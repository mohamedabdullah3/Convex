import { z } from 'zod';

export const auditInputSchema = z.object({
  websiteUrl: z.string().url(),
  country: z.string().min(2),
  industry: z.string().min(2),
  businessModel: z.enum(['Ecommerce', 'Lead Generation', 'SaaS', 'Clinic', 'Education', 'Local Service', 'App', 'Other']),
  conversionGoal: z.enum(['Purchase', 'Lead', 'Booking', 'Call', 'WhatsApp', 'Signup', 'App Install']),
  ticketSize: z.enum(['Low', 'Medium', 'High', 'Premium']),
  language: z.enum(['Arabic', 'English', 'Bilingual']),
  businessNotes: z.string().max(1000).optional().default('')
});

const sev = z.enum(['High', 'Medium', 'Low']);
const status = z.enum(['Weak', 'Medium', 'Good', 'Strong']);

export const auditOutputSchema = z.object({
  executiveSummary: z.string(),
  overallScore: z.number().min(0).max(100),
  businessContext: z.object({
    country: z.string(),
    industry: z.string(),
    businessModel: z.string(),
    conversionGoal: z.string(),
    ticketSize: z.string(),
    language: z.string().optional()
  }),
  scorecard: z.array(z.object({ area: z.string(), score: z.number().min(0).max(100), status, whyItMatters: z.string() })),
  topConversionBlockers: z.array(z.object({ title: z.string(), severity: sev, whyItMatters: z.string() })),
  findings: z.array(z.object({
    title: z.string(), area: z.string(), severity: sev, evidenceObserved: z.string(), croUxPrinciple: z.string(), conversionImpact: z.string(), recommendation: z.string(), expectedImpact: sev, effort: sev, priority: sev, abTestHypothesis: z.string()
  })),
  prioritizedRecommendations: z.array(z.object({ recommendation: z.string(), impact: z.number(), confidence: z.number(), effort: z.number(), priorityScore: z.number() })),
  abTestingRoadmap: z.array(z.object({ testName: z.string(), hypothesis: z.string(), primaryMetric: z.string(), audience: z.string(), expectedLearning: z.string() })),
  quickWins: z.array(z.string()),
  strategicImprovements: z.array(z.string()),
  thirtyDayActionPlan: z.object({ week1: z.array(z.string()), week2: z.array(z.string()), week3: z.array(z.string()), week4: z.array(z.string()) })
});

export type AuditInput = z.infer<typeof auditInputSchema>;
export type AuditOutput = z.infer<typeof auditOutputSchema>;
