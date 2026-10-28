import type { SupabaseClient } from "@supabase/supabase-js"
import { normalizeRoles, type ClinicRole } from "@/lib/api/context"

export type ClinicMembership = {
  membership_id: string
  clinic_id: string
  user_id: string
  status: string
  created_at: string
  roles: ClinicRole[]
  clinic: {
    id: string
    nome_fantasia: string
    ano_fundacao: number | null
    cnpj: string | null
    created_at: string
    updated_at: string
  }
}

export async function listMemberships(
  supabase: SupabaseClient,
  userId: string
): Promise<ClinicMembership[]> {
  const { data, error } = await supabase
    .from("clinica_usuarios")
    .select(
      `
      id,
      clinica_id,
      perfil_id,
      status,
      created_at,
      clinicas (
        id,
        nome_fantasia,
        ano_fundacao,
        cnpj,
        created_at,
        updated_at
      ),
      clinica_usuario_funcoes (
        funcoes ( codigo )
      )
    `
    )
    .eq("perfil_id", userId)
    .eq("status", "ativo")
    .order("created_at", { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).flatMap((row) => {
    const clinicRaw = row.clinicas
    const clinic = Array.isArray(clinicRaw) ? clinicRaw[0] : clinicRaw
    if (!clinic) return []

    return [
      {
        membership_id: row.id,
        clinic_id: row.clinica_id,
        user_id: row.perfil_id,
        status: row.status,
        created_at: row.created_at,
        roles: normalizeRoles(row.clinica_usuario_funcoes),
        clinic,
      },
    ]
  })
}

export const ROLE_LABELS: Record<string, string> = {
  administrador: "Administrador",
  medico: "Médico",
  recepcionista: "Recepcionista",
  auxiliar: "Auxiliar",
  financeiro: "Financeiro",
  funcionario: "Funcionário",
}

export function roleLabels(roles: string[]) {
  return roles.map((role) => ROLE_LABELS[role] ?? role)
}
