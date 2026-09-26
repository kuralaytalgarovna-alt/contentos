"""AI content generation service.

Uses the Anthropic API when ANTHROPIC_API_KEY is configured; otherwise falls
back to a deterministic template-based generator so the product works out of
the box without any external key or cost.
"""
import json
import random
from dataclasses import dataclass

from app.core.config import get_settings

settings = get_settings()

_HOOKS = [
    "5 фактов о {niche}, которые вы не знали",
    "Как {niche} меняется прямо сейчас",
    "Разбираем главный вопрос недели про {niche}",
    "Топ-3 ошибки, которые совершают в {niche}",
    "История одного зрителя: {niche}",
    "Что не так с последними новостями о {niche}?",
    "Гид для новичков: {niche} за 60 секунд",
    "Сравнение: раньше vs сейчас в {niche}",
    "Мнение редакции про {niche}",
    "Закулисье: как мы делаем контент про {niche}",
]

_RATIONALES = {
    "reach": "Формат с высоким потенциалом органического охвата — цепляющий заголовок работает на удержание в первые секунды.",
    "engagement": "Провоцирует комментарии и репосты за счёт вопроса/спорного утверждения в начале.",
    "sales": "Подводит к продукту через понятную пользу, не выглядит как реклама в лоб.",
}

_FORMATS_BY_GOAL = {
    "reach": ["reels", "carousel"],
    "engagement": ["carousel", "post"],
    "sales": ["post", "story"],
}


@dataclass
class GeneratedIdea:
    title: str
    rationale: str
    suggested_format: str
    suggested_platform: str


def _mock_generate_ideas(niche: str, goal: str, platform: str | None, count: int) -> list[GeneratedIdea]:
    rationale = _RATIONALES.get(goal, _RATIONALES["engagement"])
    formats = _FORMATS_BY_GOAL.get(goal, ["post"])
    niche_label = niche or "вашей ниши"

    hooks = random.sample(_HOOKS, k=min(count, len(_HOOKS)))
    while len(hooks) < count:
        hooks.append(random.choice(_HOOKS))

    ideas = []
    for i, hook in enumerate(hooks[:count]):
        ideas.append(
            GeneratedIdea(
                title=hook.format(niche=niche_label),
                rationale=rationale,
                suggested_format=formats[i % len(formats)],
                suggested_platform=platform or "instagram",
            )
        )
    return ideas


def _anthropic_generate_ideas(niche: str, audience: str, tone: str, goal: str, platform: str | None, count: int) -> list[GeneratedIdea]:
    import anthropic

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    prompt = (
        f"Ты — SMM-стратег. Ниша: {niche or 'не указана'}. "
        f"Целевая аудитория: {audience or 'не указана'}. "
        f"Tone of voice бренда: {tone or 'нейтральный'}. "
        f"Цель контента: {goal}. Платформа: {platform or 'любая'}.\n"
        f"Сгенерируй {count} идей постов. Для каждой идеи дай: title (заголовок/тема), "
        f"rationale (почему это сработает, 1 предложение), suggested_format (post/reels/story/carousel).\n"
        f'Ответь строго в JSON: {{"ideas": [{{"title": "...", "rationale": "...", "suggested_format": "..."}}]}}'
    )
    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}],
    )
    text = message.content[0].text
    data = json.loads(text)
    return [
        GeneratedIdea(
            title=item["title"],
            rationale=item.get("rationale", ""),
            suggested_format=item.get("suggested_format", "post"),
            suggested_platform=platform or "instagram",
        )
        for item in data["ideas"][:count]
    ]


def generate_ideas(
    niche: str,
    audience: str,
    tone: str,
    goal: str,
    platform: str | None,
    count: int = 10,
) -> list[GeneratedIdea]:
    if settings.anthropic_api_key:
        try:
            return _anthropic_generate_ideas(niche, audience, tone, goal, platform, count)
        except Exception:
            # Fall back to the mock generator rather than breaking the flow
            # if the external API is unreachable or misconfigured.
            pass
    return _mock_generate_ideas(niche, goal, platform, count)


def generate_post_text(topic: str, niche: str, tone: str, platform: str, format: str) -> dict:
    if settings.anthropic_api_key:
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            prompt = (
                f"Напиши черновик поста для {platform} в формате {format}. Тема: {topic}. "
                f"Ниша: {niche or 'не указана'}. Tone of voice: {tone or 'нейтральный'}.\n"
                f'Ответь строго в JSON: {{"title": "...", "body": "...", "cta_options": ["...", "...", "..."], "hashtags": "#..."}}'
            )
            message = client.messages.create(
                model="claude-sonnet-5",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}],
            )
            return json.loads(message.content[0].text)
        except Exception:
            pass

    niche_label = niche or "вашей теме"
    return {
        "title": topic or f"Пост про {niche_label}",
        "body": (
            f"{topic or 'Сегодня разбираем важную тему'} — вот что стоит знать. "
            f"Это черновик, отредактируйте под свой стиль перед публикацией."
        ),
        "cta_options": [
            "Сохрани, чтобы не потерять",
            "Напиши в комментариях своё мнение",
            "Поделись с другом, которому актуально",
        ],
        "hashtags": f"#{(niche or 'контент').replace(' ', '')} #smm #контент",
    }
