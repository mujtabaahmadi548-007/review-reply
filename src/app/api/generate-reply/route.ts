/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    console.log('Received request to /api/generate-reply');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { authorName, rating, comment } = body;

    if (!process.env.AI_API_KEY) {
      console.error('Error: AI_API_KEY missing');
      return NextResponse.json({ error: "AI_API_KEY missing" }, { status: 400 });
    }
    
    const supabase = await createClient();
    const { data: settings } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    
    const businessName = settings?.business_name || 'Our Business';
    const supportEmail = settings?.support_email || 'support@business.com';
    const tonePreset = settings?.tone_preset || 'Professional';
    const customInstructions = settings?.custom_instructions ? `\n- Additional Instructions: ${settings.custom_instructions}` : '';

    const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

    const prompt = `You are a customer service representative for ${businessName}. Draft a reply to this customer review.
Author Name: ${authorName}
Rating: ${rating} out of 5 stars
Review: "${comment}"

Guidelines:
- Tone: ${tonePreset}.
${
  rating >= 4 
  ? `- Thank the reviewer by name, mention a specific positive detail from their review, and keep it under 50 words.` 
  : `- Sincerely apologize on behalf of ${businessName} without admitting legal liability, acknowledge their frustration, invite them to contact ${supportEmail} to resolve the issue directly, and keep it under 75 words.`
}${customInstructions}`;

    const generateWithRetry = async (model: string, maxRetries: number) => {
      let attempts = 0;
      while (attempts <= maxRetries) {
        try {
          console.log(`Calling Gemini API (model: ${model}, attempt: ${attempts + 1})...`);
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
          });
          return response.text || '';
        } catch (error: any) {
          const status = error?.status || error?.response?.status || (error.message?.includes('503') ? 503 : (error.message?.includes('429') ? 429 : 500));
          if ((status === 503 || status === 429 || status === 'UNAVAILABLE') && attempts < maxRetries) {
            const waitTime = (attempts + 1) * 1000;
            console.warn(`Encountered ${status} error, retrying in ${waitTime}ms...`);
            await delay(waitTime);
            attempts++;
          } else {
            throw error;
          }
        }
      }
      throw new Error('Max retries reached');
    };

    let reply = '';
    try {
      reply = await generateWithRetry('gemini-3.8-flash', 3);
    } catch (primaryError: any) {
      console.warn('Primary model failed, falling back to gemini-2.0-flash...', primaryError.message);
      try {
        reply = await generateWithRetry('gemini-2.0-flash', 0);
      } catch (fallbackError: any) {
        console.error('Fallback model also failed:', fallbackError.message);
        return NextResponse.json({ error: "AI service is busy right now. Please try again in a few seconds." }, { status: 503 });
      }
    }

    console.log('Generated reply successfully');
    return NextResponse.json({ reply: reply.trim() });
  } catch (error: any) {
    console.error('Error in /api/generate-reply:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate reply' }, { status: 500 });
  }
}
