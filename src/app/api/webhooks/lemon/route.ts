export const runtime = 'nodejs';

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** verify Lemon Squeezy signature using raw body */
function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  // timing-safe string comparison
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a as any, b as any);
}

function pickEmail(payload: any): string | null {
  const a = payload?.meta.custom_data.user_id || null;
  return (
    a || null
  );
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,   // service role (server only)
  { auth: { persistSession: false } }
);

export async function POST(req: Request) {
  try {
    const raw = await req.text();                          // raw body for signature
    const signature = req.headers.get('x-signature');
    const secret = process.env.LEMON_WEBHOOK_SECRET!;
    if (!secret) return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });

    const ok = verifySignature(raw, signature, secret);
    if (!ok) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    const body = JSON.parse(raw);
    const event = body?.meta?.event_name as string | undefined;

    // Handle purchase/subscription events that should mark user as paid
    const activates = new Set([
      'subscription_payment_success',
    ]);

    if (!event || !activates.has(event)) {
      return NextResponse.json({ received: true, ignored: event ?? 'unknown' });
    }

    const id = pickEmail(body);
    if (!id) {
      console.error('No user_id in webhook payload:', body);
      return NextResponse.json({ error: 'user_not_found' }, { status: 400 });
    }

    // Update profile: plan -> paid, reset tries, set subscribed_on
    const { error } = await admin
      .from('profiles')
      .update({
        plan: 'paid',
        tries: 0,
        subscribed_on: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
