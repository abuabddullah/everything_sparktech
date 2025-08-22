import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import fs from 'fs/promises';
import path from 'path';
import { TTSRequest, TTSResponse } from '../types';

class TextToSpeechService {
  private client: TextToSpeechClient;
  private audioDirectory: string;

  constructor() {
    this.client = new TextToSpeechClient();
    this.audioDirectory = path.join(process.cwd(), 'public', 'audio');
    this.ensureAudioDirectory();
  }

  private async ensureAudioDirectory(): Promise<void> {
    try {
      await fs.access(this.audioDirectory);
    } catch {
      await fs.mkdir(this.audioDirectory, { recursive: true });
    }
  }

  async synthesizeSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      const synthesisRequest = {
        input: { text: request.text },
        voice: {
          languageCode: request.language || 'en-US',
          name: request.voice || 'en-US-Wavenet-D',
          ssmlGender: 'NEUTRAL' as const,
        },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          speakingRate: request.speed || 1.0,
        },
      };

      const [response] = await this.client.synthesizeSpeech(synthesisRequest);

      // Generate unique filename
      const filename = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
      const filePath = path.join(this.audioDirectory, filename);

      // Save audio file
      if (response.audioContent) {
        await fs.writeFile(filePath, response.audioContent as Buffer);
      }

      const audioUrl = `/audio/${filename}`;

      return {
        audio_url: audioUrl,
        text: request.text,
        settings: {
          language: request.language || 'en-US',
          voice: request.voice || 'en-US-Wavenet-D',
          speed: request.speed || 1.0
        }
      };
    } catch (error) {
      console.error('Error in text-to-speech synthesis:', error);
      throw new Error(`TTS synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAvailableVoices(languageCode?: string): Promise<any> {
    try {
      const [result] = await this.client.listVoices({
        languageCode: languageCode || undefined
      });

      return result.voices?.map(voice => ({
        name: voice.name,
        languageCode: voice.languageCodes?.[0],
        gender: voice.ssmlGender,
        naturalSampleRateHertz: voice.naturalSampleRateHertz
      })) || [];
    } catch (error) {
      console.error('Error getting available voices:', error);
      throw new Error(`Failed to get available voices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.audioDirectory);
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      for (const file of files) {
        if (file.endsWith('.mp3')) {
          const filePath = path.join(this.audioDirectory, file);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime.getTime() < cutoffTime) {
            await fs.unlink(filePath);
            console.log(`Cleaned up old audio file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old audio files:', error);
    }
  }
}

export default new TextToSpeechService();