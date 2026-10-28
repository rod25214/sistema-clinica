"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User,
  IdCard,
  Mail,
  Phone,
  Palette,
  Sun,
  Moon,
  Monitor,
  Clock,
  BadgeCheck,
  Loader2,
  Save,
  X,
  Pencil,
  CheckCircle2,
  Camera,
  ImagePlus,
  Trash2,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"

// ---------- Tipos e constantes ----------

type Tema = "claro" | "escuro" | "sistema"

interface DadosPerfil {
  nome: string
  cpf: string
  rg: string
  telefone: string
  tema: Tema
  cor: string
}

const CORES_SUGERIDAS = ["#000000", "#2563EB", "#00AEEF", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"]

const TEMA_PARA_NEXT: Record<Tema, string> = {
  claro: "light",
  escuro: "dark",
  sistema: "system",
}

const temas: { valor: Tema; label: string; icon: LucideIcon }[] = [
  { valor: "claro", label: "Claro", icon: Sun },
  { valor: "escuro", label: "Escuro", icon: Moon },
  { valor: "sistema", label: "Padrão do sistema", icon: Monitor },
]

const TAMANHO_MAX_FOTO = 5 * 1024 * 1024 // 5 MB

// Dados de exemplo — apenas para visualizar o layout
const DADOS_INICIAIS: DadosPerfil = {
  nome: "Maria Souza Oliveira",
  cpf: "123.456.789-09",
  rg: "12.345.678-9",
  telefone: "(11) 98765-4321",
  tema: "sistema",
  cor: "#2563EB",
}

// ---------- Utilitários ----------

const onlyDigits = (v: string) => v.replace(/\D/g, "")

function maskCpf(v: string) {
  return onlyDigits(v)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

function maskTelefone(v: string) {
  const d = onlyDigits(v).slice(0, 11)
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2")
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2")
}

const corValida = (c: string) => /^#[0-9a-fA-F]{6}$/.test(c)

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// ---------- Componentes auxiliares ----------

/** Linha de informação exibida no modo visualização */
function CampoLeitura({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`truncate text-sm font-medium ${value ? "" : "text-muted-foreground/60 italic"}`}>
          {value || "Não informado"}
        </p>
      </div>
    </div>
  )
}

/** Modal da foto ampliada, com opções de adicionar / trocar / remover */
function FotoModal({
  aberto,
  onFechar,
  foto,
  nome,
  cor,
  onSelecionar,
  onRemover,
}: {
  aberto: boolean
  onFechar: () => void
  foto: string | null
  nome: string
  cor: string
  onSelecionar: (file: File) => string | null // devolve mensagem de erro, se houver
  onRemover: () => void
}) {
  const galeriaRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [aberto, onFechar])

  if (!aberto) return null

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // permite escolher o mesmo arquivo de novo
    if (!file) return
    const msg = onSelecionar(file)
    setErro(msg)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onFechar}
      role="dialog"
      aria-modal="true"
      aria-label="Foto do perfil"
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Foto grande */}
        <div
          className="flex aspect-square w-full items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${cor}, ${cor}80)` }}
        >
          {foto ? (
            <img src={foto} alt={`Foto de ${nome}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/70 bg-white/20 text-5xl font-semibold backdrop-blur-sm">
                {iniciais(nome)}
              </div>
              <p className="text-sm text-white/80">Você ainda não adicionou uma foto</p>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-3 p-4">
          {erro && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-2.5 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {erro}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" onClick={() => galeriaRef.current?.click()} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              {foto ? "Trocar foto" : "Adicionar foto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => cameraRef.current?.click()} className="gap-2">
              <Camera className="h-4 w-4" />
              Tirar foto
            </Button>
          </div>

          {foto && (
            <Button
              type="button"
              variant="ghost"
              onClick={onRemover}
              className="w-full gap-2 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Remover foto
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">JPG, PNG ou WEBP • até 5 MB</p>

          <input ref={galeriaRef} type="file" accept="image/*" className="hidden" onChange={handleArquivo} />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleArquivo}
          />
        </div>
      </div>
    </div>
  )
}

// ---------- Página ----------

export default function ProfilePage() {
  const { setTheme } = useTheme()

  // "salvo" = o que está gravado; "rascunho" = o que está sendo editado
  const [salvo, setSalvo] = useState<DadosPerfil>(DADOS_INICIAIS)
  const [rascunho, setRascunho] = useState<DadosPerfil>(DADOS_INICIAIS)
  const [editando, setEditando] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msgSucesso, setMsgSucesso] = useState(false)

  const [foto, setFoto] = useState<string | null>(null)
  const [fotoAberta, setFotoAberta] = useState(false)

  const email = "maria.souza@clinica.com"
  const ultimoLogin = "13/10/2026 09:41"
  const status = "Ativo"

  const dados = editando ? rascunho : salvo
  const corAtiva = corValida(dados.cor) ? dados.cor : "#000000"
  const temaAtual = temas.find((t) => t.valor === dados.tema)!
  const TemaIcon = temaAtual.icon

  const atualizar = <K extends keyof DadosPerfil>(campo: K, valor: DadosPerfil[K]) =>
    setRascunho((prev) => ({ ...prev, [campo]: valor }))

  // Libera a URL temporária da foto ao trocar/sair
  useEffect(() => {
    return () => {
      if (foto) URL.revokeObjectURL(foto)
    }
  }, [foto])

  // Esconde a mensagem de sucesso sozinha
  useEffect(() => {
    if (!msgSucesso) return
    const t = setTimeout(() => setMsgSucesso(false), 3500)
    return () => clearTimeout(t)
  }, [msgSucesso])

  const iniciarEdicao = () => {
    setRascunho(salvo)
    setMsgSucesso(false)
    setEditando(true)
  }

  const cancelarEdicao = () => {
    setTheme(TEMA_PARA_NEXT[salvo.tema]) // desfaz a pré-visualização do tema
    setRascunho(salvo)
    setEditando(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    // Simulação visual (sem banco de dados)
    setTimeout(() => {
      setSalvo(rascunho)
      setSaving(false)
      setEditando(false)
      setMsgSucesso(true)
    }, 700)
  }

  // Foto: apenas visual, guarda uma URL temporária no navegador
  const selecionarFoto = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "Escolha um arquivo de imagem."
    if (file.size > TAMANHO_MAX_FOTO) return "A imagem deve ter no máximo 5 MB."
    setFoto(URL.createObjectURL(file))
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto @container">
        <form onSubmit={handleSave} className="w-full p-4 @sm:p-6 space-y-6">
          {/* Cabeçalho */}
          <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between gap-2">
            <div>
              <h1 className="text-2xl @lg:text-3xl font-bold tracking-tight">Meu Perfil</h1>
              <p className="text-muted-foreground">
                {editando ? "Altere seus dados e toque em salvar" : "Gerencie seus dados pessoais e preferências do aplicativo"}
              </p>
            </div>
          </div>

          {/* Banner do perfil */}
          <div className="relative w-full overflow-hidden rounded-xl border">
            <div
              className="relative h-48 @sm:h-52 @lg:h-56 w-full transition-colors duration-500"
              style={{ background: `linear-gradient(135deg, ${corAtiva}, ${corAtiva}80)` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              {/* Botão de editar (canto do banner) */}
              {!editando && (
                <Button
                  type="button"
                  onClick={iniciarEdicao}
                  className="absolute right-3 top-3 gap-2 border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/35 @lg:right-4 @lg:top-4"
                >
                  <Pencil className="h-4 w-4" />
                  Editar perfil
                </Button>
              )}
              {editando && (
                <Badge className="absolute right-3 top-3 border-0 bg-white/25 text-white backdrop-blur-sm @lg:right-4 @lg:top-4">
                  <Pencil className="mr-1 h-3 w-3" />
                  Modo edição
                </Badge>
              )}

              <div className="absolute bottom-0 left-0 right-0 flex flex-col @sm:flex-row @sm:items-end gap-4 p-4 @lg:p-6 text-white">
                {/* Avatar — tocar abre a foto ampliada */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setFotoAberta(true)}
                    aria-label="Ver e alterar foto do perfil"
                    className="group relative flex h-20 w-20 @lg:h-24 @lg:w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-white/20 text-2xl @lg:text-3xl font-semibold backdrop-blur-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {foto ? (
                      <img src={foto} alt={`Foto de ${dados.nome}`} className="h-full w-full object-cover" />
                    ) : (
                      iniciais(dados.nome)
                    )}
                    <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-6 w-6" />
                    </span>
                  </button>
                  <span className="pointer-events-none absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow">
                    <Camera className="h-4 w-4" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg @lg:text-2xl font-semibold">{dados.nome || "Seu nome"}</h2>
                  <p className="truncate text-sm text-white/80">{email}</p>
                </div>

                <Badge className="w-fit border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                  {status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Cards-resumo */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-4 gap-4">
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Último login</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ultimoLogin.split(" ")[1]}</div>
                <p className="text-xs text-muted-foreground">{ultimoLogin.split(" ")[0]}</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do perfil</CardTitle>
                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status}</div>
                <p className="text-xs text-muted-foreground">Definido pelo sistema</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tema</CardTitle>
                <TemaIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{temaAtual.label}</div>
                <p className="text-xs text-muted-foreground">Aparência do aplicativo</p>
              </CardContent>
            </Card>

            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cor de destaque</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full border" style={{ backgroundColor: corAtiva }} aria-hidden />
                  <div className="text-2xl font-bold font-mono">{corAtiva.toUpperCase()}</div>
                </div>
                <p className="text-xs text-muted-foreground">Usada em botões e destaques</p>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo principal */}
          <div className="grid grid-cols-1 @2xl:grid-cols-2 gap-6">
            {/* ---------- DADOS PESSOAIS ---------- */}
            <Card className={editando ? "ring-1 ring-primary/30 transition-shadow" : "transition-shadow"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Dados pessoais
                </CardTitle>
                <CardDescription>Informações usadas na sua identificação dentro das clínicas</CardDescription>
              </CardHeader>

              <CardContent>
                {editando ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="grid gap-2">
                      <Label htmlFor="nome">Nome completo</Label>
                      <Input
                        id="nome"
                        value={rascunho.nome}
                        onChange={(e) => atualizar("nome", e.target.value)}
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="grid grid-cols-1 @sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="cpf" className="flex items-center gap-1.5">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          CPF
                        </Label>
                        <Input
                          id="cpf"
                          inputMode="numeric"
                          value={rascunho.cpf}
                          onChange={(e) => atualizar("cpf", maskCpf(e.target.value))}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="rg" className="flex items-center gap-1.5">
                          <IdCard className="h-4 w-4 text-muted-foreground" />
                          RG
                        </Label>
                        <Input
                          id="rg"
                          value={rascunho.rg}
                          onChange={(e) => atualizar("rg", e.target.value)}
                          placeholder="00.000.000-0"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="telefone" className="flex items-center gap-1.5">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone
                      </Label>
                      <Input
                        id="telefone"
                        inputMode="tel"
                        value={rascunho.telefone}
                        onChange={(e) => atualizar("telefone", maskTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email" className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        E-mail
                      </Label>
                      <Input id="email" value={email} disabled />
                      <p className="text-xs text-muted-foreground">
                        O e-mail é o mesmo usado no login e não pode ser alterado aqui.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 animate-in fade-in duration-300">
                    <CampoLeitura icon={User} label="Nome completo" value={salvo.nome} />
                    <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
                      <CampoLeitura icon={IdCard} label="CPF" value={salvo.cpf} />
                      <CampoLeitura icon={IdCard} label="RG" value={salvo.rg} />
                    </div>
                    <CampoLeitura icon={Phone} label="Telefone" value={salvo.telefone} />
                    <CampoLeitura icon={Mail} label="E-mail" value={email} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ---------- APARÊNCIA ---------- */}
            <Card className={editando ? "ring-1 ring-primary/30 transition-shadow" : "transition-shadow"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Aparência
                </CardTitle>
                <CardDescription>Tema e cor de destaque usados no aplicativo</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Tema */}
                <div className="grid gap-2">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {temas.map((t) => {
                      const Icon = t.icon
                      const ativo = dados.tema === t.valor
                      return (
                        <Button
                          key={t.valor}
                          type="button"
                          variant="outline"
                          disabled={!editando}
                          onClick={() => {
                            atualizar("tema", t.valor)
                            setTheme(TEMA_PARA_NEXT[t.valor]) // pré-visualiza na hora
                          }}
                          className={`h-auto flex-col gap-2 py-4 transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-100 ${
                            ativo ? "border-primary bg-primary/10" : editando ? "" : "opacity-50"
                          }`}
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="text-xs font-medium text-center leading-tight">{t.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Cor de destaque */}
                <div className="grid gap-3">
                  <Label htmlFor="cor">Cor de destaque</Label>

                  <div className="flex flex-wrap gap-2">
                    {CORES_SUGERIDAS.map((c) => {
                      const ativa = dados.cor.toUpperCase() === c
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={!editando}
                          onClick={() => atualizar("cor", c)}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            editando ? "hover:scale-110" : "cursor-default"
                          } ${ativa ? "border-foreground scale-110" : "border-transparent"} ${
                            !editando && !ativa ? "opacity-40" : ""
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Usar cor ${c}`}
                        />
                      )
                    })}
                  </div>

                  {editando && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                      <input
                        id="cor"
                        type="color"
                        value={corAtiva}
                        onChange={(e) => atualizar("cor", e.target.value.toUpperCase())}
                        className="h-10 w-14 cursor-pointer rounded-md border bg-transparent p-1"
                        aria-label="Selecionar cor de destaque"
                      />
                      <Input
                        value={rascunho.cor}
                        onChange={(e) => atualizar("cor", e.target.value.toUpperCase())}
                        placeholder="#000000"
                        maxLength={7}
                        className="w-32 font-mono"
                      />
                    </div>
                  )}

                  {/* Pré-visualização */}
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                    <span
                      className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-white"
                      style={{ backgroundColor: corAtiva }}
                    >
                      Botão de exemplo
                    </span>
                    <span
                      className="inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium"
                      style={{ backgroundColor: `${corAtiva}1A`, color: corAtiva }}
                    >
                      Etiqueta
                    </span>
                    <span className="text-xs text-muted-foreground">Pré-visualização</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mensagem de sucesso (modo visualização) */}
          {msgSucesso && !editando && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              Perfil atualizado com sucesso!
            </div>
          )}

          {/* Barra de ações — só aparece no modo edição, fixa no rodapé */}
          {editando && (
            <div className="sticky bottom-4 z-10 flex flex-col-reverse @sm:flex-row @sm:items-center @sm:justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-300">
              <p className="hidden @sm:block text-sm text-muted-foreground pl-1">Você está editando seu perfil</p>
              <div className="flex gap-3 @sm:justify-end">
                <Button type="button" variant="outline" onClick={cancelarEdicao} disabled={saving} className="flex-1 @sm:flex-none">
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving} className="flex-1 @sm:flex-none">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Foto ampliada */}
      <FotoModal
        aberto={fotoAberta}
        onFechar={() => setFotoAberta(false)}
        foto={foto}
        nome={dados.nome}
        cor={corAtiva}
        onSelecionar={selecionarFoto}
        onRemover={() => setFoto(null)}
      />
    </div>
  )
}