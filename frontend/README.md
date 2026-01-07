# A2UI Chat Frontend

A conversational chat interface that generates rich, interactive UIs using the [A2UI Protocol](https://github.com/google/A2UI) and Google's Gemini AI.

![A2UI Chat](https://a2ui.org/assets/a2ui_gallery_examples.png)

## Features

- **AI-Powered UI Generation**: Describe what you want and watch as Gemini creates beautiful interfaces
- **A2UI Protocol**: Uses the standard A2UI component catalog (Card, Text, Image, Button, List, etc.)
- **Modern Design**: Glassmorphic UI with gradient backgrounds and smooth animations
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Responsive**: Works on desktop and mobile devices
- **Serverless**: Uses Vercel Edge Functions for the Gemini API

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/a2ui-chat&env=GEMINI_API_KEY&envDescription=Your%20Google%20Gemini%20API%20Key&project-name=a2ui-chat)

### Option 2: Manual Deploy

1. **Push to GitHub**:
   ```bash
   # Create a new repository on GitHub, then:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/a2ui-chat.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Add Environment Variable**:
   - In Vercel project settings, go to "Environment Variables"
   - Add `GEMINI_API_KEY` with your Google Gemini API key
   - You can get a key from [Google AI Studio](https://aistudio.google.com/apikey)

4. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

## Usage Examples

Try these prompts in the chat:

- "Create a restaurant card with an image, name, rating, and a reserve button"
- "Show me a contact form with name, email, and message fields"
- "Build a product gallery with 3 items showing images, titles, and prices"
- "Create a weather widget showing temperature, conditions, and a forecast"
- "Design a user profile card with avatar, name, bio, and social links"

## Project Structure

```
frontend/
├── api/
│   └── chat.ts          # Vercel serverless function for Gemini
├── src/
│   ├── app.ts           # Main Lit application
│   ├── client.ts        # API client
│   ├── renderer.ts      # A2UI component renderer
│   └── theme.ts         # Theme configuration
├── index.html           # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json          # Vercel deployment config
```

## Technology Stack

- **Frontend**: [Lit](https://lit.dev/) - Fast, lightweight web components
- **Build Tool**: [Vite](https://vitejs.dev/) - Next-generation frontend tooling
- **AI**: [Google Gemini](https://ai.google.dev/) - Multimodal AI model
- **Protocol**: [A2UI](https://a2ui.org/) - Agent-to-User Interface standard
- **Hosting**: [Vercel](https://vercel.com/) - Edge-first deployment platform

## A2UI Protocol

This app uses the A2UI v0.8 standard catalog which includes:

| Component | Description |
|-----------|-------------|
| Text | Text content with h1-h5, body, caption styles |
| Image | Images with icon, avatar, feature, header sizes |
| Icon | Material Symbols icons |
| Row/Column | Flex layout containers |
| List | Scrollable lists (horizontal/vertical) |
| Card | Elevated content container |
| Button | Interactive buttons with actions |
| TextField | Text input fields |
| CheckBox | Boolean checkboxes |
| Slider | Range input |
| Divider | Visual separator |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |

## Security Notes

- **Never commit your API key** to version control
- The API key is only used server-side in the Vercel function
- Use environment variables in Vercel for production deployments

## License

Apache 2.0 - See [LICENSE](../LICENSE) for details.

## Credits

Built on the [A2UI](https://github.com/google/A2UI) open-source project by Google.

