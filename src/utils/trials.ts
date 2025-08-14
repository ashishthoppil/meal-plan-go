import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,            // server-only
  { auth: { persistSession: false } }
);

const sha = (s: string) => crypto.createHash('sha256').update(s || '').digest('hex');

export async function checkAndConsumeTrial(opts: { email: string; ip?: string; ua?: string }) {
  const email = (opts.email || '').trim().toLowerCase();
  if (!email) throw new Error('email required');

  // 1) already used?
  const { data } = await admin.from('trial_uses').select('email').eq('email', email).maybeSingle();
  if (data) return { allowed: false };

  // 2) consume (insert row)
  await admin.from('trial_uses').insert({
    email,
    ip_hash: sha(opts.ip || ''),
    ua_hash: sha(opts.ua || ''),
  });

  return { allowed: true };
}
