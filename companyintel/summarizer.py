from typing import List
from .models import CompanyData, Summary, WebDoc


def _bulletify(docs: List[WebDoc], limit: int = 5) -> str:
    bullets: list[str] = []
    for d in docs[:limit]:
        title = d.title.strip() if d.title else "Untitled"
        bullets.append(f"- {title}")
    return "\n".join(bullets) if bullets else "- No notable items"


async def generate_summary(data: CompanyData) -> Summary:
    company = data.company

    executive_points: list[str] = []
    if data.press_releases:
        executive_points.append("Recent press indicates product or partnership momentum.")
    if data.earnings_reports:
        executive_points.append("Latest earnings provide signals on priorities and budget.")
    if data.industry_reports:
        executive_points.append("Industry coverage highlights market position and threats.")
    if data.competitors:
        executive_points.append("Competitor list helps position differentiators in the pitch.")

    if not executive_points:
        executive_points.append("Limited public signals found. Use discovery questions to qualify initiatives.")

    executive_brief = (
        f"{company.name} overview based on public signals.\n\n" + "\n".join(f"- {p}" for p in executive_points)
    )

    ads_opportunities = (
        "Map messaging to current announcements and peaks in coverage. "
        "Leverage product launches and partnerships for awareness campaigns; align performance efforts around revenue drivers from earnings calls."
        "\n\nTop sources:\n" + _bulletify(data.press_releases) + "\n" + _bulletify(data.industry_reports)
    )

    recruiting_notes = (
        "Use growth signals (hiring bursts, expansions, funding) to pitch employer branding and recruiting products. "
        "Target roles tied to the highlighted initiatives in press and earnings."
    )

    risks_flags = (
        "Watch for restructuring, regulatory actions, or missed guidance in earnings. "
        "Validate any negative press before referencing in a pitch."
    )

    return Summary(
        executive_brief=executive_brief,
        ads_opportunities=ads_opportunities,
        recruiting_notes=recruiting_notes,
        risks_flags=risks_flags,
    )
