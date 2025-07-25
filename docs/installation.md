# Installation & Setup Guide

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### Hardware Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 500MB free space for dependencies
- **Internet**: Stable connection for AI API calls

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository (if from git)
git clone <repository-url>
cd dream11-analytics-tool

# Or navigate to existing project directory
cd e:\Dream11\project

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root (optional):

```bash
# Optional: Set default API keys (not recommended for security)
# VITE_OPENAI_API_KEY=sk-...
# VITE_GEMINI_API_KEY=AI...
# VITE_CLAUDE_API_KEY=sk-ant-...
```

**Note**: It's more secure to configure API keys through the application UI.

### 3. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

## AI Provider Setup

### OpenAI Configuration

1. **Get API Key**:

   - Visit [OpenAI Platform](https://platform.openai.com)
   - Create account or sign in
   - Navigate to API keys section
   - Create new secret key
   - Copy the key (starts with `sk-`)

2. **Configure in App**:
   - Open the application
   - Go to "AI Config" tab
   - Paste OpenAI API key
   - Select preferred models
   - Test connection

### Google Gemini Setup

1. **Get API Key**:

   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Create new API key
   - Copy the key (starts with `AI`)

2. **Configure in App**:
   - Open "AI Config" tab
   - Paste Gemini API key
   - Test connection

### Anthropic Claude Setup

1. **Get API Key**:

   - Visit [Anthropic Console](https://console.anthropic.com)
   - Create account or sign in
   - Navigate to API keys
   - Create new key
   - Copy the key (starts with `sk-ant-`)

2. **Configure in App**:
   - Open "AI Config" tab
   - Paste Claude API key
   - Test connection

## Configuration Guide

### Basic Configuration

1. **Launch Application**:

   ```bash
   npm run dev
   ```

2. **Access AI Configuration**:

   - Click "AI Config" tab in the top navigation
   - Or navigate to `http://localhost:5173` and click the settings icon

3. **Add API Keys**:

   - Enter at least one AI provider API key
   - Multiple providers recommended for redundancy
   - Test each connection before saving

4. **Model Selection**:

   - Choose models for different tasks:
     - **Text Extraction**: `gpt-4o` (recommended)
     - **UI Analysis**: `gpt-4o` or `claude-3-sonnet`
     - **Event Generation**: `gpt-4o`

5. **Advanced Settings**:
   - **Confidence Threshold**: 0.8 (default)
   - **Max Properties**: 10 per event
   - **Auto Detect Events**: Enabled
   - **Property Inference**: Enabled

### Production Configuration

For production deployment:

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

**Environment Variables** (if using):

```bash
# .env.production
VITE_APP_TITLE="AI User Journey Analytics"
VITE_APP_VERSION="1.0.0"
```

## Troubleshooting

### Common Installation Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# If version is too old, install newer version:
# Visit https://nodejs.org and download latest LTS
```

#### Dependency Installation Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use npm ci for clean install
npm ci
```

#### Port Already in Use

```bash
# If port 5173 is in use, specify different port
npm run dev -- --port 3000
```

### AI Configuration Issues

#### API Key Validation Errors

1. **Verify Key Format**:

   - OpenAI: `sk-...` (51 characters)
   - Gemini: `AI...` (39 characters)
   - Claude: `sk-ant-...` (variable length)

2. **Check API Key Permissions**:

   - Ensure key has chat/completion permissions
   - Verify account has sufficient credits

3. **Test Connection**:
   - Use the "Test Connection" button in AI Config
   - Check browser console for detailed errors

#### Rate Limiting Issues

```typescript
// If you encounter rate limits:
// 1. Wait for rate limit reset
// 2. Configure multiple providers for fallback
// 3. Reduce request frequency
```

### Application Issues

#### Drawing Canvas Not Loading

1. **Browser Compatibility**:

   - Ensure modern browser (Chrome 90+, Firefox 88+)
   - Enable JavaScript
   - Clear browser cache

2. **Check Console Errors**:
   - Open browser dev tools (F12)
   - Look for JavaScript errors
   - Report issues with error messages

#### AI Analysis Failing

1. **Check Configuration**:

   - Verify at least one AI provider configured
   - Test API connections
   - Check browser network tab for failed requests

2. **Fallback Mode**:
   - App should work with mock data if AI fails
   - Check console for fallback activation messages

## Development Setup

### VSCode Configuration

Recommended extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint"
  ]
}
```

### Project Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Additional scripts (if configured)
npm run test         # Run tests
npm run type-check   # TypeScript type checking
```

### Code Quality Setup

The project includes:

- **ESLint**: JavaScript/TypeScript linting
- **TypeScript**: Type checking
- **Tailwind CSS**: Utility-first styling
- **Prettier**: Code formatting (if configured)

## Deployment

### Static Hosting (Recommended)

Build and deploy to any static hosting service:

```bash
# Build for production
npm run build

# Deploy 'dist' folder to:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - Any static hosting service
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t ai-analytics-tool .
docker run -p 8080:80 ai-analytics-tool
```

## Security Considerations

### API Key Security

- **Never commit API keys to version control**
- **Use environment variables in production**
- **Rotate keys regularly**
- **Monitor API usage**

### Client-Side Storage

- API keys stored in browser localStorage
- Clear storage when switching environments
- Consider encrypted storage for sensitive environments

### HTTPS Requirements

- Some AI providers require HTTPS in production
- Use SSL certificates for production deployment
- Test all AI providers in production environment

## Performance Optimization

### Development Performance

```bash
# Use development mode for faster builds
npm run dev

# Clear browser cache if experiencing issues
# Ctrl+Shift+Del (Windows) or Cmd+Shift+Del (Mac)
```

### Production Performance

```bash
# Optimize build
npm run build

# Analyze bundle size
npm install -g vite-bundle-analyzer
npx vite-bundle-analyzer dist
```

## Getting Help

### Documentation

- [High-Level Design](./high-level-design.md)
- [API Documentation](./api-documentation.md)
- [AI Integration Guide](./ai-integration.md)

### Troubleshooting Steps

1. Check browser console for errors
2. Verify AI provider configurations
3. Test with different browsers
4. Clear browser cache and localStorage
5. Check network connectivity

### Common Solutions

- **AI not working**: Configure API keys in AI Config tab
- **Drawing not saving**: Check browser localStorage permissions
- **Slow performance**: Try with fewer drawing elements
- **Export failing**: Check browser download permissions

### Support Resources

- Browser developer tools (F12)
- Network tab for API request debugging
- Console tab for JavaScript errors
- Application tab for localStorage inspection
