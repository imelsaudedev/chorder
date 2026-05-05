import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware that ensures NEXT_LOCALE is set to pt-BR if missing
  // This satisfies next-intl's getLocale() without requiring URL rewrites or localized folders.
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'pt-BR';
  
  const response = NextResponse.next();
  
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', 'pt-BR');
  }
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)']
};
