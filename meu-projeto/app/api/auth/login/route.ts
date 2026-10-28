
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: "O corpo da requisição não contém um JSON válido." },
        { status: 400 },
      )
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Informe seu e-mail e sua senha." },
        { status: 400 },
      )
    }

    const payload = body as Record<string, unknown>

    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : ""

    const password =
      typeof payload.password === "string"
        ? payload.password
        : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "Informe seu e-mail e sua senha." },
        { status: 400 },
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Informe um endereço de e-mail válido." },
        { status: 400 },
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "Configuração do Supabase ausente. Verifique as variáveis de ambiente.",
      )

      return NextResponse.json(
        {
          error:
            "O serviço de autenticação não está configurado corretamente.",
        },
        { status: 500 },
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },

          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      },
    )

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error || !data.user || !data.session) {
      const authCode =
        error && "code" in error
          ? String(error.code)
          : ""

      if (authCode === "email_not_confirmed") {
        return NextResponse.json(
          {
            error:
              "Confirme seu e-mail antes de entrar na sua conta.",
          },
          { status: 403 },
        )
      }

      if (error) {
        console.warn(
          "Falha no login do Supabase:",
          error.message,
        )
      }

      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Login realizado com sucesso.",
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error(
      "Erro inesperado na rota /api/auth/login:",
      error,
    )

    return NextResponse.json(
      {
        error:
          "Não foi possível conectar ao servidor. Tente novamente.",
      },
      { status: 500 },
    )
  }
}
