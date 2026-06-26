from langchain_core.documents import Document

from app.rag.loaders.file_loader import extract_text_from_file
from app.rag.splitters.text_splitter import split_text
from app.rag.vectordb.chroma_service import get_vectorstore


def ingest_file(
    file_path: str,
    file_ext: str,
    owner_id: int,
    file_id: int,
) -> int:
    text = extract_text_from_file(file_path, file_ext)

    if not text or not text.strip():
        return 0

    chunks = split_text(text)

    documents = []
    for i, chunk in enumerate(chunks):
        doc = Document(
            page_content=chunk,
            metadata={
                "source": file_path,
                "owner_id": owner_id,
                "file_id": file_id,
                "chunk_index": i,
            },
        )
        documents.append(doc)

    vectorstore = get_vectorstore()
    vectorstore.add_documents(documents)

    return len(documents)
