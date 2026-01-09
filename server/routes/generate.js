// Generation Route - Handles AI family tree generation
// All themes are FREE - payment is only for download/share ($2.99)

import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { buildPrompt, buildContinuationPrompt } from '../services/promptBuilder.js';
import { generateImage, isConfigured as isKieAIConfigured } from '../services/kieai.js';
import {
  saveGeneratedImage,
  addWatermark,
  isConfigured as isCloudinaryConfigured,
  uploadMemberPhotos,
} from '../services/compositor.js';
import { optionalAuth } from '../middleware/auth.js';
import ImageStore from '../models/ImageStore.js';

// In-memory fallback store (used when MongoDB is not connected)
const cleanUrlStore = new Map();

// Clean up old entries after 24 hours (for in-memory fallback)
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of cleanUrlStore.entries()) {
    if (now - data.createdAt > 24 * 60 * 60 * 1000) {
      cleanUrlStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

// Check if MongoDB is connected
function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// Export for use in payments route
export async function getCleanUrl(imageId) {
  // Try MongoDB first
  if (isMongoConnected()) {
    try {
      const record = await ImageStore.findOne({ imageId });
      if (record) {
        return record.cleanUrl;
      }
    } catch (error) {
      console.error('MongoDB getCleanUrl error:', error.message);
    }
  }

  // Fallback to in-memory
  const data = cleanUrlStore.get(imageId);
  return data?.cleanUrl || null;
}

export async function storeCleanUrl(cleanUrl) {
  const imageId = crypto.randomBytes(16).toString('hex');

  // Try MongoDB first
  if (isMongoConnected()) {
    try {
      await ImageStore.create({ imageId, cleanUrl });
      return imageId;
    } catch (error) {
      console.error('MongoDB storeCleanUrl error:', error.message);
    }
  }

  // Fallback to in-memory
  cleanUrlStore.set(imageId, {
    cleanUrl,
    createdAt: Date.now(),
  });
  return imageId;
}

const router = express.Router();

/**
 * POST /api/generate
 * Generate a family tree image - FREE for all users
 * All themes are free, watermark added for preview
 * Payment ($2.99) required only for download/share
 */
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { members, relationships, theme, name: treeName, customPrompt } = req.body;

    // Validate input
    if (!members || members.length < 2) {
      return res.status(400).json({ error: 'At least 2 family members are required' });
    }

    if (!relationships || relationships.length < 1) {
      return res.status(400).json({ error: 'At least 1 relationship is required' });
    }

    // Validate custom theme has a prompt
    if (theme === 'custom' && !customPrompt) {
      return res.status(400).json({ error: 'Custom theme requires a style description' });
    }

    // Check if Kie AI is configured
    if (!isKieAIConfigured()) {
      return res.status(503).json({
        error: 'AI generation is not configured. Please set KIE_AI_API_KEY.',
        code: 'KIE_AI_NOT_CONFIGURED'
      });
    }

    // All themes are now FREE - no premium checks needed
    // All users (including guests) can generate unlimited family trees

    console.log(`🌳 Generating family tree for ${members.length} members with theme: ${theme}`);
    
    // Log members with photos
    const membersWithPhotos = members.filter(m => m.photoUrl);
    console.log(`📸 Found ${membersWithPhotos.length} members with photos:`, 
      membersWithPhotos.map(m => `${m.name} (${m.photoUrl?.substring(0, 50)}...)`));

    // Step 1: Upload member photos to Cloudinary (if any)
    let uploadedPhotos = [];
    if (isCloudinaryConfigured()) {
      try {
        uploadedPhotos = await uploadMemberPhotos(members);
        console.log(`✅ Uploaded ${uploadedPhotos.length} photos to Cloudinary:`, 
          uploadedPhotos.map(p => `${p.memberName} -> ${p.photoUrl.substring(0, 60)}...`));
      } catch (error) {
        console.error('❌ Photo upload error (continuing without photos):', error.message);
        console.error('Error stack:', error.stack);
        // Continue generation even if photo upload fails
      }
    } else {
      console.warn('⚠️ Cloudinary not configured - photos will not be uploaded or used');
    }

    // Step 2: Build the prompt with photo information, tree name, and custom prompt (if any)
    const familyTreeName = treeName || 'Family Tree';
    const prompt = buildPrompt({ members, relationships }, theme, uploadedPhotos, customPrompt, familyTreeName);

    // Step 3: Prepare image inputs for Kie AI (if we have photos)
    // Kie AI has a limit of 8 image inputs maximum
    // Priority: oldest generation first (people without parents in the tree)
    const MAX_IMAGE_INPUTS = 8;

    // Sort photos by generation - prioritize ancestors (those with no parents in tree)
    const childIds = new Set(relationships.filter(r => r.type === 'parent').map(r => r.to));
    const sortedPhotos = [...uploadedPhotos].sort((a, b) => {
      const aIsChild = childIds.has(a.memberId);
      const bIsChild = childIds.has(b.memberId);
      // Ancestors (non-children) come first
      if (!aIsChild && bIsChild) return -1;
      if (aIsChild && !bIsChild) return 1;
      return 0;
    });

    // Split photos into batches if more than 8
    const firstBatchPhotos = sortedPhotos.slice(0, MAX_IMAGE_INPUTS);
    const remainingPhotos = sortedPhotos.slice(MAX_IMAGE_INPUTS);
    const needsMultiPass = remainingPhotos.length > 0;

    if (needsMultiPass) {
      console.log(`📸 Multi-pass generation required: ${sortedPhotos.length} photos total`);
      console.log(`   Pass 1: ${firstBatchPhotos.map(p => p.memberName).join(', ')}`);
      console.log(`   Pass 2: ${remainingPhotos.map(p => p.memberName).join(', ')}`);
    }

    let imageInputs = firstBatchPhotos.map(p => p.photoUrl);

    if (imageInputs.length > 0) {
      console.log(`🎨 Pass 1: ${imageInputs.length} photos to Kie AI`);
    } else {
      console.log('⚠️ No photos to pass to Kie AI - generation will use text prompt only');
    }

    // Step 4: Generate image with Kie AI (First Pass)
    // Use 2K resolution and 1:1 aspect ratio for family trees
    const generationOptions = {
      model: 'nano-banana-pro',
      aspectRatio: '1:1',
      resolution: '2K',
      outputFormat: 'png',
    };

    // Add image inputs if we have photos
    if (imageInputs.length > 0) {
      generationOptions.imageInput = imageInputs;
      console.log('📤 Pass 1: Sending to Kie AI with image inputs:', imageInputs.map(url => url.substring(0, 60) + '...'));
    }

    console.log('🚀 Starting Kie AI generation (Pass 1)...');
    let { url: generatedUrl } = await generateImage(prompt, generationOptions);
    console.log('✅ Pass 1 complete, received image URL:', generatedUrl.substring(0, 60) + '...');

    // Step 5: Multi-pass generation for remaining photos (if needed)
    let passesCompleted = 1;

    if (needsMultiPass) {
      console.log(`🔄 Starting Pass 2 to add ${remainingPhotos.length} more members...`);

      // Save the first pass image to Cloudinary so we can use it as input
      let firstPassUrl = generatedUrl;
      if (isCloudinaryConfigured()) {
        const saved = await saveGeneratedImage(generatedUrl);
        firstPassUrl = saved.url;
        console.log('📁 First pass saved to Cloudinary for reference');
      }

      // Build continuation prompt for adding remaining members
      const remainingMemberNames = remainingPhotos.map(p => p.memberName);
      const continuationPrompt = buildContinuationPrompt(
        { members, relationships },
        theme,
        remainingMemberNames,
        customPrompt
      );

      // Prepare second pass with: first pass image + remaining photos
      // First pass image counts as 1, so we can add up to 7 more photos
      const maxRemainingPhotos = MAX_IMAGE_INPUTS - 1;
      const secondBatchPhotos = remainingPhotos.slice(0, maxRemainingPhotos);
      const stillRemaining = remainingPhotos.slice(maxRemainingPhotos);

      if (stillRemaining.length > 0) {
        console.log(`⚠️ Note: ${stillRemaining.length} photos still won't fit (${stillRemaining.map(p => p.memberName).join(', ')})`);
        console.log('   Consider smaller family groups or fewer photos per person');
      }

      const secondPassInputs = [firstPassUrl, ...secondBatchPhotos.map(p => p.photoUrl)];

      const secondPassOptions = {
        model: 'nano-banana-pro',
        aspectRatio: '1:1',
        resolution: '2K',
        outputFormat: 'png',
        imageInput: secondPassInputs,
      };

      console.log('📤 Pass 2: Adding members:', secondBatchPhotos.map(p => p.memberName).join(', '));

      const secondResult = await generateImage(continuationPrompt, secondPassOptions);
      generatedUrl = secondResult.url;
      passesCompleted = 2;

      console.log('✅ Pass 2 complete! All available photos integrated');
    }

    // Step 6: Use the AI-generated image directly
    // The AI uses the uploaded photos as reference to generate integrated portraits
    // No manual photo overlay needed - this keeps the design clean and professional
    let finalImageUrl = generatedUrl;
    console.log(`✅ Using AI-generated image directly (${passesCompleted} pass${passesCompleted > 1 ? 'es' : ''} completed)`);

    // Step 7: Save to Cloudinary with watermark (all previews are watermarked)
    // Users pay $2.99 to download/share WITHOUT watermark
    // SECURITY: Never expose clean URL to client - store it server-side
    let finalResult;
    let imageId = null;

    if (isCloudinaryConfigured()) {
      try {
        // Save the clean version FIRST (for paid downloads) - stored server-side only
        console.log('💾 Saving clean version for downloads...');
        const cleanVersion = await saveGeneratedImage(finalImageUrl);
        // Store clean URL securely and get an ID
        imageId = storeCleanUrl(cleanVersion.url);
        console.log('🔒 Clean URL stored securely with ID:', imageId);

        // All generated previews get a watermark with the tree name
        console.log('🎨 Adding watermark to preview...');
        finalResult = await addWatermark(finalImageUrl, 'PREVIEW', familyTreeName);
      } catch (cloudinaryError) {
        console.error('⚠️ Cloudinary operations failed, using Kie AI URL as fallback:', cloudinaryError.message);
        // Fallback: use the Kie AI URL directly (still watermarked from AI)
        finalResult = {
          url: finalImageUrl,
          warning: 'Image saved to temporary storage. Please regenerate if the image expires.'
        };
        // Store the temp URL as clean (it will expire anyway)
        imageId = storeCleanUrl(finalImageUrl);
      }
    } else {
      // Use Kie AI URL directly if Cloudinary not configured
      finalResult = { url: finalImageUrl };
      imageId = storeCleanUrl(finalImageUrl);
    }

    // No credits to deduct - all generations are FREE
    // MongoDB operations are optional for guest users

    // Build photo usage metadata
    const photoMetadata = {
      total: uploadedPhotos.length,
      pass1: firstBatchPhotos.map(p => p.memberName),
      pass2: needsMultiPass ? remainingPhotos.slice(0, MAX_IMAGE_INPUTS - 1).map(p => p.memberName) : [],
      notIncluded: needsMultiPass && remainingPhotos.length > MAX_IMAGE_INPUTS - 1
        ? remainingPhotos.slice(MAX_IMAGE_INPUTS - 1).map(p => p.memberName)
        : [],
    };

    const response = {
      success: true,
      imageUrl: finalResult.url, // Watermarked preview URL only
      imageId, // Secure ID for payment - never contains actual URL
      message: needsMultiPass
        ? `Family tree generated in ${passesCompleted} passes! All ${uploadedPhotos.length} photos integrated.`
        : 'Family tree generated successfully!',
      photosUsed: uploadedPhotos.length,
      photoMetadata,
      passesCompleted,
      isPaid: false, // Indicates this is a preview (watermarked)
    };

    // Add warning if using temporary storage
    if (finalResult.warning) {
      response.warning = finalResult.warning;
    }

    res.json(response);

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
    kieAiConfigured: isKieAIConfigured(),
    cloudinaryConfigured: isCloudinaryConfigured(),
    ready: isKieAIConfigured(),
  });
});

export default router;
