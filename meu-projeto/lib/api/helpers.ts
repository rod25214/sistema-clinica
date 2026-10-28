/**
 * ============================================================
 * Helpers compartilhados das rotas de API.
 *
 * Mantém as rotas enxutas e padroniza o comportamento de
 * listagem (paginação) e atualização (PATCH parcial).
 * ============================================================
 */

import { NextResponse } from "next/server"

/**
 * Lê e valida a paginação da query string.
 */
export function readPagination(
  request: Request
) {
  const { searchParams } =
    new URL(request.url)

  const page = Math.max(
    Number(searchParams.get("page")) || 1,
    1
  )

  const limit = Math.min(
    Math.max(
      Number(searchParams.get("limit")) || 20,
      1
    ),
    100
  )

  return {
    page,
    limit,
    from: (page - 1) * limit,
  }
}

/**
 * Resposta padrão de listagem paginada.
 */
export function paginated<T>(
  rows: T[],
  page: number,
  limit: number,
  total?: number | null
) {
  return NextResponse.json({
    data: rows,
    page,
    limit,
    total: total ?? rows.length,
    hasMore:
      page * limit <
      (total ?? rows.length),
  })
}

/**
 * Mantém apenas os campos permitidos no body.
 *
 * Evita dois problemas comuns:
 *   1. o cliente mandar "id" e sobrescrever a chave;
 *   2. mass assignment (cliente mandar "clinic_id" de
 *      outra clínica).
 */
export function pickAllowed<
  T extends Record<string, unknown>
>(
  body: T,
  allowed: readonly (keyof T)[]
): Partial<T> {
  const output: Partial<T> = {}

  for (const key of allowed) {
    if (
      body[key] !== undefined
    ) {
      output[key] = body[key]
    }
  }

  return output
}

/**
 * Valida um UUID antes de consultar o banco.
 *
 * Sem isso, um id malformado gera erro de sintaxe no
 * Postgres em vez de um 400 compreensível.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    UUID_RE.test(value)
  )
}

/**
 * Resposta 404 padronizada.
 */
export function notFound(
  what = "Registro"
) {
  return NextResponse.json(
    {
      error: `${what} não encontrado.`,
    },
    { status: 404 }
  )
}

/**
 * Resposta 400 padronizada.
 */
export function badRequest(
  message = "Dados inválidos."
) {
  return NextResponse.json(
    { error: message },
    { status: 400 }
  )
}
