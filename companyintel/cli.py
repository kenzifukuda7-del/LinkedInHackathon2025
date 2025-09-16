import asyncio
import json
from pathlib import Path
from typing import Optional
import argparse
from rich import print
from .models import CompanyInput, CompanyData, WebDoc, Report
from .fetchers.press import fetch_press
from .fetchers.earnings import fetch_earnings
from .fetchers.news import fetch_industry_reports
from .fetchers.competitors import fetch_competitors
from .summarizer import generate_summary


async def gather_data(name: str, website: str) -> Report:
    company = CompanyInput(name=name, website=website)

    press, earnings, industry, competitors = await asyncio.gather(
        fetch_press(company),
        fetch_earnings(company),
        fetch_industry_reports(company),
        fetch_competitors(company),
    )

    data = CompanyData(
        company=company,
        press_releases=press,
        earnings_reports=earnings,
        industry_reports=industry,
        competitors=competitors,
    )

    summary = await generate_summary(data)
    return Report(data=data, summary=summary)


def write_markdown_report(report: Report, out_path: Path) -> None:
    c = report.data.company
    lines = []
    lines.append(f"# {c.name} — Company Intelligence Report")
    lines.append("")
    lines.append(f"Website: {c.website}")
    lines.append("")

    lines.append("## Executive Brief (for Sales Reps)")
    lines.append(report.summary.executive_brief)
    lines.append("")

    lines.append("## Advertising Opportunities")
    lines.append(report.summary.ads_opportunities)
    lines.append("")

    lines.append("## Recruiting Notes")
    lines.append(report.summary.recruiting_notes)
    lines.append("")

    lines.append("## Risks & Flags")
    lines.append(report.summary.risks_flags)
    lines.append("")

    def section(title: str, docs: list[WebDoc]):
        lines.append(f"## {title}")
        if not docs:
            lines.append("- None found")
        for d in docs[:15]:
            line = f"- [{d.title}]({d.url})"
            if d.snippet:
                line += f" — {d.snippet}"
            lines.append(line)
        lines.append("")

    section("Press Releases & Newsroom", report.data.press_releases)
    section("Earnings & Investor Updates", report.data.earnings_reports)
    section("Industry Reports & Coverage", report.data.industry_reports)

    lines.append("## Competitors")
    if report.data.competitors:
        for comp in report.data.competitors[:20]:
            lines.append(f"- {comp}")
    else:
        lines.append("- None found")

    out_path.write_text("\n".join(lines), encoding="utf-8")


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Company intel report generator")
    parser.add_argument("--name", required=True, help="Company name")
    parser.add_argument("--website", required=True, help="Company website URL")
    parser.add_argument("--out", default="report.md", help="Output Markdown path")
    parser.add_argument("--json", dest="json_out", default=None, help="Optional JSON output path")

    args = parser.parse_args(argv)

    report = asyncio.run(gather_data(args.name, args.website))

    out_path = Path(args.out)
    write_markdown_report(report, out_path)
    print(f"[green]Wrote markdown report to {out_path}")

    if args.json_out:
        Path(args.json_out).write_text(report.model_dump_json(indent=2), encoding="utf-8")
        print(f"[green]Wrote JSON report to {args.json_out}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
