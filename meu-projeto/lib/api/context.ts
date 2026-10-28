/**
 * Autenticação e contexto da clínica.
 *
 * Uma requisição chega em três estados:
 *   1. Sem sessão                         -> 401
 *   2. Com sessão, sem clínica resolvida  -> 400
 *   3. Com sessão + vínculo ativo         -> contexto válido
 *
 * O header x-clinic-id e o cookie app_clinic_id apenas
 * indicam a clínica desejada. O acesso só vale se existir
 * linha ativa em clinica_usuarios.
 */

import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

import { createClient } from "@/lib/supabase/server"
import { CLINIC_COOKIE, isClinicId } from "@/lib/auth/clinic-cookie"
import type { SupabaseClient, User } from "@supabase/supabase-js"

export type ClinicRole =
  | "administrador"
  | "medico"
  | "recepcionista"
  | "auxiliar"
  | "financeiro"
  | "funcionario"

function fail(message: string, status: number) {
  return NextResponse.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } }
  )
}

async function resolveClinicId(
  userId: string,
  supabase: SupabaseClient
): Promise<
  | { ok: true; clinicId: string }
  | { ok: false; error: string; status: number }
> {
  const requestHeaders = await headers()
  const fromHeader = requestHeaders.get("x-clinic-id")?.trim() || null
  if (isClinicId(fromHeader)) {
    return { ok: true, clinicId: fromHeader }
  }

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(CLINIC_COOKIE)?.value || null
  if (isClinicId(fromCookie)) {
    return { ok: true, clinicId: fromCookie }
  }

  const { data: memberships } = await supabase
    .from("clinica_usuarios")
    .select("clinica_id")
    .eq("perfil_id", userId)
    .eq("status", "ativo")

  const clinicIds = [...new Set((memberships || []).map((m) => m.clinica_id))]

  if (clinicIds.length === 1) {
    return { ok: true, clinicId: clinicIds[0] }
  }

  if (clinicIds.length === 0) {
    return {
      ok: false,
      error: "Você não pertence a nenhuma clínica.",
      status: 403,
    }
  }

  return {
    ok: false,
    error: "Selecione uma clínica antes de continuar.",
    status: 400,
  }
}

export async function requireUser(_request?: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return fail("Não autenticado.", 401)
  }

  return { supabase, user, userId: user.id }
}

export async function requireClinic(_request?: Request) {
  const auth = await requireUser()
  if (auth instanceof NextResponse) return auth

  const { supabase, user } = auth
  const resolved = await resolveClinicId(user.id, supabase)

  if (!resolved.ok) {
    return fail(resolved.error, resolved.status)
  }

  const clinicId = resolved.clinicId

  const { data: membership, error: membershipError } = await supabase
    .from("clinica_usuarios")
    .select(
      `
      id,
      clinica_id,
      status,
      clinica_usuario_funcoes (
        funcoes ( codigo )
      )
    `
    )
    .eq("clinica_id", clinicId)
    .eq("perfil_id", user.id)
    .eq("status", "ativo")
    .maybeSingle()

  if (membershipError) {
    console.error("[requireClinic] vínculo:", membershipError.message)
    return fail("Não foi possível validar o acesso à clínica.", 500)
  }

  if (!membership) {
    return fail("Você não possui acesso a esta clínica.", 403)
  }

  const roles = normalizeRoles(membership.clinica_usuario_funcoes)

  return {
    supabase,
    user,
    userId: user.id,
    clinicId,
    membershipId: membership.id as string,
    roles,
    role: (roles[0] ?? "funcionario") as ClinicRole,
  }
}

type NestedRole =
  | { funcoes: { codigo: string } | { codigo: string }[] | null }
  | null

export function normalizeRoles(rows: NestedRole[] | null | undefined) {
  const codes: string[] = []
  for (const row of rows ?? []) {
    const fn = row?.funcoes
    if (!fn) continue
    if (Array.isArray(fn)) {
      for (const item of fn) {
        if (item?.codigo) codes.push(item.codigo)
      }
    } else if (fn.codigo) {
      codes.push(fn.codigo)
    }
  }
  return [...new Set(codes)] as ClinicRole[]
}

export function requireAdmin(
  ctx: Exclude<Awaited<ReturnType<typeof requireClinic>>, NextResponse>
) {
  if (!ctx.roles.includes("administrador")) {
    return fail("Apenas administradores podem fazer isso.", 403)
  }
  return null
}

export type ClinicContext = Exclude<
  Awaited<ReturnType<typeof requireClinic>>,
  NextResponse
>

export type AuthContext = Exclude<
  Awaited<ReturnType<typeof requireUser>>,
  NextResponse
> & { user: User }

export const errors = {
  notFound: (what = "Registro") => fail(`${what} não encontrado.`, 404),
  invalidBody: () => fail("Dados inválidos.", 400),
  serverError: (err: unknown, where: string) => {
    console.error(`[${where}]`, err)
    return fail("Erro interno do servidor.", 500)
  },
}
