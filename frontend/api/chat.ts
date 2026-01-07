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

const SYSTEM_PROMPT = `You are a JSON-only API that generates A2UI interfaces. You MUST respond with ONLY a valid JSON array. No text, no explanations, no markdown - JUST the JSON array starting with [ and ending with ].

${A2UI_PROTOCOL_SCHEMA}

Available components: Text, Image, Icon, Row, Column, Card, Button, TextField, Divider, List

CRITICAL RULES:
1. Output MUST start with [ and end with ]
2. NO text before or after the JSON
3. NO markdown code blocks
4. First element: { "createSurface": { "surfaceId": "main", "catalogId": "a2ui.dev:standard:0.8" } }
5. One component MUST have "id": "root"
6. Images: https://picsum.photos/seed/{word}/{width}/{height}

Example output format:
[{"createSurface":{"surfaceId":"main","catalogId":"a2ui.dev:standard:0.8"}},{"updateComponents":{"surfaceId":"main","components":[{"id":"root","type":"Card","child":"content"}]}}]`;

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
        { role: 'user', parts: [{ text: `Create a UI for: ${message}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text ?? '';
    console.log('Raw Gemini response (first 500 chars):', text.substring(0, 500));
    
    // Robust JSON extraction with multiple strategies
    const extractJSON = (input: string): string | null => {
      let cleaned = input.trim();
      
      // Strategy 1: Remove markdown code blocks
      cleaned = cleaned.replace(/```json\s*/gi, '');
      cleaned = cleaned.replace(/```\s*/gi, '');
      cleaned = cleaned.trim();
      
      // Strategy 2: Remove common AI preambles before the JSON
      const preamblePatterns = [
        /^(okay|ok|sure|here['']?s?|alright|certainly)[,.:!\s]*/i,
        /^(here is|here's|this is)[^[{]*/i,
        /^[^[{]*?(?=\[)/s, // Everything before first [
      ];
      
      for (const pattern of preamblePatterns) {
        if (cleaned.match(pattern)) {
          const match = cleaned.match(/\[[\s\S]*\]/);
          if (match) {
            cleaned = match[0];
            break;
          }
        }
      }
      
      // Find the outermost JSON array with bracket matching
      const start = cleaned.indexOf('[');
      if (start === -1) return null;
      
      let depth = 0;
      let end = -1;
      let inString = false;
      let escape = false;
      
      for (let i = start; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escape) {
          escape = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escape = true;
          continue;
        }
        
        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '[') depth++;
          else if (char === ']') {
            depth--;
            if (depth === 0) {
              end = i;
              break;
            }
          }
        }
      }
      
      if (end !== -1) {
        return cleaned.slice(start, end + 1);
      }
      
      return null;
    };

    const jsonString = extractJSON(text);
    
    if (!jsonString) {
      console.error('No JSON array found in response:', text.substring(0, 500));
      const fallbackMessages = [
        { createSurface: { surfaceId: "main", catalogId: "a2ui.dev:standard:0.8" } },
        { updateComponents: { surfaceId: "main", components: [
          { id: "root", type: "Card", child: "content" },
          { id: "content", type: "Column", children: { explicitList: ["title", "desc"] } },
          { id: "title", type: "Text", text: { literalString: "Parsing Issue" }, usageHint: "h3" },
          { id: "desc", type: "Text", text: { literalString: "Could not extract UI data. Please try again with a different request." }, usageHint: "body" }
        ] } }
      ];
      return res.status(200).json({ messages: fallbackMessages });
    }

    // Parse and validate the JSON
    try {
      const messages = JSON.parse(jsonString);
      if (!Array.isArray(messages)) {
        throw new Error('Response is not an array');
      }
      
      // Validate basic structure
      const hasCreateSurface = messages.some((m: Record<string, unknown>) => m.createSurface);
      if (!hasCreateSurface && messages.length > 0) {
        // Add createSurface if missing
        messages.unshift({ createSurface: { surfaceId: "main", catalogId: "a2ui.dev:standard:0.8" } });
      }
      
      return res.status(200).json({ messages });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Input:', jsonString.substring(0, 300));
      
      // Return a fallback error UI
      const fallbackMessages = [
        { createSurface: { surfaceId: "main", catalogId: "a2ui.dev:standard:0.8" } },
        { updateComponents: { surfaceId: "main", components: [
          { id: "root", type: "Card", child: "content" },
          { id: "content", type: "Column", children: { explicitList: ["title", "desc"] } },
          { id: "title", type: "Text", text: { literalString: "Generation Error" }, usageHint: "h3" },
          { id: "desc", type: "Text", text: { literalString: "The AI response was malformed. Please try a simpler request." }, usageHint: "body" }
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
