import { createClient } from "@supabase/supabase-js"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""

// Cliente server-side com service_role key: bypassa RLS completamente.
// Usado nas rotas de API (server-side). NUNCA importe este cliente em componentes client.
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ""

if (!serviceRoleKey) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY não definida. " +
    "Usando publishable key como fallback — RLS pode bloquear operações."
  )
}

export const supabase = createClient(supabaseUrl, serviceRoleKey ?? publishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Cliente público (para uso futuro no client-side, se necessário)
export const supabasePublic = createClient(supabaseUrl, publishableKey)
