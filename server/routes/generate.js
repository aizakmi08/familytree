// Generation Route - Handles AI family tree generation

import express from 'express';
import { buildPrompt } from '../services/promptBuilder.js';
import { generateImage, isConfigured as isOpenAIConfigured } from '../services/openai.js';
import { saveGeneratedImage, addWatermark, isConfigured as isCloudinaryConfigured } from '../services/compositor.js';
import { isPremiumTheme } from '../services/themes.js';
import { optionalAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import FamilyTree from '../models/FamilyTree.js';

const router = express.Router();

/**
 * POST /api/generate
 * Generate a family tree image
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { members, relationships, theme, treeName } = req.body;

    // Validate input
    if (!members || members.length < 2) {
      return res.status(400).json({ error: 'At least 2 family members are required' });
    }

    if (!relationships || relationships.length < 1) {
      return res.status(400).json({ error: 'At least 1 relationship is required' });
    }

    // Check if OpenAI is configured
    if (!isOpenAIConfigured()) {
      return res.status(503).json({ 
        error: 'AI generation is not configured. Please set OPENAI_API_KEY.',
        code: 'OPENAI_NOT_CONFIGURED'
      });
    }

    // Check premium theme access
    if (isPremiumTheme(theme)) {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Please sign in to use premium themes',
          code: 'AUTH_REQUIRED'
        });
      }

      const user = await User.findById(req.user.userId);
      if (!user.purchasedThemes.includes(theme) && !user.isPremium) {
        return res.status(403).json({ 
          error: 'This premium theme requires purchase',
          code: 'THEME_NOT_PURCHASED'
        });
      }
    }

    // Check generation credits for non-premium users
    if (req.user) {
      const user = await User.findById(req.user.userId);
      if (!user.isPremium && user.generationCredits <= 0) {
        return res.status(403).json({
          error: 'No generation credits remaining. Upgrade to premium for unlimited generations.',
          code: 'NO_CREDITS'
        });
      }
    }

    console.log(`🌳 Generating family tree for ${members.length} members with theme: ${theme}`);

    // Build the prompt
    const prompt = buildPrompt({ members, relationships }, theme);

    // Generate image with DALL-E
    const { url: dalleUrl, revisedPrompt } = await generateImage(prompt, '1024x1024');

    // Save to Cloudinary (with watermark for free users)
    let finalResult;
    if (isCloudinaryConfigured()) {
      if (req.user) {
        const user = await User.findById(req.user.userId);
        if (user.isPremium) {
          finalResult = await saveGeneratedImage(dalleUrl);
        } else {
          finalResult = await addWatermark(dalleUrl);
        }
      } else {
        finalResult = await addWatermark(dalleUrl);
      }
    } else {
      // Use DALL-E URL directly if Cloudinary not configured (temporary URL)
      finalResult = { url: dalleUrl };
    }

    // Deduct credit for authenticated non-premium users
    if (req.user) {
      const user = await User.findById(req.user.userId);
      if (!user.isPremium && user.generationCredits > 0) {
        user.generationCredits -= 1;
        await user.save();
      }

      // Save to user's gallery
      let tree = await FamilyTree.findOne({ userId: req.user.userId });
      if (!tree) {
        tree = new FamilyTree({
          userId: req.user.userId,
          name: treeName || 'My Family Tree',
          theme,
          members: members.map(m => ({
            clientId: m.id,
            name: m.name,
            photoUrl: m.photoUrl,
            birthYear: m.birthYear,
            deathYear: m.deathYear,
          })),
          relationships: relationships.map(r => ({
            from: r.from,
            to: r.to,
            type: r.type,
          })),
        });
      }

      tree.generations.push({
        imageUrl: finalResult.url,
        prompt: revisedPrompt || prompt,
        theme,
      });

      await tree.save();
    }

    res.json({
      success: true,
      imageUrl: finalResult.url,
      message: 'Family tree generated successfully!',
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate family tree',
    });
  }
});

/**
 * GET /api/generate/status
 * Check if generation is available
 */
router.get('/status', (req, res) => {
  res.json({
    openaiConfigured: isOpenAIConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
    ready: isOpenAIConfigured(),
  });
});

export default router;

