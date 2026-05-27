from langchain_core.prompts import ChatPromptTemplate


chat_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "你是企业级 AI Agent"),
        ("human", "{question}")
    ]
)