"use client"

import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { ArrowUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIOverlayProps {
  open: boolean
  onClose: () => void
  /**
   * Chamado ao enviar a pergunta. Se nao for informado, abre a pagina
   * /assistente-ia com a pergunta em ?q=
   */
  onSubmit?: (text: string) => void
}

// Tempo da animacao de saida (ms) — precisa bater com ai-fade-out / ai-rise-out abaixo
const EXIT_MS = 300

const AI_CSS = `
@keyframes ai-spin { to { transform: rotate(360deg); } }
@keyframes ai-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes ai-fade-out { from { opacity: 1; } to { opacity: 0; } }
@keyframes ai-rise-in {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ai-rise-out {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(18px) scale(0.98); }
}

/* Anel que mostra so a borda da tela (mascara "furada" no meio) */
.ai-ring {
  position: fixed;
  inset: 0;
  z-index: 60;
  pointer-events: none;
  overflow: hidden;
  padding: var(--ai-ring, 3px);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}
.ai-ring[data-state="open"]   { animation: ai-fade-in 0.4s ease forwards; }
.ai-ring[data-state="closed"] { animation: ai-fade-out ${EXIT_MS}ms ease forwards; }

/* Faixa colorida girando: aparece como uma luz passando pelas bordas */
.ai-ring::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 250vmax;
  height: 250vmax;
  margin: -125vmax 0 0 -125vmax;
  background:
    conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 190deg,
      #22d3ee 235deg,
      #6366f1 270deg,
      #a855f7 298deg,
      #ec4899 322deg,
      #f97316 345deg,
      transparent 360deg
    ),
    rgba(99, 102, 241, 0.22);
  animation: ai-spin 3.4s linear infinite;
}

/* Halo desfocado por cima da linha */
.ai-ring--glow {
  --ai-ring: 8px;
  filter: blur(9px);
}

.ai-box[data-state="open"]   { animation: ai-rise-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
.ai-box[data-state="closed"] { animation: ai-rise-out ${EXIT_MS}ms ease forwards; }

@media (prefers-reduced-motion: reduce) {
  .ai-ring::before { animation-duration: 14s; }
}
`

export function AIOverlay({ open, onClose, onSubmit }: AIOverlayProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false) // portal so existe no cliente
  const [render, setRender] = useState(open) // mantem montado durante a animacao de saida
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      setRender(true)
      return
    }
    const t = setTimeout(() => setRender(false), EXIT_MS)
    return () => clearTimeout(t)
  }, [open])

  // Foca o campo assim que abre
  useEffect(() => {
    if (open && render) textareaRef.current?.focus()
  }, [open, render])

  // Esc fecha
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const submit = () => {
    const text = value.trim()
    if (!text) return
    if (onSubmit) onSubmit(text)
    else router.push(`/assistente-ia?q=${encodeURIComponent(text)}`)
    setValue("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    onClose()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    submit()
  }

  // Enter envia; Shift+Enter quebra linha
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  if (!mounted || !render) return null

  const state = open ? "open" : "closed"

  return createPortal(
    <>
      <style>{AI_CSS}</style>

      {/* Linha colorida passando pelas bordas da pagina */}
      <div className="ai-ring ai-ring--glow" data-state={state} aria-hidden />
      <div className="ai-ring" data-state={state} aria-hidden />

      {/* Input flutuante */}
      <div className="fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4 pointer-events-none">
        <form onSubmit={handleSubmit} data-state={state} className="ai-box pointer-events-auto w-full max-w-[720px]">
          <div className="rounded-2xl border border-border bg-card p-3 shadow-2xl ring-1 ring-black/5 flex flex-col gap-2">
            <textarea
              ref={textareaRef}
              value={value}
              rows={1}
              onChange={(e) => {
                setValue(e.target.value)
                autoResize()
              }}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo para a IA..."
              className="w-full resize-none bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground max-h-40"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="hidden sm:block text-xs text-muted-foreground">
                Enter para enviar · Shift+Enter para nova linha · Esc para fechar
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground"
                  onClick={onClose}
                  title="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={!value.trim()}
                  title="Enviar"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>,
    document.body,
  )
}