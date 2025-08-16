import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { email } = await req.json();
    const { data: profile, error: profErr } = await admin
        .from('profiles')
        .select('plan')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
    return NextResponse.json({ status: 'success', plan: profile?.plan });
}