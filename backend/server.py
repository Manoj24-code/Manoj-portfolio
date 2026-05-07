from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
import uuid
from datetime import datetime, timedelta, timezone
import jwt

from defaults import DEFAULT_CONTENT

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALG = "HS256"
JWT_TTL_DAYS = 7

CONTENT_DOC_ID = "main"

app = FastAPI(title="Embedded Portfolio API")
api_router = APIRouter(prefix="/api")

# ---------- Models ----------
class LoginReq(BaseModel):
    password: str

class LoginRes(BaseModel):
    token: str
    expiresAt: str

class MessageReq(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=5000)

class MessageRes(BaseModel):
    id: str
    name: str
    email: str
    message: str
    createdAt: str

class ContentUpdate(BaseModel):
    profile: Optional[dict] = None
    about: Optional[dict] = None
    skills: Optional[List[dict]] = None
    projects: Optional[List[dict]] = None
    experience: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    certifications: Optional[List[dict]] = None

# ---------- Helpers ----------

def _strip_mongo(doc: dict) -> dict:
    if not doc:
        return doc
    doc.pop("_id", None)
    return doc


async def _get_or_seed_content() -> dict:
    existing = await db.portfolio_content.find_one({"_id": CONTENT_DOC_ID})
    if existing:
        return _strip_mongo(existing)
    seed = {**DEFAULT_CONTENT, "_id": CONTENT_DOC_ID,
            "updatedAt": datetime.now(timezone.utc).isoformat()}
    await db.portfolio_content.insert_one(seed)
    return _strip_mongo(dict(seed))


def _make_token() -> LoginRes:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_TTL_DAYS)
    payload = {"sub": "admin", "exp": exp}
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return LoginRes(token=token, expiresAt=exp.isoformat())


def require_admin(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("sub") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return "admin"


# ---------- Public routes ----------
@api_router.get("/")
async def root():
    return {"message": "portfolio-api ok"}


@api_router.get("/content")
async def get_content():
    return await _get_or_seed_content()


@api_router.post("/messages")
async def create_message(req: MessageReq):
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.contact_messages.insert_one({
        "_id": msg_id,
        "name": req.name.strip(),
        "email": req.email,
        "message": req.message.strip(),
        "createdAt": now,
    })
    return {"ok": True, "id": msg_id}


# ---------- Admin routes ----------
@api_router.post("/admin/login", response_model=LoginRes)
async def admin_login(req: LoginReq):
    if req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    return _make_token()


@api_router.get("/admin/me")
async def admin_me(_: str = Depends(require_admin)):
    return {"ok": True, "sub": "admin"}


@api_router.put("/admin/content")
async def admin_update_content(body: ContentUpdate, _: str = Depends(require_admin)):
    current = await _get_or_seed_content()
    patch: dict[str, Any] = {}
    for k in ("profile", "about", "skills", "projects", "experience", "education", "certifications"):
        v = getattr(body, k)
        if v is not None:
            patch[k] = v
    if not patch:
        raise HTTPException(status_code=400, detail="No fields to update")
    patch["updatedAt"] = datetime.now(timezone.utc).isoformat()
    merged = {**current, **patch, "_id": CONTENT_DOC_ID}
    await db.portfolio_content.replace_one({"_id": CONTENT_DOC_ID}, merged, upsert=True)
    return _strip_mongo(merged)


@api_router.get("/admin/messages")
async def admin_list_messages(_: str = Depends(require_admin)):
    cursor = db.contact_messages.find(
        {},
        {"_id": 1, "name": 1, "email": 1, "message": 1, "createdAt": 1},
    ).sort("createdAt", -1).limit(500)
    items = []
    async for m in cursor:
        items.append({
            "id": m.get("_id"),
            "name": m.get("name"),
            "email": m.get("email"),
            "message": m.get("message"),
            "createdAt": m.get("createdAt"),
        })
    return items


@api_router.delete("/admin/messages/{msg_id}")
async def admin_delete_message(msg_id: str, _: str = Depends(require_admin)):
    res = await db.contact_messages.delete_one({"_id": msg_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
