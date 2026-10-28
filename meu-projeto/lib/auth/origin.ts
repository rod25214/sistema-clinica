import { type NextRequest } from "next/server"

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return true

  try {
    return new URL(origin).origin === request.nextUrl.origin
  } catch {
    return false
  }
}

export function safeNextPath(next: unknown, fallback = "/boas-vindas") {
  if (typeof next !== "string") return fallback
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback
  }
  return next
}
