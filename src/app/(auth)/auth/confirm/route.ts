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
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const destination = new URL('/', request.url);

  if (!tokenHash || !type || !otpTypes.has(type)) {
    return NextResponse.redirect(
      new URL('/login?error=invalid-link', request.url),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error || !user || !(await provisionAuthorizedUser(user))) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL('/login?error=unauthorized', request.url),
    );
  }

  return NextResponse.redirect(destination);
}
