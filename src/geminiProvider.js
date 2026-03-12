import { GoogleGenAI } from "@google/genai";

export default class GeminiProvider {
  constructor(apiKey, modelName) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is required");
    if (!modelName) throw new Error("GEMINI_MODEL is required");

    this.client = new GoogleGenAI({ apiKey });
    this.model = modelName;
  }

  async generateResponse(prompt) {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      });

      return response.text;
    } catch (err) {
      console.error("Gemini error:", err);
      throw err;
    }
  }

  async generateEmbeddings(texts, taskType = "RETRIEVAL_DOCUMENT") {
    if (!Array.isArray(texts)) texts = [texts];

    const response = await this.client.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts.map(text => ({
        role: "user",
        parts: [{ text }]
      })),
      taskType
    });

    return response.embeddings.map(e => e.values);
  }
}
