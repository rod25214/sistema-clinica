"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Loader2 } from "lucide-react"
import { clinicHeaders } from "@/lib/clinic-client"

type Membro = {
  id: string
  full_name: string | null
  roleLabels: string[]
}

export default function EmployeesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [membros, setMembros] = useState<Membro[]>([])

  useEffect(() => {
    let active = true
    fetch("/api/equipe", {
      credentials: "include",
      cache: "no-store",
      headers: clinicHeaders(),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!active) return
        if (!res.ok) {
          setError(data?.error || "Não foi possível carregar a equipe.")
          return
        }
        setMembros(data.membros ?? [])
      })
      .catch(() => {
        if (active) setError("Não foi possível conectar ao servidor.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="w-full space-y-6 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Users className="h-6 w-6" />
                Funcionários
              </h1>
              <p className="text-muted-foreground">Equipe vinculada à clínica selecionada</p>
            </div>
            <Button asChild>
              <a href="/boas-vindas">
                <Plus className="mr-2 h-4 w-4" />
                Convidar
              </a>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Lista de Funcionários</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : membros.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum membro encontrado nesta clínica.
                </p>
              ) : (
                <ul className="space-y-3">
                  {membros.map((membro) => (
                    <li key={membro.id} className="rounded-lg border border-border px-4 py-3">
                      <p className="text-sm font-medium">{membro.full_name || "Sem nome"}</p>
                      <p className="text-xs text-muted-foreground">
                        {membro.roleLabels.join(", ") || "Sem papel"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
