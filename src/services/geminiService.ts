import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type ExamType = 'mcq' | 'essay';

export interface Question {
  id: string;
  text: string;
  type: ExamType;
  options?: string[];
  correctOptionIndex?: number;
  idealAnswer?: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
}

export const GeminiService = {
  async generateQuestionsFromText(text: string, type: ExamType = 'mcq'): Promise<Question[]> {
    try {
      const prompt = type === 'mcq' 
        ? `Generate 5 multiple choice questions based on the following text. Each question should have 4 options and one correct answer. Return ONLY a JSON array of objects with fields: id (string), text (string), options (string array), correctOptionIndex (number). Do not include any markdown formatting or extra text.`
        : `Generate 3 descriptive/essay questions based on the following text. These questions should require the student to explain, list, or write a paragraph. For each question, also provide an "idealAnswer" which is a rubric or a perfect example answer. Return ONLY a JSON array of objects with fields: id (string), text (string), idealAnswer (string). Do not include any markdown formatting or extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${prompt}\n\nText: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.NUMBER },
                idealAnswer: { type: Type.STRING }
              },
              required: ["id", "text"]
            }
          }
        }
      });

      const rawText = response.text || "[]";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(cleanJson);
      return questions.map((q: any) => ({ ...q, type }));
    } catch (error) {
      console.error("Generation Error (Text):", error);
      throw error;
    }
  },

  async generateQuestionsFromFile(base64Data: string, mimeType: string, type: ExamType = 'mcq'): Promise<Question[]> {
    try {
      const prompt = type === 'mcq'
        ? "Generate 5 multiple choice questions based on this document. Each question should have 4 options and one correct answer. Return ONLY a JSON array of objects with fields: id (string), text (string), options (string array), correctOptionIndex (number). Do not include any markdown formatting or extra text."
        : "Generate 3 descriptive/essay questions based on this document. These questions should require the student to explain, list, or write a paragraph. For each question, also provide an \"idealAnswer\" which is a rubric or a perfect example answer. Return ONLY a JSON array of objects with fields: id (string), text (string), idealAnswer (string). Do not include any markdown formatting or extra text.";

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.NUMBER },
                idealAnswer: { type: Type.STRING }
              },
              required: ["id", "text"]
            }
          }
        }
      });

      const rawText = response.text || "[]";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(cleanJson);
      return questions.map((q: any) => ({ ...q, type }));
    } catch (error) {
      console.error("Generation Error (File):", error);
      throw error;
    }
  },

  async generateQuestionsFromUrl(url: string, type: ExamType = 'mcq'): Promise<Question[]> {
    try {
      const prompt = type === 'mcq'
        ? `Generate 5 multiple choice questions based on the content of this URL: ${url}. Each question should have 4 options and one correct answer. Return ONLY a JSON array of objects with fields: id (string), text (string), options (string array), correctOptionIndex (number). Do not include any markdown formatting or extra text.`
        : `Generate 3 descriptive/essay questions based on the content of this URL: ${url}. These questions should require the student to explain, list, or write a paragraph. For each question, also provide an "idealAnswer" which is a rubric or a perfect example answer. Return ONLY a JSON array of objects with fields: id (string), text (string), idealAnswer (string). Do not include any markdown formatting or extra text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.NUMBER },
                idealAnswer: { type: Type.STRING }
              },
              required: ["id", "text"]
            }
          }
        }
      });

      const rawText = response.text || "[]";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(cleanJson);
      return questions.map((q: any) => ({ ...q, type }));
    } catch (error) {
      console.error("Generation Error (URL):", error);
      throw error;
    }
  },

  async evaluateEssayAnswer(question: string, idealAnswer: string, studentAnswer: string): Promise<EvaluationResult> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Evaluate the following student answer for an essay question.
        Question: ${question}
        Ideal Answer/Rubric: ${idealAnswer}
        Student Answer: ${studentAnswer}
        
        Provide a score from 0 to 10 and a brief feedback. Return ONLY a JSON object with fields: score (number), feedback (string).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              feedback: { type: Type.STRING }
            },
            required: ["score", "feedback"]
          }
        }
      });

      const rawText = response.text || "{\"score\": 0, \"feedback\": \"Error evaluating\"}";
      const cleanJson = rawText.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      console.error("Evaluation Error:", error);
      return { score: 0, feedback: "Failed to evaluate answer." };
    }
  },

  async analyzeProctoringFrame(base64Image: string): Promise<{ lookingAway: boolean; reason?: string }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: "Analyze this webcam frame from a student taking an exam. Determine if the student is looking away from the screen (left, right, up, or down) for an extended period, or if they are using a phone, reading from a book, talking/speaking (moving lips significantly), or if another person is visible. Be strict but fair. Respond with JSON: { \"lookingAway\": boolean, \"reason\": string }. If any violation is detected, set lookingAway to true and provide a short, clear reason."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lookingAway: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["lookingAway"]
        }
      }
    });

    return JSON.parse(response.text || "{\"lookingAway\": false}");
  }
};
