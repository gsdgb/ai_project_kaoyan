from langchain_chroma import Chroma

from app.rag.embeddings.embedding_service import get_embedding_model

CHROMA_DIR = "app/storage/chroma"


def get_vectorstore():
    embedding_model = get_embedding_model()

    vectorstore = Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embedding_model,
    )

    return vectorstore