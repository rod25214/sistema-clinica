"use client"

import { FormEvent, Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Activity, ArrowLeft, KeyRound, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function EntrarClinicaForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fromQuery = searchParams.get("token")
    if (fromQuery) setToken(fromQuery)
  }, [searchParams])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/convites/aceitar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || "Não foi possível aceitar o convite.")
        return
      }

      if (data?.clinic_id) {
        try {
          localStorage.setItem("app_clinic_id", data.clinic_id)
          sessionStorage.setItem("app_clinic_id", data.clinic_id)
        } catch {}
      }

      router.replace("/")
    } catch {
      setError("Não foi possível conectar ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">Entrar em uma clínica</p>
              <p className="text-xs text-muted-foreground">Use o token recebido no convite</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Código do convite</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="h-12 pl-10"
                  placeholder="Cole o código aqui"
                  required
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="h-12 w-full" disabled={loading || token.trim().length < 20}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Aceitar convite
            </Button>
          </form>

          <Link href="/boas-vindas" className="mt-6 inline-flex items-center text-sm text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          O convite só vale para o e-mail da sua conta
        </div>
      </div>
    </main>
  )
}

export default function EntrarClinicaPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center">Carregando...</main>}>
      <EntrarClinicaForm />
    </Suspense>
  )
}
