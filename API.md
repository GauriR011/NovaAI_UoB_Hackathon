# Space42 API Documentation

This document describes the Supabase Edge Functions that power the Space42 AI Career Platform.

## Base URL

```
https://<your-project-ref>.supabase.co/functions/v1/
```

## Authentication

All requests require the Supabase anon key in the Authorization header:

```
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

---

## 1. Nova Chat API

AI-powered career assistant with RAG context about Space42.

### Endpoint

```
POST /nova-chat
```

### Request Body

```json
{
  "message": "What benefits does Space42 offer?",
  "conversationHistory": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's message (max 2000 chars) |
| `conversationHistory` | array | No | Previous conversation for context |

### Response

```json
{
  "response": "At Space42, we offer comprehensive benefits including...",
  "debug": {
    "chunksUsed": 3,
    "model": "gpt-4o-mini"
  }
}
```

### Error Response

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

### Example (cURL)

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/nova-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "message": "Tell me about Space42"
  }'
```

---

## 2. Match Resume API

Analyze resume text and match against Space42 job openings.

### Endpoint

```
POST /match-resume-
```

> Note: The function name ends with a hyphen (`match-resume-`)

### Request Body

```json
{
  "resumeText": "John Smith is a Senior Software Engineer with 5 years of experience..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resumeText` | string | Yes | Extracted text from resume (min 50 chars) |

### Response

```json
{
  "name": "John Smith",
  "title": "Senior Software Engineer",
  "experience": 5,
  "overallMatch": 73,
  "keySkills": [
    "Python",
    "JavaScript",
    "React",
    "Machine Learning"
  ],
  "topMatches": [
    {
      "id": "job-5",
      "title": "Data Scientist - Space Analytics",
      "category": "Data & AI",
      "location": "Abu Dhabi, UAE",
      "matchScore": 85,
      "matchedSkills": ["Python", "Machine Learning", "Data Analysis"]
    },
    {
      "id": "job-6",
      "title": "Software Engineer - Flight Systems",
      "category": "Engineering",
      "location": "Abu Dhabi, UAE",
      "matchScore": 70,
      "matchedSkills": ["Python", "Git"]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Extracted candidate name |
| `title` | string | Current/most recent job title |
| `experience` | number | Years of experience |
| `overallMatch` | number | Average match score (0-100) |
| `keySkills` | string[] | Top 6-8 skills from resume |
| `topMatches` | array | Top 5 matching jobs, sorted by score |

### Job Match Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Job ID (e.g., "job-1") |
| `title` | string | Job title |
| `category` | string | Job category |
| `location` | string | Job location |
| `matchScore` | number | Compatibility score (0-100) |
| `matchedSkills` | string[] | Skills that matched this job |

### Example (cURL)

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/match-resume-" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -d '{
    "resumeText": "John Smith is a Senior Software Engineer with 5 years of professional experience specializing in Python, JavaScript, React, and Node.js development. Previously worked at Google and Microsoft."
  }'
```

---

## Available Jobs

The resume matcher compares against these Space42 positions:

| ID | Title | Category |
|----|-------|----------|
| job-1 | Manager - Spacecraft Analysis | Spacecraft Operations |
| job-2 | Senior Satellite Systems Engineer | Spacecraft Operations |
| job-3 | Mission Operations Specialist | Mission Control |
| job-4 | Ground Systems Engineer | Ground Segment |
| job-5 | Data Scientist - Space Analytics | Data & AI |
| job-6 | Software Engineer - Flight Systems | Engineering |
| job-7 | RF Engineer | Ground Segment |
| job-8 | Project Manager - Space Programs | Management |

---

## Match Score Criteria

| Score | Meaning |
|-------|---------|
| 80-100 | Strong match - most required skills present |
| 60-79 | Good match - some skills, transferable experience |
| 40-59 | Partial match - few matching skills |
| 0-39 | Weak match - different background |

---

## Error Codes

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Invalid JSON | Request body is not valid JSON |
| 400 | Resume text required | Missing or too short resume text |
| 500 | Server configuration error | Missing API keys on server |
| 502 | AI service error | OpenRouter API failed |

---

## Rate Limits

- OpenRouter API has its own rate limits based on your plan
- Supabase Edge Functions: depends on your Supabase plan

---

## Setting Up Your Own Backend

### Required Environment Variables

Set these as Secrets in Supabase Edge Functions:

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `OPENROUTER_API_KEY` | OpenRouter API key | https://openrouter.ai/keys |

### Deploying Functions

1. Copy the code from `supabase/functions/nova-chat/index.ts`
2. Create a new Edge Function named `nova-chat` in Supabase Dashboard
3. Paste the code and deploy
4. Repeat for `match-resume-` function

### Testing Your Deployment

```bash
# Test nova-chat
curl -X POST "https://YOUR-PROJECT.supabase.co/functions/v1/nova-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"message": "Hello"}'

# Test match-resume-
curl -X POST "https://YOUR-PROJECT.supabase.co/functions/v1/match-resume-" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"resumeText": "Test resume with Python and JavaScript skills, 5 years experience at Google."}'
```

---

## Frontend Integration

### TypeScript Interfaces

```typescript
// Resume Match Result
interface MatchResult {
  name: string;
  title: string;
  experience: number;
  overallMatch: number;
  keySkills: string[];
  topMatches: Array<{
    id: string;
    title: string;
    category: string;
    location: string;
    matchScore: number;
    matchedSkills: string[];
  }>;
}

// Nova Chat Response
interface NovaResponse {
  response: string;
  debug?: {
    chunksUsed: number;
    model: string;
  };
  error?: string;
}
```

### Using with Supabase JS Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_PUBLIC_SUPABASE_URL,
  process.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

// Call Nova Chat
const { data, error } = await supabase.functions.invoke('nova-chat', {
  body: { message: 'Hello Nova!' }
});

// Call Resume Matcher
const { data, error } = await supabase.functions.invoke('match-resume-', {
  body: { resumeText: 'Your resume text here...' }
});
```
