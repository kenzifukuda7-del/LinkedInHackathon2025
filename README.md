# Company Intelligence Tool

A CLI that ingests a company's name and website and collects public signals (press releases, earnings/IR links, industry coverage, competitors), then outputs a sales-focused summary and a Markdown report.

## Setup

1. Python 3.10+
2. Install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
python -m companyintel.cli --name "Acme Corp" --website "https://www.acme.com" --out report.md --json report.json
```

- `--name`: Company name
- `--website`: Company website URL
- `--out`: Output Markdown path (default `report.md`)
- `--json`: Optional JSON output with raw links and summary

## Outputs

- Markdown summary tailored for social media ads, sales, and recruiting pitches
- Links to press releases/newsroom, earnings/IR updates, industry coverage
- Competitor list (heuristic from public web)

## Notes

- Web sources are fetched via public search (DuckDuckGo). No scraping of private or paywalled content.
- Consider validating sensitive items (layoffs, regulatory flags) with primary sources before use in pitches.
