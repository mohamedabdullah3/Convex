import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { auditInputSchema, auditOutputSchema, type AuditInput, type AuditOutput } from '@/lib/schemas';
import { extractUrlSignals } from '@/lib/url-extractor';

function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

function buildPrompt(input: AuditInput, extraction: unknown): string {
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
Return the result as valid JSON only, matching the required schema.

Business Input:\n${JSON.stringify(input, null, 2)}\n\nURL Extraction Context:\n${JSON.stringify(extraction, null, 2)}`;
}

function buildDemoAudit(input: AuditInput, limitation?: string): AuditOutput {
  return {
    executiveSummary: `Demo mode: add OPENAI_API_KEY to generate live AI audits. This sample highlights likely CRO risks for ${input.industry} in ${input.country}.`,
    overallScore: 63,
    businessContext: {
      country: input.country,
      industry: input.industry,
      businessModel: input.businessModel,
      conversionGoal: input.conversionGoal,
      ticketSize: input.ticketSize,
      language: input.language
    },
    scorecard: [{ area: 'Clarity', score: 58, status: 'Medium', whyItMatters: 'Unclear first impression increases bounce.' }, { area: 'Trust', score: 62, status: 'Medium', whyItMatters: 'Trust signals reduce purchase anxiety.' }],
    topConversionBlockers: [{ title: 'Weak above-the-fold value proposition', severity: 'High', whyItMatters: 'Users may not understand why they should convert now.' }],
    findings: [{ title: 'Primary CTA lacks specificity', area: 'CTA', severity: 'High', evidenceObserved: limitation || 'Generic CTA text with low action clarity.', croUxPrinciple: 'Clarity and motivation matching', conversionImpact: 'Lower click-through to key conversion step.', recommendation: 'Use outcome-driven CTA text and reinforce with microcopy.', expectedImpact: 'High', effort: 'Low', priority: 'High', abTestHypothesis: 'If CTA specifies clear outcome, click-through rate will improve by 10-20%.' }],
    prioritizedRecommendations: [{ recommendation: 'Rewrite hero headline and CTA around one concrete value promise.', impact: 8, confidence: 7, effort: 3, priorityScore: 18 }],
    abTestingRoadmap: [{ testName: 'Hero messaging clarity test', hypothesis: 'Specific benefit-led hero copy will increase conversion intent.', primaryMetric: 'Primary CTA CTR', audience: 'All new visitors', expectedLearning: 'Whether clarity is a primary bottleneck.' }],
    quickWins: ['Clarify hero headline value proposition.', 'Improve CTA text specificity.', 'Add trust proof near first CTA.'],
    strategicImprovements: ['Build a segmented landing experience by intent.', 'Systematically map objections and add proof blocks.'],
    thirtyDayActionPlan: { week1: ['Message clarity rewrite', 'CTA microcopy updates'], week2: ['Trust section improvements'], week3: ['Run first A/B test'], week4: ['Analyze results and iterate'] }
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return jsonError('Invalid JSON body.', 400);

    const parsed = auditInputSchema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid input.', 400, parsed.error.flatten());

    const extraction = await extractUrlSignals(parsed.data.websiteUrl);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ report: buildDemoAudit(parsed.data, extraction.limitation), extraction, demoMode: true, notice: 'Demo mode: add OPENAI_API_KEY to generate live AI audits.' });
    }

    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({ model: 'gpt-4.1-mini', input: buildPrompt(parsed.data, extraction), temperature: 0.3 });
    const outputText = response.output_text?.trim();
    if (!outputText) return jsonError('Empty AI output.', 502);

    let json: unknown;
    try { json = JSON.parse(outputText); } catch { return jsonError('AI returned invalid JSON.', 502); }

    const validated = auditOutputSchema.safeParse(json);
    if (!validated.success) return jsonError('AI JSON schema mismatch.', 502, validated.error.flatten());

    return NextResponse.json({ report: validated.data, extraction, demoMode: false });
  } catch (error) {
    console.error('POST /api/audit failed', error instanceof Error ? error.message : error);
    return jsonError('Audit generation failed.', 500);
  }
}

export async function GET() {
  return jsonError('Method not allowed. Use POST.', 405);
}
