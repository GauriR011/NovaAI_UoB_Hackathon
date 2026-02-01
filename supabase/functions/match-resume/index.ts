const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SPACE42_JOBS = [
  {
    id: "job-1",
    title: "Manager - Spacecraft Analysis",
    category: "Spacecraft Operations",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Spacecraft Operations", "Payload Operations", "Anomaly Management", "Technical Leadership", "Link Budget Analysis", "Fleet Management"],
    description: "Technical lead responsible for the health and performance of the Company Spacecraft fleet with Payload focus. Provide assurance for efficient and continuous 24x7 spacecraft fleet operations."
  },
  {
    id: "job-2",
    title: "Senior Satellite Systems Engineer",
    category: "Spacecraft Operations",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Satellite Systems", "Systems Engineering", "Python", "Data Analysis", "RF Engineering", "MATLAB"],
    description: "Design and optimize satellite communication systems. Work on next-generation spacecraft platforms and ground segment integration."
  },
  {
    id: "job-3",
    title: "Mission Operations Specialist",
    category: "Mission Control",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Mission Control", "Spacecraft Operations", "Ground Station Operations", "Anomaly Management", "Telemetry"],
    description: "Support 24/7 mission operations for Earth observation satellite constellation. Monitor spacecraft health and execute commanding sequences."
  },
  {
    id: "job-4",
    title: "Ground Systems Engineer",
    category: "Ground Segment",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Ground Station Operations", "RF Engineering", "Systems Engineering", "Python", "Linux"],
    description: "Maintain and upgrade ground station infrastructure. Ensure reliable communication links with spacecraft fleet."
  },
  {
    id: "job-5",
    title: "Data Scientist - Space Analytics",
    category: "Data & AI",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Python", "Machine Learning", "Data Analysis", "TensorFlow", "SQL"],
    description: "Apply machine learning to satellite imagery and telemetry data. Develop predictive models for spacecraft health monitoring."
  },
  {
    id: "job-6",
    title: "Software Engineer - Flight Systems",
    category: "Engineering",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Python", "C++", "Software Engineering", "Git", "Linux", "Testing"],
    description: "Develop and maintain flight software systems for satellite operations. Work on mission-critical applications."
  },
  {
    id: "job-7",
    title: "RF Engineer",
    category: "Ground Segment",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["RF Engineering", "Signal Processing", "Antenna Systems", "Link Budget Analysis", "MATLAB"],
    description: "Design and optimize RF communication systems for satellite ground stations."
  },
  {
    id: "job-8",
    title: "Project Manager - Space Programs",
    category: "Management",
    location: "Abu Dhabi, UAE",
    requiredSkills: ["Project Management", "Agile", "Stakeholder Management", "Risk Management", "Budget Management"],
    description: "Lead cross-functional teams in delivering space technology projects on time and within budget."
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!openRouterKey) {
      console.error('Missing OPENROUTER_API_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Resume text is required (min 50 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing resume, length:', resumeText.length);

    const jobListForPrompt = SPACE42_JOBS.map(j => 
      `- ID: ${j.id}, Title: "${j.title}", Skills: [${j.requiredSkills.join(', ')}]`
    ).join('\n');

    const prompt = `Analyze this resume and match it against Space42 job openings.

RESUME TEXT:
${resumeText.substring(0, 3000)}

AVAILABLE JOBS AT SPACE42:
${jobListForPrompt}

Return a JSON object with this EXACT structure (no markdown, just pure JSON):
{
  "name": "extracted candidate name or 'Candidate'",
  "title": "their current/most recent job title",
  "experience": number of years of experience (integer),
  "keySkills": ["skill1", "skill2", ...] (top 6-8 skills from resume),
  "jobMatches": [
    {"jobId": "job-X", "score": 0-100, "matchedSkills": ["skill1", "skill2"]},
    ...
  ] (rank ALL jobs by match score, highest first)
}

Score criteria:
- 80-100: Strong match (most required skills present, relevant experience)
- 60-79: Good match (some skills match, transferable experience)
- 40-59: Partial match (few skills, different background)
- 0-39: Weak match

Be generous but realistic. Most candidates should have at least one job scoring 60+.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://space42.ai',
        'X-Title': 'Space42 Resume Matcher'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a resume analyzer. Return only valid JSON, no markdown code blocks.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let aiContent = data.choices?.[0]?.message?.content || '';
    
    aiContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('AI response:', aiContent.substring(0, 200));

    let analysis;
    try {
      analysis = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', aiContent);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const topMatches = (analysis.jobMatches || [])
      .slice(0, 5)
      .map((match: { jobId: string; score: number; matchedSkills: string[] }) => {
        const job = SPACE42_JOBS.find(j => j.id === match.jobId);
        return {
          id: match.jobId,
          title: job?.title || 'Unknown Position',
          category: job?.category || 'General',
          location: job?.location || 'Abu Dhabi, UAE',
          matchScore: Math.min(100, Math.max(0, match.score)),
          matchedSkills: match.matchedSkills || []
        };
      });

    const overallMatch = topMatches.length > 0
      ? Math.round(topMatches.slice(0, 3).reduce((sum: number, m: { matchScore: number }) => sum + m.matchScore, 0) / Math.min(3, topMatches.length))
      : 50;

    const result = {
      name: analysis.name || 'Candidate',
      title: analysis.title || 'Professional',
      experience: analysis.experience || 0,
      overallMatch: overallMatch,
      keySkills: (analysis.keySkills || []).slice(0, 8),
      topMatches: topMatches
    };

    console.log('Match result:', { name: result.name, overallMatch: result.overallMatch, topMatch: topMatches[0]?.title });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
