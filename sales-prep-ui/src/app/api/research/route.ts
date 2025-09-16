import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

type ResearchOptions = {
  companyHistory?: boolean;
  existingProducts?: boolean;
  financialInfo?: boolean;
  newsArticles?: boolean;
  industryDeepDive?: boolean;
  competitorsTrends?: boolean;
  keyStakeholders?: boolean; // not implemented in backend yet
  draftEmail?: boolean;
  exportMarkdown?: boolean;
};

function toLOB(selectedProduct?: string): 'LTS' | 'LLS' | 'LMS' | 'LSS' | undefined {
  if (!selectedProduct) return undefined;
  const p = selectedProduct.toLowerCase();
  if (p.includes('talent') || p === 'lts') return 'LTS';
  if (p.includes('learning') || p === 'lls') return 'LLS';
  if (p.includes('marketing') || p === 'lms') return 'LMS';
  if (p.includes('sales') || p === 'lss') return 'LSS';
  return undefined;
}

function sanitizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function cachePaths(workspaceRoot: string, companyName: string, lob?: string) {
  const cacheDir = path.join(workspaceRoot, '.cache', 'companyintel');
  const key = `${sanitizeKey(companyName)}_${lob ? lob : 'NA'}`;
  const jsonPath = path.join(cacheDir, `${key}.json`);
  return { cacheDir, jsonPath };
}

async function isFresh(filePath: string, ttlMs: number): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    const age = Date.now() - stat.mtimeMs;
    return age < ttlMs;
  } catch {
    return false;
  }
}

function pythonCandidates(workspaceRoot: string): string[] {
  return [
    path.join(workspaceRoot, '.venv', 'bin', 'python'),
    'python3',
    'python',
  ];
}

async function runCompanyIntel(pythonPath: string, args: string[], cwd: string) {
  return execFileAsync(pythonPath, args, { cwd });
}

function buildMarkdownExport(companyName: string, summary: any, data: any, lob?: string, selected?: ResearchOptions): string {
  const lines: string[] = [];
  lines.push(`# ${companyName} — Sales Prep ${lob ? `(Focus: ${lob})` : ''}`.trim());
  if (summary?.pitch_headlines?.length) {
    lines.push('## Top Headlines');
    for (const h of summary.pitch_headlines.slice(0, 3)) lines.push(`- ${h}`);
    lines.push('');
  }
  if (selected?.companyHistory) {
    lines.push('## Company History');
    lines.push(summary?.executive_brief || '');
    lines.push('');
  }
  if (selected?.existingProducts) {
    lines.push('## Existing Products/Offerings (Signals)');
    lines.push(summary?.ads_opportunities || '');
    lines.push('');
  }
  if (selected?.financialInfo) {
    lines.push('## Financial Info (Earnings/IR)');
    for (const d of (data?.earnings_reports || []).slice(0, 5)) {
      const t = d.title || 'Untitled';
      const url = d.url || '';
      const date = d.published_at ? ` (${d.published_at})` : '';
      lines.push(`- [${t}](${url})${date}`);
    }
    lines.push('');
  }
  if (selected?.newsArticles) {
    lines.push('## News Articles');
    for (const d of (data?.press_releases || []).slice(0, 5)) {
      const t = d.title || 'Untitled';
      const url = d.url || '';
      const date = d.published_at ? ` (${d.published_at})` : '';
      lines.push(`- [${t}](${url})${date}`);
    }
    lines.push('');
  }
  if (selected?.industryDeepDive) {
    lines.push('## Industry Deep Dive');
    for (const d of (data?.industry_reports || []).slice(0, 5)) {
      const t = d.title || 'Untitled';
      const url = d.url || '';
      const date = d.published_at ? ` (${d.published_at})` : '';
      lines.push(`- [${t}](${url})${date}`);
    }
    lines.push('');
  }
  if (selected?.competitorsTrends) {
    lines.push('## Competitors & Market Trends');
    for (const c of (data?.competitors || []).slice(0, 15)) lines.push(`- ${c}`);
    lines.push('');
  }
  if (selected?.draftEmail) {
    lines.push('## Draft Email');
    const subject = `LinkedIn ${lob || ''} Opportunity for ${companyName}`.trim();
    const body = `Hi [Name],\n\nI noticed ${companyName}'s recent updates — ${
      (summary?.pitch_headlines && summary.pitch_headlines[0]) || 'recent press and industry signals'
    }. Based on ${lob || 'LinkedIn solutions'}, we can help you reach the right audiences and tie impact to outcomes.\n\nA quick idea: ${summary?.outbound_prep || 'pilot a targeted campaign aligned to current priorities.'}\n\nBest,\n[Your Name]`;
    lines.push(`Subject: ${subject}`);
    lines.push('');
    lines.push(body);
  }
  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, companyWebsite, selectedProduct, researchOptions } = body || {} as { researchOptions?: ResearchOptions };

    if (!companyName || !companyWebsite || !selectedProduct) {
      return NextResponse.json(
        { error: 'Company name, website, and product selection are required' },
        { status: 400 }
      );
    }

    const lob = toLOB(selectedProduct);

    // Resolve workspace root (project root containing Python package)
    const workspaceRoot = path.resolve(process.cwd(), '..');

    // Check cache first (15 minutes TTL)
    const { cacheDir, jsonPath: cachedJson } = cachePaths(workspaceRoot, companyName, lob);
    await ensureDir(cacheDir);
    const TTL_MS = 15 * 60 * 1000;
    let report: any | null = null;
    if (await isFresh(cachedJson, TTL_MS)) {
      const raw = await fs.readFile(cachedJson, 'utf-8');
      report = JSON.parse(raw);
    } else {
      // Prepare temp output files for this invocation
      const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'companyintel-'));
      const mdOut = path.join(tmpDir, 'report.md');
      const jsonOut = path.join(tmpDir, 'report.json');

      const baseArgs = ['-m', 'companyintel.cli', '--name', companyName, '--website', companyWebsite, '--out', mdOut, '--json', jsonOut];
      if (lob) baseArgs.push('--lob', lob);

      // Try python candidates until one succeeds
      let lastError: any = null;
      for (const py of pythonCandidates(workspaceRoot)) {
        try {
          await runCompanyIntel(py, baseArgs, workspaceRoot);
          lastError = null;
          break;
        } catch (err) {
          lastError = err;
        }
      }
      if (lastError) throw lastError;

      const raw = await fs.readFile(jsonOut, 'utf-8');
      report = JSON.parse(raw);
      await fs.writeFile(cachedJson, raw, 'utf-8');
    }

    const summary = report.summary || {};
    const data = report.data || {};

    // Build the full results
    const full = {
      topHeadlines: (summary.pitch_headlines || []).slice(0, 3),
      lob: summary.selected_lob || lob,
      lobFocus: summary.lob_focus || null,
      executiveBrief: summary.executive_brief || '',
      renewalPrep: summary.renewal_prep || '',
      outboundPrep: summary.outbound_prep || '',
      adsOpportunities: summary.ads_opportunities || '',
      recruitingNotes: summary.recruiting_notes || '',
      risksFlags: summary.risks_flags || '',
      press: (data.press_releases || []).slice(0, 3).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      earnings: (data.earnings_reports || []).slice(0, 3).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      industry: (data.industry_reports || []).slice(0, 3).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      competitors: data.competitors || [],
    };

    // Filter by researchOptions
    const sel: ResearchOptions = researchOptions || {};
    const filtered: any = {};

    if (sel.companyHistory) filtered.companyHistory = { executiveBrief: full.executiveBrief };
    if (sel.existingProducts) filtered.existingProducts = { adsOpportunities: full.adsOpportunities };
    if (sel.financialInfo) filtered.financialInfo = { earnings: full.earnings };
    if (sel.newsArticles) filtered.newsArticles = { press: full.press };
    if (sel.industryDeepDive) filtered.industryDeepDive = { industry: full.industry };
    if (sel.competitorsTrends) filtered.competitorsTrends = { competitors: full.competitors };
    if (sel.keyStakeholders) filtered.keyStakeholders = { note: 'Not implemented yet' };

    if (sel.draftEmail) {
      const subject = `LinkedIn ${full.lob || ''} Opportunity for ${companyName}`.trim();
      const body = `Hi [Name],\n\nI noticed ${companyName}'s recent updates — ${
        (full.topHeadlines && full.topHeadlines[0]) || 'recent press and industry signals'
      }. Based on ${full.lob || 'LinkedIn solutions'}, we can help you reach the right audiences and tie impact to outcomes.\n\nA quick idea: ${full.outboundPrep || 'pilot a targeted campaign aligned to current priorities.'}\n\nBest,\n[Your Name]`;
      filtered.draftEmail = { subject, body };
    }

    if (sel.exportMarkdown) {
      filtered.exportMarkdown = buildMarkdownExport(companyName, summary, data, full.lob, sel);
    }

    // Always include some top-level context
    const basePayload: any = {
      companyName,
      companyWebsite,
      selectedProduct,
      lob: full.lob,
      topHeadlines: full.topHeadlines,
      results: filtered,
    };

    return NextResponse.json(basePayload);
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
