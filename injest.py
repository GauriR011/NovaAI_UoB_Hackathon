# ingest_service.py
import os
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma

DOCS_DIR = "docs"
DB_DIR = "chroma_db"

def ingest_all_pdfs():
    docs = []
    for fname in os.listdir(DOCS_DIR):
        if not fname.lower().endswith(".pdf"):
            continue
        path = os.path.join(DOCS_DIR, fname)
        loader = PyPDFLoader(path)
        file_docs = loader.load()
        for d in file_docs:
            d.metadata.setdefault("source", fname)
        docs.extend(file_docs)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
    )
    chunks = splitter.split_documents(docs)

    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=DB_DIR,
    )
    vectordb.persist()
    return len(chunks)
