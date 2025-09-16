from typing import List
from ddgs import DDGS
from ..models import CompanyInput, WebDoc


async def fetch_press(company: CompanyInput) -> List[WebDoc]:
    queries = [
        f"site:{company.website.host} press release",
        f"site:{company.website.host} newsroom",
        f"{company.name} press releases",
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

    # Dedup by URL
    seen = set()
    deduped: list[WebDoc] = []
    for d in results:
        if d.url in seen:
            continue
        seen.add(str(d.url))
        deduped.append(d)
    return deduped[:30]
