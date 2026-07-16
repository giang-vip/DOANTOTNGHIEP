cd "d:\DO AN TRUONG HOC THONG MINH\quan-ly-va-ho-tro-hoc-tap-hung-nhan"

Cài các package cần thiết
npm install

Tạo file môi trường
Copy-Item .env.example .env.local

Sau đó mở file .env.local và sửa lại:
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"


npm run dev