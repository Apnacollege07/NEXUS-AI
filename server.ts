import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is missing. AI routes will run in offline simulation mode.");
}

// Resilient wrapper to retry on transient 503/429/overloaded errors
async function generateWithRetry(params: any, retries = 2, delayMs = 1000): Promise<any> {
  if (!ai) throw new Error("GoogleGenAI client is not initialized.");
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    const status = err.status || (err.error && err.error.code);
    const msg = err.message || "";
    const isTransient = status === 503 || status === 429 || 
      msg.includes("503") || msg.includes("429") || 
      msg.includes("UNAVAILABLE") || msg.includes("overloaded") || 
      msg.includes("high demand") || msg.includes("temporary");
    
    if (isTransient && retries > 0) {
      console.warn(`Transient Gemini error: "${msg}". Retrying in ${delayMs}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return generateWithRetry(params, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

// 1. Syllabus-to-Quest Engine
app.post("/api/syllabus-to-quests", async (req, res) => {
  const { text, subject } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: "Syllabus or course text is required." });
  }

  const prompt = `You are a study planning expert. Parse the following syllabus / study text into a list of 4 to 6 adaptive "Micro-Quests" (small, actionable study tasks). 
Subject of interest: ${subject || "General Study"}.
For each micro-quest, specify:
1. "title": A clear, action-oriented study goal (e.g. "Master Chapter 2: Electrostatics Basics").
2. "description": A short, motivational description of what to review.
3. "duration": Recommended study duration in minutes (between 15 and 60 minutes).
4. "xp": XP rewards based on duration (10 XP per 10 minutes, plus bonuses for difficulty).
5. "priority": 'high' | 'medium' | 'low'.

Return the response STRICTLY as a JSON object of this structure:
{
  "quests": [
    { "title": "...", "description": "...", "duration": 25, "xp": 50, "priority": "high" }
  ]
}

Syllabus Text:
"${text}"`;

  if (!ai) {
    // Offline simulation mode fallback
    const simulatedQuests = [
      { title: `Review ${subject || "Module"} Fundamentals`, description: "Go over core notes and definitions from the uploaded content.", duration: 25, xp: 30, priority: "high" },
      { title: `Summarize Key Theories in ${subject || "Topic"}`, description: "Write down a brief mindmap or outline of major concepts.", duration: 40, xp: 50, priority: "high" },
      { title: `Create Flashcards for ${subject || "Exam"}`, description: "Build quick self-test prompts for critical definitions.", duration: 20, xp: 20, priority: "medium" },
      { title: `Timed Deep-Focus Practice`, description: "Complete a Pomodoro session focusing strictly on difficult exercises.", duration: 30, xp: 40, priority: "medium" }
    ];
    return res.json({ quests: simulatedQuests, simulated: true });
  }

  try {
    const response = await generateWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  xp: { type: Type.INTEGER },
                  priority: { type: Type.STRING }
                },
                required: ["title", "description", "duration", "xp", "priority"]
              }
            }
          },
          required: ["quests"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (err: any) {
    console.warn("Gemini Error (Service overloaded/unavailable), falling back to simulation mode:", err.message);
    const simulatedQuests = [
      { title: `Review ${subject || "Module"} Fundamentals`, description: "Go over core notes and definitions from the uploaded content.", duration: 25, xp: 30, priority: "high" },
      { title: `Summarize Key Theories in ${subject || "Topic"}`, description: "Write down a brief mindmap or outline of major concepts.", duration: 40, xp: 50, priority: "high" },
      { title: `Create Flashcards for ${subject || "Exam"}`, description: "Build quick self-test prompts for critical definitions.", duration: 20, xp: 20, priority: "medium" },
      { title: `Timed Deep-Focus Practice`, description: "Complete a Pomodoro session focusing strictly on difficult exercises.", duration: 30, xp: 40, priority: "medium" }
    ];
    res.json({ quests: simulatedQuests, simulated: true, error: err.message });
  }
});

// 2. Smart Task Recommendations
app.post("/api/recommend-tasks", async (req, res) => {
  const { currentTasks, persona, subject } = req.body;

  const prompt = `You are an executive productivity co-pilot for a ${persona || "Student"}.
Based on their focus area: "${subject || "General Development"}" and their current pending task list:
${JSON.stringify(currentTasks || [])}

Recommend 3 highly relevant, high-impact study or work task recommendations to tackle next. Ensure they address overwhelm, isolation, or context-switching (classic frustrations of this persona).

For each recommendation, provide:
1. "title": Concrete task name.
2. "category": 'Study' | 'Review' | 'Deep Work' | 'Declutter' | 'Collaborate'.
3. "difficulty": 'Easy' | 'Medium' | 'Hard'.
4. "reason": Why this is critical right now, tailored to a ${persona}.

Return the response STRICTLY as a JSON object of this structure:
{
  "recommendations": [
    { "title": "...", "category": "...", "difficulty": "...", "reason": "..." }
  ]
}
`;

  if (!ai) {
    const defaultRecs = [
      { title: `Block "Deep Work" for ${subject || "Core Study"}`, category: "Deep Work", difficulty: "Medium", reason: `Shields your schedule from distraction to help you master ${subject || "your topic"} efficiently.` },
      { title: `Rapid Flashcard Recall session`, category: "Review", difficulty: "Easy", reason: "Quick cognitive load booster that solidifies concepts without fatigue." },
      { title: `Study Duel Challenge: Pomodoro Sprint`, category: "Collaborate", difficulty: "Hard", reason: "Compete with friends in your Guild to stay motivated and eliminate isolation panic." }
    ];
    return res.json({ recommendations: defaultRecs, simulated: true });
  }

  try {
    const response = await generateWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["title", "category", "difficulty", "reason"]
              }
            }
          },
          required: ["recommendations"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);
  } catch (err: any) {
    console.warn("Gemini Error (Service overloaded/unavailable), falling back to simulation mode:", err.message);
    const defaultRecs = [
      { title: `Block "Deep Work" for ${subject || "Core Study"}`, category: "Deep Work", difficulty: "Medium", reason: `Shields your schedule from distraction to help you master ${subject || "your topic"} efficiently.` },
      { title: `Rapid Flashcard Recall session`, category: "Review", difficulty: "Easy", reason: "Quick cognitive load booster that solidifies concepts without fatigue." },
      { title: `Study Duel Challenge: Pomodoro Sprint`, category: "Collaborate", difficulty: "Hard", reason: "Compete with friends in your Guild to stay motivated and eliminate isolation panic." }
    ];
    res.json({ recommendations: defaultRecs, simulated: true, error: err.message });
  }
});

// 3. AI Notepad Helper (Summarize, Quiz, Key Concepts)
app.post("/api/ai-notes", async (req, res) => {
  const { noteText, action } = req.body;
  if (!noteText || noteText.trim().length === 0) {
    return res.status(400).json({ error: "Note content is required." });
  }

  let prompt = "";
  if (action === "summarize") {
    prompt = `Summarize the following study notes into structured bullet points with key headings, action steps, and an encouraging closing sentence.\n\nNotes:\n"${noteText}"`;
  } else if (action === "key-concepts") {
    prompt = `Extract the 3 to 5 key academic theories or practical concepts from the notes below, explaining each in 1-2 clear sentences.\n\nNotes:\n"${noteText}"`;
  } else if (action === "quiz") {
    prompt = `Based on these study notes, create 3 to 5 study Flashcards (questions and answers) for active recall.
Return STRICTLY as a JSON object with this structure:
{
  "flashcards": [
    { "front": "Question...", "back": "Answer..." }
  ]
}

Notes:
"${noteText}"`;
  }

  if (!ai) {
    // Simulated offline fallback
    if (action === "summarize") {
      return res.json({ result: `**Simulated Note Summary**\n- Highlights critical points from your text.\n- Retains core topics related to your studies.\n- *Tip:* Connect a real Gemini API Key to experience full context-aware summaries!` });
    } else if (action === "key-concepts") {
      return res.json({ result: `**Simulated Key Concepts**\n1. **Active Recall**: Interrogating your brain instead of passively re-reading.\n2. **Time Boxing**: Aligning deep-work focus directly into distraction-free blocks.` });
    } else {
      return res.json({
        flashcards: [
          { front: "What is active recall?", back: "Testing your memory by retrieving information rather than passively reviewing notes." },
          { front: "How long is a standard Pomodoro sprint?", back: "25 minutes of high-intensity focus followed by a 5-minute break." }
        ],
        simulated: true
      });
    }
  }

  try {
    if (action === "quiz") {
      const response = await generateWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["flashcards"]
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } else {
      const response = await generateWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      res.json({ result: response.text });
    }
  } catch (err: any) {
    console.warn("Gemini Error (Service overloaded/unavailable) in ai-notes, falling back to simulation mode:", err.message);
    if (action === "summarize") {
      res.json({ result: `**Simulated Note Summary**\n- Highlights critical points from your text.\n- Retains core topics related to your studies.\n- *Tip:* Connect a real Gemini API Key to experience full context-aware summaries!`, simulated: true, error: err.message });
    } else if (action === "key-concepts") {
      res.json({ result: `**Simulated Key Concepts**\n1. **Active Recall**: Interrogating your brain instead of passively re-reading.\n2. **Time Boxing**: Aligning deep-work focus directly into distraction-free blocks.`, simulated: true, error: err.message });
    } else {
      res.json({
        flashcards: [
          { front: "What is active recall?", back: "Testing your memory by retrieving information rather than passively reviewing notes." },
          { front: "How long is a standard Pomodoro sprint?", back: "25 minutes of high-intensity focus followed by a 5-minute break." }
        ],
        simulated: true,
        error: err.message
      });
    }
  }
});

// 4. Generate Flashcards directly from topic
app.post("/api/ai-flashcards", async (req, res) => {
  const { topic } = req.body;
  if (!topic || topic.trim().length === 0) {
    return res.status(400).json({ error: "Topic is required." });
  }

  const prompt = `Generate a set of 4-5 study flashcards (Question on "front", Answer on "back") for the topic: "${topic}". 
Make the questions challenging and direct to facilitate deep learning.

Return STRICTLY as a JSON object with this structure:
{
  "flashcards": [
    { "front": "Question...", "back": "Answer..." }
  ]
}
`;

  if (!ai) {
    const fallbackFlashcards = [
      { front: `What is the primary definition of ${topic}?`, back: `The core theory and systems underlying ${topic}.` },
      { front: `Name a common real-world application of ${topic}.`, back: `Standard optimization or problem-solving implementations.` },
      { front: `What is a common misconception about ${topic}?`, back: `That it's easy to memorize without active, spaced testing.` }
    ];
    return res.json({ flashcards: fallbackFlashcards, simulated: true });
  }

  try {
    const response = await generateWithRetry({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["flashcards"]
        }
      }
    });
    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.warn("Gemini Error (Service overloaded/unavailable) in ai-flashcards, falling back to simulation mode:", err.message);
    const fallbackFlashcards = [
      { front: `What is the primary definition of ${topic}?`, back: `The core theory and systems underlying ${topic}.` },
      { front: `Name a common real-world application of ${topic}.`, back: `Standard optimization or problem-solving implementations.` },
      { front: `What is a common misconception about ${topic}?`, back: `That it's easy to memorize without active, spaced testing.` }
    ];
    res.json({ flashcards: fallbackFlashcards, simulated: true, error: err.message });
  }
});

// Vite Middleware & Static Asset Serving Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
