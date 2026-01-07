/**
 * ComponentSpec Schema
 * Structured specification for UI component generation
 * This is the normalized representation of user intent
 */

import { z } from 'zod';

// ============================================================
// ENUMS & CONSTANTS
// ============================================================

export const ComponentTypes = [
  // Primitives
  'button', 'input', 'badge', 'avatar', 'icon', 'text', 'link', 'image',
  'divider', 'checkbox', 'radio', 'switch', 'slider', 'select', 'textarea',
  // Composites
  'card', 'modal', 'dialog', 'toast', 'alert', 'tooltip', 'popover',
  'navbar', 'sidebar', 'footer', 'header', 'breadcrumb', 'pagination',
  'tabs', 'accordion', 'dropdown', 'menu',
  // Data Display
  'table', 'list', 'grid', 'carousel', 'gallery', 'timeline',
  // Marketing/Business
  'pricing', 'testimonial', 'feature', 'hero', 'cta', 'stats', 'faq',
  // Forms
  'form', 'search', 'login', 'signup', 'contact', 'newsletter',
  // Dashboard
  'dashboard-card', 'metric', 'chart-container', 'progress', 'status',
] as const;

export const LayoutTypes = ['stack', 'row', 'grid', 'flex', 'absolute'] as const;
export const ToneTypes = ['neutral', 'bold', 'playful', 'minimal', 'corporate', 'luxurious'] as const;
export const SizeVariants = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const IntentVariants = ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;
export const StateVariants = ['default', 'hover', 'active', 'focus', 'disabled', 'loading', 'error'] as const;

export const OutputTargets = [
  'react-tailwind',
  'react-tailwind-shadcn',
  'vue-tailwind',
  'html-tailwind',
  'react-css-modules',
] as const;

// ============================================================
// DESIGN TOKENS SCHEMA
// ============================================================

export const ThemeTokensSchema = z.object({
  // Semantic colors
  background: z.string().optional(),
  foreground: z.string().optional(),
  primary: z.string().optional(),
  primaryForeground: z.string().optional(),
  secondary: z.string().optional(),
  secondaryForeground: z.string().optional(),
  muted: z.string().optional(),
  mutedForeground: z.string().optional(),
  accent: z.string().optional(),
  accentForeground: z.string().optional(),
  destructive: z.string().optional(),
  destructiveForeground: z.string().optional(),
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
});

// ============================================================
// ACCESSIBILITY CHECKLIST SCHEMA
// ============================================================

export const AccessibilityChecklistSchema = z.object({
  // Required for interactive elements
  keyboardNavigable: z.boolean().optional().default(true),
  ariaLabels: z.boolean().optional().default(true),
  focusVisible: z.boolean().optional().default(true),
  reducedMotion: z.boolean().optional().default(true),
  // Required for specific types
  roleAttribute: z.string().optional(),
  ariaDescribedBy: z.boolean().optional(),
  ariaLive: z.enum(['off', 'polite', 'assertive']).optional(),
  tabIndex: z.number().optional(),
});

// ============================================================
// PROP DEFINITION SCHEMA
// ============================================================

export const PropTypeSchema = z.enum([
  'string', 'number', 'boolean', 'ReactNode', 'function',
  'string[]', 'object', 'any',
]);

export const PropDefinitionSchema = z.object({
  name: z.string(),
  type: PropTypeSchema,
  required: z.boolean().default(false),
  defaultValue: z.unknown().optional(),
  description: z.string().optional(),
  enumValues: z.array(z.string()).optional(), // For union types like 'sm' | 'md' | 'lg'
});

// ============================================================
// COMPONENT SPEC SCHEMA (MAIN)
// ============================================================

export const ComponentSpecSchema = z.object({
  // === Identity ===
  name: z.string().describe('PascalCase component name'),
  componentType: z.enum(ComponentTypes).describe('Category of component'),
  description: z.string().describe('Brief description of purpose'),

  // === Layout & Structure ===
  layout: z.enum(LayoutTypes).default('stack'),
  isComposite: z.boolean().default(false).describe('Uses child primitives'),
  children: z.array(z.string()).optional().describe('Child component types if composite'),

  // === Visual Design ===
  tone: z.enum(ToneTypes).default('neutral'),
  themeTokens: ThemeTokensSchema.optional(),
  
  // === Variants ===
  sizes: z.array(z.enum(SizeVariants)).default(['sm', 'md', 'lg']),
  intents: z.array(z.enum(IntentVariants)).default(['default', 'primary']),
  states: z.array(z.enum(StateVariants)).default(['default', 'hover', 'focus', 'disabled']),

  // === States to Implement ===
  hasLoadingState: z.boolean().default(false),
  hasErrorState: z.boolean().default(false),
  hasEmptyState: z.boolean().default(false),

  // === Props ===
  props: z.array(PropDefinitionSchema).default([]),
  
  // === Accessibility ===
  accessibility: AccessibilityChecklistSchema.optional(),
  isInteractive: z.boolean().default(false),

  // === Output Preferences ===
  outputTarget: z.enum(OutputTargets).default('react-tailwind-shadcn'),
  includeStory: z.boolean().default(true),
  includeDemo: z.boolean().default(true),

  // === Data Shape (for data-driven components) ===
  dataShape: z.record(z.string(), z.unknown()).optional().describe('Sample data structure'),

  // === Raw user prompt (for context) ===
  userPrompt: z.string().optional(),
});

export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;
export type ThemeTokens = z.infer<typeof ThemeTokensSchema>;
export type AccessibilityChecklist = z.infer<typeof AccessibilityChecklistSchema>;
export type PropDefinition = z.infer<typeof PropDefinitionSchema>;
export type ComponentType = typeof ComponentTypes[number];
export type LayoutType = typeof LayoutTypes[number];
export type ToneType = typeof ToneTypes[number];
export type OutputTarget = typeof OutputTargets[number];

// ============================================================
// GENERATION RESULT SCHEMA
// ============================================================

export const GeneratedFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  language: z.enum(['tsx', 'ts', 'vue', 'html', 'css', 'json']),
});

export const GenerationResultSchema = z.object({
  spec: ComponentSpecSchema,
  files: z.array(GeneratedFileSchema),
  usageExample: z.string(),
  storySnippet: z.string().optional(),
  propsDocumentation: z.string(),
  qualityScore: z.number().min(0).max(100),
  validationPassed: z.boolean(),
  validationErrors: z.array(z.string()).default([]),
  generationTimeMs: z.number(),
});

export type GeneratedFile = z.infer<typeof GeneratedFileSchema>;
export type GenerationResult = z.infer<typeof GenerationResultSchema>;

