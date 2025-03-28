// AI API 连通性测试工具函数

/**
 * 测试 OpenAI API 连通性
 * @param {string} apiBaseUrl - API 基础 URL
 * @param {string} apiKey - API 密钥
 * @returns {Promise<{success: boolean, message: string}>} 测试结果
 */
async function testOpenAI(apiBaseUrl, apiKey) {
  try {
    const response = await fetch(`${apiBaseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true, message: '连接成功' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || '连接失败' }
    }
  } catch (error) {
    return { success: false, message: error.message || '连接失败' }
  }
}

/**
 * 测试 Anthropic API 连通性
 * @param {string} apiBaseUrl - API 基础 URL
 * @param {string} apiKey - API 密钥
 * @returns {Promise<{success: boolean, message: string}>} 测试结果
 */
async function testAnthropic(apiBaseUrl, apiKey) {
  try {
    const response = await fetch(`${apiBaseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-2',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    })

    if (response.ok) {
      return { success: true, message: '连接成功' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || '连接失败' }
    }
  } catch (error) {
    return { success: false, message: error.message || '连接失败' }
  }
}

/**
 * 测试 Ollama API 连通性
 * @param {string} apiBaseUrl - API 基础 URL
 * @returns {Promise<{success: boolean, message: string}>} 测试结果
 */
async function testOllama(apiBaseUrl) {
  try {
    const response = await fetch(`${apiBaseUrl}/api/tags`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-cache'
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, message: '连接成功' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error || '连接失败' }
    }
  } catch (error) {
    return { success: false, message: error.message || '连接失败' }
  }
}

/**
 * 测试 OpenRouter API 连通性
 * @param {string} apiBaseUrl - API 基础 URL
 * @param {string} apiKey - API 密钥
 * @returns {Promise<{success: boolean, message: string}>} 测试结果
 */
async function testOpenRouter(apiBaseUrl, apiKey) {
  try {
    const response = await fetch(`${apiBaseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true, message: '连接成功' }
    } else {
      const error = await response.json()
      return { success: false, message: error.error?.message || '连接失败' }
    }
  } catch (error) {
    return { success: false, message: error.message || '连接失败' }
  }
}

/**
 * 根据供应商 ID 测试 API 连通性
 * @param {string} vendorId - 供应商 ID
 * @param {string} apiBaseUrl - API 基础 URL
 * @param {string} apiKey - API 密钥
 * @returns {Promise<{success: boolean, message: string}>} 测试结果
 */
export async function testVendorAPI(vendorId, apiBaseUrl, apiKey) {
  switch (vendorId) {
    case 'openai':
      return testOpenAI(apiBaseUrl, apiKey)
    case 'anthropic':
      return testAnthropic(apiBaseUrl, apiKey)
    case 'ollama':
      return testOllama(apiBaseUrl)
    case 'openrouter':
      return testOpenRouter(apiBaseUrl, apiKey)
    default:
      return { success: false, message: '不支持的供应商' }
  }
}
