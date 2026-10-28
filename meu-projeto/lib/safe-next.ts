/**
 * ============================================================
 * DESTINO PÓS-LOGIN (?next=)
 *
 * Quando o usuário tenta acessar uma página protegida
 * sem sessão, o proxy redireciona para:
 *
 *   /login?next=/patients/123
 *
 * Depois do login queremos devolver o usuário para aquele
 * endereço, em vez de sempre cair na home.
 *
 * Este módulo concentra a validação desse parâmetro para
 * que o proxy e as páginas usem exatamente a mesma regra.
 */

/**
 * Valida um destino vindo de `?next=`.
 *
 * Só são aceitos caminhos internos iniciados por "/".
 * Isso bloqueia open redirects, como:
 *
 *   //evil.com       (protocolo relativo)
 *   /\evil.com       (barra invertida)
 *   https://evil.com (URL absoluta)
 *   javascript:...   (esquema perigoso)
 *
 * Retorna o caminho limpo ou null quando inválido.
 */
export function safeNext(
  value: string | null | undefined
): string | null {
  if (!value) return null

  const target = value.trim()

  if (!target) return null

  // Precisa ser um caminho interno.
  if (!target.startsWith("/")) return null

  // Bloqueia "//host" e "/\host".
  if (target.startsWith("//")) return null

  if (target.startsWith("/\\")) return null

  return target
}

/**
 * Lê o `next` diretamente da URL do navegador.
 *
 * Usamos `window.location` em vez de `useSearchParams`
 * porque essas páginas já são 100% client-side (dependem
 * de localStorage e de fetch para /api/auth/me) e essa
 * forma dispensa o wrapper de <Suspense>.
 */
export function getNextPath(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const params = new URLSearchParams(
      window.location.search
    )

    return safeNext(params.get("next"))
  } catch {
    // URL malformada não deve quebrar a navegação.
    return null
  }
}
