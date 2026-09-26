from pydantic import BaseModel


class DailyPoint(BaseModel):
    date: str
    reach: int
    engagement_rate: float
    followers: int


class PlatformSummary(BaseModel):
    platform: str
    reach: int
    reach_delta_pct: float
    engagement_rate: float
    engagement_rate_delta_pct: float
    followers: int
    followers_delta: int
    daily: list[DailyPoint]


class TopPost(BaseModel):
    post_id: str
    title: str
    platform: str
    reach: int
    engagement_rate: float


class AnalyticsOverview(BaseModel):
    platforms: list[PlatformSummary]
    top_posts: list[TopPost]
    ai_summary: str
