"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Home,
  CalendarDays,
  Users,
  Package,
  Bot,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
  Activity,
  LogOut,
  Loader2,
  MessageCircle,
  Clock,
  FlaskConical,
  Building2,
  Lightbulb,
  GraduationCap,
} from "lucide-react"
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
import { UserManagementDialog } from "@/components/user-management-dialog"
import { AIOverlay } from "@/components/ai-overlay"

interface SessionUser {
  id: string
  name: string
  full_name?: string
  social_name?: string | null
  position: string
  roles?: string[]
  avatar_url: string | null
  login: string
  email?: string | null
  clinic_id?: string
  employee_status?: string
  current_status?: string | null
  is_active?: boolean
}

interface CurrentClinic {
  id: string
  nome_fantasia: string
}

const MOCK_USER: SessionUser = {
  id: "mock-user",
  name: "Dr. Usuário Demo",
  email: "demo@clinica.com",
  position: "",
  roles: ["administrador"],
  avatar_url: null,
  login: "demo@clinica.com",
}

const MOCK_CLINIC: CurrentClinic = {
  id: "mock-clinic",
  nome_fantasia: "Clínica Demo",
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  /*
  |--------------------------------------------------------------------------
  | IMPORTANTE PARA HIDRATAÇÃO
  |--------------------------------------------------------------------------
  |
  | O servidor e o navegador começam exatamente com o mesmo valor.
  |
  | NÃO usamos localStorage dentro do useState.
  |
  */

  const [collapsed, setCollapsed] = useState(false)

  const [mounted, setMounted] = useState(false)

  const [readyForTransition, setReadyForTransition] = useState(false)

  const [aiOpen, setAiOpen] = useState(false)

  const [currentUser, setCurrentUser] = useState<SessionUser | null>(MOCK_USER)
  const [userLoading, setUserLoading] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const [currentClinic, setCurrentClinic] = useState<CurrentClinic | null>(MOCK_CLINIC)
  const [clinicRoles, setClinicRoles] = useState<string[]>(["administrador"])
  const [clinicLoading, setClinicLoading] = useState(false)

  const [totalUnreadContacts, setTotalUnreadContacts] = useState(0)

  const [currentDateTime, setCurrentDateTime] = useState<Date | null>(null)

  /*
  |--------------------------------------------------------------------------
  | Inicialização no cliente
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setMounted(true)

    try {
      const saved = localStorage.getItem("sidebar_collapsed")

      if (saved === "true") {
        setCollapsed(true)
      } else if (saved === "false") {
        setCollapsed(false)
      }
    } catch {
    }

    setCurrentDateTime(new Date())

    const id = requestAnimationFrame(() => {
      setReadyForTransition(true)
    })

    return () => cancelAnimationFrame(id)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Salva estado da sidebar
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!mounted) return

    try {
      localStorage.setItem("sidebar_collapsed", String(collapsed))
    } catch {
      // Ignora erro de localStorage
    }
  }, [collapsed, mounted])

  /*
  |--------------------------------------------------------------------------
  | Relógio
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Eventos
  |--------------------------------------------------------------------------
  */

  const openQuickChat = useCallback(() => {
    window.dispatchEvent(new Event("open-quick-chat"))
  }, [])

  const closeAi = useCallback(() => {
    setAiOpen(false)
  }, [])

  /*
  |--------------------------------------------------------------------------
  | Logout (Supabase)
  |--------------------------------------------------------------------------
  */

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    } finally {
      setCurrentUser(null)
      setCurrentClinic(null)
      setClinicRoles([])
      router.replace("/login")
      router.refresh()
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Data
  |--------------------------------------------------------------------------
  */

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  /*
  |--------------------------------------------------------------------------
  | Navegação
  |--------------------------------------------------------------------------
  */

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      current: pathname === "/",
    },
    {
      name: "Agenda",
      href: "/agenda",
      icon: CalendarDays,
      current: pathname === "/agenda",
    },
    {
      name: "Pacientes",
      href: "/patients",
      icon: Users,
      current: pathname === "/patients",
    },
    {
      name: "Estoque",
      href: "/estoque",
      icon: Package,
      current: pathname === "/estoque",
    },
    {
      name: "Funcionários",
      href: "/employees",
      icon: UserCheck,
      current: pathname === "/employees",
    },
    {
      name: "Protético",
      href: "/protetico",
      icon: FlaskConical,
      current: pathname === "/protetico",
    },
    {
      name: "Assistente IA",
      href: "/assistente-ia",
      icon: Bot,
      current: pathname === "/assistente-ia",
    },
    {
      name: "Estudos",
      href: "/estudos",
      icon: GraduationCap,
      current: pathname === "/estudos",
    },
  ]

  /*
  |--------------------------------------------------------------------------
  | Cargo exibido abaixo do nome (papel real da clínica)
  |--------------------------------------------------------------------------
  */

  const roleLabel = clinicRoles.length > 0 ? clinicRoles.join(" · ") : ""

  // Mostra o e-mail enquanto o cargo ainda não vem do banco.
  const subtitle = roleLabel || currentUser?.email || ""

  const isAdmin = clinicRoles.some((role) =>
    ["administrador", "admin"].includes(role.toLowerCase())
  )

  /*
  |--------------------------------------------------------------------------
  | Botão IA
  |--------------------------------------------------------------------------
  */

  const aiButton = (
    <Button
      type="button"
      variant={aiOpen ? "default" : "outline"}
      onClick={() => setAiOpen((prev) => !prev)}
      aria-pressed={aiOpen}
      title="Perguntar para a IA"
      className={cn(
        "h-8 px-2.5 text-xs font-bold tracking-wide",
        !aiOpen && "bg-transparent"
      )}
    >
      IA
    </Button>
  )

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={cn(
        "flex flex-col bg-card border-r border-border/60 h-full shrink-0 overflow-hidden",
        "shadow-[1px_0_4px_rgba(0,0,0,0.04)]",
        readyForTransition &&
          "transition-[width] duration-500 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ================================================================ */}
      {/* CABEÇALHO */}
      {/* ================================================================ */}

      <div className="flex flex-col border-b border-border/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div
            className={cn(
              "flex items-center space-x-2.5 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
              collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 shrink-0">
              <Activity className="h-4.5 w-4.5 text-primary" />
            </div>

            <span className="font-semibold tracking-tight">
              Your Company 2.0
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCollapsed((prev) => !prev)
            }}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            className="h-8 w-8 shrink-0 rounded-full hover:bg-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* ============================================================ */}
        {/* RELÓGIO ABERTO */}
        {/* ============================================================ */}

        {!collapsed && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground tabular-nums leading-tight">
                  {currentDateTime ? formatTime(currentDateTime) : "--:--"}
                </p>

                <p className="text-xs text-muted-foreground capitalize truncate">
                  {currentDateTime ? formatDate(currentDateTime) : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* CLÍNICA ATUAL (ABERTA) */}
        {/* ============================================================ */}

        {!collapsed && currentUser && (
          <div className="px-4 pb-3">
            <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Clínica atual
                </p>

                <p className="truncate text-sm font-semibold text-foreground">
                  {clinicLoading
                    ? "Carregando clínica..."
                    : currentClinic?.nome_fantasia ?? "Nenhuma clínica vinculada"}
                </p>

                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {clinicLoading
                    ? "Consultando permissões..."
                    : clinicRoles.length > 0
                      ? clinicRoles.join(" · ")
                      : currentClinic
                        ? "Papel não atribuído"
                        : "Cadastre ou solicite acesso a uma clínica"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* RELÓGIO FECHADO */}
        {/* ============================================================ */}

        {collapsed && (
          <div className="flex flex-col items-center pb-2">
            <Clock className="h-4 w-4 text-muted-foreground mb-1" />

            <span className="text-xs font-medium tabular-nums">
              {currentDateTime
                ? currentDateTime.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--:--"}
            </span>
          </div>
        )}

        {/* ============================================================ */}
        {/* CLÍNICA ATUAL (FECHADA) */}
        {/* ============================================================ */}

        {collapsed && currentUser && (
          <div
            className="flex justify-center pb-2"
            title={currentClinic?.nome_fantasia ?? "Nenhuma clínica vinculada"}
          >
            <Building2 className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* MENU */}
      {/* ================================================================ */}

      <nav className="flex-1 space-y-1.5 p-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon

          /*
           * mounted garante que a indicação de página ativa
           * também não cause diferença entre servidor e cliente.
           */
          const isActive = mounted && item.current

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",

                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground",

                collapsed && "justify-center px-2"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-primary transition-all duration-300 ease-in-out",

                  isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                )}
              />

              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200",
                  "group-hover:scale-110"
                )}
              />

              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",

                  collapsed
                    ? "max-w-0 opacity-0 ml-0"
                    : "max-w-[160px] opacity-100 ml-3"
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* ================================================================ */}
      {/* MENSAGENS */}
      {/* ================================================================ */}

      <div className="p-2 border-t border-border/60">
        <Button
          variant="ghost"
          onClick={openQuickChat}
          className={cn(
            "w-full relative hover:bg-accent/60",

            collapsed ? "justify-center px-2" : "justify-start px-3"
          )}
        >
          <div className="relative shrink-0">
            <MessageCircle className="h-4 w-4" />

            {totalUnreadContacts > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                {totalUnreadContacts > 99 ? "99+" : totalUnreadContacts}
              </span>
            )}
          </div>

          <span
            className={cn(
              "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300 ease-in-out",

              collapsed
                ? "max-w-0 opacity-0 ml-0"
                : "max-w-[120px] opacity-100 ml-3"
            )}
          >
            Mensagens
          </span>

          {totalUnreadContacts > 0 && (
            <span
              className={cn(
                "flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold overflow-hidden transition-all duration-300 ease-in-out",

                collapsed
                  ? "min-w-0 w-0 h-0 opacity-0 ml-0"
                  : "min-w-[20px] h-5 px-1.5 opacity-100 ml-auto"
              )}
            >
              {totalUnreadContacts > 99 ? "99+" : totalUnreadContacts}
            </span>
          )}
        </Button>
      </div>

      {/* ================================================================ */}
      {/* TEMA / IA */}
      {/* ================================================================ */}

      <div className="p-2 border-t border-border/60">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <ThemeColorSelector />
            {aiButton}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-2">
            <span className="text-sm font-medium">Tema & Cores</span>

            <ThemeColorSelector />

            {aiButton}
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* USUÁRIO */}
      {/* ================================================================ */}

      <div className="p-2 border-t border-border/60 space-y-2">
        {userLoading ? (
          /* Enquanto carrega, não mostramos nenhum nome nem o botão "Entrar". */
          <div
            className={cn("flex items-center p-2", collapsed && "justify-center")}
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>
                <Loader2 className="h-4 w-4 animate-spin" />
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <span className="ml-3 text-sm text-muted-foreground">
                Carregando...
              </span>
            )}
          </div>
        ) : currentUser ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-auto p-2 hover:bg-accent/60",
                    collapsed && "justify-center"
                  )}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-primary/15 shrink-0">
                    <AvatarImage src={currentUser.avatar_url || undefined} />

                    <AvatarFallback>
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "text-left min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",

                      collapsed
                        ? "max-w-0 opacity-0 ml-0"
                        : "max-w-[160px] opacity-100 ml-3 flex-1"
                    )}
                  >
                    <p className="text-sm font-medium truncate">
                      {currentUser.name}
                    </p>

                    {subtitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/sugestoes">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Sugestões
                  </Link>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/clinica">
                      <Building2 className="mr-2 h-4 w-4" />
                      Dados da Clínica
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={signingOut}
                  onSelect={(event) => {
                    event.preventDefault()
                    handleLogout()
                  }}
                  className="cursor-pointer"
                >
                  {signingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  {signingOut ? "Saindo..." : "Sair"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {!collapsed && <UserManagementDialog />}
          </>
        ) : (
          <Button asChild className="w-full bg-transparent" variant="outline">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </div>

      {/* ================================================================ */}
      {/* IA */}
      {/* ================================================================ */}

      <AIOverlay open={aiOpen} onClose={closeAi} />
    </div>
  )
}
