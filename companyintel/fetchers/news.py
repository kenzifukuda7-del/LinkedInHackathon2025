from typing import List
from ddgs import DDGS
from ..models import CompanyInput, WebDoc


async def fetch_industry_reports(company: CompanyInput) -> List[WebDoc]:
    queries = [
        f"{company.name} market share report",
        f"{company.name} industry report",
        f"{company.name} competitors analysis",
        f"{company.name} partnership announcement",
        f"{company.name} funding round",
    ]

    results: list[WebDoc] = []
    with DDGS() as ddgs:
        for q in queries:
            for r in ddgs.text(q, max_results=10, safesearch="moderate"):  # type: ignore
                try:
                    results.append(
                        WebDoc(
                            title=r.get("title") or "",
                            url=r.get("href") or r.get("url"),
                            snippet=r.get("body"),
                            source="ddg",
                        )
                    )
                except Exception:
                    continue
    seen = set()
    deduped: list[WebDoc] = []
    for d in results:
        if d.url in seen:
            continue
        seen.add(str(d.url))
        deduped.append(d)
    return deduped[:30]
