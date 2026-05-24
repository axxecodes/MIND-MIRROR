import { Router } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const apiRouter = Router();

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cognitive reframing prompt endpoint
apiRouter.post('/reframe', async (req, res) => {
  const { thought } = req.body;
  if (!thought || typeof thought !== 'string' || thought.trim().length === 0) {
    return res.status(400).json({ error: 'A thought is required to reframe.' });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: 'Gemini API key is not configured in Secrets. Please add GEMINI_API_KEY in Netlify settings.'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are a warm, wise, compassionate CBT (Cognitive Behavioral Therapy) expert. Analyze the following negative or stressful automatic thought and provide structural guidance.

Thought: "${thought}"

Your goals are:
1. Identify up to 3 cognitive distortions present in the thought (e.g., Catastrophizing, All-or-Nothing Thinking, Mind-Reading, Emotional Reasoning, Overgeneralization, "Should" Statements, Fortune-Telling, Personalization, Discounting the Positive).
2. For each distortion, provide a concise explanation of why it applies here.
3. Formulate 3 distinct alternative, realistic, and self-compassionate reframed perspectives that are grounded, believable, and helpful.

Respond with valid JSON according to this structure:
{
  "distortions": [
    {
      "name": "Name of Distortion",
      "explanation": "Brief explanation of how this plays out in the thought."
    }
  ],
  "reframings": [
    {
      "type": "Balanced Choice | Self-Compassionate Check | Compassionate Action-Oriented",
      "text": "The reframed thought text. Believable, warm, and highly practical."
    }
  ],
  "originalThought": "The original thought analyzed"
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ["distortions", "reframings", "originalThought"],
          properties: {
            originalThought: { type: Type.STRING },
            distortions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "explanation"],
                properties: {
                  name: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                }
              }
            },
            reframings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "text"],
                properties: {
                  type: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error('No content returned from Gemini API.');
    }

    const parsed = JSON.parse(textOutput.trim());
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error reframing thought:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during reframing.' });
  }
});

export default apiRouter;
