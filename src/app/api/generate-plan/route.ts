export const maxDuration = 300;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { checkAndConsumeTrial } from '@/utils/trials';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
// import Chromium from '@sparticuz/chromium';
// import type { Browser } from 'puppeteer-core';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
// ---------- Types
export type Meal = {
  dish: string;
  cookingDuration: string;
  ingredients: string[];
  recipe: string[];
};
export type DayPlan = {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
};
export type GroceryItem = { ingredient: string; quantity: string };
export type PlanResponse = { meals: DayPlan[]; groceryList: GroceryItem[] };

// ---------- Helpers
function stripCodeFence(input: string) {
  if (!input) return input;
  let trimmedText = input.replace('```json', '')
  trimmedText = trimmedText.replace('```', '');
  return trimmedText;
}

function safeParsePlan(content: string): PlanResponse {
  const raw = stripCodeFence(content).trim();
  try {
    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.meals) || !Array.isArray(parsed.groceryList)) {
      throw new Error('Malformed JSON structure.');
    }
    return parsed as PlanResponse;
  } catch (e) {
    throw new Error('LLM did not return valid JSON.');
  }
}

function buildPrompt({ peopleCount, dietPreference, cuisine, additionalNote }: any) {
  return `You are a professional meal planner.\nCreate a 7-day meal plan for ${peopleCount} people.\nDiet preference: ${dietPreference}.\nPreferred cuisines: ${cuisine}.\nAdditional note: ${additionalNote || 'None'}.\nNumber of meals a day: 3.\n\nSTRICTLY return valid JSON matching this shape (no prose, no explanations, no markdown fences):\n{\n  "meals": [\n    {\n      "breakfast": {\n        "dish": "Oatmeal",\n        "cookingDuration": "5 minutes",\n        "ingredients": ["..."],\n        "recipe": ["Step 1", "Step 2"]\n      },\n      "lunch": { "dish": "...", "cookingDuration": "...", "ingredients": ["..."], "recipe": ["..."] },\n      "dinner": { "dish": "...", "cookingDuration": "...", "ingredients": ["..."], "recipe": ["..."] }\n    }\n  ],\n  "groceryList": [ { "ingredient": "Chicken", "quantity": "500 g" } ]\n}\n\nRules:\n- meals array MUST have exactly 7 entries (Mon..Sun).\n- Keep meals simple and healthy for busy people.\n- Use METRIC units for quantities in groceryList (g, ml, etc.).\n- Avoid brand names.`;
}

// function planToHTML(plan: PlanResponse, opts: { title?: string; people?: number } = {}, trialAllowed: boolean) {
//   const title = opts.title ?? '7‑Day Meal Plan';
//   const people = opts.people ?? 1;
//   const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
//   const esc = (s: string) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
//   return `<!doctype html>
//   <html><head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1" />
//     <title>${esc(title)}</title>
//     <style>
//       body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#0f172a}
//       h1{margin:0 0 12px}
//       .sub{color:#475569;margin-bottom:24px}
//       .grid{display:grid;grid-template-columns:repeat(1,1fr);gap:16px}
//       @media(min-width:900px){.grid{grid-template-columns:repeat(2,1fr)}}
//       .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fff}
//       .meal{display:grid;grid-template-columns:120px 1fr;gap:8px}
//       .meal h3{margin:0 0 4px}
//       .tag{display:inline-block;border-radius:9999px;background:#eef2ff;color:#3730a3;padding:2px 10px;font-size:12px}
//       ul{margin:6px 0 12px}
//       .grocery{margin-top:24px}
//       table{width:100%;border-collapse:collapse;margin-top:8px}
//       th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}
//       th{background:#f8fafc}
//     </style>
//   </head>
//   <body>
//     <h1>${esc(title)}</h1>
//     <div class="sub">Planned for <strong>${people}</strong> people.</div>
//     <div class="grid">
//       ${plan.meals
//         .map((d, i) => `
//         <div class="card">
//           <div class="tag">${days[i] ?? `Day ${i+1}`}</div>
//           ${(['breakfast','lunch','dinner'] as const)
//             .map((slot) => {
//               const m = d[slot];
//               return `
//                 <div class="meal">
//                   <div><h3>${slot[0].toUpperCase() + slot.slice(1)}</h3></div>
//                   <div>
//                     <div><strong>${esc(m.dish)}</strong> · ${esc(m.cookingDuration)}</div>
//                     <div><em>Ingredients:</em>
//                       <ul>${m.ingredients.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul>
//                     </div>
//                     <div><em>Recipe:</em>
//                       <ol>${m.recipe.map((x)=>`<li>${esc(x)}</li>`).join('')}</ol>
//                     </div>
//                   </div>
//                 </div>`;
//             }).join('')}
//         </div>`)
//         .join('')}
//     </div>
//     <div class="grocery">
//       <h2>Consolidated Grocery List</h2>
//       <table><thead><tr><th>Ingredient</th><th>Quantity (metric)</th></tr></thead>
//       <tbody>
//         ${plan.groceryList.map((g) => `<tr><td>${esc(g.ingredient)}</td><td>${esc(g.quantity)}</td></tr>`).join('')}
//       </tbody></table>
//     </div>
//   </body></html>`;
// }

function planToHTML(
  plan: PlanResponse,
  opts: { title?: string; people?: number } = {},
  previewOnly: boolean // true = show 2 days only
) {
  const title = opts.title ?? '7-Day Meal Plan';
  const people = opts.people ?? 1;
  const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
  const esc = (s: string) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const REVEAL_DAYS = 2;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:24px;color:#0f172a}
    h1{margin:0 0 12px}
    .sub{color:#475569;margin-bottom:24px}
    .grid{display:grid;grid-template-columns:repeat(1,1fr);gap:16px}
    @media(min-width:900px){.grid{grid-template-columns:repeat(2,1fr)}}
    .card{border:1px solid #e2e8f0;border-radius:12px;padding:16px;background:#fff}
    .meal{display:grid;grid-template-columns:120px 1fr;gap:8px}
    .meal h3{margin:0 0 4px}
    .tag{display:inline-block;border-radius:9999px;background:#eef2ff;color:#3730a3;padding:2px 10px;font-size:12px}
    ul,ol{margin:6px 0 12px}
    .grocery{margin-top:24px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}
    th{background:#f8fafc}
    .placeholder{display:flex;align-items:center;justify-content:center;min-height:140px;background:#f8fafc;border:1px dashed #cbd5e1;border-radius:10px;color:#334155;text-align:center;padding:16px}
    .muted{color:#64748b}
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <div class="sub">Planned for <strong>${people}</strong> people.</div>
  <div class="grid">
    ${plan.meals.map((d, i) => {
      const hideDay = previewOnly && i >= REVEAL_DAYS;
      if (hideDay) {
        return `
          <div class="card">
            <div class="tag">${days[i] ?? `Day ${i+1}`}</div>
            <div class="placeholder">
              <div>
                <strong>Sign in to view the full plan</strong><br/>
                <span class="muted">Unlock recipes for ${esc(days[i] ?? `Day ${i+1}`)} and remaining days.</span>
              </div>
            </div>
          </div>`;
      }
      return `
        <div class="card">
          <div class="tag">${days[i] ?? `Day ${i+1}`}</div>
          ${(['breakfast','lunch','dinner'] as const).map(slot => {
            const m = d[slot];
            return `
              <div class="meal">
                <div><h3>${slot[0].toUpperCase() + slot.slice(1)}</h3></div>
                <div>
                  <div><strong>${esc(m.dish)}</strong> · ${esc(m.cookingDuration)}</div>
                  <div><em>Ingredients:</em>
                    <ul>${m.ingredients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
                  </div>
                  <div><em>Recipe:</em>
                    <ol>${m.recipe.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('')}
  </div>
  <div class="grocery">
    <h2>Consolidated Grocery List</h2>
    <table>
      <thead><tr><th>Ingredient</th><th>Quantity (metric)</th></tr></thead>
      <tbody>
        ${
          previewOnly
            ? plan.groceryList.slice(0, 8).map(g => `<tr><td>${esc(g.ingredient)}</td><td>${esc(g.quantity)}</td></tr>`).join('')
              + `<tr><td colspan="2" class="muted">Sign in to view the full grocery list…</td></tr>`
            : plan.groceryList.map(g => `<tr><td>${esc(g.ingredient)}</td><td>${esc(g.quantity)}</td></tr>`).join('')
        }
      </tbody>
    </table>
  </div>
</body>
</html>`;
}



async function renderPdf(plan: PlanResponse, previewOnly: boolean): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const pageMargin = 50;
  const pageWidth = 595.28;  // A4 width pt
  const pageHeight = 841.89; // A4 height pt
  const lineGap = 4;

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const addPage = () => pdf.addPage([pageWidth, pageHeight]);
  let page = addPage();
  let y = pageHeight - pageMargin;

  const drawText = (text: string, size = 12, bold = false) => {
    const usedFont = bold ? fontBold : font;
    const lines = wrap(text, usedFont, size, pageWidth - pageMargin * 2);
    lines.forEach((line) => {
      if (y < pageMargin + size) { page = addPage(); y = pageHeight - pageMargin; }
      page.drawText(line, { x: pageMargin, y, size, font: usedFont, color: rgb(0.1, 0.1, 0.15) });
      y -= size + lineGap;
    });
  };

  const divider = () => {
    if (y < pageMargin + 16) { page = addPage(); y = pageHeight - pageMargin; }
    page.drawLine({
      start: { x: pageMargin, y: y - 6 },
      end: { x: pageWidth - pageMargin, y: y - 6 },
      thickness: 0.5,
      color: rgb(0.8, 0.85, 0.9),
    });
    y -= 14;
  };

  // Title
  drawText('7-Day Meal Plan', 20, true);
  // divider();

  const dayLabels = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
  const revealDays = 2;

  // Days
  plan.meals.forEach((day, i) => {
    const isHidden = previewOnly && i >= revealDays;
    drawText(dayLabels[i] || `Day ${i + 1}`, 14, true);

    if (isHidden) {
      drawText('Sign in to view the full plan for this day.', 12);
      // divider();
      return;
    }

    (['breakfast', 'lunch', 'dinner'] as const).forEach((slot) => {
      const meal = day[slot];
      drawText(cap(slot), 12, true);
      drawText(`${meal.dish} · ${meal.cookingDuration}`, 12);
      drawText('Ingredients:', 12, true);
      meal.ingredients.forEach((it) => drawText(`• ${it}`, 12));
      drawText('Recipe:', 12, true);
      meal.recipe.forEach((step, idx) => drawText(`${idx + 1}. ${step}`, 12));
      y -= 4;
    });

    // divider();
  });

  // Grocery List
  drawText('Consolidated Grocery List', 14, true);
  const items = previewOnly ? plan.groceryList.slice(0, 8) : plan.groceryList;
  items.forEach((g) => drawText(`• ${g.ingredient} — ${g.quantity}`, 12));
  if (previewOnly && plan.groceryList.length > 8) {
    drawText('Sign in to view the full grocery list…', 12);
  }

  const bytes = await pdf.save();
  return bytes;

  // ---- helpers ----
  function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function wrap(text: string, fnt: any, size: number, maxWidth: number): string[] {
    const words = (text || '').split(/\s+/);
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (fnt.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
}

export async function POST(req: Request) {
  const { email, dietPreference, peopleCount, cuisine, additionalNote, user } = await req.json();

  const ipResponse = await fetch('https://ipwho.is/', {
    method: 'GET',
  });

  const ipData = await ipResponse.json();
  const ip = ipData.ip;
  const ua = req.headers.get('user-agent') || '';

  const trial = await checkAndConsumeTrial({ email, ip, ua });  
  let tries = 0;
// User is not signed in and has used up his/her trial
  if (!trial.allowed && !user) {
    return NextResponse.json({ error: 'trial_exhausted' }, { status: 402 });
  }
  if (!trial.allowed && user) {
    // check the plan user has selected
  const { data: profile, error: profErr } = await admin
    .from('profiles')
    .select('plan, tries, subscribed_on')
    .eq('email', email.toLowerCase())
    .maybeSingle();

    if (profErr) {
      return NextResponse.json({ error: 'profile_lookup_failed' }, { status: 500 });
    }
    if (!profile) {
      return NextResponse.json({ error: 'choose_plan' }, { status: 402 });
    }
    if (profile.plan === 'free') {
      return NextResponse.json({ error: 'choose_plan' }, { status: 402 });
    }
    if (profile.plan === 'paid') {
      // Check if tries is already at the limit
      tries = profile.tries;
      if ((profile.tries ?? 0) >= 20) {
        return NextResponse.json(
          { error: 'limit_reached', message: 'You are out of credits for this month!' },
          { status: 402 }
        );
      }
    }
  }

  const prompt = buildPrompt({ peopleCount, dietPreference, cuisine, additionalNote });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  });

  const responseContent = completion.choices[0]?.message?.content ?? '';
  const plan = safeParsePlan(responseContent);

  // const html = planToHTML(plan, { title: '7‑Day Meal Plan', people: Number(peopleCount) || 1 }, trial.allowed);
  const pdf = await renderPdf(plan, trial.allowed);
  if (user) {
    const { error: incErr } = await admin
      .from('profiles')
      .update({ tries: (tries ?? 0) + 1 })
      .eq('email', email.toLowerCase());
  }

  return new NextResponse(pdf as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="meal-plan.pdf"',
    },
  });
}