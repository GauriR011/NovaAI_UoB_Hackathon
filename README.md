# 🚀 Nova.AI  
### AI-Powered Agentic Recruiting Assistant

Today, hiring is broken for both sides.

HR teams are overwhelmed by hundreds of resumes, while candidates struggle with long, repetitive, and time-consuming application forms.

The result?  
⏳ Wasted time  
🎯 Poor matches  
😓 A frustrating experience for everyone  

**Nova.AI** is built to fix that.



## 🌟 Overview

**Nova.AI** is an AI-powered agentic recruiting assistant designed to streamline hiring for both candidates and HR teams.  

It automates resume matching, candidate support, and early-stage screening — reducing manual effort while improving hiring quality.



# 🔑 Key Features

## 1️⃣ Resume Matching & Smart Shortlisting

Candidates can:
- Upload their existing resume  
**OR**
- Generate one with AI assistance  

Nova.AI automatically:
- Compares the resume against available job roles
- Calculates similarity scores
- Ranks roles from highest to lowest match

This allows candidates to:
- Apply to roles that best align with their background
- Improve their chances of shortlisting

For HR teams:
- A similarity threshold (e.g., **80% match**) can be set by admins
- Candidates above the threshold are automatically shortlisted
- Only qualified profiles move to the interview stage



## 2️⃣ AI Recruiting Assistant (RAG-Based)

Nova.AI serves as a conversational recruiting assistant.

Candidates can ask questions about:
- Company mission
- Culture and values
- Open roles
- Hiring process

The assistant uses **Retrieval-Augmented Generation (RAG)**, meaning:
- It responds only using verified company content
- It relies on approved internal documents
- It prevents hallucinated or incorrect answers

This ensures:
- Accurate responses
- Consistent information
- Enterprise-ready scalability



## 3️⃣ AI-Powered Early Stage Interview Screening

Shortlisted candidates are invited to take an AI-led interview.

Key Highlights:
- Candidates can take interviews anytime within a defined deadline
- Nova generates **role-specific questions**
- Candidates respond naturally (no rigid forms)

The AI evaluates:
- Quality and relevance of responses
- Communication clarity
- Confidence and emotional signals
- Sentiment and emotion patterns

Each candidate receives a **screening score**, and only the strongest profiles move forward to HR review.



# 🧠 How Nova.AI Improves Hiring

### For Candidates
- No more blind applications
- Clear job-role alignment
- Instant company information via chat
- Flexible interview scheduling

### For HR Teams
- Automated resume screening
- Reduced manual filtering
- Intelligent shortlisting
- Data-driven early-stage evaluation



# 🛠 Tech Highlights

- Large Language Models (LLMs)
- RAG (Retrieval-Augmented Generation)
- Semantic Similarity Matching
- Sentiment & Emotion Analysis
- Automated Scoring Pipelines
- Configurable HR Thresholds

---




# Tech stack, Project Structure and Environment Setup

We have created this platform tailored to Space42, a UAE-based, AI -powered SpaceTech company.

![Space42 Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)

## ✨ Features

- **Nova AI Chat** - Intelligent career assistant powered by Gemini-3-flash with RAG context
- **PDF Resume Upload** - Extract text from PDF resumes using pdf.js
- **AI Resume Matching** - Analyze resumes and match candidates to Space42 job openings
- **Real-time Profile Display** - Show candidate skills, experience, and job compatibility scores
- **Demo Mode** - Try the platform with sample data

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **AI**: OpenRouter API (google/gemini-3-flash-preview)
- **PDF Parsing**: pdfjs-dist

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for backend)
- OpenRouter API key (for AI features)

### 1. Clone and Install

```bash
git clone https://github.com/GauriR011/UoB_Hackathon.git
cd UoB_Hackathon
git checkout frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
VITE_PUBLIC_SUPABASE_URL="your-supabase-project-url"
VITE_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## ⚙️ Backend Setup (Supabase Edge Functions)

If you want to run your own backend, you need to deploy two Edge Functions to Supabase.

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key

### 2. Add OpenRouter API Key

1. Get an API key from https://openrouter.ai
2. In Supabase Dashboard → Edge Functions → Secrets
3. Add secret: `OPENROUTER_API_KEY` = your key

### 3. Deploy Edge Functions

#### Option A: Via Supabase Dashboard

1. Go to Edge Functions in Supabase Dashboard
2. Create function `nova-chat` → paste code from `supabase/functions/nova-chat/index.ts`
3. Create function `match-resume-` → paste code from `supabase/functions/match-resume/index.ts`

#### Option B: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy nova-chat
supabase functions deploy match-resume-
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── novaChat.ts      # Nova AI chat API
│   ├── resumeMatcher.ts # Resume matching API
│   └── pdfParser.ts     # PDF text extraction
├── pages/
│   ├── home/            # Landing page
│   ├── briefing/        # CV upload flow
│   ├── browse/          # Job listings + matching
│   ├── chat/            # Nova AI chat
│   └── ...
└── mocks/
    └── sampleCV.ts      # Demo data

supabase/functions/
├── nova-chat/           # AI chat endpoint
└── match-resume/        # Resume analysis endpoint
```

## 🔌 API Reference

See [API.md](./API.md) for detailed API documentation.

### Quick Overview

| Endpoint | Description |
|----------|-------------|
| `nova-chat` | AI career assistant chat |
| `match-resume-` | Resume analysis & job matching |

## 🎮 Demo Mode

Don't want to upload your real CV? Click "Try Demo" on the briefing page to see the platform in action with sample data (Alex Chen's profile).

## 📝 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run type-check # TypeScript check
```

## 🤝 Team

Built for UoB Hackathon 2026 by:
- Frontend: Claire & Claude & Gemini
- Backend: Gauri
- Agentic Workflow: Roman

## 📄 License

MIT
