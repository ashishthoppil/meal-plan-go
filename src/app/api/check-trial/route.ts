import { checkAndConsumeTrial } from "@/utils/trials";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
      const forwardedFor = req.headers.get('x-forwarded-for') || '';
      // If there are multiple IPs, the first one is the client
      const ip = forwardedFor.split(',')[0]?.trim() || 'unknown';
      const ua = req.headers.get('user-agent') || '';
    
      const trial = await checkAndConsumeTrial({ ip, ua });
      
    return NextResponse.json({
          trial,
    })
}