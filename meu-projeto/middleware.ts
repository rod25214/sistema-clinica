import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PUBLIC_PREFIXES = [
  "/login",
  "/cadastro",
  "/recuperar-senha",
  "/auth",
  "/api/auth",
  "/api/cadastro",
]

const GUEST_ONLY_PAGES = ["/login", "/cadastro", "/recuperar-senha"]

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = request.nextUrl

  function withCookies(target: NextResponse) {
    response.cookies.getAll().forEach((cookie) => {
      target.cookies.set(cookie)
    })
    return target
  }

  const isPublic = PUBLIC_PREFIXES.some((prefix) => matches(pathname, prefix))

  if (!user && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return withCookies(
        NextResponse.json(
          { ok: false, error: "Não autenticado." },
          { status: 401, headers: { "Cache-Control": "no-store" } }
        )
      )
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.search = ""
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", `${pathname}${search}`)
    }
    return withCookies(NextResponse.redirect(loginUrl))
  }

  if (user && GUEST_ONLY_PAGES.some((page) => matches(pathname, page))) {
    const requestedNext = request.nextUrl.searchParams.get("next")
    const nextUrl = request.nextUrl.clone()
    if (
      requestedNext &&
      requestedNext.startsWith("/") &&
      !requestedNext.startsWith("//") &&
      !requestedNext.includes("\\")
    ) {
      return withCookies(NextResponse.redirect(new URL(requestedNext, request.nextUrl.origin)))
    }
    nextUrl.pathname = "/boas-vindas"
    nextUrl.search = ""
    return withCookies(NextResponse.redirect(nextUrl))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff2?)$).*)",
  ],
}
