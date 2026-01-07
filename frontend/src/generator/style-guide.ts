/**
 * Style Guide
 * Design tokens and conventions that all generated components must follow
 */

// ============================================================
// SPACING SCALE (Tailwind-compatible)
// ============================================================

export const SPACING_SCALE = {
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

export const SPACING_TAILWIND = {
  xs: 'p-2 gap-1.5',
  sm: 'p-3 gap-2',
  md: 'p-4 gap-3',
  lg: 'p-6 gap-4',
  xl: 'p-8 gap-6',
} as const;

// ============================================================
// TYPOGRAPHY SCALE
// ============================================================

export const TYPOGRAPHY_SCALE = {
  xs: { fontSize: '0.75rem', lineHeight: '1rem' },      // 12px
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },  // 14px
  base: { fontSize: '1rem', lineHeight: '1.5rem' },     // 16px
  lg: { fontSize: '1.125rem', lineHeight: '1.75rem' },  // 18px
  xl: { fontSize: '1.25rem', lineHeight: '1.75rem' },   // 20px
  '2xl': { fontSize: '1.5rem', lineHeight: '2rem' },    // 24px
  '3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' }, // 30px
  '4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' }, // 36px
  '5xl': { fontSize: '3rem', lineHeight: '1' },         // 48px
} as const;

export const TYPOGRAPHY_TAILWIND = {
  display: 'text-4xl font-bold tracking-tight',
  h1: 'text-3xl font-semibold tracking-tight',
  h2: 'text-2xl font-semibold',
  h3: 'text-xl font-medium',
  h4: 'text-lg font-medium',
  body: 'text-base',
  small: 'text-sm',
  caption: 'text-xs text-muted-foreground',
  label: 'text-sm font-medium',
} as const;

// ============================================================
// BORDER RADIUS
// ============================================================

export const RADIUS_SCALE = {
  none: '0',
  sm: '0.125rem',    // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',    // 6px
  lg: '0.5rem',      // 8px
  xl: '0.75rem',     // 12px
  '2xl': '1rem',     // 16px
  '3xl': '1.5rem',   // 24px
  full: '9999px',
} as const;

export const RADIUS_TAILWIND = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
} as const;

// ============================================================
// SHADOWS
// ============================================================

export const SHADOW_SCALE = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

export const SHADOW_TAILWIND = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

// ============================================================
// SEMANTIC COLOR TOKENS (CSS Variables)
// ============================================================

export const COLOR_TOKENS = {
  // Backgrounds
  background: 'bg-background',
  foreground: 'text-foreground',
  
  // Cards & Surfaces
  card: 'bg-card',
  cardForeground: 'text-card-foreground',
  
  // Muted
  muted: 'bg-muted',
  mutedForeground: 'text-muted-foreground',
  
  // Accents
  accent: 'bg-accent',
  accentForeground: 'text-accent-foreground',
  
  // Primary
  primary: 'bg-primary',
  primaryForeground: 'text-primary-foreground',
  
  // Secondary
  secondary: 'bg-secondary',
  secondaryForeground: 'text-secondary-foreground',
  
  // Destructive
  destructive: 'bg-destructive',
  destructiveForeground: 'text-destructive-foreground',
  
  // Borders & Inputs
  border: 'border-border',
  input: 'border-input',
  ring: 'ring-ring',
} as const;

// ============================================================
// STATE CLASSES
// ============================================================

export const STATE_CLASSES = {
  hover: 'hover:',
  focus: 'focus:',
  active: 'active:',
  disabled: 'disabled:opacity-50 disabled:pointer-events-none',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  groupHover: 'group-hover:',
} as const;

// ============================================================
// ANIMATION & MOTION
// ============================================================

export const ANIMATION_TOKENS = {
  // Durations
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  
  // Easings
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Tailwind classes
  transition: 'transition-all duration-200 ease-in-out',
  transitionFast: 'transition-all duration-150 ease-out',
  transitionSlow: 'transition-all duration-300 ease-in-out',
} as const;

export const REDUCED_MOTION_WRAPPER = `@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`;

// ============================================================
// COMPONENT API CONVENTIONS
// ============================================================

export const API_CONVENTIONS = {
  // Prop naming
  propNaming: {
    boolean: 'isX, hasX (e.g., isLoading, hasError)',
    handler: 'onX (e.g., onClick, onChange)',
    render: 'renderX (e.g., renderItem)',
    class: 'className (not class)',
    style: 'style (inline styles object)',
  },
  
  // Default exports
  exports: {
    component: 'named export: export function ComponentName',
    types: 'named export: export interface ComponentNameProps',
    variants: 'named export: export const componentVariants',
  },
  
  // Variant organization
  variants: {
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    intent: ['default', 'primary', 'secondary', 'success', 'warning', 'danger'],
    variant: ['solid', 'outline', 'ghost', 'link'],
  },
} as const;

// ============================================================
// TAILWIND BASE PATTERNS
// ============================================================

export const BASE_PATTERNS = {
  // Interactive base
  interactiveBase: 'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  
  // Card base
  cardBase: 'rounded-xl border bg-card text-card-foreground shadow',
  
  // Input base
  inputBase: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  
  // Badge base
  badgeBase: 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  
  // Focus ring
  focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
} as const;

// ============================================================
// SIZE VARIANT MAPS
// ============================================================

export const SIZE_VARIANTS = {
  button: {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    xl: 'h-12 px-8 text-lg',
  },
  icon: {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8',
  },
  avatar: {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  },
  input: {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  },
} as const;

// ============================================================
// INTENT VARIANT MAPS
// ============================================================

export const INTENT_VARIANTS = {
  button: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline',
  },
  badge: {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-500 text-white',
    warning: 'border-transparent bg-yellow-500 text-white',
    danger: 'border-transparent bg-red-500 text-white',
  },
  alert: {
    default: 'bg-background text-foreground',
    info: 'border-blue-200 bg-blue-50 text-blue-900 [&>svg]:text-blue-600',
    success: 'border-green-200 bg-green-50 text-green-900 [&>svg]:text-green-600',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 [&>svg]:text-yellow-600',
    danger: 'border-red-200 bg-red-50 text-red-900 [&>svg]:text-red-600',
  },
} as const;

// ============================================================
// STYLE GUIDE EXPORT
// ============================================================

export const STYLE_GUIDE = {
  spacing: SPACING_SCALE,
  spacingTailwind: SPACING_TAILWIND,
  typography: TYPOGRAPHY_SCALE,
  typographyTailwind: TYPOGRAPHY_TAILWIND,
  radius: RADIUS_SCALE,
  radiusTailwind: RADIUS_TAILWIND,
  shadows: SHADOW_SCALE,
  shadowsTailwind: SHADOW_TAILWIND,
  colors: COLOR_TOKENS,
  states: STATE_CLASSES,
  animations: ANIMATION_TOKENS,
  reducedMotion: REDUCED_MOTION_WRAPPER,
  api: API_CONVENTIONS,
  basePatterns: BASE_PATTERNS,
  sizeVariants: SIZE_VARIANTS,
  intentVariants: INTENT_VARIANTS,
} as const;

export type StyleGuide = typeof STYLE_GUIDE;

