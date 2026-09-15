'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { activeTeamCookieName } from '@/features/auth/authorization';
import { createClient } from '@/lib/supabase/server';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(activeTeamCookieName);
  redirect('/login');
}
