from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.routers.health import health_api
from app.routers.rag import rag_api
from app.routers.pdf import pdf_api 
from app.routers.chat import chat_api
from app.routers.survey import survey_api
from app.routers.rag import rag_api

app = FastAPI(
    title="Workshop Demo API",
    description="API for demos",
    version="1.0.0",
)

# register CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/app", StaticFiles(directory="static", html=True), name="static")
app.mount("/surveys", StaticFiles(directory="surveys"), name="surveys")

routers = [
    rag_api,
    health_api,
    pdf_api,
    chat_api,
    survey_api,
    rag_api,
]

# Register routers
for router in routers:
    app.include_router(router, prefix='/api')
    print(f"Registered router: {router.prefix}")

