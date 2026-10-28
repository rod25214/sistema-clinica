import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              cookieStore.set(
                name,
                value,
                options
              )
            }
          )
        } catch {
          // Pode acontecer quando chamado
          // dentro de um Server Component.
          //
          // O proxy/middleware será responsável
          // por atualizar a sessão.
        }
      },
    },
  })
}
