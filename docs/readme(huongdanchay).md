cd "d:\DO AN TRUONG HOC THONG MINH\quan-ly-va-ho-tro-hoc-tap-hung-nhan"

Cài các package cần thiết
npm install

Nếu bị báo lỗi thiếu type React/React DOM, tiếp theo chạy:
npm install --save-dev @types/react @types/react-dom

Tạo file môi trường
Copy-Item .env.example .env.local

Sau đó mở file .env.local và sửa lại:
GEMINI_API_KEY="your_gemini_api_key"
APP_URL="http://localhost:3000"


npm run dev