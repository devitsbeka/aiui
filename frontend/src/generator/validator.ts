/**
 * Stage 3: Validator + Auto-Fix
 * Validates generated code and automatically fixes common issues
 */

import type { ComponentSpec, GeneratedFile } from './schema.js';

// ============================================================
// VALIDATION RULES
// ============================================================

export interface ValidationRule {
  id: string;
  name: string;
  category: 'types' | 'a11y' | 'style' | 'quality';
  severity: 'error' | 'warning';
  check: (code: string, spec: ComponentSpec) => ValidationResult;
  fix?: (code: string, spec: ComponentSpec) => string;
}

export interface ValidationResult {
  passed: boolean;
  message?: string;
  line?: number;
}

export interface ValidationReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  fixesApplied: string[];
}

// ============================================================
// VALIDATION RULES IMPLEMENTATION
// ============================================================

const VALIDATION_RULES: ValidationRule[] = [
  // === TYPE RULES ===
  {
    id: 'has-typescript-props',
    name: 'Component has TypeScript props interface',
    category: 'types',
    severity: 'error',
    check: (code) => {
      const hasInterface = /interface\s+\w+Props/.test(code);
      const hasType = /type\s+\w+Props\s*=/.test(code);
      return {
        passed: hasInterface || hasType,
        message: hasInterface || hasType ? undefined : 'Missing TypeScript props interface',
      };
    },
    fix: (code, spec) => {
      if (/interface\s+\w+Props/.test(code) || /type\s+\w+Props\s*=/.test(code)) {
        return code;
      }
      // Insert a basic props interface after imports
      const propsInterface = `\nexport interface ${spec.name}Props extends React.HTMLAttributes<HTMLDivElement> {\n  className?: string;\n}\n`;
      const importEnd = code.lastIndexOf('import');
      const lineEnd = code.indexOf('\n', importEnd);
      if (lineEnd !== -1) {
        return code.slice(0, lineEnd + 1) + propsInterface + code.slice(lineEnd + 1);
      }
      return propsInterface + code;
    },
  },
  {
    id: 'exports-component',
    name: 'Component is properly exported',
    category: 'types',
    severity: 'error',
    check: (code) => {
      const hasExport = /export\s+(function|const|default)/.test(code);
      return {
        passed: hasExport,
        message: hasExport ? undefined : 'Component is not exported',
      };
    },
  },

  // === ACCESSIBILITY RULES ===
  {
    id: 'has-focus-ring',
    name: 'Interactive elements have focus ring',
    category: 'a11y',
    severity: 'error',
    check: (code, spec) => {
      if (!spec.isInteractive) return { passed: true };
      const hasFocusVisible = /focus-visible:|focus:ring|focus:outline/.test(code);
      return {
        passed: hasFocusVisible,
        message: hasFocusVisible ? undefined : 'Missing focus ring styles for interactive element',
      };
    },
    fix: (code, spec) => {
      if (!spec.isInteractive) return code;
      if (/focus-visible:|focus:ring/.test(code)) return code;
      // Add focus ring to className strings
      return code.replace(
        /(className\s*=\s*{?\s*cn\s*\([^)]*?["'])/g,
        '$1focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 '
      );
    },
  },
  {
    id: 'has-aria-labels',
    name: 'Interactive elements have aria labels',
    category: 'a11y',
    severity: 'warning',
    check: (code, spec) => {
      if (!spec.isInteractive) return { passed: true };
      // Check for aria-label, aria-labelledby, or accessible text content
      const hasAria = /aria-label|aria-labelledby|aria-describedby/.test(code);
      const hasAccessibleButton = /<button[^>]*>.*\{.*children.*\}.*<\/button>/s.test(code);
      return {
        passed: hasAria || hasAccessibleButton,
        message: hasAria || hasAccessibleButton ? undefined : 'Consider adding aria-label for accessibility',
      };
    },
  },
  {
    id: 'has-reduced-motion',
    name: 'Animations respect reduced-motion',
    category: 'a11y',
    severity: 'warning',
    check: (code) => {
      const hasAnimation = /animate-|transition-|@keyframes/.test(code);
      if (!hasAnimation) return { passed: true };
      
      const hasReducedMotion = /motion-reduce|prefers-reduced-motion/.test(code);
      return {
        passed: hasReducedMotion,
        message: hasReducedMotion ? undefined : 'Animations should respect prefers-reduced-motion',
      };
    },
    fix: (code) => {
      if (/motion-reduce|prefers-reduced-motion/.test(code)) return code;
      if (!/animate-|transition-/.test(code)) return code;
      
      // Add motion-reduce variant to transition/animate classes
      return code.replace(
        /(\btransition-\w+)/g,
        '$1 motion-reduce:transition-none'
      ).replace(
        /(\banimate-\w+)/g,
        '$1 motion-reduce:animate-none'
      );
    },
  },
  {
    id: 'disabled-state-accessible',
    name: 'Disabled state is accessible',
    category: 'a11y',
    severity: 'error',
    check: (code, spec) => {
      if (!spec.states.includes('disabled')) return { passed: true };
      const hasDisabledProp = /disabled/.test(code);
      const hasAriaDisabled = /aria-disabled/.test(code);
      return {
        passed: hasDisabledProp || hasAriaDisabled,
        message: hasDisabledProp || hasAriaDisabled ? undefined : 'Disabled state should use disabled prop or aria-disabled',
      };
    },
  },

  // === STYLE RULES ===
  {
    id: 'no-hardcoded-colors',
    name: 'No hardcoded hex colors',
    category: 'style',
    severity: 'warning',
    check: (code) => {
      // Match hex colors that aren't inside comments
      const hexPattern = /(?<!\/\/.*)(#[0-9A-Fa-f]{3,8})(?![^"]*["'])/;
      const match = code.match(hexPattern);
      // Allow some common exceptions like #fff, #000
      if (match && !['#fff', '#000', '#ffffff', '#000000'].includes(match[1].toLowerCase())) {
        return {
          passed: false,
          message: `Hardcoded color found: ${match[1]}. Use CSS variables or Tailwind tokens instead.`,
        };
      }
      return { passed: true };
    },
  },
  {
    id: 'uses-consistent-spacing',
    name: 'Uses consistent spacing scale',
    category: 'style',
    severity: 'warning',
    check: (code) => {
      // Check for arbitrary pixel values in padding/margin
      const arbitraryPx = /(?:p|m)[xytblr]?-\[(\d+)px\]/.exec(code);
      if (arbitraryPx) {
        const value = parseInt(arbitraryPx[1]);
        // Allow multiples of 4 (Tailwind spacing scale)
        if (value % 4 !== 0) {
          return {
            passed: false,
            message: `Non-standard spacing: ${value}px. Use Tailwind spacing scale (multiples of 4).`,
          };
        }
      }
      return { passed: true };
    },
  },
  {
    id: 'uses-semantic-colors',
    name: 'Uses semantic color tokens',
    category: 'style',
    severity: 'warning',
    check: (code) => {
      // Check for usage of semantic colors
      const semanticColors = ['primary', 'secondary', 'muted', 'accent', 'destructive', 'foreground', 'background', 'card', 'border'];
      const usesSemanticColor = semanticColors.some(color => code.includes(color));
      
      // If using colors at all, should use semantic ones
      const usesAnyColor = /text-|bg-|border-/.test(code);
      if (!usesAnyColor) return { passed: true };
      
      return {
        passed: usesSemanticColor,
        message: usesSemanticColor ? undefined : 'Consider using semantic color tokens (primary, muted, etc.)',
      };
    },
  },

  // === QUALITY RULES ===
  {
    id: 'no-unused-imports',
    name: 'No unused imports',
    category: 'quality',
    severity: 'warning',
    check: (code) => {
      const importMatches = code.matchAll(/import\s*{\s*([^}]+)\s*}\s*from/g);
      const unusedImports: string[] = [];
      
      for (const match of importMatches) {
        const imports = match[1].split(',').map(s => s.trim().split(' as ')[0].trim());
        for (const imp of imports) {
          if (!imp || imp === 'type') continue;
          // Check if the import is used after the import statements
          const afterImports = code.slice(code.lastIndexOf('import'));
          const usePattern = new RegExp(`\\b${imp}\\b`, 'g');
          const occurrences = (afterImports.match(usePattern) || []).length;
          // Should appear more than once (the import itself)
          if (occurrences <= 1) {
            unusedImports.push(imp);
          }
        }
      }
      
      return {
        passed: unusedImports.length === 0,
        message: unusedImports.length > 0 ? `Potentially unused imports: ${unusedImports.join(', ')}` : undefined,
      };
    },
  },
  {
    id: 'uses-cn-utility',
    name: 'Uses cn() utility for className merging',
    category: 'quality',
    severity: 'warning',
    check: (code) => {
      const hasMultipleClassNames = /className\s*=\s*\{[^}]*\+[^}]*\}/.test(code);
      const usesClsx = /clsx|cn\(/.test(code);
      
      if (!hasMultipleClassNames) return { passed: true };
      
      return {
        passed: usesClsx,
        message: usesClsx ? undefined : 'Use cn() utility for merging classNames instead of string concatenation',
      };
    },
  },
  {
    id: 'component-has-display-name',
    name: 'Component has displayName (for forwardRef)',
    category: 'quality',
    severity: 'warning',
    check: (code) => {
      const usesForwardRef = /forwardRef/.test(code);
      if (!usesForwardRef) return { passed: true };
      
      const hasDisplayName = /\.displayName\s*=/.test(code);
      return {
        passed: hasDisplayName,
        message: hasDisplayName ? undefined : 'forwardRef components should have displayName',
      };
    },
    fix: (code, spec) => {
      if (!(/forwardRef/.test(code))) return code;
      if (/\.displayName\s*=/.test(code)) return code;
      
      // Add displayName after the component
      const componentName = spec.name;
      return code.replace(
        new RegExp(`(const ${componentName}[^;]+;)`),
        `$1\n${componentName}.displayName = "${componentName}";`
      );
    },
  },
];

// ============================================================
// VALIDATOR CLASS
// ============================================================

export class CodeValidator {
  private rules: ValidationRule[] = VALIDATION_RULES;
  private maxPasses = 2;

  /**
   * Validate generated code and optionally auto-fix
   */
  validate(
    files: GeneratedFile[],
    spec: ComponentSpec,
    autoFix = true
  ): { files: GeneratedFile[]; report: ValidationReport } {
    let currentFiles = [...files];
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    const fixesApplied: string[] = [];
    let passCount = 0;

    // Run validation passes
    while (passCount < this.maxPasses) {
      passCount++;
      let anyFixes = false;

      for (let i = 0; i < currentFiles.length; i++) {
        const file = currentFiles[i];
        
        // Only validate TypeScript/TSX files
        if (!['tsx', 'ts'].includes(file.language)) continue;

        for (const rule of this.rules) {
          const result = rule.check(file.content, spec);

          if (!result.passed) {
            const message = `[${rule.id}] ${result.message || rule.name}`;

            if (rule.severity === 'error') {
              allErrors.push(message);
            } else {
              allWarnings.push(message);
            }

            // Try to auto-fix
            if (autoFix && rule.fix && passCount < this.maxPasses) {
              const fixedContent = rule.fix(file.content, spec);
              if (fixedContent !== file.content) {
                currentFiles[i] = { ...file, content: fixedContent };
                fixesApplied.push(rule.id);
                anyFixes = true;
              }
            }
          }
        }
      }

      // If no fixes were applied, stop
      if (!anyFixes) break;
    }

    // Calculate score
    const totalRules = this.rules.length * files.filter(f => ['tsx', 'ts'].includes(f.language)).length;
    const failedRules = allErrors.length + allWarnings.length * 0.5;
    const score = Math.max(0, Math.round(((totalRules - failedRules) / totalRules) * 100));

    return {
      files: currentFiles,
      report: {
        passed: allErrors.length === 0,
        errors: [...new Set(allErrors)],
        warnings: [...new Set(allWarnings)],
        score,
        fixesApplied: [...new Set(fixesApplied)],
      },
    };
  }

  /**
   * Validate a single code string
   */
  validateCode(code: string, spec: ComponentSpec): ValidationResult[] {
    return this.rules.map(rule => ({
      ...rule.check(code, spec),
      ruleId: rule.id,
      ruleName: rule.name,
    }));
  }
}

// Export singleton
export const validator = new CodeValidator();

