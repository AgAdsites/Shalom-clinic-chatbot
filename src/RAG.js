import fs from "fs";

export default class RagService {

  fetchDocumentData(fileName) {
    return JSON.parse(fs.readFileSync(fileName, "utf-8"));
  }

  cosineSimilarity(vecA, vecB) {
    const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);

    const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));

    return dot / (magnitudeA * magnitudeB);
  }

  retrieveTopK(queryVector, faqVectors, k = 3) {
    const scored = faqVectors.map(item => ({
      faq: item.faq,
      score: this.cosineSimilarity(queryVector, item.vector)
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.faq);
  }

preparePrompt(userMessage, topFAQs) {
  let context = "";

  if (topFAQs.length > 0) {
    context = topFAQs
      .map(faq => `Q: ${faq.question}\nA: ${faq.answer}`)
      .join("\n\n");
  }

  return `
You are a helpful AI assistant.

If the FAQ context below is relevant to the user's question, use it to answer accurately.
If the context is not relevant or empty, answer the question using your general knowledge.

FAQ Context:
${context || "No relevant FAQ available."}

User Question:
${userMessage}

Provide a clear and helpful response.
`;
}

}
