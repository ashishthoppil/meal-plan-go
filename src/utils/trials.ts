import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,            // server-only
  { auth: { persistSession: false } }
);

const sha = (s: string) => crypto.createHash('sha256').update(s || '').digest('hex');

export async function checkAndConsumeTrial(opts: { ip?: string; ua?: string }) {

  // 1) already used?
  const { data } = await admin.from('trial_uses')
    .select('ip_hash')
    .eq('ip_hash', opts.ip)
  if (data?.length && data.length > 0) return { allowed: false };

  // 2) consume (insert row)
  await admin.from('trial_uses').insert({
    ip_hash: opts.ip,
    ua_hash: opts.ua,
  });

  return { allowed: true };
}
