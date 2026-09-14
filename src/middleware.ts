import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  
  // Exclude login and API routes that handle auth
  const isLoginPage = request.nextUrl.pathname === '/login';

  let decodedSession = null;
  if (session) {
    try {
      decodedSession = await decrypt(session);
    } catch (e) {
      decodedSession = null;
    }
  }

  if (!decodedSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (decodedSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
