import { type NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  return NextResponse.redirect(
    new URL('/login?error=magic-link-disabled', request.url),
  );
}
