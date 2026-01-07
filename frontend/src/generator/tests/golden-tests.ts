/**
 * Golden Tests
 * Test prompts with expected output properties for quality assurance
 */

export interface GoldenTest {
  id: string;
  prompt: string;
  expectedSpec: {
    componentType: string;
    minProps?: number;
    requiredProps?: string[];
    hasVariants?: boolean;
    isInteractive?: boolean;
  };
  expectedCode: {
    containsPatterns: string[];
    mustNotContain?: string[];
    minScore?: number;
  };
}

export const GOLDEN_TESTS: GoldenTest[] = [
  // ============ PRIMITIVE COMPONENTS ============
  {
    id: 'button-basic',
    prompt: 'Create a button component',
    expectedSpec: {
      componentType: 'button',
      requiredProps: ['children'],
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'interface.*Props',
        'export',
        'button',
        'onClick',
        'disabled',
      ],
      mustNotContain: ['#[0-9a-fA-F]{6}'], // No hardcoded colors
      minScore: 70,
    },
  },
  {
    id: 'button-variants',
    prompt: 'Create a button with primary, secondary, and outline variants plus loading state',
    expectedSpec: {
      componentType: 'button',
      hasVariants: true,
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'primary',
        'secondary',
        'outline',
        'loading',
        'disabled',
        'aria-',
      ],
      minScore: 75,
    },
  },
  {
    id: 'input-with-validation',
    prompt: 'Create an input field with label, error message, and helper text',
    expectedSpec: {
      componentType: 'input',
      requiredProps: ['error', 'label'],
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'input',
        'label',
        'error',
        'aria-invalid',
        'focus-visible',
      ],
      minScore: 70,
    },
  },
  {
    id: 'badge-component',
    prompt: 'Create a badge component for showing status',
    expectedSpec: {
      componentType: 'badge',
    },
    expectedCode: {
      containsPatterns: [
        'span',
        'badge',
        'variant',
      ],
      minScore: 65,
    },
  },
  {
    id: 'avatar-with-status',
    prompt: 'Create an avatar component with online/offline status indicator',
    expectedSpec: {
      componentType: 'avatar',
    },
    expectedCode: {
      containsPatterns: [
        'avatar',
        'status',
        'online',
        'fallback',
      ],
      minScore: 65,
    },
  },

  // ============ COMPOSITE COMPONENTS ============
  {
    id: 'card-basic',
    prompt: 'Create a card component with header, content, and footer',
    expectedSpec: {
      componentType: 'card',
    },
    expectedCode: {
      containsPatterns: [
        'Card',
        'Header',
        'Content',
        'Footer',
        'rounded',
        'shadow',
      ],
      minScore: 70,
    },
  },
  {
    id: 'pricing-card',
    prompt: 'Create a pricing card with plan name, price, features list, and CTA button',
    expectedSpec: {
      componentType: 'pricing',
      requiredProps: ['name', 'price', 'features'],
    },
    expectedCode: {
      containsPatterns: [
        'price',
        'features',
        'Button',
        'highlighted',
      ],
      minScore: 75,
    },
  },
  {
    id: 'testimonial-card',
    prompt: 'Create a testimonial card with quote, author name, role, and star rating',
    expectedSpec: {
      componentType: 'testimonial',
      requiredProps: ['quote', 'author'],
    },
    expectedCode: {
      containsPatterns: [
        'quote',
        'author',
        'rating',
        'Star',
      ],
      minScore: 70,
    },
  },
  {
    id: 'dashboard-metric',
    prompt: 'Create a dashboard metric card showing revenue with trend indicator',
    expectedSpec: {
      componentType: 'dashboard-card',
    },
    expectedCode: {
      containsPatterns: [
        'value',
        'trend',
        'TrendingUp',
        'change',
      ],
      minScore: 70,
    },
  },
  {
    id: 'feature-card',
    prompt: 'Create a feature card with icon, title, description, and learn more link',
    expectedSpec: {
      componentType: 'feature',
    },
    expectedCode: {
      containsPatterns: [
        'icon',
        'title',
        'description',
        'link',
      ],
      minScore: 65,
    },
  },

  // ============ FORMS ============
  {
    id: 'login-form',
    prompt: 'Create a login form with email, password, remember me checkbox, and submit button',
    expectedSpec: {
      componentType: 'login',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'email',
        'password',
        'checkbox',
        'submit',
        'form',
      ],
      minScore: 70,
    },
  },
  {
    id: 'contact-form',
    prompt: 'Create a contact form with name, email, message textarea, and send button',
    expectedSpec: {
      componentType: 'contact',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'name',
        'email',
        'message',
        'textarea',
        'Button',
      ],
      minScore: 70,
    },
  },
  {
    id: 'newsletter-signup',
    prompt: 'Create a newsletter signup with email input and subscribe button',
    expectedSpec: {
      componentType: 'newsletter',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'email',
        'subscribe',
        'Button',
      ],
      minScore: 65,
    },
  },

  // ============ NAVIGATION ============
  {
    id: 'navbar',
    prompt: 'Create a navigation bar with logo, links, and user menu',
    expectedSpec: {
      componentType: 'navbar',
    },
    expectedCode: {
      containsPatterns: [
        'nav',
        'logo',
        'link',
      ],
      minScore: 65,
    },
  },

  // ============ ACCESSIBILITY FOCUSED ============
  {
    id: 'accessible-modal',
    prompt: 'Create an accessible modal dialog with close button',
    expectedSpec: {
      componentType: 'modal',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'dialog',
        'role',
        'aria-label',
        'focus',
        'Escape',
      ],
      minScore: 75,
    },
  },
  {
    id: 'accessible-tabs',
    prompt: 'Create accessible tabs with keyboard navigation',
    expectedSpec: {
      componentType: 'tabs',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'tab',
        'role',
        'aria-selected',
        'keyboard',
      ],
      minScore: 75,
    },
  },

  // ============ DATA DISPLAY ============
  {
    id: 'data-table',
    prompt: 'Create a data table with sorting and pagination',
    expectedSpec: {
      componentType: 'table',
    },
    expectedCode: {
      containsPatterns: [
        'table',
        'thead',
        'tbody',
        'sort',
      ],
      minScore: 65,
    },
  },

  // ============ MARKETING ============
  {
    id: 'hero-section',
    prompt: 'Create a hero section with headline, description, and two CTAs',
    expectedSpec: {
      componentType: 'hero',
    },
    expectedCode: {
      containsPatterns: [
        'h1',
        'Button',
        'description',
      ],
      minScore: 65,
    },
  },
  {
    id: 'stats-section',
    prompt: 'Create a stats section showing 4 key metrics',
    expectedSpec: {
      componentType: 'stats',
    },
    expectedCode: {
      containsPatterns: [
        'stat',
        'value',
        'label',
      ],
      minScore: 65,
    },
  },
  {
    id: 'faq-accordion',
    prompt: 'Create an FAQ accordion with question/answer pairs',
    expectedSpec: {
      componentType: 'faq',
      isInteractive: true,
    },
    expectedCode: {
      containsPatterns: [
        'accordion',
        'question',
        'answer',
      ],
      minScore: 65,
    },
  },
];

/**
 * Run a single golden test
 */
export async function runGoldenTest(
  test: GoldenTest,
  generateFn: (prompt: string) => Promise<{ spec: any; files: any[]; qualityScore: number }>
): Promise<{
  passed: boolean;
  testId: string;
  errors: string[];
  score: number;
}> {
  const errors: string[] = [];
  
  try {
    const result = await generateFn(test.prompt);
    
    // Check spec expectations
    if (test.expectedSpec.componentType) {
      if (result.spec.componentType !== test.expectedSpec.componentType) {
        errors.push(`Expected componentType "${test.expectedSpec.componentType}", got "${result.spec.componentType}"`);
      }
    }
    
    if (test.expectedSpec.isInteractive !== undefined) {
      if (result.spec.isInteractive !== test.expectedSpec.isInteractive) {
        errors.push(`Expected isInteractive=${test.expectedSpec.isInteractive}`);
      }
    }
    
    // Check code patterns
    const allCode = result.files.map((f: any) => f.content).join('\n');
    
    for (const pattern of test.expectedCode.containsPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (!regex.test(allCode)) {
        errors.push(`Code should contain pattern: ${pattern}`);
      }
    }
    
    if (test.expectedCode.mustNotContain) {
      for (const pattern of test.expectedCode.mustNotContain) {
        const regex = new RegExp(pattern, 'i');
        if (regex.test(allCode)) {
          errors.push(`Code should NOT contain pattern: ${pattern}`);
        }
      }
    }
    
    // Check score
    if (test.expectedCode.minScore && result.qualityScore < test.expectedCode.minScore) {
      errors.push(`Score ${result.qualityScore} below minimum ${test.expectedCode.minScore}`);
    }
    
    return {
      passed: errors.length === 0,
      testId: test.id,
      errors,
      score: result.qualityScore,
    };
    
  } catch (error) {
    return {
      passed: false,
      testId: test.id,
      errors: [`Test failed with error: ${error instanceof Error ? error.message : 'Unknown'}`],
      score: 0,
    };
  }
}

/**
 * Run all golden tests
 */
export async function runAllGoldenTests(
  generateFn: (prompt: string) => Promise<{ spec: any; files: any[]; qualityScore: number }>
): Promise<{
  passed: number;
  failed: number;
  total: number;
  results: Array<{ testId: string; passed: boolean; errors: string[]; score: number }>;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;
  
  for (const test of GOLDEN_TESTS) {
    const result = await runGoldenTest(test, generateFn);
    results.push(result);
    if (result.passed) passed++;
    else failed++;
  }
  
  return {
    passed,
    failed,
    total: GOLDEN_TESTS.length,
    results,
  };
}

