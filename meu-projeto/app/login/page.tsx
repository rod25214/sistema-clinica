"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Activity,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  UserRound,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserPlus,
} from "lucide-react"
import { ThemeColorSelector } from "@/components/theme-color-selector"

const slides = [
  {
    image: "/placeholder.svg",
    title: "Gestão completa para sua clínica",
    description:
      "Tenha pacientes, profissionais, agenda, documentos e processos organizados em um único sistema.",
  },
  {
    image: "/placeholder.svg",
    title: "Mais organização no seu dia",
    description:
      "Simplifique a rotina da sua equipe e tenha as informações importantes sempre à mão.",
  },
  {
    image: "/placeholder.svg",
    title: "Sua clínica em um só lugar",
    description:
      "Uma plataforma desenvolvida para facilitar a gestão e melhorar a experiência da sua equipe.",
  },
  {
    image: "/placeholder.svg",
    title: "Tecnologia para cuidar melhor",
    description:
      "Centralize seus processos e permita que sua equipe dedique mais tempo ao que realmente importa.",
  },
]

export default function AppLoginPage() {
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)

  // ==========================================================
  // VERIFICAR SESSÃO EXISTENTE
  // ==========================================================

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        if (!mounted) return

        if (!response.ok) {
          setCheckingSession(false)
          return
        }

        const data = await response.json()

        if (!mounted) return

        if (!data.authenticated || !data.user) {
          setCheckingSession(false)
          return
        }

        /*
         * A sessão é protegida pelo Supabase
         * através do cookie.
         *
         * Usuários autenticados são encaminhados
         * diretamente para a página de boas-vindas.
         */

        const params = new URLSearchParams(window.location.search)
        const next = params.get("next")
        window.location.href =
          next && next.startsWith("/") && !next.startsWith("//")
            ? next
            : "/boas-vindas"
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)

        if (mounted) {
          setCheckingSession(false)
        }
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [])

  // ==========================================================
  // SLIDES
  // ==========================================================

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((current) =>
        current === slides.length - 1 ? 0 : current + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((current) =>
      current === slides.length - 1 ? 0 : current + 1
    )
  }

  const previousSlide = () => {
    setCurrentSlide((current) =>
      current === 0 ? slides.length - 1 : current - 1
    )
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!login.trim() || !password) {
      setError("Informe seu e-mail e sua senha.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email: login.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login ou senha inválidos.")
        return
      }

      /*
       * O servidor criou/atualizou a sessão
       * do Supabase no cookie.
       *
       * Após o login bem-sucedido, o usuário
       * é encaminhado para /boas-vindas.
       */

      const params = new URLSearchParams(window.location.search)
      const next = params.get("next")
      window.location.href =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/boas-vindas"
    } catch (error) {
      console.error("Erro no login:", error)

      setError("Não foi possível conectar ao servidor.")
    } finally {
      setLoading(false)
    }
  }

  // ==========================================================
  // VERIFICANDO SESSÃO
  // ==========================================================

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground">
            <Activity className="w-7 h-7" />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verificando sessão...
          </div>
        </div>
      </main>
    )
  }

  const slide = slides[currentSlide]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* FUNDO */}

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* HEADER */}

      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Activity className="w-5 h-5" />
            </div>

            <div>
              <p className="font-semibold text-foreground">
                Your Company 2.0
              </p>

              <p className="text-[11px] text-muted-foreground">
                Gestão clínica
              </p>
            </div>
          </div>

          <ThemeColorSelector />
        </div>
      </header>

      {/* CONTEÚDO */}

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* LADO ESQUERDO */}

        <section className="hidden lg:flex relative min-h-screen overflow-hidden">
          {slides.map((item, index) => (
            <div
              key={item.image + index}
              className={`
                absolute inset-0
                transition-opacity duration-1000
                ${
                  index === currentSlide
                    ? "opacity-100"
                    : "opacity-0"
                }
              `}
            >
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/45" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
            </div>
          ))}

          <div className="relative z-10 flex flex-col justify-end w-full p-12 xl:p-16 pb-14">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md border border-white/20">
                <Building2 className="w-4 h-4 text-white" />
              </div>

              <span className="text-sm font-medium text-white/90">
                Gestão inteligente
              </span>
            </div>

            <div
              key={currentSlide}
              className="animate-in fade-in slide-in-from-bottom-3 duration-700"
            >
              <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-white max-w-xl leading-tight">
                {slide.title}
              </h2>

              <p className="mt-5 text-base xl:text-lg text-white/75 max-w-lg leading-relaxed">
                {slide.description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-10 max-w-xl">
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir para slide ${index + 1}`}
                    className={`
                      h-1.5 rounded-full transition-all duration-300
                      ${
                        index === currentSlide
                          ? "w-8 bg-white"
                          : "w-2 bg-white/40 hover:bg-white/70"
                      }
                    `}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousSlide}
                  aria-label="Imagem anterior"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Próxima imagem"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LADO DIREITO */}

        <section className="min-h-screen flex items-center justify-center px-5 sm:px-8 lg:px-12 py-28">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="lg:hidden mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
                <Activity className="w-8 h-8" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Bem-vindo de volta
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Entre na sua conta para acessar o sistema
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden">
              <div className="p-6 sm:p-8">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="login"
                      className="text-sm font-medium"
                    >
                      E-mail
                    </Label>

                    <div className="relative">
                      <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                      <Input
                        id="login"
                        type="email"
                        placeholder="Digite seu e-mail"
                        value={login}
                        onChange={(e) => {
                          setLogin(e.target.value)
                          setError(null)
                        }}
                        autoComplete="username"
                        autoFocus
                        disabled={loading}
                        className="h-12 pl-10 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Senha
                    </Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setError(null)
                        }}
                        autoComplete="current-password"
                        disabled={loading}
                        className="h-12 pl-10 pr-11 rounded-xl"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={
                          showPassword
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                      <p className="text-sm text-destructive">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      loading ||
                      !login.trim() ||
                      !password
                    }
                    className="w-full h-12 rounded-xl font-semibold text-sm group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar no sistema
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-7">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>

                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      ou
                    </span>
                  </div>
                </div>

                <Link
                  href="/cadastro"
                  className="w-full"
                >
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl font-medium"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar uma conta
                  </Button>
                </Link>
              </div>

              <div className="border-t border-border px-6 sm:px-8 py-4">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />

                  <span>
                    Ambiente protegido e seguro
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Ainda não possui uma clínica?
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Crie sua conta e configure sua clínica depois.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}