import os

from langchain_chroma import Chroma

from app.rag.embeddings.embedding_service import get_embedding_model

CHROMA_DIR = "app/storage/chroma"
COLLECTION_NAME = "user_documents"


def get_vectorstore():
    os.makedirs(CHROMA_DIR, exist_ok=True)

    embedding_model = get_embedding_model()

    vectorstore = Chroma(
        collection_name=COLLECTION_NAME,
        persist_directory=CHROMA_DIR,
        embedding_function=embedding_model,
    )

    return vectorstore


def delete_vectors_by_file(owner_id: int, file_id: int) -> int:
    """删除指定 owner_id + file_id 的所有向量，返回删除数量"""
    vectorstore = get_vectorstore()
    collection = vectorstore._collection

    result = collection.get(
        where={"$and": [{"owner_id": owner_id}, {"file_id": file_id}]}
    )
    ids_to_delete = result.get("ids", [])

    if ids_to_delete:
        collection.delete(ids=ids_to_delete)

    return len(ids_to_delete)
