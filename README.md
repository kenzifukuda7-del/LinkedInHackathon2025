# LinkedIn Sales Preparation Platform

A comprehensive platform for LinkedIn sales representatives to prepare for outbound prospecting calls and renewal check-ins with existing customers. The platform consists of two main components:

## 🚀 Components

### 1. **Company Intelligence CLI** (`companyintel/`)
A Python CLI tool that ingests a company's name and website and collects public signals (press releases, earnings/IR links, industry coverage, competitors), then outputs a sales-focused summary and a Markdown report.

### 2. **Sales Prep Web UI** (`sales-prep-ui/`)
A responsive React web application with LinkedIn-inspired design that provides an intuitive interface for sales reps to generate comprehensive company research and personalized pitches.

## 🎯 Quick Start

### For CLI Tool:
```bash
python -m companyintel.cli --name "Acme Corp" --website "https://www.acme.com" --out report.md --json report.json
```

### For Web UI:
```bash
cd sales-prep-ui
npm install
npm run dev
# Open http://localhost:3000
```

### For Demo Version (No Installation Required):
```bash
cd sales-prep-ui
python3 -m http.server 8080
# Open http://localhost:8080/demo.html
```

## 📁 Project Structure

```
LinkedInHackathon2025/
├── README.md                    # This file - project overview
├── companyintel/               # Python CLI backend
│   ├── cli.py
│   ├── fetchers/
│   └── models.py
├── sales-prep-ui/              # React web frontend
│   ├── README.md              # Detailed web UI documentation
│   ├── src/
│   └── package.json
└── docs/                       # Additional documentation
```

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
