import os
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def _make_async_database_url(raw_url: str) -> str:
    """
    Normalize DATABASE_URL to an async driver.
    - If the user provides psycopg2, swap to asyncpg.
    - If no driver is provided, append asyncpg.
    """
    if "+psycopg2" in raw_url:
        return raw_url.replace("+psycopg2", "+asyncpg")
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return raw_url


DATABASE_URL = _make_async_database_url(
    os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@db:5432/geoai",
    )
)

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
