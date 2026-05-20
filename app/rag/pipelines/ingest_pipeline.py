from langchain_core.documents import Document

from app.rag.loaders.pdf_loader import extract_text_from_pdf
from app.rag.splitters.text_splitter import split_text
from app.rag.vectordb.chroma_service import get_vectorstore


def ingest_pdf(file_path: str,
               owner_id: int,
               file_id: int):
    text = extract_text_from_pdf(file_path)

    chunks = split_text(text)

    documents = []

    for chunk in chunks:
        doc = Document(
            page_content=chunk,
            metadata={
                "source": file_path,
                "owner_id": owner_id,
                "file_id": file_id,
            },
        )

        documents.append(doc)

    vectorstore = get_vectorstore()

    vectorstore.add_documents(documents)

    return len(documents)