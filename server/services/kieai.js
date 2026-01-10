// Kie AI Service - Handles image generation via Kie AI API

const KIE_AI_BASE_URL = 'https://api.kie.ai';

/**
 * Create a generation task
 * @param {string} prompt - The prompt for image generation
 * @param {object} options - Generation options
 * @returns {Promise<{taskId: string}>}
 */
export async function createTask(prompt, options = {}) {
  const apiKey = process.env.KIE_AI_API_KEY;
  
  if (!apiKey || apiKey === 'your_kie_ai_api_key_here') {
    throw new Error('Kie AI is not configured. Please set KIE_AI_API_KEY environment variable.');
  }

  const {
    model = 'nano-banana-pro',
    aspectRatio = '1:1',
    resolution = '2K',
    outputFormat = 'png',
    imageInput = [],
    callBackUrl = null,
  } = options;

  try {
    console.log('🎨 Creating Kie AI generation task...');
    console.log('Prompt length:', prompt.length, 'characters');
    
    const payload = {
      model,
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        resolution,
        output_format: outputFormat,
      },
    };

    if (imageInput.length > 0) {
      payload.input.image_input = imageInput;
    }

    if (callBackUrl) {
      payload.callBackUrl = callBackUrl;
    }

    const response = await fetch(`${KIE_AI_BASE_URL}/api/v1/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('📥 Kie AI response:', JSON.stringify(data, null, 2));

    if (data.code !== 200) {
      console.error('❌ Kie AI error response:', data);
      throw new Error(data.message || data.msg || `API error code: ${data.code}`);
    }

    console.log('✅ Task created:', data.data.taskId);
    
    return {
      taskId: data.data.taskId,
    };
  } catch (error) {
    console.error('❌ Kie AI task creation error:', error.message);
    throw new Error(`Failed to create generation task: ${error.message}`);
  }
}

/**
 * Query task status and get result
 * @param {string} taskId - The task ID
 * @returns {Promise<{state: string, resultUrls?: string[], failMsg?: string}>}
 */
export async function queryTask(taskId) {
  const apiKey = process.env.KIE_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Kie AI is not configured.');
  }

  try {
    const response = await fetch(
      `${KIE_AI_BASE_URL}/api/v1/jobs/recordInfo?taskId=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to query task');
    }

    const taskData = data.data;

    if (taskData.state === 'success') {
      // Parse resultJson to get URLs
      let resultUrls = [];
      if (taskData.resultJson) {
        try {
          const result = JSON.parse(taskData.resultJson);
          resultUrls = result.resultUrls || [];
        } catch (e) {
          console.error('Failed to parse resultJson:', e);
        }
      }

      return {
        state: 'success',
        resultUrls,
        taskId: taskData.taskId,
        costTime: taskData.costTime,
      };
    } else if (taskData.state === 'fail') {
      return {
        state: 'fail',
        failCode: taskData.failCode,
        failMsg: taskData.failMsg || 'Generation failed',
        taskId: taskData.taskId,
      };
    } else {
      // waiting, queuing, generating
      return {
        state: taskData.state,
        taskId: taskData.taskId,
      };
    }
  } catch (error) {
    console.error('❌ Kie AI query error:', error.message);
    throw new Error(`Failed to query task: ${error.message}`);
  }
}

/**
 * Poll task until completion
 * @param {string} taskId - The task ID
 * @param {number} maxWaitTime - Maximum time to wait in milliseconds (default: 300000 = 5 minutes)
 * @param {number} pollInterval - Polling interval in milliseconds (default: 2000 = 2 seconds)
 * @returns {Promise<{url: string, taskId: string}>}
 */
export async function pollTaskUntilComplete(taskId, maxWaitTime = 300000, pollInterval = 2000) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const result = await queryTask(taskId);

    if (result.state === 'success') {
      if (result.resultUrls && result.resultUrls.length > 0) {
        console.log(`✅ Task completed in ${result.costTime}ms`);
        return {
          url: result.resultUrls[0], // Use first result URL
          taskId: result.taskId,
        };
      } else {
        throw new Error('Task completed but no result URLs found');
      }
    } else if (result.state === 'fail') {
      throw new Error(result.failMsg || 'Generation failed');
    }

    // Still processing, wait and poll again
    console.log(`⏳ Task state: ${result.state}, waiting ${pollInterval}ms...`);
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Task timeout: generation took too long');
}

/**
 * Generate an image (convenience function that creates task and polls)
 * @param {string} prompt - The prompt for image generation
 * @param {object} options - Generation options
 * @returns {Promise<{url: string, taskId: string}>}
 */
export async function generateImage(prompt, options = {}) {
  const { taskId } = await createTask(prompt, options);
  const result = await pollTaskUntilComplete(taskId);
  return result;
}

/**
 * Check if Kie AI is properly configured
 */
export function isConfigured() {
  const key = process.env.KIE_AI_API_KEY;
  return !!key && key !== 'your_kie_ai_api_key_here';
}



