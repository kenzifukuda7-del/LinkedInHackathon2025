from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional


class CompanyInput(BaseModel):
    name: str = Field(..., description="Company official name")
    website: HttpUrl = Field(..., description="Company website URL")


class WebDoc(BaseModel):
    title: str
    url: HttpUrl
    snippet: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None


class CompanyData(BaseModel):
    company: CompanyInput
    press_releases: List[WebDoc] = []
    earnings_reports: List[WebDoc] = []
    industry_reports: List[WebDoc] = []
    competitors: List[str] = []


class Summary(BaseModel):
    executive_brief: str
    ads_opportunities: str
    recruiting_notes: str
    risks_flags: str


class Report(BaseModel):
    data: CompanyData
    summary: Summary
