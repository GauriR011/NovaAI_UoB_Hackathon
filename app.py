# app.py - COMPLETE, FIXED VERSION with error handling
import os
import shutil
from typing import List, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()

# Config
DOCS_DIR = "docs"
DB_DIR = "chroma_db"
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

app = FastAPI(title="Company Careers Bot (Gemini RAG)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
qa_chain = None

def get_qa_chain():
    """Load vector store and create RAG chain with error handling"""
    global qa_chain
    if qa_chain is not None:
        return qa_chain
    
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        
        # TRY to load existing Chroma DB, with fallback
        try:
            vectordb = Chroma(
                embedding_function=embeddings,
                persist_directory=DB_DIR,
            )
            print("Loaded existing Chroma DB")
        except Exception as e:
            print(f"Chroma load failed ({e}), will create empty one")
            vectordb = None
        
        retriever = vectordb.as_retriever(search_kwargs={"k": 5}) if vectordb else None
        
        llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            temperature=0.2,
        )
        
        template = """
You are a professional, polite, and friendly AI recruiting assistant and information provider for the company Space42.

Your role is to:
- Answer questions strictly related to Space42 as a company
- Provide information about Space42’s mission, values, policies, culture, roles, hiring process, and publicly available job opportunities
- Assist candidates and users with general company-related inquiries

STRICT RULES:
1. You MUST answer questions ONLY using:
   - The provided company context (if there is any)
   - Verified information about Space42 obtained via web search (company website, official announcements, or trusted sources)
   
2. You MUST NOT:
   - Make assumptions or fabricate information
   - Agree with or validate incorrect information provided by the user
   - Answer questions unrelated to Space42 (e.g., personal advice, politics, jokes, unrelated companies, general AI topics)

3. If the user:
   - Asks an unrelated question
   - Uses rude, abusive, or inappropriate language
   - Asks nonsense or meaningless questions
   
   Respond politely but firmly, redirecting them back to Space42-related topics.

4. If the answer is NOT clearly available in the provided context or verified sources:
   Respond exactly with:
   "I'm not sure about that. Please contact info@space42.ai for further details."

5. Maintain a professional, respectful, and neutral tone at all times.
   - Do NOT engage emotionally
   - Do NOT argue with the user
   - Do NOT lecture or scold

6. You MUST NOT discuss:
   - Any company other than Space42
   - Internal or confidential information
   - Topics that do not serve the purpose of a company or recruitment chatbot

CONTEXT FROM COMPANY DOCUMENTS:
{context}

USER QUESTION:
{question}

"""

        prompt = PromptTemplate(
            input_variables=["context", "question"],
            template=template,
        )
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            chain_type="stuff",
            chain_type_kwargs={"prompt": prompt},
            return_source_documents=True,
        )
        return qa_chain
        
    except Exception as e:
        print(f"Failed to create QA chain: {e}")
        return None

def ingest_all_pdfs():
    """Ingest all PDFs in docs/ folder - with full error handling"""
    try:
        docs = []
        pdf_files = [f for f in os.listdir(DOCS_DIR) if f.lower().endswith('.pdf')]
        
        if not pdf_files:
            return 0
        
        for fname in pdf_files:
            path = os.path.join(DOCS_DIR, fname)
            try:
                loader = PyPDFLoader(path)
                file_docs = loader.load()
                for d in file_docs:
                    d.metadata["source"] = fname
                docs.extend(file_docs)
                print(f"Loaded {fname} ({len(file_docs)} pages)")
            except Exception as e:
                print(f"Failed to load {fname}: {e}")
                continue
        
        if not docs:
            return 0
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        chunks = splitter.split_documents(docs)
        print(f"Created {len(chunks)} chunks from {len(pdf_files)} PDFs")
        
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        vectordb = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=DB_DIR,
        )
        vectordb.persist()
        print("Vector DB saved!")
        return len(chunks)
        
    except Exception as e:
        print(f"Ingestion failed: {e}")
        return 0

# Models
class ChatTurn(BaseModel):
    user: str
    assistant: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatTurn]] = None
    top_k: Optional[int] = 5

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
    chunk_count: Optional[int] = None

# Routes
@app.get("/")
def root():
    return {"message": "Company Careers Bot is running! Visit http://localhost:8000/docs"}

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    chain = get_qa_chain()
    if chain is None:
        return ChatResponse(
            answer="Bot not ready. Please upload PDFs and run /admin/reindex first.",
            sources=[]
        )
    
    try:
        result = chain({"query": req.question})
        answer = result["result"]
        source_docs = result["source_documents"]
        
        sources = []
        for d in source_docs:
            meta = d.metadata
            sources.append(Source(
                source=meta.get("source", "unknown"),
                page=meta.get("page"),
                snippet=d.page_content[:300] + "..." if len(d.page_content) > 300 else d.page_content,
            ))
        
        return ChatResponse(answer=answer, sources=sources)
    except Exception as e:
        return ChatResponse(
            answer=f"Sorry, something went wrong: {str(e)}",
            sources=[]
        )

@app.post("/admin/upload", response_model=StatusResponse)
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(400, "Only PDF files allowed")
    
    filepath = os.path.join(DOCS_DIR, file.filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    return StatusResponse(
        status="success",
        message=f"Uploaded {file.filename}",
    )

@app.post("/admin/reindex", response_model=StatusResponse)
def reindex():
    global qa_chain
    qa_chain = None  # Reset chain
    
    chunk_count = ingest_all_pdfs()
    pdf_count = len([f for f in os.listdir(DOCS_DIR) if f.lower().endswith('.pdf')])
    
    return StatusResponse(
        status="success",
        message=f"Reindexed {chunk_count} chunks from {pdf_count} PDFs",
        chunk_count=chunk_count,
    )

@app.get("/admin/status")
def admin_status():
    pdf_count = len([f for f in os.listdir(DOCS_DIR) if f.lower().endswith('.pdf')])
    db_exists = os.path.exists(DB_DIR) and os.listdir(DB_DIR)
    
    return StatusResponse(
        status="ready" if db_exists else "needs_indexing",
        message=f"{pdf_count} PDFs | 🗄️ DB: {'ready' if db_exists else 'empty'}",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
