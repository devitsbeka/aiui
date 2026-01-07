/**
 * Stage 0: Normalize User Intent
 * Converts unstructured user prompts into structured ComponentSpec
 */

import { 
  ComponentSpec, 
  ComponentSpecSchema,
  ComponentType,
  LayoutType,
  ToneType,
  PropDefinition,
  AccessibilityChecklist,
} from './schema.js';

// ============================================================
// INTENT DETECTION PATTERNS
// ============================================================

const COMPONENT_PATTERNS: Record<ComponentType, RegExp[]> = {
  // Primitives
  button: [/\bbutton\b/i, /\bcta\b/i, /\bclick\b/i, /\bsubmit\b/i],
  input: [/\binput\b/i, /\btext\s*field\b/i, /\btext\s*box\b/i],
  badge: [/\bbadge\b/i, /\btag\b/i, /\blabel\b/i, /\bchip\b/i],
  avatar: [/\bavatar\b/i, /\bprofile\s*(pic|image|photo)\b/i, /\buser\s*image\b/i],
  icon: [/\bicon\b/i],
  text: [/\btext\b/i, /\bparagraph\b/i, /\bheading\b/i, /\btitle\b/i],
  link: [/\blink\b/i, /\banchor\b/i, /\bhyperlink\b/i],
  image: [/\bimage\b/i, /\bphoto\b/i, /\bpicture\b/i, /\bthumbnail\b/i],
  divider: [/\bdivider\b/i, /\bseparator\b/i, /\bhr\b/i],
  checkbox: [/\bcheckbox\b/i, /\bcheck\s*box\b/i],
  radio: [/\bradio\b/i, /\bradio\s*button\b/i],
  switch: [/\bswitch\b/i, /\btoggle\b/i],
  slider: [/\bslider\b/i, /\brange\b/i],
  select: [/\bselect\b/i, /\bdropdown\b/i, /\bcombobox\b/i],
  textarea: [/\btextarea\b/i, /\bmulti\s*line\b/i],

  // Composites
  card: [/\bcard\b/i, /\btile\b/i, /\bpanel\b/i],
  modal: [/\bmodal\b/i, /\bpopup\b/i, /\boverlay\b/i],
  dialog: [/\bdialog\b/i, /\bconfirm\b/i, /\balert\s*dialog\b/i],
  toast: [/\btoast\b/i, /\bsnackbar\b/i, /\bnotification\b/i],
  alert: [/\balert\b/i, /\bwarning\s*box\b/i, /\bmessage\s*box\b/i],
  tooltip: [/\btooltip\b/i, /\bhover\s*tip\b/i],
  popover: [/\bpopover\b/i],
  navbar: [/\bnav\s*bar\b/i, /\bnavigation\b/i, /\bheader\s*nav\b/i, /\btop\s*bar\b/i],
  sidebar: [/\bsidebar\b/i, /\bside\s*menu\b/i, /\bside\s*nav\b/i],
  footer: [/\bfooter\b/i],
  header: [/\bheader\b/i, /\bpage\s*header\b/i],
  breadcrumb: [/\bbreadcrumb\b/i],
  pagination: [/\bpagination\b/i, /\bpager\b/i],
  tabs: [/\btabs\b/i, /\btab\s*bar\b/i, /\btab\s*panel\b/i],
  accordion: [/\baccordion\b/i, /\bcollapsible\b/i, /\bexpandable\b/i],
  dropdown: [/\bdropdown\b/i, /\bdrop\s*down\b/i],
  menu: [/\bmenu\b/i, /\bcontext\s*menu\b/i],

  // Data Display
  table: [/\btable\b/i, /\bdata\s*grid\b/i, /\bdata\s*table\b/i],
  list: [/\blist\b/i, /\blist\s*view\b/i],
  grid: [/\bgrid\b/i, /\bgallery\b/i, /\bmasonry\b/i],
  carousel: [/\bcarousel\b/i, /\bslideshow\b/i, /\bslider\b/i],
  gallery: [/\bgallery\b/i, /\bphoto\s*gallery\b/i],
  timeline: [/\btimeline\b/i, /\bhistory\b/i],

  // Marketing
  pricing: [/\bpricing\b/i, /\bprice\s*card\b/i, /\bplan\b/i, /\bsubscription\b/i],
  testimonial: [/\btestimonial\b/i, /\breview\b/i, /\bquote\b/i],
  feature: [/\bfeature\b/i, /\bfeature\s*card\b/i, /\bbenefit\b/i],
  hero: [/\bhero\b/i, /\bbanner\b/i, /\blanding\b/i],
  cta: [/\bcta\b/i, /\bcall\s*to\s*action\b/i],
  stats: [/\bstat\b/i, /\bmetric\b/i, /\bkpi\b/i, /\bnumber\s*card\b/i],
  faq: [/\bfaq\b/i, /\bquestion\b/i],

  // Forms
  form: [/\bform\b/i],
  search: [/\bsearch\b/i, /\bsearch\s*bar\b/i],
  login: [/\blogin\b/i, /\bsign\s*in\b/i],
  signup: [/\bsignup\b/i, /\bsign\s*up\b/i, /\bregister\b/i],
  contact: [/\bcontact\b/i, /\bcontact\s*form\b/i],
  newsletter: [/\bnewsletter\b/i, /\bsubscribe\b/i, /\bemail\s*signup\b/i],

  // Dashboard
  'dashboard-card': [/\bdashboard\s*card\b/i, /\bwidget\b/i],
  metric: [/\bmetric\b/i, /\bkpi\b/i, /\bstat\s*card\b/i],
  'chart-container': [/\bchart\b/i, /\bgraph\b/i],
  progress: [/\bprogress\b/i, /\bprogress\s*bar\b/i],
  status: [/\bstatus\b/i, /\bstatus\s*indicator\b/i],
};

const LAYOUT_PATTERNS: Record<LayoutType, RegExp[]> = {
  stack: [/\bstack\b/i, /\bvertical\b/i, /\bcolumn\b/i],
  row: [/\brow\b/i, /\bhorizontal\b/i, /\binline\b/i],
  grid: [/\bgrid\b/i, /\bcards?\s*grid\b/i, /\b\d+\s*col/i],
  flex: [/\bflex\b/i, /\bflexbox\b/i, /\bresponsive\b/i],
  absolute: [/\babsolute\b/i, /\boverlay\b/i, /\bfloating\b/i],
};

const TONE_PATTERNS: Record<ToneType, RegExp[]> = {
  neutral: [/\bneutral\b/i, /\bclean\b/i, /\bsimple\b/i],
  bold: [/\bbold\b/i, /\bvibrant\b/i, /\bstrong\b/i, /\bimpactful\b/i],
  playful: [/\bplayful\b/i, /\bfun\b/i, /\bcolorful\b/i, /\bfriendly\b/i],
  minimal: [/\bminimal\b/i, /\bminimalist\b/i, /\bsubtl/i],
  corporate: [/\bcorporate\b/i, /\bprofessional\b/i, /\bbusiness\b/i, /\benterprise\b/i],
  luxurious: [/\bluxur/i, /\belegant\b/i, /\bpremium\b/i, /\bhigh\s*end\b/i],
};

const INTERACTIVE_TYPES: ComponentType[] = [
  'button', 'input', 'checkbox', 'radio', 'switch', 'slider', 'select',
  'textarea', 'modal', 'dialog', 'tabs', 'accordion', 'dropdown', 'menu',
  'form', 'search', 'login', 'signup', 'contact', 'newsletter',
];

const COMPOSITE_TYPES: ComponentType[] = [
  'card', 'modal', 'dialog', 'navbar', 'sidebar', 'footer', 'header',
  'tabs', 'accordion', 'pricing', 'testimonial', 'feature', 'hero',
  'form', 'login', 'signup', 'contact', 'dashboard-card',
];

// ============================================================
// NORMALIZER CLASS
// ============================================================

export class IntentNormalizer {
  /**
   * Convert raw user prompt into structured ComponentSpec
   */
  normalize(userPrompt: string, options: Partial<ComponentSpec> = {}): ComponentSpec {
    const componentType = this.detectComponentType(userPrompt);
    const layout = this.detectLayout(userPrompt, componentType);
    const tone = this.detectTone(userPrompt);
    const isInteractive = INTERACTIVE_TYPES.includes(componentType);
    const isComposite = COMPOSITE_TYPES.includes(componentType);

    const spec: ComponentSpec = {
      name: this.generateComponentName(componentType, userPrompt),
      componentType,
      description: this.generateDescription(userPrompt, componentType),
      layout,
      isComposite,
      children: isComposite ? this.inferChildren(componentType) : undefined,
      tone,
      sizes: this.inferSizes(componentType),
      intents: this.inferIntents(componentType),
      states: this.inferStates(componentType, isInteractive),
      hasLoadingState: this.needsLoadingState(componentType, userPrompt),
      hasErrorState: this.needsErrorState(componentType, userPrompt),
      hasEmptyState: this.needsEmptyState(componentType, userPrompt),
      props: this.inferProps(componentType, userPrompt),
      accessibility: this.buildAccessibilityChecklist(componentType, isInteractive),
      isInteractive,
      outputTarget: options.outputTarget ?? 'react-tailwind-shadcn',
      includeStory: options.includeStory ?? true,
      includeDemo: options.includeDemo ?? true,
      dataShape: this.inferDataShape(componentType, userPrompt),
      userPrompt,
      ...options, // Allow overrides
    };

    // Validate and return
    return ComponentSpecSchema.parse(spec);
  }

  private detectComponentType(prompt: string): ComponentType {
    // Score each type by pattern matches
    const scores: Record<string, number> = {};

    for (const [type, patterns] of Object.entries(COMPONENT_PATTERNS)) {
      scores[type] = patterns.reduce((score, pattern) => {
        return score + (pattern.test(prompt) ? 1 : 0);
      }, 0);
    }

    // Find highest scoring type
    const entries = Object.entries(scores).filter(([, score]) => score > 0);
    if (entries.length === 0) {
      return 'card'; // Default fallback
    }

    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0] as ComponentType;
  }

  private detectLayout(prompt: string, componentType: ComponentType): LayoutType {
    for (const [layout, patterns] of Object.entries(LAYOUT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          return layout as LayoutType;
        }
      }
    }

    // Defaults based on component type
    const gridTypes: ComponentType[] = ['gallery', 'grid', 'pricing'];
    const rowTypes: ComponentType[] = ['navbar', 'breadcrumb', 'tabs', 'pagination'];
    
    if (gridTypes.includes(componentType)) return 'grid';
    if (rowTypes.includes(componentType)) return 'row';
    return 'stack';
  }

  private detectTone(prompt: string): ToneType {
    for (const [tone, patterns] of Object.entries(TONE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(prompt)) {
          return tone as ToneType;
        }
      }
    }
    return 'neutral';
  }

  private generateComponentName(type: ComponentType, prompt: string): string {
    // Extract a descriptive word from prompt if possible
    const descriptors = prompt.match(/\b(primary|secondary|hero|main|featured|premium|simple)\b/i);
    const descriptor = descriptors ? descriptors[1] : '';
    
    // Convert type to PascalCase
    const pascalType = type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    return descriptor 
      ? `${descriptor.charAt(0).toUpperCase() + descriptor.slice(1)}${pascalType}`
      : pascalType;
  }

  private generateDescription(prompt: string, type: ComponentType): string {
    // Use first sentence or generate based on type
    const firstSentence = prompt.split(/[.!?]/)[0].trim();
    if (firstSentence.length > 10) {
      return firstSentence;
    }
    return `A reusable ${type} component with variants and accessibility support.`;
  }

  private inferSizes(type: ComponentType): ('xs' | 'sm' | 'md' | 'lg' | 'xl')[] {
    const fullRange: ComponentType[] = ['button', 'input', 'badge', 'avatar', 'icon'];
    const threeSize: ComponentType[] = ['card', 'modal', 'dialog'];
    
    if (fullRange.includes(type)) return ['xs', 'sm', 'md', 'lg', 'xl'];
    if (threeSize.includes(type)) return ['sm', 'md', 'lg'];
    return ['md'];
  }

  private inferIntents(type: ComponentType): ('default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info')[] {
    const fullIntent: ComponentType[] = ['button', 'badge', 'alert', 'toast'];
    const simpleIntent: ComponentType[] = ['input', 'card'];
    
    if (fullIntent.includes(type)) {
      return ['default', 'primary', 'secondary', 'success', 'warning', 'danger'];
    }
    if (simpleIntent.includes(type)) {
      return ['default', 'primary'];
    }
    return ['default'];
  }

  private inferStates(type: ComponentType, isInteractive: boolean): ('default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error')[] {
    if (!isInteractive) return ['default'];
    
    const states: ('default' | 'hover' | 'active' | 'focus' | 'disabled' | 'loading' | 'error')[] = 
      ['default', 'hover', 'focus', 'disabled'];
    
    const loadingTypes: ComponentType[] = ['button', 'form', 'search'];
    const errorTypes: ComponentType[] = ['input', 'form', 'login', 'signup'];
    
    if (loadingTypes.includes(type)) states.push('loading');
    if (errorTypes.includes(type)) states.push('error');
    
    return states;
  }

  private needsLoadingState(type: ComponentType, prompt: string): boolean {
    const loadingTypes: ComponentType[] = ['button', 'card', 'table', 'list', 'form', 'search'];
    return loadingTypes.includes(type) || /\b(load|fetch|async|api)\b/i.test(prompt);
  }

  private needsErrorState(type: ComponentType, prompt: string): boolean {
    const errorTypes: ComponentType[] = ['input', 'form', 'login', 'signup', 'contact'];
    return errorTypes.includes(type) || /\b(error|validation|invalid)\b/i.test(prompt);
  }

  private needsEmptyState(type: ComponentType, prompt: string): boolean {
    const emptyTypes: ComponentType[] = ['table', 'list', 'grid', 'gallery', 'search'];
    return emptyTypes.includes(type) || /\b(empty|no\s*data|no\s*results)\b/i.test(prompt);
  }

  private inferProps(type: ComponentType, _prompt: string): PropDefinition[] {
    const baseProps: PropDefinition[] = [
      { name: 'className', type: 'string', required: false, description: 'Additional CSS classes' },
    ];

    const typeProps: Record<string, PropDefinition[]> = {
      button: [
        { name: 'children', type: 'ReactNode', required: true, description: 'Button content' },
        { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'primary', 'secondary', 'outline', 'ghost', 'link'] },
        { name: 'size', type: 'string', required: false, defaultValue: 'md', enumValues: ['xs', 'sm', 'md', 'lg', 'xl'] },
        { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
        { name: 'loading', type: 'boolean', required: false, defaultValue: false },
        { name: 'onClick', type: 'function', required: false, description: 'Click handler' },
      ],
      input: [
        { name: 'value', type: 'string', required: false },
        { name: 'placeholder', type: 'string', required: false },
        { name: 'type', type: 'string', required: false, defaultValue: 'text', enumValues: ['text', 'email', 'password', 'number', 'tel', 'url'] },
        { name: 'error', type: 'string', required: false, description: 'Error message' },
        { name: 'disabled', type: 'boolean', required: false },
        { name: 'onChange', type: 'function', required: false },
      ],
      card: [
        { name: 'children', type: 'ReactNode', required: true },
        { name: 'title', type: 'string', required: false },
        { name: 'description', type: 'string', required: false },
        { name: 'image', type: 'string', required: false, description: 'Header image URL' },
        { name: 'footer', type: 'ReactNode', required: false },
      ],
      pricing: [
        { name: 'name', type: 'string', required: true, description: 'Plan name' },
        { name: 'price', type: 'string', required: true, description: 'Price display' },
        { name: 'period', type: 'string', required: false, defaultValue: '/month' },
        { name: 'features', type: 'string[]', required: true, description: 'List of features' },
        { name: 'highlighted', type: 'boolean', required: false, description: 'Featured plan' },
        { name: 'ctaText', type: 'string', required: false, defaultValue: 'Get Started' },
        { name: 'onSelect', type: 'function', required: false },
      ],
    };

    return [...baseProps, ...(typeProps[type] || [])];
  }

  private inferChildren(type: ComponentType): string[] {
    const childMap: Record<string, string[]> = {
      card: ['image', 'text', 'button'],
      modal: ['text', 'button'],
      dialog: ['text', 'button'],
      navbar: ['link', 'button', 'avatar'],
      form: ['input', 'textarea', 'select', 'checkbox', 'button'],
      login: ['input', 'button', 'link'],
      signup: ['input', 'button', 'checkbox', 'link'],
      pricing: ['text', 'badge', 'button', 'list'],
      hero: ['text', 'button', 'image'],
      feature: ['icon', 'text'],
    };
    return childMap[type] || [];
  }

  private buildAccessibilityChecklist(type: ComponentType, isInteractive: boolean): AccessibilityChecklist {
    const base: AccessibilityChecklist = {
      keyboardNavigable: isInteractive,
      ariaLabels: isInteractive,
      focusVisible: isInteractive,
      reducedMotion: true,
    };

    // Add role based on type
    const roles: Record<string, string> = {
      button: 'button',
      modal: 'dialog',
      dialog: 'alertdialog',
      alert: 'alert',
      tabs: 'tablist',
      menu: 'menu',
      navbar: 'navigation',
      sidebar: 'navigation',
    };

    if (roles[type]) {
      base.roleAttribute = roles[type];
    }

    // Add aria-live for dynamic content
    const liveTypes: ComponentType[] = ['toast', 'alert', 'progress', 'status'];
    if (liveTypes.includes(type)) {
      base.ariaLive = type === 'alert' ? 'assertive' : 'polite';
    }

    return base;
  }

  private inferDataShape(type: ComponentType, _prompt: string): Record<string, unknown> | undefined {
    const dataShapes: Record<string, Record<string, unknown>> = {
      pricing: {
        name: 'Pro',
        price: '$29',
        period: '/month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        highlighted: false,
      },
      testimonial: {
        quote: 'This product changed my life!',
        author: 'Jane Doe',
        role: 'CEO at Company',
        avatar: 'https://picsum.photos/seed/avatar/100/100',
      },
      'dashboard-card': {
        title: 'Total Revenue',
        value: '$45,231',
        change: '+12%',
        trend: 'up',
      },
      card: {
        title: 'Card Title',
        description: 'Card description goes here.',
        image: 'https://picsum.photos/seed/card/400/200',
      },
    };

    return dataShapes[type];
  }
}

// Export singleton instance
export const normalizer = new IntentNormalizer();

