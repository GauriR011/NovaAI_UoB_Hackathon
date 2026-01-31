# # app.py - MODERN LCEL VERSION (2026 BEST PRACTICE)
# import os
# import shutil
# from typing import List, Optional
# from dotenv import load_dotenv
# from fastapi import FastAPI, UploadFile, File, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# from langchain_community.document_loaders import PyPDFLoader
# from langchain_text_splitters import RecursiveCharacterTextSplitter
# from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
# from langchain_community.vectorstores import Chroma

# from langchain_core.prompts import ChatPromptTemplate
# from langchain_core.runnables import RunnablePassthrough, RunnableLambda
# from langchain_core.documents import Document

# load_dotenv()

# # Config
# DOCS_DIR = "docs"
# DB_DIR = "chroma_db"
# os.makedirs(DOCS_DIR, exist_ok=True)
# os.makedirs(DB_DIR, exist_ok=True)

# app = FastAPI(title="Company Careers Bot (Gemini RAG - LCEL)")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Globals
# retriever = None
# rag_chain = None

# def build_rag_chain():
#     """Build LCEL RAG chain"""
#     global retriever, rag_chain

#     embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

#     if not os.path.exists(DB_DIR) or not os.listdir(DB_DIR):
#         raise RuntimeError("Vector DB is empty. Please run /admin/reindex.")

#     vectordb = Chroma(
#         persist_directory=DB_DIR,
#         embedding_function=embeddings,
#     )

#     retriever = vectordb.as_retriever(search_kwargs={"k": 5})

#     llm = ChatGoogleGenerativeAI(
#         model="gemini-flash-latest",
#         temperature=0.2,
#     )

#     template = """
# You are a professional, polite, and friendly AI recruiting assistant and information provider for the company Space42.

# Your role is to:
# - Answer questions strictly related to Space42 as a company
# - Provide information about Space42’s mission, values, policies, culture, roles, hiring process, and publicly available job opportunities
# - Assist candidates and users with general company-related inquiries

# STRICT RULES:
# 1. You MUST answer questions ONLY using:
#    - The provided company documents (context)

# 2. You MUST NOT:
#    - Make assumptions or fabricate information
#    - Agree with or validate incorrect information provided by the user
#    - Answer questions unrelated to Space42

# 3. If the user asks unrelated, rude, abusive, or meaningless questions:
#    Respond politely but firmly, redirecting them back to Space42-related topics.

# 4. If the answer is NOT clearly available in the provided context:
#    Respond exactly with:
#    "I'm not sure about that. Please contact info@space42.ai for further details."

# 5. Maintain a professional, respectful, and neutral tone at all times.

# CONTEXT FROM COMPANY DOCUMENTS:
# {context}

# USER QUESTION:
# {question}
# """

#     prompt = ChatPromptTemplate.from_template(template)

#     def format_docs(docs: List[Document]) -> str:
#         return "\n\n".join(
#             f"[Source: {d.metadata.get('source', 'unknown')}]\n{d.page_content}"
#             for d in docs
#         )

#     rag_chain = (
#         {
#             "context": retriever | RunnableLambda(format_docs),
#             "question": RunnablePassthrough(),
#         }
#         | prompt
#         | llm
#     )

#     return rag_chain

# def get_rag_chain():
#     global rag_chain
#     if rag_chain is not None:
#         return rag_chain
#     rag_chain = build_rag_chain()
#     return rag_chain

# def ingest_all_pdfs():
#     """Ingest all PDFs in docs/ folder"""
#     try:
#         docs = []
#         pdf_files = [f for f in os.listdir(DOCS_DIR) if f.lower().endswith(".pdf")]

#         if not pdf_files:
#             return 0

#         for fname in pdf_files:
#             path = os.path.join(DOCS_DIR, fname)
#             try:
#                 loader = PyPDFLoader(path)
#                 file_docs = loader.load()
#                 for d in file_docs:
#                     d.metadata["source"] = fname
#                 docs.extend(file_docs)
#                 print(f"Loaded {fname} ({len(file_docs)} pages)")
#             except Exception as e:
#                 print(f"Failed to load {fname}: {e}")

#         if not docs:
#             return 0

#         splitter = RecursiveCharacterTextSplitter(
#             chunk_size=1000,
#             chunk_overlap=200,
#         )
#         chunks = splitter.split_documents(docs)
#         print(f"Created {len(chunks)} chunks")

#         embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

#         vectordb = Chroma.from_documents(
#             documents=chunks,
#             embedding=embeddings,
#             persist_directory=DB_DIR,
#         )

#         try:
#             vectordb.persist()
#         except Exception:
#             pass

#         print("Vector DB saved!")
#         return len(chunks)

#     except Exception as e:
#         print(f"Ingestion failed: {e}")
#         return 0

# # Models
# class ChatTurn(BaseModel):
#     user: str
#     assistant: str

# class ChatRequest(BaseModel):
#     question: str
#     history: Optional[List[ChatTurn]] = None
#     top_k: Optional[int] = 5

# class Source(BaseModel):
#     source: str
#     page: Optional[int] = None
#     snippet: str

# class ChatResponse(BaseModel):
#     answer: str
#     sources: List[Source]

# class StatusResponse(BaseModel):
#     status: str
#     message: str
#     chunk_count: Optional[int] = None

# # Routes
# @app.get("/")
# def root():
#     return {"message": "Company Careers Bot (LCEL) is running! Visit /docs"}

# @app.post("/chat", response_model=ChatResponse)
# def chat(req: ChatRequest):
#     try:
#         chain = get_rag_chain()
#         result = chain.invoke(req.question)

#         # Get source docs separately
#         docs = retriever.get_relevant_documents(req.question)

#         sources = []
#         for d in docs:
#             meta = d.metadata
#             sources.append(Source(
#                 source=meta.get("source", "unknown"),
#                 page=meta.get("page", meta.get("page_number")),
#                 snippet=d.page_content[:300] + "..." if len(d.page_content) > 300 else d.page_content,
#             ))

#         return ChatResponse(answer=result.content, sources=sources)

#     except Exception as e:
#         return ChatResponse(
#             answer=f"Bot not ready or error occurred: {str(e)}",
#             sources=[]
#         )

# @app.post("/admin/upload", response_model=StatusResponse)
# async def upload_pdf(file: UploadFile = File(...)):
#     if not file.filename.lower().endswith(".pdf"):
#         raise HTTPException(400, "Only PDF files allowed")

#     filepath = os.path.join(DOCS_DIR, file.filename)
#     with open(filepath, "wb") as f:
#         shutil.copyfileobj(file.file, f)

#     return StatusResponse(status="success", message=f"Uploaded {file.filename}")

# @app.post("/admin/reindex", response_model=StatusResponse)
# def reindex():
#     global rag_chain, retriever
#     rag_chain = None
#     retriever = None

#     chunk_count = ingest_all_pdfs()
#     pdf_count = len([f for f in os.listdir(DOCS_DIR) if f.lower().endswith(".pdf")])

#     return StatusResponse(
#         status="success",
#         message=f"Reindexed {chunk_count} chunks from {pdf_count} PDFs",
#         chunk_count=chunk_count,
#     )

# @app.get("/admin/status", response_model=StatusResponse)
# def admin_status():
#     pdf_count = len([f for f in os.listdir(DOCS_DIR) if f.lower().endswith(".pdf")])
#     db_exists = os.path.exists(DB_DIR) and bool(os.listdir(DB_DIR))

#     return StatusResponse(
#         status="ready" if db_exists else "needs_indexing",
#         message=f"{pdf_count} PDFs | 🗄️ DB: {'ready' if db_exists else 'empty'}",
#     )

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


# app.py - WEB SEARCH POWERED BOT (NO PDFs, NO VECTOR DB)
import os
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

from langchain_community.tools.tavily_search import TavilySearchResults

load_dotenv()

app = FastAPI(title="Company Careers Bot (Web Search + Gemini)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Web search tool
search_tool = TavilySearchResults(max_results=5)

llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    temperature=0.2,
)

PROMPT = """
You are a professional, polite, and friendly AI recruiting assistant and information provider for the company Space42.

Your role is to:
- Answer questions STRICTLY related to Space42 as a company
- Provide information ONLY about Space42’s mission, values, policies, culture, roles, hiring process, and publicly available job opportunities

STRICT RULES:
1. You MUST answer questions ONLY using the web search results provided.
2. You MUST NOT fabricate information.
3. If the answer is NOT clearly found in the search results:
   Respond exactly with:
   "I'm not sure about that. Please contact info@space42.ai for further details."
4. Do NOT answer questions unrelated to Space42.

WEB SEARCH RESULTS:
{context}

USER QUESTION:
{question}
"""

prompt = ChatPromptTemplate.from_template(PROMPT)

def run_web_search(query: str) -> str:
    """Run web search and format results for prompt"""
    results = search_tool.run(query)

    formatted = []
    for r in results:
        formatted.append(
            f"Title: {r.get('title')}\n"
            f"URL: {r.get('url')}\n"
            f"Content: {r.get('content')}"
        )

    return "\n\n".join(formatted)

# LCEL Web RAG Chain
web_rag_chain = (
    {
        "context": RunnableLambda(run_web_search),
        "question": RunnablePassthrough(),
    }
    | prompt
    | llm
)

# Models
class ChatTurn(BaseModel):
    user: str
    assistant: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatTurn]] = None

class Source(BaseModel):
    source: str
    page: Optional[int] = None
    snippet: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]

class StatusResponse(BaseModel):
    status: str
    message: str

# Routes
@app.get("/")
def root():
    return {"message": "Company Careers Bot (Web Search) is running! Visit /docs"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        result = web_rag_chain.invoke(req.question)

        # For transparency, also return raw search snippets as sources
        raw_results = search_tool.run(req.question)

        sources = []
        for r in raw_results:
            sources.append(Source(
                source=r.get("url", "unknown"),
                snippet=(r.get("content") or "")[:300]
            ))

        return ChatResponse(
            answer=result.content,
            sources=sources
        )

    except Exception as e:
        return ChatResponse(
            answer=f"Error occurred: {str(e)}",
            sources=[]
        )

@app.get("/admin/status", response_model=StatusResponse)
def admin_status():
    return StatusResponse(
        status="ready",
        message="Web search mode enabled (no documents, no indexing required)"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)



# HOW TO RUN THIS
# python app.py
# uvicorn app:app --reload


# TODO: Change the prompt to the previous one