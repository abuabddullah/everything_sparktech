import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import config from '../config/settings';
import { ChatMessage, ChatRequest, ChatResponse } from '../types';

class GenerativeAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.googleApiKey);
    this.initializeModel();
  }

  private initializeModel(): void {
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    this.model = this.genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings,
      generationConfig,
    });
  }

  async generateResponse(request: ChatRequest): Promise<ChatResponse> {
    try {
      let prompt = request.message;

      // If conversation history exists, format it for context
      if (request.conversation_history && request.conversation_history.length > 0) {
        const historyContext = request.conversation_history
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
        
        prompt = `Previous conversation:\n${historyContext}\n\nCurrent message: ${request.message}`;
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        response: text,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStreamResponse(request: ChatRequest): Promise<AsyncIterableIterator<string>> {
    try {
      let prompt = request.message;

      if (request.conversation_history && request.conversation_history.length > 0) {
        const historyContext = request.conversation_history
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
        
        prompt = `Previous conversation:\n${historyContext}\n\nCurrent message: ${request.message}`;
      }

      const result = await this.model.generateContentStream(prompt);

      return this.createStreamIterator(result.stream);
    } catch (error) {
      console.error('Error generating streaming AI response:', error);
      throw new Error(`Failed to generate streaming AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async* createStreamIterator(stream: any): AsyncIterableIterator<string> {
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  }

  async isModelAvailable(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Test");
      return !!result;
    } catch (error) {
      console.error('Model availability check failed:', error);
      return false;
    }
  }
}

export default new GenerativeAIService();