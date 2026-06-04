import asyncio

from app.runtime.streaming import (
    stream_graph_response
)


async def main():

    async for chunk in stream_graph_response(
        "简要说明国内找工作的薪资"
    ):

        print(chunk)


asyncio.run(main())