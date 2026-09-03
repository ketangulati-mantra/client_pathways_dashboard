import { config } from '../../config/index.js';

export interface GeminiGenerationOptions {
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  systemInstruction?: string;
  mockResponse?: any;
}

export const geminiClient = {
  /**
   * Generates structured JSON from Gemini 2.5 Flash via official REST API.
   * Server-side only; never exposes keys or prompts to clients.
   */
  async generateStructuredContent<T = any>(
    prompt: string,
    options: GeminiGenerationOptions = {}
  ): Promise<T> {
    // 1. Support test mocking if provided
    if (options.mockResponse) {
      return options.mockResponse as T;
    }

    const apiKey = config.gemini.apiKey;
    const model = config.gemini.modelName || 'gemini-2.5-flash';

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const timeoutMs = options.timeoutMs || 25000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const bodyPayload: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature !== undefined ? options.temperature : 0.75,
        maxOutputTokens: options.maxOutputTokens || 1200,
        responseMimeType: 'application/json'
      }
    };

    if (options.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemini API error [${response.status}]: ${errorText || response.statusText}`);
      }

      const responseData = await response.json();
      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText || typeof rawText !== 'string') {
        throw new Error('Gemini API returned an empty or invalid candidate text payload');
      }

      // Parse and return structured JSON
      const parsedJson = JSON.parse(rawText);
      return parsedJson as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Gemini generation timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
};
