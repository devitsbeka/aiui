/**
 * Blueprint Registry
 * Central access point for all component blueprints
 */

import { PRIMITIVE_BLUEPRINTS, type Blueprint } from './primitives.js';
import { COMPOSITE_BLUEPRINTS } from './composites.js';
import type { ComponentType } from '../schema.js';

// ============================================================
// COMBINED REGISTRY
// ============================================================

export const BLUEPRINTS: Record<string, Blueprint> = {
  ...PRIMITIVE_BLUEPRINTS,
  ...COMPOSITE_BLUEPRINTS,
};

// ============================================================
// REGISTRY API
// ============================================================

/**
 * Get a blueprint by component type
 */
export function getBlueprint(type: ComponentType | string): Blueprint | undefined {
  return BLUEPRINTS[type];
}

/**
 * Find the closest matching blueprint for a component type
 * Falls back to similar types if exact match not found
 */
export function findClosestBlueprint(type: ComponentType | string): Blueprint {
  // Exact match
  if (BLUEPRINTS[type]) {
    return BLUEPRINTS[type];
  }

  // Fallback mappings for types without blueprints
  const fallbacks: Record<string, string> = {
    // Map to card
    modal: 'card',
    dialog: 'card',
    alert: 'card',
    toast: 'card',
    tooltip: 'card',
    popover: 'card',
    
    // Map to feature
    hero: 'feature',
    cta: 'feature',
    
    // Map to pricing
    stats: 'dashboard-card',
    metric: 'dashboard-card',
    
    // Map to testimonial
    review: 'testimonial',
    quote: 'testimonial',
    
    // Map to input
    textarea: 'input',
    select: 'input',
    search: 'input',
    
    // Map to button
    link: 'button',
    
    // Form fallbacks
    login: 'card',
    signup: 'card',
    contact: 'card',
    form: 'card',
    newsletter: 'card',
    
    // Navigation fallbacks
    navbar: 'card',
    sidebar: 'card',
    footer: 'card',
    header: 'card',
    breadcrumb: 'badge',
    tabs: 'card',
    
    // Data display fallbacks
    table: 'card',
    list: 'card',
    grid: 'card',
    gallery: 'card',
    carousel: 'card',
    timeline: 'card',
    accordion: 'card',
    faq: 'card',
    
    // Primitives fallbacks
    icon: 'badge',
    text: 'badge',
    image: 'card',
    divider: 'badge',
    checkbox: 'input',
    radio: 'input',
    switch: 'input',
    slider: 'input',
    dropdown: 'button',
    menu: 'card',
    pagination: 'button',
    progress: 'badge',
    status: 'badge',
    'chart-container': 'dashboard-card',
  };

  const fallbackType = fallbacks[type];
  if (fallbackType && BLUEPRINTS[fallbackType]) {
    return BLUEPRINTS[fallbackType];
  }

  // Ultimate fallback to card
  return BLUEPRINTS.card;
}

/**
 * Get all available blueprint types
 */
export function getAllBlueprintTypes(): string[] {
  return Object.keys(BLUEPRINTS);
}

/**
 * Check if a blueprint exists for a type
 */
export function hasBlueprint(type: string): boolean {
  return type in BLUEPRINTS;
}

/**
 * Get blueprints by category
 */
export function getBlueprintsByCategory(): {
  primitives: Blueprint[];
  composites: Blueprint[];
} {
  return {
    primitives: Object.values(PRIMITIVE_BLUEPRINTS),
    composites: Object.values(COMPOSITE_BLUEPRINTS),
  };
}

// Re-export types
export type { Blueprint } from './primitives.js';

