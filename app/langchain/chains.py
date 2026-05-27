from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from app.langchain.llm import get_llm


llm = get_llm()

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是企业 AI Agent"),
        ("human", "{question}")
    ]
)

chain = (
    prompt
    | llm
    | StrOutputParser()
)