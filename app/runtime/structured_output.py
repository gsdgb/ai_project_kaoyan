from pydantic import BaseModel


class AgentResponse(BaseModel):

    step: str

    content: str

    status: str