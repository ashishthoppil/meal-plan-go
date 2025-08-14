import { checkAndConsumeTrial } from '@/utils/trials';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// export const runtime = 'nodejs'; // <-- uncomment if deploying where Edge isn't compatible with Puppeteer

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

function planToHTML(plan: PlanResponse, opts: { title?: string; people?: number } = {}) {
  const title = opts.title ?? '7‑Day Meal Plan';
  const people = opts.people ?? 1;
  const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
  const esc = (s: string) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `<!doctype html>
  <html><head>
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
      ul{margin:6px 0 12px}
      .grocery{margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #e2e8f0;padding:8px;text-align:left}
      th{background:#f8fafc}
    </style>
  </head>
  <body>
    <h1>${esc(title)}</h1>
    <div class="sub">Planned for <strong>${people}</strong> people.</div>
    <div class="grid">
      ${plan.meals
        .map((d, i) => `
        <div class="card">
          <div class="tag">${days[i] ?? `Day ${i+1}`}</div>
          ${(['breakfast','lunch','dinner'] as const)
            .map((slot) => {
              const m = d[slot];
              return `
                <div class="meal">
                  <div><h3>${slot[0].toUpperCase() + slot.slice(1)}</h3></div>
                  <div>
                    <div><strong>${esc(m.dish)}</strong> · ${esc(m.cookingDuration)}</div>
                    <div><em>Ingredients:</em>
                      <ul>${m.ingredients.map((x)=>`<li>${esc(x)}</li>`).join('')}</ul>
                    </div>
                    <div><em>Recipe:</em>
                      <ol>${m.recipe.map((x)=>`<li>${esc(x)}</li>`).join('')}</ol>
                    </div>
                  </div>
                </div>`;
            }).join('')}
        </div>`)
        .join('')}
    </div>
    <div class="grocery">
      <h2>Consolidated Grocery List</h2>
      <table><thead><tr><th>Ingredient</th><th>Quantity (metric)</th></tr></thead>
      <tbody>
        ${plan.groceryList.map((g) => `<tr><td>${esc(g.ingredient)}</td><td>${esc(g.quantity)}</td></tr>`).join('')}
      </tbody></table>
    </div>
  </body></html>`;
}

async function renderPdf(html: string): Promise<Uint8Array> {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' } });
    await browser.close();
    return pdf;
}

export async function POST(req: Request) {
  const { email, dietPreference, peopleCount, cuisine, additionalNote } = await req.json();

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim();
  const ua = req.headers.get('user-agent') || '';

  const trial = await checkAndConsumeTrial({ email, ip, ua });

  if (!trial.allowed) {
    return NextResponse.json({ error: 'trial_exhausted' }, { status: 402 });
  }

  const prompt = buildPrompt({ peopleCount, dietPreference, cuisine, additionalNote });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
  });

  const responseContent = completion.choices[0]?.message?.content ?? '';
  const plan = safeParsePlan(responseContent);

  const html = planToHTML(plan, { title: '7‑Day Meal Plan', people: Number(peopleCount) || 1 });
  const pdf = await renderPdf(html);
  return new NextResponse(pdf as any, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="meal-plan.pdf"',
    },
  });
}