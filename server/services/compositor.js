// Compositor Service - Overlays real photos onto AI-generated images

import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Download image from URL as buffer
 */
async function downloadImage(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload buffer to Cloudinary
 */
async function uploadToCloudinary(buffer, folder = 'family-trees') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        format: 'png',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(buffer);
  });
}

/**
 * Simple composite - save the generated image directly to Cloudinary
 * (Photo compositing would require more sophisticated position detection)
 */
export async function saveGeneratedImage(imageUrl) {
  try {
    console.log('📥 Downloading generated image...');
    const imageBuffer = await downloadImage(imageUrl);
    
    console.log('☁️ Uploading to Cloudinary...');
    const result = await uploadToCloudinary(imageBuffer);
    
    console.log('✅ Image saved to Cloudinary:', result.secure_url);
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('❌ Compositor error:', error.message);
    throw new Error(`Failed to save image: ${error.message}`);
  }
}

/**
 * Add watermark to image for free users
 */
export async function addWatermark(imageUrl, text = 'AI Family Tree - Free Version') {
  try {
    const imageBuffer = await downloadImage(imageUrl);
    
    // Create watermark
    const watermarked = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(`
            <svg width="400" height="50">
              <text x="10" y="35" font-family="Arial" font-size="24" fill="rgba(255,255,255,0.5)" stroke="rgba(0,0,0,0.3)" stroke-width="1">
                ${text}
              </text>
            </svg>
          `),
          gravity: 'southeast',
        },
      ])
      .toBuffer();
    
    const result = await uploadToCloudinary(watermarked, 'family-trees/watermarked');
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('❌ Watermark error:', error.message);
    // Fall back to original if watermarking fails
    return { url: imageUrl };
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isConfigured() {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

