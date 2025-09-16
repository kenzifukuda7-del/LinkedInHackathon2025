from typing import List
from ddgs import DDGS
from ..models import CompanyInput, WebDoc


async def fetch_earnings(company: CompanyInput) -> List[WebDoc]:
    queries = [
        f"site:{company.website.host} investor relations",
        f"site:{company.website.host} earnings",
        f"{company.name} earnings press release",
        f"{company.name} SEC 10-K",
        f"{company.name} SEC 10-Q",
        f"{company.name} earnings call transcript",
    ]

    results: list[WebDoc] = []
    try:
        with DDGS() as ddgs:
            for q in queries:
                try:
                    for r in ddgs.text(q, max_results=10, safesearch="moderate"):  # type: ignore
                        try:
                            results.append(
                                WebDoc(
                                    title=r.get("title") or "",
                                    url=r.get("href") or r.get("url"),
                                    snippet=r.get("body"),
                                    source="ddg",
                                    published_at=r.get("date") or r.get("published") or r.get("published_time")
                                )
                            )
                        except Exception:
                            continue
                except Exception:
                    continue
    except Exception:
        results = []

    seen = set()
    deduped: list[WebDoc] = []
    for d in results:
        if d.url in seen:
            continue
        seen.add(str(d.url))
        deduped.append(d)
    return deduped[:30]
