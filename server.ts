import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for AI Study Buddy
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, history, subjectName } = req.body;

    if (!prompt) {
       res.status(400).json({ error: 'Nội dung câu hỏi không được trống.' });
       return;
    }

    const systemInstruction = `Bạn là "Hưng Nhân AI Study Buddy" - Trợ lý học tập thông minh tại Đại học Hưng Nhân.
Nhiệm vụ của bạn là hỗ trợ sinh viên học tập tốt môn học: "${subjectName || 'Công nghệ thông tin'}".
Hãy trả lời câu hỏi bằng tiếng Việt một cách khoa học, tận tâm, dễ hiểu và súc tích.
Nếu học viên hỏi về lý thuyết, hãy giải thích cặn kẽ và cho ví dụ minh họa thực tế.
Tuyệt đối không giải hộ toàn bộ bài tập lớn hoặc đề thi gốc, hãy đóng vai trò định hướng giải quyết vấn đề từng bước.`;

    // 1. Cố gắng gọi Ollama Local Llama trước
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout for fast fallback
      
      const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // Mặc định là mô hình Llama3
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          stream: false
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (ollamaResponse.ok) {
        const ollamaData: any = await ollamaResponse.json();
        const aiText = ollamaData?.message?.content || ollamaData?.response;
        if (aiText) {
          console.log("[Hưng Nhân Local AI] Phản hồi thành công từ mô hình Llama cục bộ.");
          res.json({ text: aiText });
          return;
        }
      }
    } catch (ollamaErr) {
      console.warn("[Hưng Nhân Local AI] Ollama local offline hoặc lỗi. Đang chuyển hướng sang Gemini...");
    }

    // 2. Fallback sang Google Gemini nếu local Ollama không hoạt động
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
       res.status(200).json({
        text: '⚠️ **Thông báo hệ thống:** Cả mô hình local Llama (qua Ollama) và khóa API Gemini đều chưa được cấu hình. Vui lòng chạy Ollama (lệnh `ollama run llama3`) hoặc cấu hình `GEMINI_API_KEY` trong file `.env.local` để trải nghiệm.'
      });
      return;
    }

    // Lazy initialization of GoogleGenAI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Call generateContent
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${systemInstruction}\n\nCâu hỏi học tập của sinh viên: ${prompt}` }] }
      ],
    });

    res.json({ text: response.text || 'Trợ lý AI đang bận, vui lòng thử lại sau.' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý AI Study Buddy.' });
  }
});

// Serve health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', fullstack: true });
});

async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Hưng Nhân Smart Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Hưng Nhân Smart Server] Running on http://localhost:${PORT}`);
  });
}

bootstrap();
