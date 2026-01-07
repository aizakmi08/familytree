// Compositor Service - Overlays real photos onto AI-generated images

import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary lazily (env vars may not be loaded at module import time)
let cloudinaryConfigured = false;
function ensureCloudinaryConfigured() {
  if (!cloudinaryConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryConfigured = true;
  }
}

/**
 * Download image from URL as buffer with retry logic
 */
async function downloadImage(url, retries = 3) {
  let lastError;
  console.log(`  🔄 Starting download (${retries} max attempts)...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  📥 Download attempt ${attempt}/${retries}...`);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`  ✅ Download succeeded on attempt ${attempt}`);
      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;
      // Extract error message from various possible structures
      const errorMsg = error.message || error.cause?.message || error.code ||
                       (typeof error === 'string' ? error : JSON.stringify(error));
      console.log(`  ⚠️ Download attempt ${attempt}/${retries} failed: ${errorMsg}`);

      // Only retry on transient network errors
      const errorString = String(errorMsg).toLowerCase();
      const isRetryable = errorString.includes('econnreset') ||
                          errorString.includes('etimedout') ||
                          errorString.includes('enotfound') ||
                          errorString.includes('fetch failed') ||
                          errorString.includes('network') ||
                          errorString.includes('timeout') ||
                          errorString.includes('abort');

      if (!isRetryable) {
        console.log(`  ❌ Error is not retryable, giving up`);
        break;
      }

      if (attempt === retries) {
        console.log(`  ❌ All ${retries} attempts failed`);
        break;
      }

      // Wait before retry (exponential backoff)
      const waitTime = 2000 * attempt; // Increased base wait time
      console.log(`  ⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error(`Failed to download image after ${retries} attempts: ${lastError?.message || lastError?.code || 'Unknown error'}`);
}

/**
 * Upload buffer to Cloudinary with compression and retry logic
 */
async function uploadToCloudinary(buffer, folder = 'family-trees', retries = 3) {
  ensureCloudinaryConfigured();

  // Compress image with Sharp to stay under Cloudinary's 10MB limit
  let processedBuffer = buffer;
  const MAX_SIZE = 9 * 1024 * 1024; // 9MB to leave some margin

  if (buffer.length > MAX_SIZE) {
    console.log(`⚠️ Image too large (${Math.round(buffer.length / 1024 / 1024)}MB), compressing...`);

    // Try JPEG with 85% quality first
    processedBuffer = await sharp(buffer)
      .jpeg({ quality: 85 })
      .toBuffer();

    // If still too large, reduce quality further
    if (processedBuffer.length > MAX_SIZE) {
      processedBuffer = await sharp(buffer)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();
    }

    console.log(`✅ Compressed to ${Math.round(processedBuffer.length / 1024 / 1024)}MB`);
  }

  // Determine format based on buffer
  const isJpeg = processedBuffer[0] === 0xFF && processedBuffer[1] === 0xD8;
  const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
  const format = isJpeg ? 'jpg' : 'png';

  const base64Data = `data:${mimeType};base64,${processedBuffer.toString('base64')}`;

  // Upload with retry logic
  let lastError;
  console.log(`  🔄 Starting Cloudinary upload (${retries} max attempts)...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  📤 Cloudinary upload attempt ${attempt}/${retries}...`);
      const result = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'image',
        format,
        timeout: 60000, // 60 second timeout
      });
      console.log(`  ✅ Cloudinary upload succeeded on attempt ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      // Extract error message from various possible structures
      const errorMsg = error.message || error.error?.message || error.code ||
                       (typeof error === 'string' ? error : JSON.stringify(error));
      console.log(`  ⚠️ Upload attempt ${attempt}/${retries} failed: ${errorMsg}`);

      // Only retry on transient network errors
      const errorString = String(errorMsg).toLowerCase();
      const isRetryable = errorString.includes('econnreset') ||
                          errorString.includes('etimedout') ||
                          errorString.includes('enotfound') ||
                          errorString.includes('socket hang up') ||
                          errorString.includes('network') ||
                          errorString.includes('timeout');

      if (!isRetryable) {
        console.log(`  ❌ Error is not retryable, giving up`);
        break;
      }

      if (attempt === retries) {
        console.log(`  ❌ All ${retries} attempts failed`);
        break;
      }

      // Wait before retry (exponential backoff)
      const waitTime = 2000 * attempt; // Increased base wait time
      console.log(`  ⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * Upload base64 image to Cloudinary with retry logic
 */
export async function uploadBase64Photo(base64Data, memberName, retries = 3) {
  ensureCloudinaryConfigured();

  let lastError;
  console.log(`  🔄 Starting photo upload for ${memberName} (${retries} max attempts)...`);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  📤 Photo upload attempt ${attempt}/${retries}...`);
      // Cloudinary can accept base64 data URIs directly
      const result = await cloudinary.uploader.upload(base64Data, {
        folder: 'family-trees/photos',
        resource_type: 'image',
        public_id: `member_${Date.now()}_${memberName.replace(/\s+/g, '_')}`,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' }
        ],
        timeout: 60000, // 60 second timeout
      });

      console.log(`  ✅ Photo upload succeeded on attempt ${attempt}`);
      return result.secure_url;
    } catch (error) {
      lastError = error;
      const errorMsg = error.message || error.error?.message || error.code ||
                       (typeof error === 'string' ? error : JSON.stringify(error));
      console.log(`  ⚠️ Photo upload attempt ${attempt}/${retries} failed: ${errorMsg}`);

      // Only retry on transient network errors
      const errorString = String(errorMsg).toLowerCase();
      const isRetryable = errorString.includes('econnreset') ||
                          errorString.includes('etimedout') ||
                          errorString.includes('enotfound') ||
                          errorString.includes('socket hang up') ||
                          errorString.includes('network') ||
                          errorString.includes('timeout');

      if (!isRetryable) {
        console.log(`  ❌ Error is not retryable, giving up`);
        console.error('❌ Photo upload error:', errorMsg);
        throw new Error(`Failed to upload photo: ${errorMsg}`);
      }

      if (attempt === retries) {
        console.log(`  ❌ All ${retries} attempts failed`);
        console.error('❌ Photo upload error:', errorMsg);
        throw new Error(`Failed to upload photo: ${errorMsg}`);
      }

      // Wait before retry (exponential backoff)
      const waitTime = 2000 * attempt;
      console.log(`  ⏳ Waiting ${waitTime}ms before retry ${attempt + 1}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Upload multiple member photos to Cloudinary
 * Returns array of { memberId, photoUrl } for members with photos
 */
export async function uploadMemberPhotos(members) {
  const uploadedPhotos = [];
  
  console.log(`📸 Processing ${members.length} members for photo upload...`);
  
  for (const member of members) {
    if (!member.photoUrl) {
      console.log(`  ⏭️  ${member.name}: No photo`);
      continue;
    }
    
    if (member.photoUrl.startsWith('data:image')) {
      try {
        console.log(`  📤 ${member.name}: Uploading base64 photo (${Math.round(member.photoUrl.length / 1024)}KB)...`);
        const cloudinaryUrl = await uploadBase64Photo(member.photoUrl, member.name);
        console.log(`  ✅ ${member.name}: Uploaded successfully -> ${cloudinaryUrl.substring(0, 60)}...`);
        uploadedPhotos.push({
          memberId: member.id,
          memberName: member.name,
          photoUrl: cloudinaryUrl,
        });
      } catch (error) {
        console.error(`  ❌ ${member.name}: Upload failed -`, error.message);
        // Continue with other photos
      }
    } else if (member.photoUrl.startsWith('http')) {
      // Already a URL, use it directly
      console.log(`  ✅ ${member.name}: Already has URL -> ${member.photoUrl.substring(0, 60)}...`);
      uploadedPhotos.push({
        memberId: member.id,
        memberName: member.name,
        photoUrl: member.photoUrl,
      });
    } else {
      console.warn(`  ⚠️  ${member.name}: Unknown photoUrl format: ${member.photoUrl.substring(0, 50)}...`);
    }
  }
  
  console.log(`📸 Photo processing complete: ${uploadedPhotos.length}/${members.length} photos ready`);
  return uploadedPhotos;
}

/**
 * Simple composite - save the generated image directly to Cloudinary
 */
export async function saveGeneratedImage(imageUrl) {
  try {
    console.log('📥 Downloading generated image...');
    const imageBuffer = await downloadImage(imageUrl);

    console.log(`📊 Image downloaded: ${Math.round(imageBuffer.length / 1024)}KB`);
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
    // Handle various error formats
    const errorMessage = error.message || error.error?.message || error.code || JSON.stringify(error);
    console.error('❌ Compositor error:', errorMessage);
    console.error('Full error:', error);
    throw new Error(`Failed to save image: ${errorMessage}`);
  }
}

/**
 * Composite real photos into generated family tree
 * This is a simplified version that places photos in circular frames
 * For a production app, you'd want more sophisticated position detection
 */
export async function compositePhotosIntoTree(generatedImageUrl, members, uploadedPhotos) {
  try {
    console.log('🎨 Compositing photos into family tree...');

    // Download the generated image
    const baseImage = await downloadImage(generatedImageUrl);
    const metadata = await sharp(baseImage).metadata();

    const photoCount = uploadedPhotos.length;

    if (photoCount === 0) {
      // No photos to composite, return original
      return { url: generatedImageUrl };
    }

    // Calculate positions - place photos in the upper portion of the image
    // This works better with family tree layouts
    const composites = [];
    const cols = Math.min(photoCount, 4); // Max 4 columns
    const rows = Math.ceil(photoCount / cols);
    const frameSize = Math.min(metadata.width / (cols + 1), 200); // Max 200px
    const photoSize = Math.round(frameSize * 0.85);

    // Start from top area (about 15% from top)
    const startY = Math.round(metadata.height * 0.15);
    const horizontalSpacing = metadata.width / (cols + 1);
    const verticalSpacing = Math.min(frameSize * 1.5, metadata.height * 0.25);

    for (let i = 0; i < uploadedPhotos.length; i++) {
      const photo = uploadedPhotos[i];
      try {
        console.log(`  📷 Processing photo ${i + 1}/${photoCount}: ${photo.memberName}`);

        // Download and resize photo to circular shape
        const photoBuffer = await downloadImage(photo.photoUrl);

        // Create circular mask
        const circleSize = photoSize;
        const circleSvg = Buffer.from(`
          <svg width="${circleSize}" height="${circleSize}">
            <circle cx="${circleSize/2}" cy="${circleSize/2}" r="${circleSize/2}" fill="white"/>
          </svg>
        `);

        // Resize and make circular
        const resizedPhoto = await sharp(photoBuffer)
          .resize(circleSize, circleSize, {
            fit: 'cover',
            position: 'center',
          })
          .composite([{
            input: circleSvg,
            blend: 'dest-in'
          }])
          .png()
          .toBuffer();

        // Calculate position
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = Math.round((col + 1) * horizontalSpacing - circleSize / 2);
        const y = Math.round(startY + row * verticalSpacing);

        // Ensure position is within bounds
        const safeX = Math.max(0, Math.min(x, metadata.width - circleSize));
        const safeY = Math.max(0, Math.min(y, metadata.height - circleSize));

        composites.push({
          input: resizedPhoto,
          left: safeX,
          top: safeY,
        });

        console.log(`  ✅ Photo positioned at (${safeX}, ${safeY})`);
      } catch (photoError) {
        const errMsg = photoError.message || JSON.stringify(photoError);
        console.error(`  ❌ Failed to process photo for ${photo.memberName}:`, errMsg);
      }
    }

    if (composites.length === 0) {
      console.log('⚠️ No photos could be processed, returning original image');
      return { url: generatedImageUrl };
    }

    // Composite all photos onto the base image
    console.log(`📸 Compositing ${composites.length} photos onto base image...`);
    const finalImage = await sharp(baseImage)
      .composite(composites)
      .png()
      .toBuffer();

    // Upload to Cloudinary
    console.log('☁️ Uploading composited image to Cloudinary...');
    const result = await uploadToCloudinary(finalImage, 'family-trees/composited');

    console.log('✅ Photos composited successfully:', result.secure_url);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const errorMessage = error.message || error.error?.message || JSON.stringify(error);
    console.error('❌ Photo compositing error:', errorMessage);
    console.error('Full error:', error);
    // Fall back to original image if compositing fails
    return { url: generatedImageUrl };
  }
}

/**
 * Add prominent watermark pattern to image for preview
 * Creates a repeating diagonal watermark that covers the entire image
 * This prevents screenshots from being usable without payment
 */
export async function addWatermark(imageUrl, text = 'PREVIEW', treeName = null) {
  try {
    const imageBuffer = await downloadImage(imageUrl);
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Create a repeating diagonal watermark pattern
    // The pattern is tilted and repeated to cover the entire image
    const watermarkText = `${text} - Heritage.ai`;
    const fontSize = Math.max(24, Math.round(width / 25)); // Scale with image
    const lineHeight = fontSize * 3;
    const textWidth = watermarkText.length * fontSize * 0.6;

    // Calculate how many rows and columns we need
    const rows = Math.ceil((height * 2) / lineHeight) + 2;
    const cols = Math.ceil((width * 2) / textWidth) + 2;

    // Build SVG with repeated diagonal text
    let textElements = '';
    for (let row = -2; row < rows; row++) {
      for (let col = -2; col < cols; col++) {
        const x = col * textWidth + (row % 2) * (textWidth / 2);
        const y = row * lineHeight;
        textElements += `
          <text
            x="${x}"
            y="${y}"
            font-family="Arial, sans-serif"
            font-size="${fontSize}"
            font-weight="bold"
            fill="rgba(255,255,255,0.35)"
            transform="rotate(-30, ${x}, ${y})"
          >${watermarkText}</text>
          <text
            x="${x}"
            y="${y}"
            font-family="Arial, sans-serif"
            font-size="${fontSize}"
            font-weight="bold"
            fill="rgba(0,0,0,0.15)"
            transform="rotate(-30, ${x + 1}, ${y + 1})"
          >${watermarkText}</text>
        `;
      }
    }

    const watermarkSvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        ${textElements}
      </svg>
    `);

    // Also add a semi-transparent overlay to reduce clarity
    const overlaySvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.08)"/>
      </svg>
    `);

    // Create tree name banner at the bottom if provided
    const bannerHeight = Math.round(height * 0.08);
    const bannerFontSize = Math.max(20, Math.round(bannerHeight * 0.4));
    const displayName = treeName || 'Family Tree';

    const bannerSvg = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0.7)"/>
            <stop offset="100%" style="stop-color:rgba(0,0,0,0.9)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="${height - bannerHeight}" width="${width}" height="${bannerHeight}" fill="url(#bannerGrad)"/>
        <text
          x="${width / 2}"
          y="${height - bannerHeight / 2 + bannerFontSize / 3}"
          font-family="Georgia, serif"
          font-size="${bannerFontSize}"
          font-weight="bold"
          fill="rgba(255,255,255,0.9)"
          text-anchor="middle"
        >${displayName}</text>
        <text
          x="${width / 2}"
          y="${height - bannerHeight / 2 + bannerFontSize / 3 + bannerFontSize * 0.8}"
          font-family="Arial, sans-serif"
          font-size="${Math.round(bannerFontSize * 0.5)}"
          fill="rgba(255,255,255,0.5)"
          text-anchor="middle"
        >Heritage.ai - $2.99 to download</text>
      </svg>
    `);

    // Composite the watermark pattern onto the image
    const watermarked = await sharp(imageBuffer)
      .composite([
        {
          input: overlaySvg,
          blend: 'over',
        },
        {
          input: watermarkSvg,
          blend: 'over',
        },
        {
          input: bannerSvg,
          blend: 'over',
        },
      ])
      .toBuffer();

    const result = await uploadToCloudinary(watermarked, 'family-trees/watermarked');

    console.log('✅ Watermark added successfully');

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    const errorMessage = error.message || error.error?.message || JSON.stringify(error);
    console.error('❌ Watermark error:', errorMessage);
    console.error('Full error:', error);
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
