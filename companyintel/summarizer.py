from typing import List, Dict, Tuple
from datetime import datetime
from .models import CompanyData, Summary, WebDoc, LOB


def _bulletify(docs: List[WebDoc], limit: int = 5) -> str:
    bullets: list[str] = []
    for d in docs[:limit]:
        title = d.title.strip() if d.title else "Untitled"
        bullets.append(f"- {title}")
    return "\n".join(bullets) if bullets else "- No notable items"


def _derive_signals(data: CompanyData) -> Dict[str, bool]:
    signals = {
        "has_press": bool(data.press_releases),
        "has_earnings": bool(data.earnings_reports),
        "has_industry": bool(data.industry_reports),
        "has_competitors": bool(data.competitors),
    }
    return signals


def _lob_value_props() -> Dict[str, str]:
    return {
        "LTS": (
            "LinkedIn Talent Solutions helps organizations attract, engage, and hire the right talent by leveraging LinkedIn’s professional network and data.\n\n"
            "- Access to the world’s largest talent pool\n"
            "- Powerful sourcing and recruiting tools\n"
            "- Employer branding and candidate engagement\n"
            "- Integrated job advertising and hiring workflows\n"
            "- Data and insights for better decisions\n"
            "- Scalable for teams of all sizes"
        ),
        "LLS": (
            "LinkedIn Learning helps organizations and individuals build skills at scale, connecting learning to measurable outcomes.\n\n"
            "- Extensive, high-quality content library\n"
            "- Personalized and social learning\n"
            "- Integration with existing workflows\n"
            "- Enterprise-level insights and ROI\n"
            "- Global scale and accessibility\n"
            "- Career development and retention"
        ),
        "LMS": (
            "LinkedIn Marketing Solutions: tools for B2B marketers to build awareness, generate leads, and run targeted campaigns.\n\n"
            "- Sponsored Content and ad formats (single image, video, carousel, document)\n"
            "- Sponsored Messaging (Message Ads, Conversation Ads) for direct engagement\n"
            "- Dynamic Ads and Text Ads for personalized reach\n"
            "- Lead Gen Forms with CRM/automation integrations"
        ),
        "LSS": (
            "LinkedIn Sales Solutions: help sales teams find, engage, prioritize, and convert prospects.\n\n"
            "- Sales Navigator for advanced prospecting and buying-committee visibility\n"
            "- Deep Sales (next-gen Navigator) with AI-driven insights and buyer intent\n"
            "- Sales Insights for operations: market sizing, account potential, and trends"
        ),
    }


def _fmt_headline(prefix: str, d: WebDoc) -> str:
    title = d.title or "Untitled"
    link = f"[{title}]({d.url})"
    if d.published_at:
        return f"{prefix}: {link} ({d.published_at})"
    return f"{prefix}: {link}"


def _parse_date(s: str) -> float:
    # Try several common formats; return timestamp or 0.0 if unknown
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d %b %Y", "%b %d, %Y", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%a, %d %b %Y %H:%M:%S %Z"):
        try:
            dt = datetime.strptime(s[:len(fmt)], fmt)
            return dt.timestamp()
        except Exception:
            continue
    try:
        # last resort: fromisoformat without tz
        return datetime.fromisoformat(s.replace('Z', '').split('.')[0]).timestamp()
    except Exception:
        return 0.0


def _make_pitch_headlines(data: CompanyData) -> List[str]:
    scored: list[Tuple[int, float, str]] = []  # (relevance, timestamp, formatted)

    for d in data.press_releases:
        if d.title and d.url:
            ts = _parse_date(d.published_at) if d.published_at else 0.0
            scored.append((3, ts, _fmt_headline("Press", d)))
    for d in data.earnings_reports:
        if d.title and d.url:
            ts = _parse_date(d.published_at) if d.published_at else 0.0
            scored.append((2, ts, _fmt_headline("Earnings/IR", d)))
    for d in data.industry_reports:
        if d.title and d.url:
            ts = _parse_date(d.published_at) if d.published_at else 0.0
            scored.append((1, ts, _fmt_headline("Industry", d)))

    if not scored:
        return ["No recent public signals found; use discovery to align on priorities."]

    # Sort by relevance desc, then recency desc
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    return [s[2] for s in scored[:3]]


async def generate_summary(data: CompanyData) -> Summary:
    company = data.company
    signals = _derive_signals(data)

    executive_points: list[str] = []
    if signals["has_press"]:
        executive_points.append("Recent press suggests momentum in launches or partnerships.")
    if signals["has_earnings"]:
        executive_points.append("Earnings disclosures indicate budget focus and near-term priorities.")
    if signals["has_industry"]:
        executive_points.append("Industry coverage frames their market position and threats.")
    if signals["has_competitors"]:
        executive_points.append("Competitor set informs differentiation in the conversation.")
    if not executive_points:
        executive_points.append("Limited public signals; use discovery to qualify initiatives and budgets.")

    executive_brief = (
        f"{company.name} overview based on public signals.\n\n" + "\n".join(f"- {p}" for p in executive_points)
    )

    ads_opportunities = (
        "Map messaging to current announcements and owned moments. "
        "Use LinkedIn for awareness among professional audiences and precise retargeting of high-intent segments.\n\n"
        "Top sources:\n" + _bulletify(data.press_releases) + "\n" + _bulletify(data.industry_reports)
    )

    recruiting_notes = (
        "Connect hiring needs to strategic initiatives surfaced in press and earnings. "
        "Use LinkedIn Talent solutions to reach niche talent pools tied to those bets."
    )

    risks_flags = (
        "Watch for restructuring, regulatory items, or guidance changes in earnings. "
        "Avoid referencing speculative or unconfirmed negative press."
    )

    renewal_prep = (
        "Goals: confirm value realized, map to current priorities, propose next-step pilots.\n\n"
        "- Tie outcomes to last 2–3 public signals (press/earnings).\n"
        "- Identify 1–2 expansion plays (new LOB, geo, or audience).\n"
        "- Prepare proof points (reach in ICP roles, CTR/lead quality, talent pipeline).\n\n"
        "Recent signals:\n" + _bulletify(data.press_releases, 3) + "\n" + _bulletify(data.earnings_reports, 2)
    )

    outbound_prep = (
        "Goals: establish relevance quickly, align to a timely initiative, propose a low-lift pilot.\n\n"
        "- Open with a reference to a fresh press item or earnings priority.\n"
        "- Position LinkedIn as the most trusted professional reach plus closed-loop impact.\n"
        "- Offer a test (ABM for launch audiences, demand for key product line, or talent spotlight).\n\n"
        "Conversation anchors:\n" + _bulletify(data.industry_reports, 3)
    )

    all_props = _lob_value_props()
    lob_value_props: Dict[str, str] = {
        "Marketing": all_props["LMS"],
        "Sales": all_props["LSS"],
        "Talent": all_props["LTS"],
        "Learning": all_props["LLS"],
    }

    selected_lob = company.lob
    lob_focus = None
    if selected_lob:
        lob_focus = all_props[selected_lob.value]

    pitch_headlines = _make_pitch_headlines(data)

    return Summary(
        executive_brief=executive_brief,
        ads_opportunities=ads_opportunities,
        recruiting_notes=recruiting_notes,
        risks_flags=risks_flags,
        renewal_prep=renewal_prep,
        outbound_prep=outbound_prep,
        lob_value_props=lob_value_props,
        selected_lob=selected_lob,
        lob_focus=lob_focus,
        pitch_headlines=pitch_headlines,
    )
