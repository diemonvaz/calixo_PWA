import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Create a Supabase client for middleware operations
 * This handles session refresh and authentication checks
 * 
 * Note: Middleware runs in Edge Runtime, which cannot disable SSL verification.
 * If APP_ENV = CAJA and you're behind a VPN, the middleware may fail.
 * Consider using Node.js runtime for routes that need SSL bypass.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Edge Runtime doesn't support disabling SSL verification
  // So we use the default fetch (even if APP_ENV = CAJA)
  // The server-side clients (in server.ts) will handle SSL bypass for Node.js runtime

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if it exists - getUser() automatically refreshes the session
  // This is important for session persistence across page loads
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Protect routes that require authentication
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/challenges') ||
    request.nextUrl.pathname.startsWith('/admin');

  if (!user && isProtectedRoute) {
    // Redirect to login if trying to access protected route without auth
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // Redirect to home (feed) if already authenticated and trying to access auth pages
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

