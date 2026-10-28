/**
 * ============================================================
 * CLÍNICA ATIVA NO NAVEGADOR
 *
 * Antes, cada componente lia o storage do seu jeito:
 * uns em localStorage, outros em sessionStorage. Isso
 * gerava o erro "Nenhuma clínica foi selecionada" mesmo
 * com o usuário corretamente vinculado a uma clínica.
 *
 * Aqui ficam as chaves e a ordem de leitura, centralizadas.
 *
 * ============================================================
 */

/**
 * Ordem de leitura do id da clínica ativa.
 *
 * sessionStorage vem primeiro porque é o que a página de
 * seleção grava hoje; os demais existem por compatibilidade
 * com sessões antigas.
 */
const CLINIC_KEYS = [
  "app_clinic_id",
  "active_clinic_id",
] as const

/**
 * Lê o id da clínica ativa.
 *
 * Retorna null quando ainda não há seleção — nesse caso
 * a API resolve sozinha pelo vínculo do usuário, então o
 * header pode ser omitido sem quebrar a requisição.
 */
export function getActiveClinicId(): string | null {
  if (typeof window === "undefined") return null

  try {
    for (const store of [
      sessionStorage,
      localStorage,
    ]) {
      for (const key of CLINIC_KEYS) {
        const value = store.getItem(key)
        if (value) return value
      }
    }
  } catch {
    // Storage bloqueado (aba anônima): seguimos sem id.
  }

  return null
}

/**
 * Headers para chamar a API, já com x-clinic-id quando
 * existir.
 *
 * Use sempre isto no lugar de montar o header à mão:
 *
 *   fetch("/api/patients", {
 *     headers: clinicHeaders(true),
 *   })
 *
 * @param json inclui Content-Type quando true.
 */
export function clinicHeaders(
  json = false
): HeadersInit {
  const headers: Record<string, string> = {}

  if (json) {
    headers["Content-Type"] =
      "application/json"
  }

  const clinicId = getActiveClinicId()

  if (clinicId) {
    headers["x-clinic-id"] = clinicId
  }

  return headers
}

/**
 * Grava a clínica ativa nos dois storages.
 *
 * Escrever nos dois garante que qualquer componente
 * encontre o valor, mesmo após um recarregamento.
 */
export function setActiveClinicId(
  clinicId: string
) {
  if (typeof window === "undefined") return

  try {
    sessionStorage.setItem(
      "app_clinic_id",
      clinicId
    )
    localStorage.setItem(
      "app_clinic_id",
      clinicId
    )
  } catch {
    // ignora falha de storage
  }
}