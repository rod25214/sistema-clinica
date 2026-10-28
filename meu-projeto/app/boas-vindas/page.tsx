"use client"

import { ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  ArrowRight,
  Building2,
  Loader2,
  LogOut,
  Plus,
  ShieldCheck,
  User,
  UserPlus,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeColorSelector } from "@/components/theme-color-selector"

const REFERENCE_WIDTH = 1536
const CLINICS_PER_PAGE = 3

function useZoomCompensation() {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const update = () => setScale(Math.max(1, window.innerWidth / REFERENCE_WIDTH))
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return scale
}

function ProfileMenu() {
  const router = useRouter()

  const displayName = "Usuário Demo"
  const initials = "UD"

  async function handleSignOut() {
    router.replace("/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto max-w-[260px] justify-start gap-3 rounded-xl border border-border/70 bg-background/70 p-2 shadow-sm backdrop-blur-md hover:bg-accent/60">
          <Avatar className="h-8 w-8 shrink-0 ring-2 ring-primary/15">
            <AvatarImage src={undefined} />
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left sm:block">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">demo@clinica.com</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile"><User className="mr-2 h-4 w-4" />Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleSignOut() }}>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AuthShell({ children }: { children: ReactNode }) {
  const scale = useZoomCompensation()
  return (
    <main style={{ zoom: scale === 1 ? undefined : scale, minHeight: `calc(100dvh / ${scale})` }} className="relative flex flex-col overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -top-64 -right-56 hidden h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl lg:block" />
        <div className="absolute -bottom-56 -left-48 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -bottom-64 -right-48 h-[360px] w-[360px] rounded-full bg-primary/5 blur-3xl sm:h-[520px] sm:w-[520px]" />
      </div>
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <ProfileMenu />
        <ThemeColorSelector />
      </header>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </main>
  )
}

function SecureFooter() {
  return (
    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground xl:justify-start">
      <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
      <span>Sua conta está sempre protegida</span>
    </div>
  )
}

function ActionCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  cta: string
}) {
  return (
    <Link href={href} className="group rounded-2xl border border-border bg-card/95 p-5 shadow-xl shadow-black/5 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-primary/5 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary [&>svg]:h-6 [&>svg]:w-6">{icon}</div>
        <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">{cta}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></div>
    </Link>
  )
}

function ClinicCard({
  clinic,
  onSelect,
  selecting,
}: {
  clinic: any
  onSelect: (c: any) => void
  selecting: string | null
}) {
  const c = clinic.clinic || clinic
  const isSel = selecting === (clinic.clinic_id || c.id)
  return (
    <button onClick={() => onSelect(clinic)} disabled={!!selecting} className="w-full text-left rounded-xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur-xl transition-all hover:border-primary/40 disabled:opacity-70">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{c.nome_fantasia}</p>
          {clinic.role && <p className="text-xs text-muted-foreground truncate">Função: {clinic.role}</p>}
        </div>
        {isSel ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>
  )
}

/*
 * Lista de clínicas paginada de 3 em 3.
 * Quando há mais de 3, aparece o botão "Ver mais clínicas",
 * que avança para as próximas 3 e volta ao início ao chegar no fim.
 */
function ClinicList({
  clinics,
  loading,
  error,
  selecting,
  onSelect,
  page,
  onNextPage,
}: {
  clinics: any[]
  loading: boolean
  error: string | null
  selecting: string | null
  onSelect: (c: any) => void
  page: number
  onNextPage: () => void
}) {
  const total = clinics.length
  const start = page * CLINICS_PER_PAGE
  const visible = clinics.slice(start, start + CLINICS_PER_PAGE)
  const end = start + visible.length

  return (
    <div className="space-y-3">
      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!loading && !error && total === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma clínica vinculada ainda.</p>
      )}

      {visible.map((item, idx) => (
        <ClinicCard
          key={item.clinic_id || (item.clinic || item).id || start + idx}
          clinic={item}
          onSelect={onSelect}
          selecting={selecting}
        />
      ))}

      {total > CLINICS_PER_PAGE && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-muted-foreground">
            Mostrando {start + 1}–{end} de {total}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!!selecting}
            className="bg-transparent"
          >
            Ver mais clínicas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function BoasVindasPage() {
  const router = useRouter()
  const [selecting, setSelecting] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const clinics = [
    { clinic_id: "mock-clinic-1", clinic: { id: "mock-clinic-1", nome_fantasia: "Clínica Sorriso Demo" }, role: "Administrador" },
    { clinic_id: "mock-clinic-2", clinic: { id: "mock-clinic-2", nome_fantasia: "OdontoMax Demo" }, role: "Dentista" },
    { clinic_id: "mock-clinic-3", clinic: { id: "mock-clinic-3", nome_fantasia: "Clínica Vida Demo" }, role: "Recepcionista" },
  ]

  const loading = false
  const error = null

  const pageCount = Math.max(1, Math.ceil(clinics.length / CLINICS_PER_PAGE))

  // Avança 3 clínicas; ao passar da última página, volta para a primeira.
  const handleNextPage = () => setPage((prev) => (prev + 1) % pageCount)

  const handleSelect = (item: any) => {
    const c = item.clinic || item
    if (!c) return
    setSelecting(item.clinic_id || c.id)
    try {
      localStorage.setItem("app_clinic_id", item.clinic_id || c.id)
      localStorage.setItem("app_clinic", JSON.stringify(c))
      localStorage.setItem("app_clinics", JSON.stringify(clinics))
    } catch {}
    router.replace("/")
  }

  const clinicList = (
    <ClinicList
      clinics={clinics}
      loading={loading}
      error={error}
      selecting={selecting}
      onSelect={handleSelect}
      page={page}
      onNextPage={handleNextPage}
    />
  )

  return (
    <AuthShell>
      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start items-start xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-20 xl:px-10">
        <aside className="hidden xl:flex xl:pb-10 xl:pt-10">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Gestão Odontológica</p>
                <p className="text-[11px] text-muted-foreground">Gestão clínica</p>
              </div>
            </div>
            <div className="mt-12">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Suas clínicas</span>
              </div>
              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">Acesse sua clínica já existente</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">Selecione uma clínica que você já participa como funcionário ou proprietário para acessar diretamente.</p>
            </div>

            {/* CLÍNICAS (desktop): logo abaixo do texto, 3 por vez */}
            <div className="mt-8">{clinicList}</div>

            <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Acesso direto</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Você entra direto no sistema sem passar pela tela de seleção.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-start justify-center px-4 pb-10 pt-4 sm:px-8 sm:pt-6 md:pt-6 xl:items-start xl:px-0 xl:pb-10 xl:pt-10">
          <div className="w-full max-w-2xl">
            <div className="mb-6 text-center sm:mb-8 xl:text-left">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ring-8 ring-primary/5 xl:hidden">
                <Building2 className="h-7 w-7" />
              </div>
              <p className="text-sm font-medium text-primary">SUAS CLÍNICAS</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Escolha uma clínica para continuar</h1>
              <p className="mt-2 text-sm text-muted-foreground">As clínicas onde você participa aparecem aqui.</p>
            </div>

            {/* CLÍNICAS (mobile/tablet): a coluna da esquerda fica oculta nessas telas */}
            <div className="xl:hidden">{clinicList}</div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <ActionCard href="/criar-clinica" icon={<Plus />} title="Criar uma clínica" description="Crie seu próprio ambiente de gestão." cta="Começar agora" />
              <ActionCard href="/entrar-clinica" icon={<UserPlus />} title="Tenho um convite" description="Use o convite recebido para entrar." cta="Aceitar convite" />
            </div>

            <SecureFooter />

            <p className="mt-4 text-center text-xs text-muted-foreground xl:text-left">Você pode criar ou entrar em uma clínica a qualquer momento.</p>
          </div>
        </section>
      </div>
    </AuthShell>
  )
}