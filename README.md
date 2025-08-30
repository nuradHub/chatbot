# GPT4All Backend Setup

## Setup Instructions

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Download a GPT4All .gguf model and place it in:
   `backend/models/`

3. Build your React frontend and place the `dist` or `build` folder in the backend folder:
   `backend/dist/`

4. Start server:
   ```bash
   npm start
   ```

- API endpoint: `POST /chat` with JSON `{ "message": "Your message" }`
- Frontend served at root `/`

Note: Ensure your Node version supports ES modules (Node 14+).