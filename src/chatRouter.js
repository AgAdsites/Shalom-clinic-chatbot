import express from 'express';
import GeminiProvider from './geminiProvider.js';
import RagService from './RAG.js';

const router = express.Router();
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const gemini = new GeminiProvider(
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_MODEL
    );

    const ragService = new RagService();

    // 1️⃣ Load FAQs
    const faqData = ragService.fetchDocumentData('data/KnowledgeFile.json');

    // 2️⃣ Embed user query
    const [queryVector] = await gemini.generateEmbeddings(
      message,
      "RETRIEVAL_QUERY"
    );

    // 3️⃣ Embed FAQ answers
    const faqEmbeddings = await gemini.generateEmbeddings(
      faqData.map(faq => faq.answer),
      "RETRIEVAL_DOCUMENT"
    );

    const faqVectors = faqData.map((faq, index) => ({
      faq,
      vector: faqEmbeddings[index]
    }));

    // 4️⃣ Get top similar FAQs
    const topFAQs = ragService.retrieveTopK(
      queryVector,
      faqVectors,
      2
    );

    // 5️⃣ Build final prompt
    const finalPrompt = ragService.preparePrompt(message, topFAQs);

    console.log("🧠 Final Prompt:\n", finalPrompt);

    const reply = await gemini.generateResponse(finalPrompt);

    return res.json({ reply });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to get response from Gemini'
    });
  }
});

export default router;
