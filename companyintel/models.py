from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict
from enum import Enum


class LOB(str, Enum):
    LTS = "LTS"  # Talent
    LLS = "LLS"  # Learning
    LMS = "LMS"  # Marketing
    LSS = "LSS"  # Sales


class CompanyInput(BaseModel):
    name: str = Field(..., description="Company official name")
    website: HttpUrl = Field(..., description="Company website URL")
    lob: Optional[LOB] = Field(None, description="Selected line of business focus (LTS, LLS, LMS, LSS)")


class WebDoc(BaseModel):
    title: str
    url: HttpUrl
    snippet: Optional[str] = None
    content: Optional[str] = None
    source: Optional[str] = None
    published_at: Optional[str] = None


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
    renewal_prep: str
    outbound_prep: str
    lob_value_props: Dict[str, str]
    selected_lob: Optional[LOB] = None
    lob_focus: Optional[str] = None
    pitch_headlines: List[str] = []


class Report(BaseModel):
    data: CompanyData
    summary: Summary
