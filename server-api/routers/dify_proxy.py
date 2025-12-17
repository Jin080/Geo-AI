import os
from typing import AsyncIterator

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api", tags=["dify"])

DIFY_API_URL = os.getenv(
    "DIFY_API_URL",
    "https://api.dify.ai/v1/chat-messages",
)


async def _stream_dify_sse(request: Request, payload: dict) -> AsyncIterator[bytes]:
    api_key = os.getenv("DIFY_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="DIFY_API_KEY is not configured")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST", DIFY_API_URL, json=payload, headers=headers
        ) as resp:
            if resp.status_code >= 400:
                detail = await resp.aread()
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=detail.decode("utf-8", errors="ignore"),
                )

            async for line in resp.aiter_lines():
                # Preserve SSE format; prepend newline to maintain event boundaries.
                yield (line + "\n").encode("utf-8")


@router.post("/chat")
async def chat(request: Request):
    payload = await request.json()

    async def event_generator() -> AsyncIterator[bytes]:
        async for chunk in _stream_dify_sse(request, payload):
            yield chunk

    return StreamingResponse(
        event_generator(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"}
    )
