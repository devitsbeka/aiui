/**
 * Quality Scoring System
 * Evaluates generated components against quality criteria
 */

import type { ComponentSpec, GeneratedFile } from './schema.js';

// ============================================================
// SCORING CRITERIA
// ============================================================

export interface ScoringCriteria {
  id: string;
  name: string;
  weight: number;
  evaluate: (code: string, spec: ComponentSpec) => number; // Returns 0-100
}

export interface ScoreBreakdown {
  total: number;
  criteria: Record<string, {
    score: number;
    weight: number;
    weighted: number;
  }>;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  suggestions: string[];
}

// ============================================================
// CRITERIA DEFINITIONS
// ============================================================

const SCORING_CRITERIA: ScoringCriteria[] = [
  {
    id: 'aesthetics',
    name: 'Aesthetics Consistency',
    weight: 0.20,
    evaluate: (code, _spec) => {
      let score = 0;
      
      // Check for consistent spacing tokens
      const usesSpacingTokens = /p-[2-8]|m-[2-8]|gap-[2-6]/.test(code);
      if (usesSpacingTokens) score += 25;
      
      // Check for consistent typography
      const usesTypography = /text-sm|text-base|text-lg|text-xl|font-medium|font-semibold/.test(code);
      if (usesTypography) score += 25;
      
      // Check for semantic colors
      const usesSemanticColors = /primary|secondary|muted|foreground|background/.test(code);
      if (usesSemanticColors) score += 25;
      
      // Check for rounded corners
      const usesRadius = /rounded-md|rounded-lg|rounded-xl/.test(code);
      if (usesRadius) score += 25;
      
      return score;
    },
  },
  {
    id: 'accessibility',
    name: 'Accessibility Coverage',
    weight: 0.25,
    evaluate: (code, spec) => {
      let score = 0;
      
      // Aria labels
      if (code.includes('aria-')) score += 20;
      
      // Focus states
      if (code.includes('focus-visible') || code.includes('focus:ring')) score += 20;
      
      // Semantic HTML
      const semanticTags = ['button', 'article', 'nav', 'main', 'aside', 'figure', 'section'];
      if (semanticTags.some(tag => code.includes(`<${tag}`))) score += 20;
      
      // Keyboard support
      if (code.includes('onKeyDown') || code.includes('onKeyUp') || !spec.isInteractive) score += 20;
      
      // Reduced motion
      if (code.includes('motion-reduce') || code.includes('prefers-reduced-motion') || !code.includes('animate-')) score += 20;
      
      return score;
    },
  },
  {
    id: 'variants',
    name: 'Variant Completeness',
    weight: 0.15,
    evaluate: (code, spec) => {
      let score = 0;
      const totalVariants = spec.sizes.length + spec.intents.length;
      let foundVariants = 0;
      
      // Check sizes
      for (const size of spec.sizes) {
        if (code.includes(`"${size}"`) || code.includes(`'${size}'`) || code.includes(`: "${size}"`)) {
          foundVariants++;
        }
      }
      
      // Check intents
      for (const intent of spec.intents) {
        if (code.includes(`"${intent}"`) || code.includes(`'${intent}'`) || code.includes(`: "${intent}"`)) {
          foundVariants++;
        }
      }
      
      score = Math.round((foundVariants / totalVariants) * 100);
      return score;
    },
  },
  {
    id: 'types',
    name: 'TypeScript Quality',
    weight: 0.15,
    evaluate: (code, _spec) => {
      let score = 0;
      
      // Has props interface
      if (/interface\s+\w+Props|type\s+\w+Props/.test(code)) score += 35;
      
      // Uses generics where appropriate
      if (code.includes('forwardRef<')) score += 15;
      
      // Has displayName
      if (code.includes('.displayName')) score += 15;
      
      // Has proper exports
      if (/export\s+(function|const|interface|type)/.test(code)) score += 20;
      
      // Uses VariantProps for CVA
      if (code.includes('VariantProps<') || !code.includes('cva')) score += 15;
      
      return score;
    },
  },
  {
    id: 'composability',
    name: 'Composability',
    weight: 0.15,
    evaluate: (code, _spec) => {
      let score = 0;
      
      // Accepts className prop
      if (code.includes('className')) score += 25;
      
      // Uses cn() or clsx for merging
      if (code.includes('cn(') || code.includes('clsx(')) score += 25;
      
      // Has children prop
      if (code.includes('children')) score += 25;
      
      // Uses rest props spread
      if (code.includes('...props') || code.includes('{...')) score += 25;
      
      return score;
    },
  },
  {
    id: 'states',
    name: 'State Handling',
    weight: 0.10,
    evaluate: (code, spec) => {
      let score = 100;
      const requiredStates = [];
      
      if (spec.hasLoadingState && !code.includes('loading')) {
        requiredStates.push('loading');
        score -= 33;
      }
      
      if (spec.hasErrorState && !code.includes('error')) {
        requiredStates.push('error');
        score -= 33;
      }
      
      if (spec.hasEmptyState && !code.includes('empty')) {
        requiredStates.push('empty');
        score -= 34;
      }
      
      // Bonus for disabled state handling
      if (spec.isInteractive && code.includes('disabled')) score = Math.min(100, score + 10);
      
      return Math.max(0, score);
    },
  },
];

// ============================================================
// SCORING FUNCTION
// ============================================================

export function calculateScore(
  files: GeneratedFile[],
  spec: ComponentSpec
): ScoreBreakdown {
  const code = files.map(f => f.content).join('\n');
  const criteriaScores: ScoreBreakdown['criteria'] = {};
  let totalWeightedScore = 0;
  const suggestions: string[] = [];

  for (const criterion of SCORING_CRITERIA) {
    const rawScore = criterion.evaluate(code, spec);
    const weightedScore = rawScore * criterion.weight;
    
    criteriaScores[criterion.id] = {
      score: rawScore,
      weight: criterion.weight,
      weighted: weightedScore,
    };
    
    totalWeightedScore += weightedScore;

    // Generate suggestions for low scores
    if (rawScore < 60) {
      suggestions.push(getSuggestion(criterion.id, rawScore, spec));
    }
  }

  const total = Math.round(totalWeightedScore);
  const grade = getGrade(total);

  return {
    total,
    criteria: criteriaScores,
    grade,
    suggestions: suggestions.filter(Boolean),
  };
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getSuggestion(criterionId: string, _score: number, spec: ComponentSpec): string {
  const suggestions: Record<string, string> = {
    aesthetics: 'Use consistent spacing (p-4, gap-3) and semantic color tokens (text-foreground, bg-card).',
    accessibility: `Add aria-label to interactive elements and focus-visible:ring-2 for focus states.`,
    variants: `Include all size variants (${spec.sizes.join(', ')}) and intent variants (${spec.intents.join(', ')}).`,
    types: 'Add TypeScript interface for props and use forwardRef with displayName.',
    composability: 'Accept className prop and use cn() utility for class merging.',
    states: `Implement required states: ${[spec.hasLoadingState && 'loading', spec.hasErrorState && 'error', spec.hasEmptyState && 'empty'].filter(Boolean).join(', ')}.`,
  };
  
  return suggestions[criterionId] || '';
}

// ============================================================
// QUICK SCORE (Lightweight version)
// ============================================================

export function quickScore(code: string): number {
  let score = 50; // Base score
  
  // Positive signals
  if (code.includes('interface') || code.includes('type Props')) score += 10;
  if (code.includes('aria-')) score += 10;
  if (code.includes('focus-visible')) score += 10;
  if (code.includes('cn(')) score += 5;
  if (code.includes('forwardRef')) score += 5;
  if (/primary|secondary|muted/.test(code)) score += 5;
  if (/rounded-md|rounded-lg/.test(code)) score += 5;
  
  // Negative signals
  if (code.includes('#') && !/--\w/.test(code)) score -= 10; // Hardcoded colors
  if (code.includes('style=')) score -= 5; // Inline styles
  if (!code.includes('export')) score -= 10; // No export
  
  return Math.min(100, Math.max(0, score));
}

