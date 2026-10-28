"use client"

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react"

import Link from "next/link"

import {

  ArrowLeft,

  ArrowRight,

  Check,

  CheckCircle2,

  Eye,

  EyeOff,

  LockKeyhole,

  Mail,
  IdCard,
  Phone,
  ShieldCheck,

  UserRound,

  X,

  Activity,

  Building2,

} from "lucide-react"

import { ThemeColorSelector } from "@/components/theme-color-selector"

/* ============================================================

 * CLASSES REUTILIZÁVEIS

 * - text-base no mobile evita o zoom automático do iOS ao focar

 *   nos campos; a partir de sm volta para text-sm.

 * ============================================================ */

const inputClass =

  "h-12 w-full rounded-xl border border-border bg-background pl-10 text-base outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"

/* ============================================================

 * COMPONENTES AUXILIARES

 * ============================================================ */

function PasswordRule({

  valid,

  children,

}: {

  valid: boolean

  children: ReactNode

}) {

  return (

    <div

      className={`flex items-center gap-2 text-xs ${

        valid ? "text-emerald-600" : "text-muted-foreground"

      }`}

    >

      {valid ? (

        <Check className="h-3.5 w-3.5 shrink-0" />

      ) : (

        <X className="h-3.5 w-3.5 shrink-0 opacity-50" />

      )}

      <span>{children}</span>

    </div>

  )

}

function Field({

  id,

  label,

  icon,

  children,

}: {

  id: string

  label: string

  icon: ReactNode

  children: ReactNode

}) {

  return (

    <div className="space-y-2">

      <label htmlFor={id} className="block text-sm font-medium">

        {label}

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

function ToggleVisibility({

  visible,

  onToggle,

  disabled,

  labelShow,

  labelHide,

}: {

  visible: boolean

  onToggle: () => void

  disabled: boolean

  labelShow: string

  labelHide: string

}) {

  return (

    <button

      type="button"

      onClick={onToggle}

      disabled={disabled}

      aria-label={visible ? labelHide : labelShow}

      className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"

    >

      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}

    </button>

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

 * Estrutura base compartilhada pelas duas telas (cadastro e sucesso):

 * fundo decorativo + header no fluxo normal + área de conteúdo.

 * O header deixa de ser "absolute", então nunca sobrepõe o conteúdo

 * e não é mais necessário compensar com padding gigante (py-28).

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

          href="/login"

          className="group inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/70 px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:bg-background hover:text-foreground sm:px-4"

        >

          <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />

          <span className="sm:hidden">Voltar</span>

          <span className="hidden sm:inline">Voltar para o login</span>

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

export default function CadastroPage() {

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [rg, setRg] = useState("")
  const [telefone, setTelefone] = useState("")

  const [password, setPassword] = useState("")

  const [passwordConfirmation, setPasswordConfirmation] = useState("")

  const [showPassword, setShowPassword] = useState(false)

  const [showConfirmation, setShowConfirmation] = useState(false)

  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const passwordRules = useMemo(

    () => ({

      length: password.length >= 12,

      uppercase: /[A-Z]/.test(password),

      lowercase: /[a-z]/.test(password),

      number: /[0-9]/.test(password),

      symbol: /[^A-Za-z0-9]/.test(password),

    }),

    [password]

  )

  const passwordIsStrong =

    passwordRules.length &&

    passwordRules.uppercase &&

    passwordRules.lowercase &&

    passwordRules.number &&

    passwordRules.symbol

  const passwordsMatch =

    password.length > 0 && password === passwordConfirmation

  const canSubmit =

    name.trim().length >= 2 &&

    email.trim().length > 0 &&
    cpf.replace(/\D/g, "").length === 11 &&
    passwordIsStrong &&

    passwordsMatch &&

    acceptedTerms &&

    !loading

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {

    event.preventDefault()

    setError(null)

    const cleanName = name.trim()

    const cleanEmail = email.trim().toLowerCase()
    const cleanCpf = cpf.replace(/\D/g, "")

    if (!cleanName || cleanName.length < 2) {

      setError("Informe seu nome completo.")

      return

    }

    if (!cleanEmail) {

      setError("Informe seu e-mail.")

      return

    }

    if (cleanCpf.length !== 11) {
      setError("Informe um CPF válido com 11 números.")
      return
    }

    if (!passwordIsStrong) {

      setError("Escolha uma senha mais segura.")

      return

    }

    if (!passwordsMatch) {

      setError("As senhas não coincidem.")

      return

    }

    if (!acceptedTerms) {

      setError("Você precisa aceitar os termos para continuar.")

      return

    }

    setLoading(true)

    try {
      setPassword("")
      setPasswordConfirmation("")
      setSuccessMessage("Sua conta foi criada com sucesso. Você já pode acessar a página de login.")
      setSuccess(true)

    } catch (err) {

      setError(

        err instanceof Error

          ? err.message

          : "Não foi possível concluir o cadastro."

      )

    } finally {

      setLoading(false)

    }
  }

  /* ==========================================================

   * TELA DE SUCESSO

   * ========================================================== */

  if (success) {

    return (

      <AuthShell>

        <section className="flex flex-1 items-center justify-center px-4 pb-10 pt-4 sm:px-6">

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/95 shadow-xl shadow-black/5 backdrop-blur-xl">

            <div className="p-6 text-center sm:p-9">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">

                <CheckCircle2 className="h-8 w-8" />

              </div>

              <h1 className="text-2xl font-bold tracking-tight">

                Conta criada

              </h1>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">

                {successMessage}

              </p>

              {successMessage.includes("confirmação") && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border bg-muted/40 p-4 text-left">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Verifique seu e-mail</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Caso não encontre a mensagem, verifique também a pasta de
                      spam ou lixo eletrônico.
                    </p>
                  </div>
                </div>
              )}

              <Link

                href="/login"

                className="group mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"

              >

                Ir para o login

                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

              </Link>

            </div>

            <SecureFooter />

          </div>

        </section>

      </AuthShell>

    )

  }

  /* ==========================================================

   * CADASTRO

   * ========================================================== */

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

                  Gestão inteligente

                </span>

              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">

                Uma plataforma para organizar sua clínica.

              </h2>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground">

                Crie seu acesso e tenha uma base segura para gerenciar sua

                clínica, sua equipe e os processos do dia a dia.

              </p>

            </div>

            {/* BLOCO DE SEGURANÇA */}

            <div className="mt-10 rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur-md">

              <div className="flex gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">

                  <ShieldCheck className="h-4 w-4 text-primary" />

                </div>

                <div>

                  <p className="text-sm font-semibold">

                    Segurança desde o primeiro acesso

                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">

                    Sua senha é gerenciada pelo sistema de autenticação e não

                    será armazenada na tabela de perfil da aplicação.

                  </p>

                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* ----------------------------------------------------

            LADO DIREITO (formulário horizontal)

        ----------------------------------------------------- */}

        <section className="flex items-start justify-center px-4 pb-10 pt-4 sm:px-8 sm:pt-6 md:pt-10 xl:items-start xl:px-0 xl:pb-10 xl:pt-16">

          <div className="w-full max-w-2xl">

            {/* TÍTULO */}

            <div className="mb-6 text-center sm:mb-8 xl:text-left">

              {/* MARCA (mobile/tablet) */}

              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ring-8 ring-primary/5 xl:hidden">

                <Activity className="h-7 w-7" />

              </div>

              <p className="text-sm font-medium text-primary">

                PRIMEIRO PASSO

              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">

                Criar sua conta

              </h1>

              <p className="mt-2 text-sm text-muted-foreground">

                Crie seu acesso para começar a utilizar o sistema.

              </p>

            </div>

            {/* CARD DO FORMULÁRIO */}

            <div className="overflow-hidden rounded-2xl border border-border bg-card/95 shadow-xl shadow-black/5 backdrop-blur-xl">

              <div className="p-5 sm:p-8">

                {/* Grid de 2 colunas a partir de sm; 1 coluna no mobile */}

                <form

                  onSubmit={handleSubmit}

                  className="grid items-start gap-x-5 gap-y-5 md:grid-cols-2"

                  noValidate

                >

                  {/* NOME */}

                  <Field id="name" label="Nome completo" icon={<UserRound />}>

                    <input

                      id="name"

                      name="name"

                      type="text"

                      autoComplete="name"

                      value={name}

                      onChange={(event) => {

                        setName(event.target.value)

                        setError(null)

                      }}

                      disabled={loading}

                      placeholder="Seu nome completo"

                      className={`${inputClass} pr-4`}

                    />

                  </Field>

                  {/* EMAIL */}

                  <Field id="email" label="E-mail" icon={<Mail />}>

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

                      placeholder="seu@email.com"

                      className={`${inputClass} pr-4`}

                    />

                  </Field>

                  {/* CPF */}
                  <Field id="cpf" label="CPF" icon={<IdCard />}>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={cpf}
                      onChange={(event) => {
                        setCpf(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      required
                      maxLength={14}
                      placeholder="000.000.000-00"
                      className={`${inputClass} pr-4`}
                    />
                  </Field>

                  {/* RG */}
                  <Field id="rg" label="RG (opcional)" icon={<IdCard />}>
                    <input
                      id="rg"
                      name="rg"
                      type="text"
                      value={rg}
                      onChange={(event) => {
                        setRg(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      maxLength={30}
                      placeholder="Seu RG"
                      className={`${inputClass} pr-4`}
                    />
                  </Field>

                  {/* TELEFONE */}
                  <Field id="telefone" label="Telefone (opcional)" icon={<Phone />}>
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      autoComplete="tel"
                      value={telefone}
                      onChange={(event) => {
                        setTelefone(event.target.value)
                        setError(null)
                      }}
                      disabled={loading}
                      maxLength={30}
                      placeholder="(11) 99999-9999"
                      className={`${inputClass} pr-4`}
                    />
                  </Field>

                  {/* SENHA */}

                  <div className="order-3">

                    <Field id="password" label="Senha" icon={<LockKeyhole />}>

                      <input

                        id="password"

                        name="password"

                        type={showPassword ? "text" : "password"}

                        autoComplete="new-password"

                        value={password}

                        onChange={(event) => {

                          setPassword(event.target.value)

                          setError(null)

                        }}

                        disabled={loading}

                        placeholder="Crie uma senha forte"

                        className={`${inputClass} pr-12`}

                      />

                      <ToggleVisibility

                        visible={showPassword}

                        onToggle={() => setShowPassword((value) => !value)}

                        disabled={loading}

                        labelShow="Mostrar senha"

                        labelHide="Ocultar senha"

                      />

                    </Field>

                  </div>

                  {/* REGRAS (logo abaixo da senha no mobile; linha própria no desktop) */}

                  <div className="order-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-muted/40 p-3 md:order-5 md:col-span-2">

                    <PasswordRule valid={passwordRules.length}>

                      12 caracteres

                    </PasswordRule>

                    <PasswordRule valid={passwordRules.uppercase}>

                      Letra maiúscula

                    </PasswordRule>

                    <PasswordRule valid={passwordRules.lowercase}>

                      Letra minúscula

                    </PasswordRule>

                    <PasswordRule valid={passwordRules.number}>

                      Número

                    </PasswordRule>

                    <PasswordRule valid={passwordRules.symbol}>

                      Símbolo

                    </PasswordRule>

                  </div>

                  {/* CONFIRMAR SENHA */}

                  <div className="order-5 space-y-2 md:order-4">

                    <Field

                      id="passwordConfirmation"

                      label="Confirmar senha"

                      icon={<LockKeyhole />}

                    >

                      <input

                        id="passwordConfirmation"

                        name="passwordConfirmation"

                        type={showConfirmation ? "text" : "password"}

                        autoComplete="new-password"

                        value={passwordConfirmation}

                        onChange={(event) => {

                          setPasswordConfirmation(event.target.value)

                          setError(null)

                        }}

                        disabled={loading}

                        placeholder="Digite a senha novamente"

                        className={`${inputClass} pr-12`}

                      />

                      <ToggleVisibility

                        visible={showConfirmation}

                        onToggle={() => setShowConfirmation((value) => !value)}

                        disabled={loading}

                        labelShow="Mostrar confirmação"

                        labelHide="Ocultar confirmação"

                      />

                    </Field>

                    {passwordConfirmation.length > 0 && (

                      <p

                        aria-live="polite"

                        className={`text-xs ${

                          passwordsMatch

                            ? "text-emerald-600"

                            : "text-destructive"

                        }`}

                      >

                        {passwordsMatch

                          ? "As senhas coincidem."

                          : "As senhas ainda não coincidem."}

                      </p>

                    )}

                  </div>

                  {/* TERMOS */}

                  <label className="order-6 flex cursor-pointer items-start gap-3 md:col-span-2">

                    <input

                      type="checkbox"

                      checked={acceptedTerms}

                      onChange={(event) => setAcceptedTerms(event.target.checked)}

                      disabled={loading}

                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"

                    />

                    <span className="text-xs leading-5 text-muted-foreground">

                      Li e aceito os termos de uso e a política de privacidade.

                    </span>

                  </label>

                  {/* ERRO */}

                  {error && (

                    <div

                      role="alert"

                      className="order-7 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 md:col-span-2"

                    >

                      <p className="text-sm text-destructive">{error}</p>

                    </div>

                  )}

                  {/* AÇÕES: lado a lado no desktop, empilhadas no mobile */}

                  <div className="order-8 flex flex-col gap-3 md:col-span-2 sm:flex-row-reverse">

                    <button

                      type="submit"

                      disabled={!canSubmit}

                      className="group flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-[3]"

                    >

                      {loading ? (

                        "Criando sua conta..."

                      ) : (

                        <>

                          Criar minha conta

                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />

                        </>

                      )}

                    </button>

                    <Link

                      href="/login"

                      className="flex h-12 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-muted sm:flex-[2]"

                    >

                      <ArrowLeft className="mr-2 h-4 w-4" />

                      Já tenho uma conta

                    </Link>

                  </div>

                </form>

              </div>

              <SecureFooter />

            </div>

            {/* TEXTO ABAIXO */}

            <p className="mt-6 text-center text-xs text-muted-foreground xl:text-left">

              Depois de criar sua conta, você poderá configurar sua clínica e

              seu perfil.

            </p>

          </div>

        </section>

      </div>

    </AuthShell>

  )

}