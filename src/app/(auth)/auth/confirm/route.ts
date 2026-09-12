import type { EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { provisionAuthorizedUser } from '@/features/auth/authorization';
import { createClient } from '@/lib/supabase/server';

const otpTypes = new Set<EmailOtpType>([
  'email',
  'email_change',
  'invite',
  'magiclink',
  'recovery',
  'signup',
]);

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const destination = new URL('/', request.url);
  const supabase = await createClient();

  const authentication = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type && otpTypes.has(type)
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : null;

  if (!authentication || authentication.error) {
    return NextResponse.redirect(
      new URL('/login?error=invalid-link', request.url),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !(await provisionAuthorizedUser(user))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/login?error=unauthorized', request.url),
    );
  }

  return NextResponse.redirect(destination);
}
