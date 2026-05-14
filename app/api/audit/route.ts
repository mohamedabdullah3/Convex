import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auditInputSchema, auditOutputSchema } from '@/lib/schemas';
import { extractUrlSignals } from '@/lib/url-extractor';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function buildPrompt(input: unknown, extraction: unknown): string {
  return `You are a senior CRO strategist, UX researcher, behavioral analyst, UI/UX auditor, and conversion copywriter with 20+ years of experience.

Perform an evidence-based CRO audit for the provided website and business context.

You must evaluate:
- Conversion clarity
- Message-market fit
- UX/UI usability
- Customer psychology
- Conversion friction
- Trust and credibility
- Mobile-first experience
- CTA and journey flow
- Copywriting effectiveness
- Offer quality
- Checkout or form optimization
- Local market expectations
- Paid traffic landing page alignment

Do not provide generic recommendations.

For every finding, provide:
- The issue
- Evidence or page signal
- CRO/UX principle
- Why it matters for conversion
- Severity
- Recommended fix
- Expected impact
- Effort level
- Priority
- A/B test hypothesis

Return the result as valid JSON only, matching the required schema.

Business Input:\n${JSON.stringify(input, null, 2)}\n\nURL Extraction Context:\n${JSON.stringify(extraction, null, 2)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = auditInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const extraction = await extractUrlSignals(parsed.data.websiteUrl);
    const prompt = buildPrompt(parsed.data, extraction);

    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',
      input: prompt,
      temperature: 0.3
    });

    const outputText = response.output_text?.trim();
    if (!outputText) return NextResponse.json({ error: 'Empty AI output' }, { status: 502 });

    let json;
    try {
      json = JSON.parse(outputText);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', raw: outputText }, { status: 502 });
    }

    const validated = auditOutputSchema.safeParse(json);
    if (!validated.success) {
      return NextResponse.json({ error: 'AI JSON schema mismatch', details: validated.error.flatten(), raw: json }, { status: 502 });
    }

    return NextResponse.json({ report: validated.data, extraction });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Audit generation failed' }, { status: 500 });
  }
}
