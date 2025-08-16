export const maxDuration = 300;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';
import { checkAndConsumeTrial } from '@/utils/trials';

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
  // const raw = stripCodeFence(content).trim();
  try {
    const parsed = JSON.parse(content);
    console.log('parsedparsed', content)
    if (!parsed || !Array.isArray(parsed.meals) || !Array.isArray(parsed.groceryList)) {
      throw new Error('Malformed JSON structure.');
    }
    return parsed as PlanResponse;
  } catch (e) {
    throw new Error('LLM did not return valid JSON.');
  }
}

function buildPrompt({ peopleCount, dietPreference, cuisine, additionalNote }: any) {
  return `You are a professional meal planner.\nCreate a 7-day meal plan for ${peopleCount} people.\nDiet preference: ${dietPreference}.\nPreferred cuisines: ${cuisine}.\nAdditional note: ${additionalNote || 'None'}.\nNumber of meals a day: 3.\n\nSTRICTLY return valid JSON matching this format (no prose, no explanations, no markdown fences):\n{\n  "meals": [\n    {\n      "breakfast": {\n        "dish": "Name of the dish",\n        "cookingDuration": "cooking duration in minutes",\n        "ingredients": ["..."],\n        "recipe": ["Step 1", "Step 2"]\n      },\n      "lunch": { "dish": "...", "cookingDuration": "...", "ingredients": ["..."], "recipe": ["..."] },\n      "dinner": { "dish": "...", "cookingDuration": "...", "ingredients": ["..."], "recipe": ["..."] }\n    }\n  ],\n  "groceryList": [ { "ingredient": "Chicken", "quantity": "500 g" } ]\n}\n\nRules:\n- meals array MUST have exactly 7 entries (Mon..Sun).\n- Keep meals simple and healthy for busy people.\n- Use METRIC units for quantities in groceryList (g, ml, etc.). Only give items that are available in Grocery stores.\n- Avoid brand names.\n- Recipes can be detailed.`;
}

async function renderPdf(plan: PlanResponse, previewOnly: boolean, peopleCount?: number): Promise<Uint8Array> {
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

  const drawText = (text: string, size = 12, bold = false, align?: 'left' | 'center' | 'right', underline?: boolean, marginBottom?: number) => {
    const usedFont = bold ? fontBold : font;
    const lines = wrap(text, usedFont, size, pageWidth - pageMargin * 2);
    lines.forEach((line, idx) => {
      if (y < pageMargin + size) { page = addPage(); y = pageHeight - pageMargin; }
      const lineWidth = usedFont.widthOfTextAtSize(line, size);
      // compute x based on alignment
      let x = pageMargin;
      if (align === 'center') x = (pageWidth - lineWidth) / 2;
      else if (align === 'right') x = pageWidth - pageMargin - lineWidth;
      // draw the text
      page.drawText(line, {
        x,
        y,
        size,
        font: usedFont,
        color: rgb(0.1, 0.1, 0.15),
      });
      // optional underline (per line)
      if (underline) {
        const underlineOffset = 2;      // distance below baseline
        const thickness = Math.max(0.5, size * 0.05);
        page.drawLine({
          start: { x, y: y - underlineOffset },
          end:   { x: x + lineWidth, y: y - underlineOffset },
          thickness,
          color: rgb(0.1, 0.1, 0.15),
        });
      }
      y -= size + lineGap;

      // if it’s the *last line*, also apply marginBottom
      if (idx === lines.length - 1 && marginBottom) {
        y -= marginBottom;
      }
    });
  };

  const divider = (opts: { marginTop?: number; marginBottom?: number } = {}) => {
    const { marginTop = 8, marginBottom = 8 } = opts;

    // apply top margin before drawing
    y -= marginTop;

    if (y < pageMargin + 16) { 
      page = addPage(); 
      y = pageHeight - pageMargin; 
    }

    page.drawLine({
      start: { x: pageMargin, y: y - 6 },
      end: { x: pageWidth - pageMargin, y: y - 6 },
      thickness: 0.5,
      color: rgb(0.8, 0.85, 0.9),
    });

    // move cursor below line + bottom margin
    y -= 6 + marginBottom;
  };

  const pngImage = await pdf.embedPng(await fetch('https://www.meal-plan-go.online/images/Logo/icon.png').then(r => r.arrayBuffer()));
  // get its dimensions
  const imgWidth = 50; // desired width in pt
  const imgHeight = (pngImage.height / pngImage.width) * imgWidth;

  const imgX = pageWidth - pageMargin - imgWidth;

  // place it near the top (say 40pt down from the edge)
  const imgY = pageHeight - pageMargin - imgHeight;

  page.drawImage(pngImage, {
    x: imgX,
    y: imgY,
    width: imgWidth,
    height: imgHeight,
  });
  drawText('', 20, true, 'center', true, 20);
  // Title
  drawText('7-Day Meal Plan', 20, true, 'center', true, 20);
  // divider();
  drawText(`This plan is for ${peopleCount ? peopleCount : 1} person(s).`, 12, false, 'left', false, 0)
  divider({ marginTop: 0, marginBottom: 40 });

  const dayLabels = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
  const revealDays = 2;

  // Days
  plan.meals.forEach((day, i) => {
    const isHidden = previewOnly && i >= revealDays;
    drawText(dayLabels[i] || `Day ${i + 1}`, 14, true, 'left', true, 20);

    if (isHidden) {
      drawText('Sign in to view the full plan for this day.', 12, false, 'left', false, 20);
      // divider();
      divider({ marginTop: 0, marginBottom: 40 });
      return;
    }

    (['breakfast', 'lunch', 'dinner'] as const).forEach((slot) => {
      const meal = day[slot];
      drawText(`${cap(slot)}: ${meal.dish} (${meal.cookingDuration})`, 12, true, 'left', false, 10);
      // drawText(`${meal.dish} · ${meal.cookingDuration}`, 12);
      drawText('Ingredients:', 12, true);
      meal.ingredients.forEach((it, idx) => drawText(`${idx + 1}. ${it}`, 12, false, 'left', false, idx === meal.ingredients.length - 1 ? 10 : 0));
      drawText('Recipe:', 12, true);
      meal.recipe.forEach((step, idx) => drawText(`${idx + 1}. ${step}`, 12, false, 'left', false, idx === meal.recipe.length - 1 ? 10 : 0));
      y -= 4;
    });

    // divider();
    divider({ marginTop: 0, marginBottom: 40 });
  });

  // Grocery List
  drawText('Grocery List', 14, true);
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
  let tries = 0;
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  // If there are multiple IPs, the first one is the client
  const ip = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const ua = req.headers.get('user-agent') || '';
  const trial = await checkAndConsumeTrial({ ip, ua });
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
    response_format: { type: 'json_object' },
    messages: [
    { role: 'system', content: 'Output a single valid JSON object only.' },
    { role: 'user', content: prompt }
  ],
    temperature: 0.6,
  });

  const responseContent = completion.choices[0]?.message?.content ?? '';
  const plan = safeParsePlan(responseContent);

  // const html = planToHTML(plan, { title: '7‑Day Meal Plan', people: Number(peopleCount) || 1 }, trial.allowed);
  const pdf = await renderPdf(plan, trial.allowed, peopleCount);
  if (user) {
    const { error: incErr } = await admin
      .from('profiles')
      .update({ tries: (tries ?? 0) + 1 })
      .eq('email', email.toLowerCase());
  }

  return new NextResponse(pdf as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="MealPlanGo-Meal-Plan-Grocery.pdf"',
    },
  });
}