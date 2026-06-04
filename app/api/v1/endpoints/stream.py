from fastapi import APIRouter

from fastapi.responses import StreamingResponse

from app.runtime.streaming import (
    stream_graph_response
)


router = APIRouter()


@router.get("/stream")
async def stream_chat(question: str):

    async def event_generator():

        async for chunk in stream_graph_response(question):

            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )