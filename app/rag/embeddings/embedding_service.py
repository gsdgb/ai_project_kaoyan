# from langchain_openai import OpenAIEmbeddings
#
# from app.core.config import settings
#
#
# def get_embedding_model():
#     embeddings = OpenAIEmbeddings(
#         api_key=settings.OPENAI_API_KEY,
#         base_url=settings.OPENAI_BASE_URL,
#         model="text-embedding-3-small",
#     )
#
#     return embeddings

from langchain_community.embeddings import HuggingFaceEmbeddings

def get_embedding_model():
    embeddings = HuggingFaceEmbeddings(
        model_name="BAAI/bge-small-zh-v1.5"
    )

    return embeddings