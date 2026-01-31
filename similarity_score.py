import numpy as np
import json
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from dotenv import load_dotenv
import re
import os


# Connecting to API
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    raise ValueError("GOOGLE_API_KEY missing")

llm = ChatGoogleGenerativeAI(
    model="gemini-flash-latest",
    temperature=0,
    api_key=api_key
)

emb = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    api_key=api_key
)

# print(llm.invoke("Say OK"))  # checking if we are connected to the API

# -------------------------------------------------------------------------------
# FUNCTIONS

# Similarity Score
def cosine_sim(a, b):
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def compute_similarity(resume_text: str, jd_text: str) -> int:
    e_resume = np.array(emb.embed_query(resume_text))
    e_jd = np.array(emb.embed_query(jd_text))
    sim = cosine_sim(e_resume, e_jd)
    score = round((sim + 1) / 2 * 100)
    return max(0, min(100, score))


# Extract top 10 JD skills (via LLM)
class SkillsOutput(BaseModel):
    skills: list[str]

skills_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "You are an expert recruiter. Extract at most 10 distinct, atomic skills "
     "from the job description (e.g., 'Python', 'React', 'AWS'). "
     "Only include concrete skills, no soft traits or responsibilities."
     "Return JSON output: {{\"skills\": [\"skill1\", ...]}}"),
    ("user", "{jd_text}")
])

def extract_jd_skills(jd_text: str) -> list[str]:
    chain = skills_prompt | llm.with_structured_output(SkillsOutput)
    result: SkillsOutput = chain.invoke({"jd_text": jd_text})
    return result.skills


# Match skills against resume
def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9+#]", " ", text.lower())

def _skill_present(skill: str, resume_norm: str) -> bool:
    pattern = r"\b" + re.escape(skill.lower()) + r"\b"
    return re.search(pattern, resume_norm) is not None

def match_skills(resume_text: str, skills: list[str]):
    resume_norm = _normalize(resume_text)
    in_resume = []
    missing = []
    for s in skills:
        if _skill_present(s, resume_norm):
            in_resume.append(s)
        else:
            missing.append(s)
    return in_resume, missing


# ----------------------------------------------------------------
# TOOLS

# Wrapping these functions as LangChain TOOLS
from typing import Tuple

@tool
def compute_similarity_tool(resume_text: str, jd_text: str) -> int:
    """Compute a 0–100 similarity score between a resume and job description."""
    return compute_similarity(resume_text, jd_text)

@tool
def extract_jd_skills_tool(jd_text: str) -> list[str]:
    """Extract at most 10 key skills from a job description."""
    return extract_jd_skills(jd_text)

class MatchSkillsResult(BaseModel):
    skills_in_resume: list[str]
    skills_missing: list[str]

@tool
def match_skills_tool(resume_text: str, skills: list[str]) -> MatchSkillsResult:
    """
    Given resume text and a list of skills (from the JD),
    return which are present in the resume and which are missing.
    """
    in_resume, missing = match_skills(resume_text, skills)
    return MatchSkillsResult(skills_in_resume=in_resume, skills_missing=missing)

# -------------------------------------------------------------------------------

# SIMILARITY SCORE FUNCTION 
# Use this function to generate the scores and skills
def analyze_resume(resume_text: str, jd_text: str):
    score = compute_similarity(resume_text, jd_text)
    jd_skills = extract_jd_skills(jd_text)
    in_resume, missing = match_skills(resume_text, jd_skills)
    return {
        "similarity_score": score,
        "top_skills": jd_skills,
        "skills_in_resume": in_resume,
        "skills_missing": missing,
    }

