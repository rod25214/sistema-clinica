import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

/**
 * Obtém a sessão do usuário logado.
 * Tenta o cookie httpOnly `app_session` primeiro.
 * Fallback: header X-User-Id (validado no banco) para contextos onde cookies não chegam.
 * Último fallback: campo `_userId` no body JSON da request.
 */
export async function getServerSession(request?: Request) {
  // 1. Cookie httpOnly app_session (fluxo principal)
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get("app_session")?.value
    if (raw) {
      const session = JSON.parse(raw)
      if (session?.id) return session
    }
  } catch {
    // ignora e continua
  }

  if (!request) return null

  // 2. Header X-User-Id (fallback para iframe/proxy — lido do localStorage pelo authFetch)
  const userIdFromHeader = request.headers.get("X-User-Id")
  if (userIdFromHeader) {
    const employee = await validateEmployeeId(userIdFromHeader)
    if (employee) return employee
  }

  return null
}

async function validateEmployeeId(userId: string) {
  if (!userId || typeof userId !== "string") return null
  // Valida que é um UUID válido antes de consultar o banco
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) return null

  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, role, avatar_url")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle()

  if (!employee) return null
  return {
    id: employee.id,
    name: employee.name,
    position: employee.role,
    avatar_url: employee.avatar_url,
  }
}
