"use client"

import { FormEvent, ReactNode, useEffect, useState } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react"

import { ThemeColorSelector } from "@/components/theme-color-selector"

/* ============================================================
 * CLASSES REUTILIZÁVEIS (mesmas da tela de cadastro)
 * - text-base no mobile evita o zoom automático do iOS ao focar
 *   nos campos; a partir de sm volta para text-sm.
 * ============================================================ */

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"

/* ============================================================
 * COMPONENTES AUXILIARES
 * ============================================================ */

function Field({
  id,
  label,
  icon,
  optional,
  children,
}: {
  id: string
  label: string
  icon: ReactNode
  optional?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && (
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            (opcional)
          </span>
        )}
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

function SecureFooter() {
  return (
    <div className="border-t border-border px-6 py-4 sm:px-8">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
        <span>Ambiente protegido e seguro</span>
      </div>
    </div>
  )
}

/*
 * Compensação de zoom do navegador.
 *
 * Ao diminuir o zoom (80%, 70%...), a largura da janela em px CSS aumenta
 * e o layout, que tem largura máxima, ficaria menor e cercado de espaço vazio.
 * Aqui ampliamos o conteúdo na mesma proporção, então ele aparece sempre
 * igual ao de REFERENCE_WIDTH (a largura da janela com zoom em 100%).
 *
 * Para descobrir o seu valor: com zoom em 100%, abra o console do navegador
 * e rode `window.innerWidth`. Coloque o número abaixo.
 */
const REFERENCE_WIDTH = 1536

function useZoomCompensation() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () =>
      setScale(Math.max(1, window.innerWidth / REFERENCE_WIDTH))

    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  return scale
}

/*
 * Estrutura base: fundo decorativo + header no fluxo normal + conteúdo.
 */
function AuthShell({ children }: { children: ReactNode }) {
  const scale = useZoomCompensation()

  return (
    <main
      style={{
        zoom: scale === 1 ? undefined : scale,
        minHeight: `calc(100dvh / ${scale})`,
      }}
      className="relative flex flex-col overflow-hidden bg-background"
    >
      {/* LUZES DO FUNDO */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-48 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -top-64 -right-56 hidden h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl lg:block" />
        <div className="absolute -bottom-56 -left-48 h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
        <div className="absolute -bottom-64 -right-48 h-[360px] w-[360px] rounded-full bg-primary/5 blur-3xl sm:h-[520px] sm:w-[520px]" />
      </div>

      {/* HEADER */}
      <header className="relative z-20 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
        <Link
          href="/boas-vindas"
          className="group inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:bg-background hover:text-foreground sm:px-4"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          Voltar
        </Link>

        <ThemeColorSelector />
      </header>

      {/* CONTEÚDO */}
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </main>
  )
}

/* ============================================================
 * PÁGINA
 * ============================================================ */

export default function CriarClinicaPage() {
  const [nome, setNome] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [anoFundacao, setAnoFundacao] = useState("")
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState("")
  const [endereco, setEndereco] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = nome.trim().length > 0 && anoFundacao.length === 4 && !loading

  // ==========================================================
  // CRIAR CLÍNICA
  // ==========================================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)

    // ========================================================
    // VALIDAÇÕES
    // ========================================================

    if (!nome.trim()) {
      setError("Informe o nome da clínica.")
      return
    }

    const ano = Number(anoFundacao)
    const anoAtual = new Date().getFullYear()

    if (!anoFundacao) {
      setError("Informe o ano de fundação da clínica.")
      return
    }

    if (anoFundacao.length !== 4 || ano < 1900 || ano > anoAtual) {
      setError(`Informe um ano de fundação entre 1900 e ${anoAtual}.`)
      return
    }

    setLoading(true)

    try {
      sessionStorage.setItem("app_clinic_id", "mock-clinic")
      localStorage.setItem("app_clinic", JSON.stringify({ id: "mock-clinic", nome_fantasia: nome.trim() }))
      window.location.href = "/"
    } catch (err) {
      console.error("Erro ao criar clínica:", err)
      setError("Não foi possível criar a clínica.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="mx-auto grid w-full max-w-7xl flex-1 content-start items-start xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] xl:gap-20 xl:px-10">
        {/* ----------------------------------------------------
            LADO ESQUERDO (somente desktop)
        ----------------------------------------------------- */}
        <aside className="hidden xl:flex xl:pb-10 xl:pt-16">
          <div className="w-full max-w-md">
            {/* IDENTIDADE */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <p className="font-semibold text-foreground">
                  Gestão Odontológica
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Gestão clínica
                </p>
              </div>
            </div>

            {/* TEXTO PRINCIPAL */}
            <div className="mt-12">
              <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>

                <span className="text-sm font-medium text-primary">
                  Nova clínica
                </span>
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Configure o ambiente da sua clínica.
              </h2>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Informe os dados principais. Você poderá completar e alterar
                tudo depois, e convidar sua equipe quando quiser.
              </p>
            </div>

            {/* BLOCO ADMINISTRADOR */}
            <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Check className="h-4 w-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    Você será o administrador
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Ao criar a clínica, sua conta será vinculada a ela
                    automaticamente como proprietário/administrador. Depois
                    você poderá convidar outras pessoas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ----------------------------------------------------
            LADO DIREITO (formulário)
        ----------------------------------------------------- */}
        <section className="flex items-start justify-center px-4 pb-10 pt-4 sm:px-8 sm:pt-6 md:pt-10 xl:items-start xl:px-0 xl:pb-10 xl:pt-16">
          <div className="w-full max-w-2xl">
            {/* TÍTULO */}
            <div className="mb-6 text-center sm:mb-8 xl:text-left">
              {/* MARCA (mobile/tablet) */}
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ring-8 ring-primary/5 xl:hidden">
                <Building2 className="h-7 w-7" />
              </div>

              <p className="text-sm font-medium text-primary">NOVA CLÍNICA</p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Criar sua clínica
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                Configure as informações principais da sua clínica.
              </p>
            </div>

            {/* CARD DO FORMULÁRIO */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-xl shadow-black/5 backdrop-blur-xl">
              <div className="p-5 sm:p-8">
                <form
                  onSubmit={handleSubmit}
                  className="grid items-start gap-x-5 gap-y-5 md:grid-cols-2"
                  noValidate
                >
                  {/* NOME */}
                  <Field
                    id="nome"
                    label="Nome da clínica"
                    icon={<Building2 />}
                  >
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      autoComplete="organization"
                      value={nome}
                      onChange={(event) => {
                        setNome(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      placeholder="Ex.: Clínica Sorriso"
                      className={inputClass}
                    />
                  </Field>

                  {/* CNPJ */}
                  <Field id="cnpj" label="CNPJ" icon={<FileText />} optional>
                    <input
                      id="cnpj"
                      name="cnpj"
                      type="text"
                      inputMode="numeric"
                      value={cnpj}
                      onChange={(event) => {
                        setCnpj(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      placeholder="00.000.000/0001-00"
                      className={inputClass}
                    />
                  </Field>

                  {/* ANO DE FUNDAÇÃO */}
                  <Field
                    id="anoFundacao"
                    label="Ano de fundação"
                    icon={<CalendarDays />}
                  >
                    <input
                      id="anoFundacao"
                      name="anoFundacao"
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={anoFundacao}
                      onChange={(event) => {
                        setAnoFundacao(
                          event.target.value.replace(/\D/g, "").slice(0, 4)
                        )
                        setError(null)
                      }}
                      disabled={loading}
                      placeholder="Ex.: 2020"
                      className={inputClass}
                    />
                  </Field>

                  {/* TELEFONE */}
                  <Field id="telefone" label="Telefone" icon={<Phone />} optional>
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={telefone}
                      onChange={(event) => {
                        setTelefone(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      placeholder="(11) 00000-0000"
                      className={inputClass}
                    />
                  </Field>

                  {/* E-MAIL */}
                  <div className="md:col-span-2">
                    <Field
                      id="email"
                      label="E-mail da clínica"
                      icon={<Mail />}
                      optional
                    >
                      <input
                        id="email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value)
                          setError(null)
                        }}
                        disabled={loading}
                        placeholder="contato@clinica.com"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* ENDEREÇO */}
                  <div className="md:col-span-2">
                    <Field
                      id="endereco"
                      label="Endereço"
                      icon={<MapPin />}
                      optional
                    >
                      <input
                        id="endereco"
                        name="endereco"
                        type="text"
                        autoComplete="street-address"
                        value={endereco}
                        onChange={(event) => {
                          setEndereco(event.target.value)
                          setError(null)
                        }}
                        disabled={loading}
                        placeholder="Rua, número, bairro, cidade..."
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* AVISO (somente mobile/tablet; no desktop fica na lateral) */}
                  <div className="flex gap-3 rounded-xl border bg-muted/40 p-4 md:col-span-2 xl:hidden">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Você será o administrador
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Sua conta será vinculada à clínica automaticamente
                        como proprietário/administrador. Depois você poderá
                        convidar outras pessoas.
                      </p>
                    </div>
                  </div>

                  {/* ERRO */}
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 md:col-span-2"
                    >
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* AÇÕES: lado a lado no desktop, empilhadas no mobile */}
                  <div className="flex flex-col gap-3 sm:flex-row-reverse md:col-span-2">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="group flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-[3]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando clínica...
                        </>
                      ) : (
                        <>
                          Criar clínica
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>

                    <Link
                      href="/boas-vindas"
                      className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:flex-[2]"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancelar
                    </Link>
                  </div>
                </form>
              </div>

              <SecureFooter />
            </div>

            {/* TEXTO ABAIXO */}
            <p className="mt-6 text-center text-xs text-muted-foreground xl:text-left">
              Você poderá editar esses dados depois em &quot;Dados da
              Clínica&quot;.
            </p>
          </div>
        </section>
      </div>
    </AuthShell>
  )
}