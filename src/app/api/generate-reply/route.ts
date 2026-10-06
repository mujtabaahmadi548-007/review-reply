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

    const models = [
      "gemini-3.8-flash", // Re-adding 3.8-flash as the primary since it's the only one supported by your API key!
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash-lite"
    ];

    let reply = '';
    let lastError: any = null;

    for (const model of models) {
      try {
        let success = false;
        // Attempt up to 5 times for this model to push through 503 high demand errors
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            console.log(`Calling Gemini API (model: ${model}, attempt: ${attempt})...`);
            const response = await ai.models.generateContent({
              model,
              contents: prompt,
            });
            reply = response.text || '';
            success = true;
            break; // Break the attempt loop on success
          } catch (error: any) {
            lastError = error;
            const status = error?.status || error?.response?.status || (error.message?.includes('503') ? 503 : (error.message?.includes('429') ? 429 : 500));
            
            // If it's a retriable error and we haven't exhausted attempts for this model
            if ((status === 503 || status === 429 || status === 'UNAVAILABLE') && attempt < 5) {
              const waitTime = attempt * 1000; // 1s, 2s, 3s, 4s backoff
              console.warn(`Model ${model} attempt ${attempt} returned ${status}, retrying in ${waitTime}ms...`);
              await delay(waitTime);
            } else {
              // Not retriable or exhausted attempts, break attempt loop to fall back to next model
              console.warn(`Model ${model} failed:`, error.message);
              break; 
            }
          }
        }
        
        if (success) {
          console.log(`Generated reply successfully using ${model}`);
          return NextResponse.json({ reply: reply.trim() });
        }
      } catch (e: any) {
        lastError = e;
      }
    }

    console.error('All models in the cascade failed. Last error:', lastError?.message);
    return NextResponse.json({ 
      error: `AI service failed. Last error: ${lastError?.message || 'Unknown error'}` 
    }, { status: 503 });
  } catch (error: any) {
    console.error('Error in /api/generate-reply:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate reply' }, { status: 500 });
  }
}
