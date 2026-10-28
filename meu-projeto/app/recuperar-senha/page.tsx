"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Activity, ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/recuperar-senha", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || "Não foi possível enviar o e-mail.")
        return
      }

      setSent(true)
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
              <p className="font-semibold">Recuperar senha</p>
              <p className="text-xs text-muted-foreground">Enviaremos um link se a conta existir</p>
            </div>
          </div>

          {sent ? (
            <p className="text-sm text-muted-foreground">
              Se houver uma conta com esse e-mail, você receberá as instruções em instantes.
              Confira também a pasta de spam.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    placeholder="voce@clinica.com"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="h-12 w-full" disabled={loading || !email.trim()}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enviar link
              </Button>
            </form>
          )}

          <Link href="/login" className="mt-6 inline-flex items-center text-sm text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 border-t border-border px-6 py-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Não revelamos se o e-mail está cadastrado
        </div>
      </div>
    </main>
  )
}
