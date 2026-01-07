import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// A2UI Standard Catalog Definition
const STANDARD_CATALOG = {
  catalogId: "a2ui.dev:standard:0.8",
  components: {
    Text: {
      text: { literalString: "string", path: "string" },
      usageHint: ["h1", "h2", "h3", "h4", "h5", "caption", "body"]
    },
    Image: {
      url: { literalString: "string", path: "string" },
      fit: ["contain", "cover", "fill", "none", "scale-down"],
      usageHint: ["icon", "avatar", "smallFeature", "mediumFeature", "largeFeature", "header"]
    },
    Icon: {
      name: { 
        literalString: ["accountCircle", "add", "arrowBack", "arrowForward", "calendarToday", 
          "call", "camera", "check", "close", "delete", "download", "edit", "event", "error",
          "favorite", "favoriteOff", "folder", "help", "home", "info", "locationOn", "lock",
          "mail", "menu", "moreVert", "moreHoriz", "notifications", "payment", "person",
          "phone", "photo", "print", "refresh", "search", "send", "settings", "share",
          "shoppingCart", "star", "starHalf", "starOff", "upload", "visibility", "warning"]
      }
    },
    Row: {
      children: { explicitList: ["componentId[]"], template: { componentId: "string", dataBinding: "string" } },
      distribution: ["center", "end", "spaceAround", "spaceBetween", "spaceEvenly", "start"],
      alignment: ["start", "center", "end", "stretch"]
    },
    Column: {
      children: { explicitList: ["componentId[]"], template: { componentId: "string", dataBinding: "string" } },
      distribution: ["start", "center", "end", "spaceBetween", "spaceAround", "spaceEvenly"],
      alignment: ["center", "end", "start", "stretch"]
    },
    List: {
      children: { explicitList: ["componentId[]"], template: { componentId: "string", dataBinding: "string" } },
      direction: ["vertical", "horizontal"],
      alignment: ["start", "center", "end", "stretch"]
    },
    Card: {
      child: "componentId"
    },
    Button: {
      child: "componentId",
      primary: "boolean",
      action: { name: "string", context: [{ key: "string", value: { path: "string", literalString: "string", literalNumber: "number", literalBoolean: "boolean" } }] }
    },
    TextField: {
      label: { literalString: "string", path: "string" },
      text: { literalString: "string", path: "string" },
      textFieldType: ["date", "longText", "number", "shortText", "obscured"]
    },
    Divider: {
      axis: ["horizontal", "vertical"]
    },
    Slider: {
      value: { literalNumber: "number", path: "string" },
      minValue: "number",
      maxValue: "number"
    },
    CheckBox: {
      label: { literalString: "string", path: "string" },
      value: { literalBoolean: "boolean", path: "string" }
    },
    MultipleChoice: {
      selections: { literalArray: ["string[]"], path: "string" },
      options: [{ label: { literalString: "string" }, value: "string" }],
      maxAllowedSelections: "integer"
    },
    DateTimeInput: {
      value: { literalString: "string (ISO 8601)", path: "string" },
      enableDate: "boolean",
      enableTime: "boolean"
    },
    Tabs: {
      tabItems: [{ title: { literalString: "string", path: "string" }, child: "componentId" }]
    },
    Modal: {
      entryPointChild: "componentId",
      contentChild: "componentId"
    }
  }
};

const A2UI_PROTOCOL_SCHEMA = `
A2UI Protocol Message Types:

1. createSurface - Creates a new UI surface:
   { "createSurface": { "surfaceId": "string", "catalogId": "a2ui.dev:standard:0.8" } }

2. updateComponents - Adds/updates components in a surface:
   { "updateComponents": { "surfaceId": "string", "components": [
     { "id": "componentId", "type": "ComponentType", ...componentProps }
   ] } }
   - One component MUST have id: "root" to serve as the root of the component tree
   - Components reference each other by ID in children arrays

3. updateDataModel - Updates data that components can bind to:
   { "updateDataModel": { "surfaceId": "string", "path": "/", "value": { ...data } } }

CRITICAL IMAGE URL RULES:
- For images, ALWAYS use Picsum Photos with this exact format: https://picsum.photos/seed/{descriptive-word}/{width}/{height}
- Examples:
  - Restaurant: https://picsum.photos/seed/sushi/400/250
  - Person/Avatar: https://picsum.photos/seed/portrait/100/100
  - Product: https://picsum.photos/seed/shoes/300/300
  - Nature: https://picsum.photos/seed/forest/400/300
  - Food: https://picsum.photos/seed/pasta/400/250
- Use descriptive seed words that match the content context
- Common sizes: 400x250 for features, 100x100 for avatars, 300x200 for cards

Example response for a restaurant card:
[
  { "createSurface": { "surfaceId": "main", "catalogId": "a2ui.dev:standard:0.8" } },
  { "updateDataModel": { "surfaceId": "main", "value": { 
    "restaurant": {
      "name": "Sakura Sushi",
      "rating": "4.8",
      "cuisine": "Japanese",
      "price": "$$$",
      "image": "https://picsum.photos/seed/sushi/400/250"
    }
  } } },
  { "updateComponents": { "surfaceId": "main", "components": [
    { "id": "root", "type": "Card", "child": "content" },
    { "id": "content", "type": "Column", "children": { "explicitList": ["img", "info"] }, "alignment": "stretch" },
    { "id": "img", "type": "Image", "url": { "path": "/restaurant/image" }, "usageHint": "mediumFeature", "fit": "cover" },
    { "id": "info", "type": "Column", "children": { "explicitList": ["name", "meta", "btn"] } },
    { "id": "name", "type": "Text", "text": { "path": "/restaurant/name" }, "usageHint": "h3" },
    { "id": "meta", "type": "Text", "text": { "literalString": "Japanese · $$$ · ★ 4.8" }, "usageHint": "caption" },
    { "id": "btn", "type": "Button", "child": "btnText", "primary": true, "action": { "name": "reserve" } },
    { "id": "btnText", "type": "Text", "text": { "literalString": "Reserve a Table" } }
  ] } }
]
`;

const SYSTEM_PROMPT = `You are an expert UI designer that creates beautiful, functional interfaces using the A2UI protocol.

When the user describes what they want, respond ONLY with a valid A2UI JSON array. No explanations, no markdown.

${A2UI_PROTOCOL_SCHEMA}

Available Component Catalog:
${JSON.stringify(STANDARD_CATALOG.components, null, 2)}

Design Principles:
1. Create visually appealing layouts with proper hierarchy
2. Use Cards to group related content
3. Use proper text hierarchy (h1 for main titles, h3 for card titles, body for descriptions, caption for metadata)
4. Always include relevant images using Picsum Photos format
5. Add interactive elements like buttons where appropriate
6. Keep designs clean and modern

Rules:
1. Respond ONLY with a valid JSON array - no text before or after
2. First message must be createSurface with surfaceId "main"
3. One component MUST have id "root"
4. Use Picsum Photos for ALL images: https://picsum.photos/seed/{word}/{width}/{height}
5. NO markdown code blocks - just raw JSON array
6. Create complete, polished UIs - not minimal examples`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    const text = response.text ?? '';
    
    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    
    // Remove various markdown formats
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Try to find JSON array in the response
    const jsonStart = cleanedText.indexOf('[');
    const jsonEnd = cleanedText.lastIndexOf(']');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.slice(jsonStart, jsonEnd + 1);
    }

    // Parse and validate the JSON
    try {
      const messages = JSON.parse(cleanedText);
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
      return res.status(200).json({ messages });
    } catch (parseError) {
      console.error('Failed to parse A2UI response:', cleanedText.substring(0, 500));
      
      // Return a fallback error UI
      const fallbackMessages = [
        { createSurface: { surfaceId: "main", catalogId: "a2ui.dev:standard:0.8" } },
        { updateComponents: { surfaceId: "main", components: [
          { id: "root", type: "Card", child: "content" },
          { id: "content", type: "Column", children: { explicitList: ["title", "desc"] } },
          { id: "title", type: "Text", text: { literalString: "Generation Error" }, usageHint: "h3" },
          { id: "desc", type: "Text", text: { literalString: "The AI response could not be parsed. Please try a different request." }, usageHint: "body" }
        ] } }
      ];
      
      return res.status(200).json({ messages: fallbackMessages });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
