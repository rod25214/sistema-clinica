import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const CLINIC_COOKIE = "app_clinic_id"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isClinicId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value)
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  }
}

export async function readClinicCookie() {
  const store = await cookies()
  const value = store.get(CLINIC_COOKIE)?.value
  return isClinicId(value) ? value : null
}

export function writeClinicCookie(response: NextResponse, clinicId: string) {
  response.cookies.set(CLINIC_COOKIE, clinicId, cookieOptions())
  return response
}

export function clearClinicCookie(response: NextResponse) {
  response.cookies.set(CLINIC_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  })
  return response
}
