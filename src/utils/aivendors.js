// AI 提供商列表定义
export const aiVendors = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    types: ['llm'],
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        type: 'llm'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        type: 'llm'
      },
      {
        id: 'claude-2',
        name: 'Claude 2',
        type: 'llm'
      }
    ],
    config: {
      apiKey: '',
      apiBaseUrl: 'https://openrouter.ai/api/v1'
    }
  },
  {
    id: 'openai',
    name: 'OpenAI',
    types: ['llm', 'image'],
    models: [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        type: 'llm'
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        type: 'llm'
      },
      {
        id: 'dall-e-3',
        name: 'DALL·E 3',
        type: 'image'
      }
    ],
    config: {
      apiKey: '',
      apiBaseUrl: 'https://api.openai.com/v1'
    }
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    types: ['llm'],
    models: [
      {
        id: 'claude-2',
        name: 'Claude 2',
        type: 'llm'
      }
    ],
    config: {
      apiKey: '',
      apiBaseUrl: 'https://api.anthropic.com'
    }
  },
  {
    id: 'ollama',
    name: 'Ollama',
    types: ['llm'],
    models: [
      {
        id: 'llama2',
        name: 'Llama 2',
        type: 'llm'
      },
      {
        id: 'mistral',
        name: 'Mistral',
        type: 'llm'
      },
      {
        id: 'codellama',
        name: 'Code Llama',
        type: 'llm'
      }
    ],
    config: {
      apiKey: '',
      apiBaseUrl: 'http://localhost:11434'
    }
  }
]

// AI 功能类型定义
export const aiTypes = {
  llm: '语言模型',
  image: '图像生成',
  video: '视频处理',
  audio: '音频处理'
}
