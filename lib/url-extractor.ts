import * as cheerio from 'cheerio';

export type UrlExtraction = {
  fetched: boolean;
  limitation?: string;
  signals?: Record<string, unknown>;
};

export async function extractUrlSignals(url: string): Promise<UrlExtraction> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 CRO-Audit-Bot' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);
    const headings = ['h1', 'h2', 'h3'].flatMap((tag) => $(tag).map((_, el) => $(el).text().trim()).get()).filter(Boolean).slice(0, 30);
    const links = $('a').map((_, el) => ({ text: $(el).text().trim(), href: $(el).attr('href') || '' })).get().slice(0, 30);
    const buttons = $('button, [role="button"], input[type="submit"]').map((_, el) => $(el).text().trim() || $(el).attr('value') || '').get().filter(Boolean).slice(0, 25);
    const forms = $('form').map((_, el) => ({ action: $(el).attr('action') || '', method: $(el).attr('method') || 'get', inputs: $(el).find('input, select, textarea').length })).get().slice(0, 10);
    const imagesAlt = $('img').map((_, el) => $(el).attr('alt') || '').get().filter(Boolean).slice(0, 30);
    const visibleText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 6000);

    return {
      fetched: true,
      signals: {
        title: $('title').first().text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        headings,
        visibleText,
        links,
        buttons,
        forms,
        imagesAlt
      }
    };
  } catch (error) {
    return {
      fetched: false,
      limitation: `Live fetch failed (${error instanceof Error ? error.message : 'unknown error'}). Audit generated from business context only.`
    };
  }
}
