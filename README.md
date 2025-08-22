# AI Chatbot Backend - Node.js/Express/TypeScript

This is a complete migration of the Python Flask AI chatbot backend to Node.js with Express and TypeScript. The application provides conversational AI capabilities using Google's Gemini AI, text-to-speech synthesis, and Wikipedia integration.

## 🚀 Key Features

- **Conversational AI**: Powered by Google's Gemini AI model
- **Text-to-Speech**: Google Cloud TTS integration for voice responses
- **Wikipedia Integration**: Search and retrieve Wikipedia articles
- **Streaming Responses**: Real-time streaming chat responses
- **TypeScript**: Full type safety and modern development experience
- **Express.js**: Fast, unopinionated web framework
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Helmet.js for security headers and CORS configuration
- **Logging**: Morgan for HTTP request logging
- **File Management**: Automatic cleanup of temporary audio files

## 📋 Prerequisites

- Node.js 18+ (LTS recommended)
- Google Cloud Console account with Generative AI API enabled
- Google Cloud Text-to-Speech API credentials (optional, for TTS features)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-chatbot-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env .env.local
   ```

   Required environment variables:
   ```env
   # Google Generative AI API Key (Required)
   GOOGLE_API_KEY=your_google_api_key_here

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # CORS Settings
   CORS_ORIGIN=http://localhost:3000

   # Google Cloud TTS (Optional - for voice features)
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   ```

4. **Get your Google API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using `ts-node-dev`.

### Production Mode
```bash
# Build the TypeScript code
npm run build

# Start the production server
npm start
```

### Build Only
```bash
npm run build
```

## 📡 API Endpoints

### Chat Endpoints

#### POST /api/chat/chat
Standard chat conversation with AI.

**Request:**
```json
{
  "message": "Hello, how are you?",
  "conversation_history": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ],
  "include_tts": true,
  "voice_settings": {
    "language": "en-US",
    "voice": "en-US-Wavenet-D",
    "speed": 1.0
  }
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing well, thank you for asking...",
  "audio_url": "/audio/tts_1234567890.mp3",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### POST /api/chat/stream
Streaming chat responses for real-time conversation.

**Request:** Same as standard chat
**Response:** Server-Sent Events (SSE) stream

### Text-to-Speech Endpoints

#### POST /api/tts/synthesize
Convert text to speech.

**Request:**
```json
{
  "text": "Hello, this is a test message",
  "language": "en-US",
  "voice": "en-US-Wavenet-D",
  "speed": 1.0
}
```

#### GET /api/tts/voices
Get available TTS voices.

#### GET /api/tts/voices/:languageCode
Get voices for a specific language.

### Wikipedia Endpoints

#### POST /api/wiki/search
Search Wikipedia articles.

**Request:**
```json
{
  "query": "artificial intelligence",
  "limit": 10,
  "detailed": true
}
```

#### GET /api/wiki/page/:title/summary
Get article summary.

#### GET /api/wiki/page/:title/content
Get full article content.

#### GET /api/wiki/random
Get a random Wikipedia article.

### Health Check

#### GET /health
System health check endpoint.

## 🏗️ Project Structure

```
src/
├── config/
│   └── settings.ts          # Application configuration
├── middleware/
│   ├── errorHandler.ts      # Error handling middleware
│   └── validation.ts        # Request validation
├── routes/
│   ├── chat.ts              # Chat-related routes
│   ├── tts.ts               # Text-to-speech routes
│   └── wiki.ts              # Wikipedia routes
├── services/
│   ├── genai.ts             # Google Generative AI service
│   ├── tts.ts               # Text-to-speech service
│   └── wiki.ts              # Wikipedia service
├── types/
│   └── index.ts             # TypeScript type definitions
└── index.ts                 # Main application entry point
```

## 🔧 Key Migration Changes

### Python to Node.js Library Equivalents

| Python Library | Node.js Equivalent | Purpose |
|----------------|-------------------|---------|
| `flask` | `express` | Web framework |
| `google.generativeai` | `@google/generative-ai` | Google AI SDK |
| `gtts` | `@google-cloud/text-to-speech` | Text-to-speech |
| `wikipedia` | `wikipedia` | Wikipedia API |
| `python-dotenv` | `dotenv` | Environment variables |
| `requests` | `axios` (built into other libs) | HTTP requests |

### Architecture Improvements

1. **Type Safety**: Full TypeScript implementation with interfaces and type checking
2. **Modular Design**: Clean separation of concerns with services, routes, and middleware
3. **Error Handling**: Comprehensive error handling with custom error classes
4. **Security**: Helmet.js for security headers and proper CORS configuration
5. **Performance**: Compression middleware and optimized async operations
6. **Maintenance**: Automatic cleanup of temporary files

### API Compatibility

The API endpoints maintain similar functionality to the original Python version while providing:
- Better error responses with proper HTTP status codes
- Streaming support for real-time chat
- Enhanced validation and security
- Comprehensive logging and monitoring

## 🧪 Testing

The application includes built-in health checks:

```bash
curl http://localhost:3000/health
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=8080
GOOGLE_API_KEY=your_production_api_key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔍 Troubleshooting

### Common Issues

1. **Google API Key Issues**: Ensure your API key has access to the Generative AI API
2. **TTS Not Working**: Verify Google Cloud credentials and TTS API access
3. **Port Already in Use**: Change the PORT in your `.env` file
4. **CORS Issues**: Update CORS_ORIGIN to match your frontend URL

### Logs and Monitoring

The application includes comprehensive logging:
- HTTP requests via Morgan
- Error logging with stack traces
- Service health monitoring
- Automatic file cleanup logging

---

🎉 **Migration Complete!** Your Python Flask chatbot is now running on Node.js with Express and TypeScript, providing better performance, type safety, and scalability.