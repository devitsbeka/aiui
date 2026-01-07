/**
 * Output Target Configurations
 * Defines how to generate code for different frameworks/stacks
 */

import type { OutputTarget } from './schema.js';

// ============================================================
// TARGET CONFIGURATION
// ============================================================

export interface TargetConfig {
  id: OutputTarget;
  name: string;
  description: string;
  fileExtension: 'tsx' | 'vue' | 'html' | 'ts';
  cssApproach: 'tailwind' | 'css-modules' | 'inline';
  componentLibrary?: 'shadcn' | 'none';
  imports: string[];
  utilities: string[];
  wrapperTemplate: string;
  propsTemplate: string;
}

// ============================================================
// TARGET DEFINITIONS
// ============================================================

export const TARGET_CONFIGS: Record<OutputTarget, TargetConfig> = {
  'react-tailwind': {
    id: 'react-tailwind',
    name: 'React + Tailwind',
    description: 'React components with Tailwind CSS',
    fileExtension: 'tsx',
    cssApproach: 'tailwind',
    imports: [
      'import * as React from "react";',
    ],
    utilities: [
      `// Utility for merging classNames
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}`,
    ],
    wrapperTemplate: `import * as React from "react";

{{utilities}}

{{propsInterface}}

{{component}}

export { {{componentName}} };`,
    propsTemplate: `export interface {{componentName}}Props extends React.HTMLAttributes<HTMLDivElement> {
  {{props}}
}`,
  },

  'react-tailwind-shadcn': {
    id: 'react-tailwind-shadcn',
    name: 'React + Tailwind + shadcn/ui',
    description: 'React components using shadcn/ui primitives and patterns',
    fileExtension: 'tsx',
    cssApproach: 'tailwind',
    componentLibrary: 'shadcn',
    imports: [
      'import * as React from "react";',
      'import { cva, type VariantProps } from "class-variance-authority";',
      'import { cn } from "@/lib/utils";',
    ],
    utilities: [],
    wrapperTemplate: `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
{{additionalImports}}

{{variants}}

{{propsInterface}}

{{component}}

export { {{componentName}}, {{componentNameLower}}Variants };`,
    propsTemplate: `export interface {{componentName}}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof {{componentNameLower}}Variants> {
  {{props}}
}`,
  },

  'vue-tailwind': {
    id: 'vue-tailwind',
    name: 'Vue + Tailwind',
    description: 'Vue 3 components with Tailwind CSS (Composition API)',
    fileExtension: 'vue',
    cssApproach: 'tailwind',
    imports: [],
    utilities: [],
    wrapperTemplate: `<script setup lang="ts">
{{propsInterface}}
</script>

<template>
{{template}}
</template>`,
    propsTemplate: `interface Props {
  {{props}}
}

const props = withDefaults(defineProps<Props>(), {
  {{defaults}}
});`,
  },

  'html-tailwind': {
    id: 'html-tailwind',
    name: 'HTML + Tailwind',
    description: 'Plain HTML with Tailwind CSS classes',
    fileExtension: 'html',
    cssApproach: 'tailwind',
    imports: [],
    utilities: [],
    wrapperTemplate: `<!-- {{componentName}} Component -->
<!-- Usage: Copy this HTML and customize as needed -->

{{component}}

<!-- Variants -->
{{variants}}`,
    propsTemplate: '',
  },

  'react-css-modules': {
    id: 'react-css-modules',
    name: 'React + CSS Modules',
    description: 'React components with CSS Modules for styling',
    fileExtension: 'tsx',
    cssApproach: 'css-modules',
    imports: [
      'import * as React from "react";',
      'import styles from "./{{componentName}}.module.css";',
    ],
    utilities: [
      `// Utility for merging classNames
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}`,
    ],
    wrapperTemplate: `import * as React from "react";
import styles from "./{{componentName}}.module.css";

{{utilities}}

{{propsInterface}}

{{component}}

export { {{componentName}} };`,
    propsTemplate: `export interface {{componentName}}Props extends React.HTMLAttributes<HTMLDivElement> {
  {{props}}
}`,
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get the target configuration for a spec
 */
export function getTargetConfig(target: OutputTarget): TargetConfig {
  return TARGET_CONFIGS[target];
}

/**
 * Generate import statements for a target
 */
export function generateImports(target: OutputTarget, additionalImports: string[] = []): string {
  const config = TARGET_CONFIGS[target];
  return [...config.imports, ...additionalImports].join('\n');
}

/**
 * Generate the file path for a component
 */
export function generateFilePath(componentName: string, target: OutputTarget): string {
  const config = TARGET_CONFIGS[target];
  const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  return `components/ui/${kebabName}.${config.fileExtension}`;
}

/**
 * Generate additional files needed (e.g., CSS modules)
 */
export function generateAdditionalFiles(
  componentName: string,
  target: OutputTarget,
  styles?: string
): Array<{ path: string; content: string; language: 'css' | 'ts' }> {
  const files: Array<{ path: string; content: string; language: 'css' | 'ts' }> = [];
  const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

  if (target === 'react-css-modules' && styles) {
    files.push({
      path: `components/ui/${kebabName}.module.css`,
      content: styles,
      language: 'css',
    });
  }

  return files;
}

/**
 * Determine best target based on existing project structure
 */
export function detectBestTarget(_hasPackageJson: boolean = true): OutputTarget {
  // Default to shadcn for React projects
  // In a real implementation, this would check package.json
  return 'react-tailwind-shadcn';
}

// ============================================================
// LUCIDE ICON IMPORTS
// ============================================================

export const COMMON_ICONS = [
  'AlertCircle', 'ArrowRight', 'Check', 'ChevronDown', 'ChevronRight',
  'Loader2', 'Mail', 'Menu', 'Moon', 'Search', 'Settings', 'Star',
  'Sun', 'TrendingDown', 'TrendingUp', 'User', 'X',
] as const;

export function generateIconImport(icons: string[]): string {
  if (icons.length === 0) return '';
  return `import { ${icons.join(', ')} } from "lucide-react";`;
}

