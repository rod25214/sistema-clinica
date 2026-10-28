"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  Users,
  Calendar,
  DollarSign,
  CalendarPlus,
  UserPlus,
  Receipt,
  FileText,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wrench,
  Bug,
  Bell,
} from "lucide-react"

// ---------- Dados de exemplo (troque pelos dados reais da sua API) ----------

const quickActions = [
  { label: "Nova Consulta", icon: CalendarPlus, href: "/agenda" },
  { label: "Novo Paciente", icon: UserPlus, href: "/patients" },
  { label: "Novo Pagamento", icon: Receipt, href: "/financeiro" },
  { label: "Gerar Relatório", icon: FileText, href: "/analises" },
]

const carouselSlides = [
  {
    image: "/placeholder.svg?height=480&width=1400&query=modern%20dental%20clinic%20reception%20area",
    title: "Nova Recepção Inaugurada",
    subtitle: "Conheça o novo espaço pensado para o conforto dos pacientes",
  },
  {
    image: "/placeholder.svg?height=480&width=1400&query=dentist%20talking%20with%20smiling%20patient",
    title: "Atendimento Humanizado",
    subtitle: "Cuidado personalizado em cada etapa do tratamento",
  },
  {
    image: "/placeholder.svg?height=480&width=1400&query=modern%20dental%20clinic%20equipment%20technology",
    title: "Tecnologia de Ponta",
    subtitle: "Equipamentos modernos para diagnósticos mais precisos",
  },
  {
    image: "/placeholder.svg?height=480&width=1400&query=healthy%20smile%20dental%20clinic%20result",
    title: "Resultados que Transformam",
    subtitle: "Sorrisos saudáveis, todos os dias",
  },
]

const appUpdates = [
  {
    type: "novo" as const,
    title: "Módulo de Análises",
    description: "Agora você acompanha indicadores da clínica em tempo real.",
    date: "Hoje",
  },
  {
    type: "melhoria" as const,
    title: "Sidebar mais rápida",
    description: "Navegação recolhível com transições mais suaves.",
    date: "Ontem",
  },
  {
    type: "correcao" as const,
    title: "Correção no financeiro",
    description: "Ajustado cálculo de descontos em pagamentos parcelados.",
    date: "2 dias atrás",
  },
  {
    type: "novo" as const,
    title: "Assistente IA",
    description: "Tire dúvidas e gere resumos de pacientes automaticamente.",
    date: "3 dias atrás",
  },
]

const updateStyles = {
  novo: { label: "Novo", icon: Sparkles, className: "bg-primary/10 text-primary" },
  melhoria: { label: "Melhoria", icon: Wrench, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  correcao: { label: "Correção", icon: Bug, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
}

// ---------- Carrossel de fotos/anúncios ----------

function PhotoCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % carouselSlides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [paused, next])

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-48 @sm:h-56 @lg:h-64 w-full">
        {carouselSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 @lg:p-6 text-white">
              <h3 className="text-lg @lg:text-xl font-semibold">{slide.title}</h3>
              <p className="text-sm text-white/80">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Setas de navegação */}
      <button
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        aria-label="Próximo slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-black/50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {carouselSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ---------- Página ----------

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* min-w-0 evita que o flex item "empurre" a largura; @container liga as
          media queries de container abaixo, que reagem ao espaço real disponível
          (e não ao viewport), então o layout responde de verdade quando a sidebar
          abre/fecha */}
      <main className="flex-1 min-w-0 overflow-y-auto @container">
        <div className="w-full p-4 @sm:p-6 space-y-6">
          <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between gap-2">
            <div>
              <h1 className="text-2xl @lg:text-3xl font-bold tracking-tight">Bem-vindo ao Sistema</h1>
              <p className="text-muted-foreground">Gerencie sua clínica de forma eficiente</p>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="grid grid-cols-2 @sm:grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.label}
                  asChild
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <Link href={action.href}>
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Carrossel de fotos / novidades visuais */}
          <PhotoCarousel />

          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-4 gap-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">6 restantes</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 45.2K</div>
                <p className="text-xs text-muted-foreground">+8% desde o mês passado</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87%</div>
                <p className="text-xs text-muted-foreground">+5% desde a semana passada</p>
              </CardContent>
            </Card>
          </div>

          {/* Consultas + Atividades + Novidades */}
          <div className="grid grid-cols-1 @lg:grid-cols-2 @2xl:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Maria Silva", time: "09:00", procedure: "Limpeza" },
                    { name: "João Santos", time: "10:30", procedure: "Restauração" },
                    { name: "Ana Costa", time: "14:00", procedure: "Canal" },
                  ].map((appointment, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{appointment.name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.procedure}</p>
                      </div>
                      <div className="text-sm font-medium">{appointment.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: "Nova consulta agendada", time: "5 min atrás" },
                    { action: "Pagamento recebido", time: "15 min atrás" },
                    { action: "Paciente atualizado", time: "1 hora atrás" },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Novidades do aplicativo */}
            <Card className="@lg:col-span-2 @2xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Novidades do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appUpdates.map((update, idx) => {
                    const style = updateStyles[update.type]
                    const Icon = style.icon
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.className}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium">{update.title}</p>
                            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${style.className}`}>
                              {style.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{update.description}</p>
                          <p className="text-[11px] text-muted-foreground/70 mt-0.5">{update.date}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}