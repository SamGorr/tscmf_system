from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import register_tortoise
from app.config import settings
from app.routes import clients, products, transactions
import os

app = FastAPI(
    title="TSCMF Management Platform API",
    description="API for Trade, Supply Chain, and Microfinance Management Platform",
    version="1.0.0"
)

# Configure CORS
origins = ["http://localhost:3000", "http://frontend:3000", "http://tscmf-frontend:3000"]
if os.environ.get("CORS_ORIGINS") == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include routers
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["transactions"])

# Register Tortoise ORM
register_tortoise(
    app,
    db_url=settings.get_database_url,
    modules={"models": ["app.models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)

@app.get("/")
async def root():
    return {"message": "TSCMF Management Platform API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 