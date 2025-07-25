# API Key Setup Guide

## 🔑 **Claude API Key (Anthropic)**

### **Current Issue:**

Your Claude API key is invalid. The error shows "invalid x-api-key".

### **How to Get a Valid Claude API Key:**

1. **Visit Anthropic Console:**

   - Go to [https://console.anthropic.com/](https://console.anthropic.com/)
   - Sign up or log in to your account

2. **Create API Key:**

   - Navigate to "API Keys" section
   - Click "Create Key"
   - Give it a name (e.g., "My App")
   - Copy the generated key

3. **Valid Format:**

   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Update Configuration:**
   - Open `env/config.env`
   - Replace the `CLAUDE_API_KEY=` line with your new key
   - Save the file

---

## 🤖 **OpenAI API Key**

### **How to Get OpenAI API Key:**

1. **Visit OpenAI Platform:**

   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Sign up or log in

2. **Create API Key:**

   - Click "Create new secret key"
   - Give it a name
   - Copy the generated key

3. **Valid Format:**

   ```
   sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Update Configuration:**
   - Your current OpenAI key looks valid
   - If you need a new one, update `env/config.env`

---

## 🌟 **Google Gemini API Key**

### **How to Get Gemini API Key:**

1. **Visit Google AI Studio:**

   - Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key:**

   - Click "Create API Key"
   - Copy the generated key

3. **Valid Format:**

   ```
   AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **Update Configuration:**
   - Your current Gemini key looks valid
   - If you need a new one, update `env/config.env`

---

## 🔧 **Configuration File**

Update your `env/config.env` file:

```env
# AI Service API Keys
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google Vision API (using service account from keys folder)
GOOGLE_VISION_PROJECT_ID=ai-initiatives-cricbuzz11
GOOGLE_VISION_SERVICE_ACCOUNT_PATH=./keys/ai-initiatives-cricbuzz11-c173860ad474.json
```

---

## 🧪 **Testing Your Keys**

1. **Open the AI Configuration Panel** in your application
2. **Enter your API keys** in the respective fields
3. **Click "Test All Connections"** to verify everything works
4. **Check the console** for detailed results

---

## ❌ **Common Error Messages**

### **Claude Errors:**

- `"invalid x-api-key"` → API key is invalid or expired
- `"401 Unauthorized"` → Check your API key format

### **OpenAI Errors:**

- `"401 Unauthorized"` → API key is invalid
- `"429 Too Many Requests"` → Rate limit exceeded

### **Gemini Errors:**

- `"API_KEY_INVALID"` → API key is invalid
- `"403 Forbidden"` → Check API key permissions

---

## 💡 **Tips**

1. **Keep API Keys Secure:** Never commit them to public repositories
2. **Check Credits:** Ensure your accounts have sufficient credits
3. **Rate Limits:** Be aware of API rate limits
4. **Model Access:** Some models may require special access

---

## 🆘 **Need Help?**

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Verify API key format** matches the examples above
3. **Test keys individually** using the "Test" buttons
4. **Check your account status** on the respective platforms
