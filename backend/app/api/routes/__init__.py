from fastapi import APIRouter

from app.api.routes import analytics, auth, brand_kit, ideas, media, posts, projects

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(posts.router)
api_router.include_router(ideas.router)
api_router.include_router(media.router)
api_router.include_router(brand_kit.router)
api_router.include_router(analytics.router)
