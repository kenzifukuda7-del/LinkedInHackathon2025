import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, companyWebsite, selectedProduct } = body || {};

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
    if (await isFresh(cachedJson, TTL_MS)) {
      const raw = await fs.readFile(cachedJson, 'utf-8');
      const report = JSON.parse(raw);
      const summary = report.summary || {};
      const data = report.data || {};
      const results = {
        topHeadlines: (summary.pitch_headlines || []).slice(0, 3),
        lob: summary.selected_lob || lob,
        lobFocus: summary.lob_focus || null,
        executiveBrief: summary.executive_brief || '',
        renewalPrep: summary.renewal_prep || '',
        outboundPrep: summary.outbound_prep || '',
        adsOpportunities: summary.ads_opportunities || '',
        recruitingNotes: summary.recruiting_notes || '',
        risksFlags: summary.risks_flags || '',
        press: (data.press_releases || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
        earnings: (data.earnings_reports || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
        industry: (data.industry_reports || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
        competitors: data.competitors || [],
      };
      return NextResponse.json({ companyName, companyWebsite, selectedProduct, results, cached: true });
    }

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
    if (lastError) {
      throw lastError;
    }

    // Read CLI output JSON
    const raw = await fs.readFile(jsonOut, 'utf-8');
    const report = JSON.parse(raw);

    // Write to cache for reuse
    await fs.writeFile(cachedJson, raw, 'utf-8');

    // Map Python JSON into UI response shape
    const summary = report.summary || {};
    const data = report.data || {};

    const results = {
      topHeadlines: (summary.pitch_headlines || []).slice(0, 3),
      lob: summary.selected_lob || lob,
      lobFocus: summary.lob_focus || null,
      executiveBrief: summary.executive_brief || '',
      renewalPrep: summary.renewal_prep || '',
      outboundPrep: summary.outbound_prep || '',
      adsOpportunities: summary.ads_opportunities || '',
      recruitingNotes: summary.recruiting_notes || '',
      risksFlags: summary.risks_flags || '',
      press: (data.press_releases || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      earnings: (data.earnings_reports || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      industry: (data.industry_reports || []).map((d: any) => ({ title: d.title, url: d.url, snippet: d.snippet, date: d.published_at || null })),
      competitors: data.competitors || [],
    };

    return NextResponse.json({ companyName, companyWebsite, selectedProduct, results, cached: false });
  } catch (error) {
    console.error('Research API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
