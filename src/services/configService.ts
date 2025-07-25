// Configuration service for loading environment variables and API keys
export interface EnvironmentConfig {
  openai: string;
  claude: string;
  gemini: string;
  vision: {
    projectId: string;
    serviceAccountPath: string;
  };
}

class ConfigService {
  private config: EnvironmentConfig | null = null;

  async loadConfig(): Promise<EnvironmentConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      // Try to load from Vite environment variables first
      const viteConfig = this.loadFromViteEnv();
      if (viteConfig) {
        this.config = viteConfig;
        return this.config;
      }

      // Try to load from environment variables
      const envConfig = this.loadFromEnv();
      if (envConfig) {
        this.config = envConfig;
        return this.config;
      }

      // Fallback to config file
      const fileConfig = await this.loadFromFile();
      if (fileConfig) {
        this.config = fileConfig;
        return this.config;
      }

      // Default empty config
      this.config = {
        openai: '',
        claude: '',
        gemini: '',
        vision: {
          projectId: '',
          serviceAccountPath: ''
        }
      };

      return this.config;
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return {
        openai: '',
        claude: '',
        gemini: '',
        vision: {
          projectId: '',
          serviceAccountPath: ''
        }
      };
    }
  }

  private loadFromViteEnv(): EnvironmentConfig | null {
    // Check if running in Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      const openai = import.meta.env.VITE_OPENAI_API_KEY || '';
      const claude = import.meta.env.VITE_CLAUDE_API_KEY || '';
      const gemini = import.meta.env.VITE_GEMINI_API_KEY || '';
      const visionProjectId = import.meta.env.VITE_GOOGLE_VISION_PROJECT_ID || '';
      const visionServiceAccountPath = import.meta.env.VITE_GOOGLE_VISION_SERVICE_ACCOUNT_PATH || '';

      if (openai || claude || gemini) {
        return {
          openai,
          claude,
          gemini,
          vision: {
            projectId: visionProjectId,
            serviceAccountPath: visionServiceAccountPath
          }
        };
      }
    }
    return null;
  }

  private loadFromEnv(): EnvironmentConfig | null {
    // Check if running in browser environment
    if (typeof window !== 'undefined') {
      // In browser, we'll use localStorage or config file
      return null;
    }

    // For Node.js environment, this would be handled differently
    // We'll rely on Vite environment variables or config file instead
    return null;
  }

  private async loadFromFile(): Promise<EnvironmentConfig | null> {
    try {
      // Try multiple possible config file locations
      const possiblePaths = [
        '/env/config.env',
        './env/config.env',
        '/config.env',
        './config.env'
      ];

      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const configText = await response.text();
            const config = this.parseConfigFile(configText);
            if (config.openai || config.claude || config.gemini) {
              console.log(`Loaded config from ${path}`);
              return config;
            }
          }
        } catch {
          // Continue to next path
          continue;
        }
      }

      return null;
    } catch (error) {
      console.warn('Could not load config file:', error);
      return null;
    }
  }

  private parseConfigFile(configText: string): EnvironmentConfig {
    const lines = configText.split('\n');
    const config: EnvironmentConfig = {
      openai: '',
      claude: '',
      gemini: '',
      vision: {
        projectId: '',
        serviceAccountPath: ''
      }
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, value] = trimmed.split('=');
        if (key && value) {
          const cleanKey = key.trim();
          const cleanValue = value.trim();
          
          switch (cleanKey) {
            case 'OPENAI_API_KEY':
            case 'VITE_OPENAI_API_KEY':
              config.openai = cleanValue;
              break;
            case 'CLAUDE_API_KEY':
            case 'VITE_CLAUDE_API_KEY':
              config.claude = cleanValue;
              break;
            case 'GEMINI_API_KEY':
            case 'VITE_GEMINI_API_KEY':
              config.gemini = cleanValue;
              break;
            case 'GOOGLE_VISION_PROJECT_ID':
            case 'VITE_GOOGLE_VISION_PROJECT_ID':
              config.vision.projectId = cleanValue;
              break;
            case 'GOOGLE_VISION_SERVICE_ACCOUNT_PATH':
            case 'VITE_GOOGLE_VISION_SERVICE_ACCOUNT_PATH':
              config.vision.serviceAccountPath = cleanValue;
              break;
          }
        }
      }
    });

    return config;
  }

  getConfig(): EnvironmentConfig | null {
    return this.config;
  }

  async getVisionServiceAccount(): Promise<Record<string, unknown> | null> {
    try {
      const config = await this.loadConfig();
      if (!config.vision.serviceAccountPath) {
        return null;
      }

      // Load the service account JSON file
      const response = await fetch(config.vision.serviceAccountPath);
      if (!response.ok) {
        console.warn('Could not load Vision service account file');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to load Vision service account:', error);
      return null;
    }
  }
}

export const configService = new ConfigService(); 