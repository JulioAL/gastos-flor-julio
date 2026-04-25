import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isLoginPath = request.nextUrl.pathname.startsWith('/login')
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth')

  // Redirect unauthenticated users to login
  if (!user && !isLoginPath && !isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce email allowlist — sign out and redirect if user is not authorized
  if (user) {
    const allowed = (process.env.ALLOWED_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
    if (allowed.length > 0 && !allowed.includes((user.email ?? '').toLowerCase())) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from login
  if (user && isLoginPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/resumen'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.png|manifest.json|icons).*)'],
}
