'use client';

import { useState } from 'react';
import { auditInputSchema, type AuditInput, type AuditOutput } from '@/lib/schemas';

type ApiResponse = { report: AuditOutput; extraction: { fetched: boolean; limitation?: string }; demoMode?: boolean; notice?: string };

const defaults: AuditInput = { websiteUrl: '', country: '', industry: '', businessModel: 'Ecommerce', conversionGoal: 'Purchase', ticketSize: 'Medium', language: 'English', businessNotes: '' };
const options = {
  businessModel: ['Ecommerce', 'Lead Generation', 'SaaS', 'Clinic', 'Education', 'Local Service', 'App', 'Other'],
  conversionGoal: ['Purchase', 'Lead', 'Booking', 'Call', 'WhatsApp', 'Signup', 'App Install'],
  ticketSize: ['Low', 'Medium', 'High', 'Premium'],
  language: ['Arabic', 'English', 'Bilingual']
} as const;

async function parseApiResponse(res: Response): Promise<ApiResponse> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Request failed');
    return payload;
  }

  const text = await res.text();
  throw new Error(`Server returned non-JSON response (status ${res.status}). ${text.slice(0, 200)}`);
}

export default function Page() {
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);
    const validated = auditInputSchema.safeParse(form);
    if (!validated.success) return setError('Please complete all required fields with a valid URL.');
    setLoading(true);
    try {
      const res = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validated.data) });
      const payload = await parseApiResponse(res);
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof AuditInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return <main className='mx-auto max-w-6xl p-6 space-y-6'>
    <section className='rounded-2xl border border-slate-800 bg-slate-900 p-8'><h1 className='text-3xl font-semibold'>CRO Evidence-Based Audit Engine</h1><p className='mt-2 text-slate-300'>Generate structured CRO audits based on UX, customer psychology, friction analysis, trust signals, and conversion principles.</p></section>
    <form onSubmit={submit} className='grid gap-3 md:grid-cols-2 rounded-2xl border border-slate-800 bg-slate-900 p-6'>
      <input required placeholder='Website URL' value={form.websiteUrl} onChange={(e) => set('websiteUrl', e.target.value)} className='rounded border border-slate-700 bg-slate-950 p-2' />
      <input required placeholder='Target country' value={form.country} onChange={(e) => set('country', e.target.value)} className='rounded border border-slate-700 bg-slate-950 p-2' />
      <input required placeholder='Industry' value={form.industry} onChange={(e) => set('industry', e.target.value)} className='rounded border border-slate-700 bg-slate-950 p-2' />
      {(Object.keys(options) as Array<keyof typeof options>).map((k) => <select key={k} value={form[k]} onChange={(e) => set(k, e.target.value)} className='rounded border border-slate-700 bg-slate-950 p-2'>{options[k].map((x) => <option key={x}>{x}</option>)}</select>)}
      <textarea placeholder='Optional business notes' value={form.businessNotes} onChange={(e) => set('businessNotes', e.target.value)} className='md:col-span-2 rounded border border-slate-700 bg-slate-950 p-2' />
      <button disabled={loading} className='md:col-span-2 rounded bg-brand-500 p-3 font-medium'>{loading ? 'Analyzing conversion friction…' : 'Generate CRO Audit'}</button>
    </form>
    {error && <p className='rounded bg-red-950 p-3 text-red-200'>{error}</p>}
    {data && <section className='space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6'>
      {data.notice && <p className='rounded bg-blue-950 p-3 text-blue-100'>{data.notice}</p>}
      {!data.extraction.fetched && <p className='rounded bg-amber-950 p-3 text-amber-200'>{data.extraction.limitation}</p>}
      <div className='flex gap-2'><button onClick={() => navigator.clipboard.writeText(JSON.stringify(data.report, null, 2))} className='rounded border border-slate-700 px-3 py-1'>Copy Report</button><button onClick={() => { const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cro-audit-report.json'; a.click(); }} className='rounded border border-slate-700 px-3 py-1'>Export JSON</button></div>
      <h2 className='text-2xl font-semibold'>Executive Summary</h2><p>{data.report.executiveSummary}</p><h3 className='text-xl font-semibold'>Overall CRO Score: {data.report.overallScore}/100</h3>
      <div className='grid gap-3 md:grid-cols-3'>{data.report.scorecard.map((s, i) => <div key={i} className='rounded border border-slate-700 p-3'><p className='font-semibold'>{s.area}</p><p>{s.score}/100 • {s.status}</p></div>)}</div>
      <div className='grid gap-3 md:grid-cols-2'>{data.report.findings.map((f, i) => <article key={i} className='rounded border border-slate-700 p-3'><h4 className='font-semibold'>{f.title}</h4><p className='text-sm text-slate-300'>{f.evidenceObserved}</p><p className='text-sm mt-1'>Principle: {f.croUxPrinciple}</p><p className='text-sm mt-1'>Fix: {f.recommendation}</p><p className='text-xs mt-1'>A/B test: {f.abTestHypothesis}</p></article>)}</div>
    </section>}
  </main>;
}
