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

Example response for a restaurant card:
[
  { "createSurface": { "surfaceId": "main", "catalogId": "a2ui.dev:standard:0.8" } },
  { "updateDataModel": { "surfaceId": "main", "value": { 
    "restaurants": [
      { "name": "Sushi Palace", "rating": 4.5, "cuisine": "Japanese", "image": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400" }
    ]
  } } },
  { "updateComponents": { "surfaceId": "main", "components": [
    { "id": "root", "type": "Column", "children": { "explicitList": ["card1"] } },
    { "id": "card1", "type": "Card", "child": "cardContent" },
    { "id": "cardContent", "type": "Column", "children": { "explicitList": ["img1", "title1", "rating1"] } },
    { "id": "img1", "type": "Image", "url": { "path": "/restaurants/0/image" }, "usageHint": "mediumFeature" },
    { "id": "title1", "type": "Text", "text": { "path": "/restaurants/0/name" }, "usageHint": "h3" },
    { "id": "rating1", "type": "Text", "text": { "literalString": "★ 4.5" }, "usageHint": "caption" }
  ] } }
]
`;

const SYSTEM_PROMPT = `You are an AI assistant that generates rich user interfaces using the A2UI protocol.

When the user asks for something, you MUST respond with a valid A2UI JSON array that creates a beautiful, functional UI.

${A2UI_PROTOCOL_SCHEMA}

Available Component Catalog:
${JSON.stringify(STANDARD_CATALOG.components, null, 2)}

Rules:
1. ALWAYS respond with a valid JSON array of A2UI messages
2. The first message should be createSurface with surfaceId "main" and catalogId "a2ui.dev:standard:0.8"
3. Use updateDataModel to provide any dynamic data
4. Use updateComponents to define the UI structure - one component MUST have id "root"
5. Use real, working image URLs from Unsplash (https://images.unsplash.com/...) or Picsum (https://picsum.photos/...)
6. Make the UI visually appealing with proper hierarchy and spacing
7. Use appropriate usageHints for Text (h1-h5, body, caption) and Image (icon, avatar, smallFeature, mediumFeature, largeFeature, header)
8. For lists of items, use the template pattern with dataBinding
9. DO NOT include any text before or after the JSON array - ONLY the JSON array
10. DO NOT wrap the response in markdown code blocks - just raw JSON

Remember: Output ONLY the JSON array, nothing else!`;

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
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Parse and validate the JSON
    try {
      const messages = JSON.parse(cleanedText);
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
      return res.status(200).json({ messages });
    } catch (parseError) {
      console.error('Failed to parse A2UI response:', cleanedText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        raw: cleanedText 
      });
    }

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate response',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

