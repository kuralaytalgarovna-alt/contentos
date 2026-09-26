"""Deterministic mock analytics generator.

Real analytics would come from each platform's Insights API (Meta Graph API,
TikTok Business API, etc.) — see PRD section 5.4 / 7 for the documented
limitations of those APIs for non-Business accounts. This module produces
stable, believable numbers per project so the dashboard and reports have
something to render before those integrations are wired up.
"""
import hashlib
import random
from datetime import datetime, timedelta, timezone

from app.schemas.analytics import AnalyticsOverview, DailyPoint, PlatformSummary, TopPost

PLATFORMS = ["instagram", "tiktok", "facebook", "telegram", "threads"]


def _seeded_random(project_id: str, platform: str) -> random.Random:
    seed = int(hashlib.sha256(f"{project_id}:{platform}".encode()).hexdigest(), 16) % (2**32)
    return random.Random(seed)


def _daily_series(rnd: random.Random, base: int, days: int = 30) -> list[DailyPoint]:
    today = datetime.now(timezone.utc).date()
    points = []
    followers = base * 20
    for i in range(days, 0, -1):
        date = today - timedelta(days=i)
        reach = max(0, int(rnd.gauss(base, base * 0.25)))
        er = round(max(0.5, rnd.gauss(4.5, 1.2)), 2)
        followers += rnd.randint(-3, 15)
        points.append(DailyPoint(date=date.isoformat(), reach=reach, engagement_rate=er, followers=followers))
    return points


def get_overview(project_id: str, platforms: list[str] | None = None) -> AnalyticsOverview:
    platforms = platforms or PLATFORMS
    summaries = []
    top_posts = []

    for platform in platforms:
        rnd = _seeded_random(project_id, platform)
        base_reach = rnd.randint(800, 15000)
        daily = _daily_series(rnd, base_reach)

        last_week = daily[-7:]
        prev_week = daily[-14:-7]
        reach_now = sum(p.reach for p in last_week)
        reach_prev = sum(p.reach for p in prev_week) or 1
        er_now = round(sum(p.engagement_rate for p in last_week) / len(last_week), 2)
        er_prev = sum(p.engagement_rate for p in prev_week) / len(prev_week) or 1

        summaries.append(
            PlatformSummary(
                platform=platform,
                reach=reach_now,
                reach_delta_pct=round((reach_now - reach_prev) / reach_prev * 100, 1),
                engagement_rate=er_now,
                engagement_rate_delta_pct=round((er_now - er_prev) / er_prev * 100, 1),
                followers=daily[-1].followers,
                followers_delta=daily[-1].followers - daily[-8].followers,
                daily=daily,
            )
        )

        for i in range(2):
            top_posts.append(
                TopPost(
                    post_id=f"mock-{platform}-{i}",
                    title=rnd.choice(
                        [
                            "Разбор главной новости недели",
                            "Закулисье съёмок",
                            "Топ-5 моментов эфира",
                            "Опрос: ваше мнение",
                        ]
                    ),
                    platform=platform,
                    reach=int(rnd.uniform(0.6, 1.4) * base_reach),
                    engagement_rate=round(rnd.uniform(3.0, 9.0), 2),
                )
            )

    top_posts.sort(key=lambda p: p.reach, reverse=True)

    best_platform = max(summaries, key=lambda s: s.reach_delta_pct)
    ai_summary = (
        f"За последнюю неделю лучший рост показал {best_platform.platform} "
        f"({'+' if best_platform.reach_delta_pct >= 0 else ''}{best_platform.reach_delta_pct}% к охвату). "
        f"Средний ER по площадкам — {round(sum(s.engagement_rate for s in summaries) / len(summaries), 2)}%. "
        f"Рекомендация: повторить формат топ-поста недели на других платформах."
    )

    return AnalyticsOverview(platforms=summaries, top_posts=top_posts[:5], ai_summary=ai_summary)
