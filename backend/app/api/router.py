from fastapi import APIRouter
from fastapi import Depends

from app.api.dashboard import router as dashboard_router
from app.api.members import router as members_router
from app.api.ml_agent import router as ml_agent_router
from app.api.hcc import router as hcc_router, hcc_map_router
from app.auth_dependencies import require_auth


api_router = APIRouter(
    prefix="/api/v1",
    dependencies=[Depends(require_auth)]
)


api_router.include_router(dashboard_router)
api_router.include_router(members_router)
api_router.include_router(ml_agent_router)
api_router.include_router(hcc_router)
api_router.include_router(hcc_map_router)