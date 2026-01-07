/**
 * Generator Pipeline Orchestrator
 * Coordinates all stages of component generation
 */

import { GoogleGenAI } from '@google/genai';
import { 
  ComponentSpec, 
  GenerationResult, 
  GeneratedFile,
  ComponentSpecSchema,
} from './schema.js';
import { normalizer } from './normalizer.js';
import { findClosestBlueprint, type Blueprint } from './blueprints/index.js';
import { validator } from './validator.js';
import { getTargetConfig, generateFilePath } from './targets.js';

// ============================================================
// PIPELINE CONFIGURATION
// ============================================================

interface PipelineConfig {
  apiKey: string;
  maxRetries: number;
  autoFix: boolean;
  includeStory: boolean;
  includeDemo: boolean;
}

const DEFAULT_CONFIG: Omit<PipelineConfig, 'apiKey'> = {
  maxRetries: 2,
  autoFix: true,
  includeStory: true,
  includeDemo: true,
};

// ============================================================
// SYSTEM PROMPTS
// ============================================================

const SPEC_GENERATION_PROMPT = `You are a UI component specification generator. Given a user's natural language description, output a structured JSON specification for the component.

Output ONLY valid JSON matching this schema:
{
  "name": "PascalCaseComponentName",
  "componentType": "button|card|pricing|...",
  "description": "Brief description",
  "layout": "stack|row|grid|flex",
  "tone": "neutral|bold|playful|minimal|corporate|luxurious",
  "sizes": ["sm", "md", "lg"],
  "intents": ["default", "primary", ...],
  "hasLoadingState": boolean,
  "hasErrorState": boolean,
  "hasEmptyState": boolean,
  "isInteractive": boolean
}

Be concise. Use reasonable defaults. Output JSON only.`;

const CODE_GENERATION_PROMPT = `You are an expert React/TypeScript component developer. Generate production-quality code following these strict rules:

STYLE GUIDE:
- Use Tailwind CSS with semantic color tokens: primary, secondary, muted, destructive, foreground, background
- Use consistent spacing: p-2, p-3, p-4, p-6, p-8 (not arbitrary values)
- Use consistent radii: rounded-md, rounded-lg, rounded-xl
- Use semantic shadows: shadow-sm, shadow-md, shadow-lg
- Add focus-visible:ring-2 focus-visible:ring-ring to interactive elements
- Include motion-reduce:transition-none for animations

ACCESSIBILITY:
- Add aria-label to icon-only buttons
- Use semantic HTML elements (button, article, nav, etc.)
- Include focus states
- Support keyboard navigation

CODE QUALITY:
- Export TypeScript interface for props
- Use forwardRef for DOM elements
- Include displayName for debugging
- Use cn() utility for className merging
- No unused imports

Output format:
\`\`\`tsx
// Component code here
\`\`\`

\`\`\`usage
// Usage example here
\`\`\``;

// ============================================================
// PIPELINE CLASS
// ============================================================

export class GeneratorPipeline {
  private ai: GoogleGenAI;
  private config: PipelineConfig;

  constructor(apiKey: string, config: Partial<Omit<PipelineConfig, 'apiKey'>> = {}) {
    this.ai = new GoogleGenAI({ apiKey });
    this.config = { ...DEFAULT_CONFIG, ...config, apiKey };
  }

  /**
   * Main generation entry point
   */
  async generate(
    userPrompt: string,
    options: Partial<ComponentSpec> = {}
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // STAGE 0: Normalize user intent
      const spec = await this.normalizeIntent(userPrompt, options);

      // STAGE 1: Select blueprint
      const blueprint = findClosestBlueprint(spec.componentType);

      // STAGE 2: Generate code with constraints
      const rawFiles = await this.generateCode(spec, blueprint);

      // STAGE 3: Validate and auto-fix
      const { files, report } = validator.validate(rawFiles, spec, this.config.autoFix);

      // STAGE 4: Generate deliverables
      const usageExample = this.generateUsageExample(spec, blueprint);
      const propsDocumentation = this.generatePropsDoc(spec, blueprint);
      const storySnippet = this.config.includeStory ? this.generateStory(spec) : undefined;

      // STAGE 5: Calculate quality score
      const qualityScore = this.calculateQualityScore(spec, files, report.score);

      return {
        spec,
        files,
        usageExample,
        storySnippet,
        propsDocumentation,
        qualityScore,
        validationPassed: report.passed,
        validationErrors: [...report.errors, ...report.warnings],
        generationTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Return a fallback result with error
      return {
        spec: normalizer.normalize(userPrompt, options),
        files: [],
        usageExample: '// Generation failed',
        propsDocumentation: '// Generation failed',
        qualityScore: 0,
        validationPassed: false,
        validationErrors: [`Generation failed: ${errorMessage}`],
        generationTimeMs: Date.now() - startTime,
      };
    }
  }

  /**
   * STAGE 0: Normalize user intent into ComponentSpec
   */
  private async normalizeIntent(
    userPrompt: string,
    options: Partial<ComponentSpec>
  ): Promise<ComponentSpec> {
    // First, try to extract structured spec using pattern matching
    const localSpec = normalizer.normalize(userPrompt, options);

    // For complex prompts, optionally enhance with AI
    if (userPrompt.length > 100) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          config: {
            systemInstruction: SPEC_GENERATION_PROMPT,
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        });

        const aiSpec = JSON.parse(response.text || '{}');
        // Merge AI suggestions with local detection
        return ComponentSpecSchema.parse({
          ...localSpec,
          ...aiSpec,
          userPrompt,
          outputTarget: options.outputTarget || localSpec.outputTarget,
        });
      } catch {
        // Fall back to local normalization
        return localSpec;
      }
    }

    return localSpec;
  }

  /**
   * STAGE 2: Generate code using LLM with blueprint context
   */
  private async generateCode(
    spec: ComponentSpec,
    blueprint: Blueprint
  ): Promise<GeneratedFile[]> {
    const targetConfig = getTargetConfig(spec.outputTarget);

    const prompt = this.buildCodePrompt(spec, blueprint, targetConfig);

    let attempts = 0;

    while (attempts < this.config.maxRetries) {
      attempts++;

      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: CODE_GENERATION_PROMPT,
            temperature: 0.5,
          },
        });

        const text = response.text || '';
        const files = this.parseCodeBlocks(text, spec, targetConfig);

        if (files.length > 0) {
          return files;
        }

      } catch {
        // Try again
      }
    }

    // Return blueprint template as fallback
    return [{
      path: generateFilePath(spec.name, spec.outputTarget),
      content: blueprint.codeTemplate.replace(/\{\{componentName\}\}/g, spec.name),
      language: targetConfig.fileExtension as 'tsx' | 'ts',
    }];
  }

  /**
   * Build the code generation prompt with full context
   */
  private buildCodePrompt(
    spec: ComponentSpec,
    blueprint: Blueprint,
    targetConfig: ReturnType<typeof getTargetConfig>
  ): string {
    const parts = [
      `Generate a ${spec.name} component with these requirements:`,
      '',
      `**Description:** ${spec.description}`,
      `**Component Type:** ${spec.componentType}`,
      `**Output Target:** ${targetConfig.name}`,
      '',
      '**Variants:**',
      `- Sizes: ${spec.sizes.join(', ')}`,
      `- Intents: ${spec.intents.join(', ')}`,
      `- States: ${spec.states.join(', ')}`,
      '',
      '**Features:**',
      spec.hasLoadingState ? '- Include loading state' : '',
      spec.hasErrorState ? '- Include error state' : '',
      spec.hasEmptyState ? '- Include empty state' : '',
      spec.isInteractive ? '- Make interactive with keyboard support' : '',
      '',
      '**Props to include:**',
      ...spec.props.map(p => `- ${p.name}: ${p.type}${p.required ? ' (required)' : ''}`),
      '',
      '**Reference Blueprint:**',
      '```tsx',
      blueprint.codeTemplate.slice(0, 1000) + '...',
      '```',
      '',
      '**Style Tokens to Use:**',
      `- Base classes: ${blueprint.tailwindBase}`,
      `- Size variants: ${JSON.stringify(blueprint.sizeClasses)}`,
      `- Intent variants: ${JSON.stringify(blueprint.intentClasses)}`,
      '',
      spec.dataShape ? `**Sample Data Shape:**\n${JSON.stringify(spec.dataShape, null, 2)}` : '',
    ].filter(Boolean);

    return parts.join('\n');
  }

  /**
   * Parse code blocks from LLM response
   */
  private parseCodeBlocks(
    text: string,
    spec: ComponentSpec,
    _targetConfig: ReturnType<typeof getTargetConfig>
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Extract TSX/component code block
    const tsxMatch = text.match(/```tsx\n([\s\S]*?)```/);
    if (tsxMatch) {
      files.push({
        path: generateFilePath(spec.name, spec.outputTarget),
        content: tsxMatch[1].trim(),
        language: 'tsx',
      });
    }

    // Extract usage example
    const usageMatch = text.match(/```usage\n([\s\S]*?)```/);
    if (usageMatch) {
      files.push({
        path: `examples/${spec.name.toLowerCase()}-example.tsx`,
        content: usageMatch[1].trim(),
        language: 'tsx',
      });
    }

    return files;
  }

  /**
   * STAGE 4: Generate usage example
   */
  private generateUsageExample(spec: ComponentSpec, _blueprint: Blueprint): string {
    const propExamples = spec.props
      .filter(p => p.required || p.defaultValue !== undefined)
      .map(p => {
        if (p.type === 'string') return `${p.name}="${p.defaultValue || 'example'}"`;
        if (p.type === 'boolean') return p.defaultValue ? p.name : '';
        if (p.type === 'ReactNode') return '';
        return `${p.name}={${JSON.stringify(p.defaultValue || 'value')}}`;
      })
      .filter(Boolean)
      .join('\n  ');

    return `import { ${spec.name} } from "@/components/ui/${spec.name.toLowerCase()}";

function Example() {
  return (
    <${spec.name}
      ${propExamples}
    >
      ${spec.componentType === 'button' ? 'Click me' : 'Content'}
    </${spec.name}>
  );
}`;
  }

  /**
   * Generate props documentation
   */
  private generatePropsDoc(spec: ComponentSpec, _blueprint: Blueprint): string {
    const propsTable = spec.props.map(p => {
      const type = p.enumValues ? p.enumValues.map(v => `"${v}"`).join(' | ') : p.type;
      const defaultVal = p.defaultValue !== undefined ? String(p.defaultValue) : '-';
      return `| ${p.name} | ${type} | ${p.required ? 'Yes' : 'No'} | ${defaultVal} | ${p.description || ''} |`;
    }).join('\n');

    return `## ${spec.name} Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${propsTable}

### Variants

**Sizes:** ${spec.sizes.join(', ')}

**Intents:** ${spec.intents.join(', ')}

**States:** ${spec.states.join(', ')}
`;
  }

  /**
   * Generate Storybook story
   */
  private generateStory(spec: ComponentSpec): string {
    return `import type { Meta, StoryObj } from "@storybook/react";
import { ${spec.name} } from "./${spec.name.toLowerCase()}";

const meta: Meta<typeof ${spec.name}> = {
  title: "Components/${spec.name}",
  component: ${spec.name},
  tags: ["autodocs"],
  argTypes: {
    ${spec.sizes.length > 1 ? `size: { control: "select", options: ${JSON.stringify(spec.sizes)} },` : ''}
    ${spec.intents.length > 1 ? `variant: { control: "select", options: ${JSON.stringify(spec.intents)} },` : ''}
  },
};

export default meta;
type Story = StoryObj<typeof ${spec.name}>;

export const Default: Story = {
  args: {
    ${spec.componentType === 'button' ? 'children: "Button",' : ''}
  },
};

${spec.sizes.map(size => `
export const Size${size.charAt(0).toUpperCase() + size.slice(1)}: Story = {
  args: {
    ...Default.args,
    size: "${size}",
  },
};`).join('\n')}
`;
  }

  /**
   * STAGE 5: Calculate overall quality score
   */
  private calculateQualityScore(
    spec: ComponentSpec,
    files: GeneratedFile[],
    validationScore: number
  ): number {
    const weights = {
      validation: 0.3,
      completeness: 0.25,
      accessibility: 0.25,
      codeQuality: 0.2,
    };

    // Completeness: check if all required elements are present
    let completeness = 0;
    const code = files.map(f => f.content).join('\n');
    if (code.includes('interface') || code.includes('type')) completeness += 25;
    if (code.includes('export')) completeness += 25;
    if (spec.sizes.every(s => code.includes(s))) completeness += 25;
    if (spec.intents.every(i => code.includes(i))) completeness += 25;

    // Accessibility: check for a11y features
    let a11y = 0;
    if (code.includes('aria-')) a11y += 25;
    if (code.includes('focus-visible') || code.includes('focus:')) a11y += 25;
    if (code.includes('role=')) a11y += 25;
    if (!spec.isInteractive || code.includes('keyboard') || code.includes('onKey')) a11y += 25;

    // Code quality
    let quality = 0;
    if (code.includes('forwardRef')) quality += 25;
    if (code.includes('displayName')) quality += 25;
    if (code.includes('cn(') || code.includes('clsx')) quality += 25;
    if (!code.includes('#') || code.includes('--')) quality += 25; // No hardcoded colors

    const finalScore = Math.round(
      validationScore * weights.validation +
      completeness * weights.completeness +
      a11y * weights.accessibility +
      quality * weights.codeQuality
    );

    return Math.min(100, Math.max(0, finalScore));
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

export function createPipeline(apiKey: string, config?: Partial<Omit<PipelineConfig, 'apiKey'>>) {
  return new GeneratorPipeline(apiKey, config);
}

