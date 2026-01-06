// OpenAI Service - Handles DALL-E image generation

import OpenAI from 'openai';

// Only create client if API key is available
let openai = null;

function getClient() {
  if (!openai && isConfigured()) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Generate an image using DALL-E 3
 * @param {string} prompt - The prompt for image generation
 * @param {string} size - Image size: '1024x1024', '1792x1024', or '1024x1792'
 * @returns {Promise<{url: string, revisedPrompt: string}>}
 */
export async function generateImage(prompt, size = '1024x1024') {
  const client = getClient();
  
  if (!client) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  try {
    console.log('🎨 Generating image with DALL-E 3...');
    console.log('Prompt length:', prompt.length, 'characters');
    
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: 'standard', // or 'hd' for higher quality (more expensive)
      response_format: 'url',
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    console.log('✅ Image generated successfully');
    
    return {
      url: imageUrl,
      revisedPrompt,
    };
  } catch (error) {
    console.error('❌ DALL-E generation error:', error.message);
    
    if (error.code === 'content_policy_violation') {
      throw new Error('The prompt was flagged by content policy. Please try different names or descriptions.');
    }
    
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('Rate limit exceeded. Please try again in a few moments.');
    }
    
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

/**
 * Check if OpenAI is properly configured
 */
export function isConfigured() {
  const key = process.env.OPENAI_API_KEY;
  return !!key && key !== 'your_openai_api_key_here';
}
