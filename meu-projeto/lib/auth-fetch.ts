/**
 * Lê o cookie `app_user_id` (não-httpOnly) para enviar na requisição.
 * Fallback: tenta ler da sessionStorage caso o cookie não esteja disponível.
 */
function getUserId(): string | null {
  if (typeof document === "undefined") return null
  // Tenta cookie não-httpOnly
  const match = document.cookie.match(/(?:^|;\s*)app_user_id=([^;]+)/)
  if (match) return decodeURIComponent(match[1])
  // Tenta sessionStorage como segundo fallback
  try {
    const stored = sessionStorage.getItem("app_user_id")
    if (stored) return stored
  } catch {
    // ignora
  }
  // Terceiro fallback: lê do localStorage (usuários já logados antes da sessionStorage)
  try {
    const raw = localStorage.getItem("app_user")
    if (raw) {
      const user = JSON.parse(raw)
      if (user?.id) return user.id
    }
  } catch {
    // ignora
  }
  return null
}

/**
 * Wrapper de fetch que injeta automaticamente o userId na requisição:
 * - Para GET/HEAD/DELETE: via header X-User-Id
 * - Para POST/PUT/PATCH com body JSON: injeta _userId no body
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const userId = getUserId()
  if (!userId) return fetch(url, options)

  const headers = new Headers(options.headers)
  // Envia o userId como header X-User-Id em todas as requisições
  headers.set("X-User-Id", userId)

  return fetch(url, { ...options, headers })
}
