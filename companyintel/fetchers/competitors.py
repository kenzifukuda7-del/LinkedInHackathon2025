from typing import List
from ddgs import DDGS
from rapidfuzz import fuzz
from ..models import CompanyInput


async def fetch_competitors(company: CompanyInput) -> List[str]:
    queries = [
        f"{company.name} competitors",
        f"companies like {company.name}",
        f"top competitors of {company.name}",
    ]
    candidates: list[str] = []
    with DDGS() as ddgs:
        for q in queries:
            for r in ddgs.text(q, max_results=15, safesearch="moderate"):  # type: ignore
                title = (r.get("title") or "").strip()
                body = (r.get("body") or "").strip()
                for text in [title, body]:
                    for token in text.replace("/", " ").replace("|", " ").split(","):
                        token = token.strip()
                        if 2 < len(token) < 80 and token.lower() != company.name.lower():
                            candidates.append(token)
    unique_names: list[str] = []
    seen = set()
    for cand in candidates:
        name = cand
        key = name.lower()
        if key in seen:
            continue
        similarity = fuzz.ratio(key, company.name.lower())  # 0..100
        if similarity < 85:  # exclude near-identical strings to company name
            seen.add(key)
            unique_names.append(name)
    return unique_names[:15]
