/**
 * Primitive Component Blueprints
 * Base components that compose into larger patterns
 */

import type { PropDefinition } from '../schema.js';

export interface Blueprint {
  type: string;
  description: string;
  requiredProps: PropDefinition[];
  optionalProps: PropDefinition[];
  variants: {
    sizes: string[];
    intents: string[];
  };
  states: string[];
  accessibility: {
    role?: string;
    ariaProps: string[];
    keyboardInteraction: string[];
  };
  structure: {
    tag: string;
    children?: string[];
  };
  tailwindBase: string;
  sizeClasses: Record<string, string>;
  intentClasses: Record<string, string>;
  stateClasses: Record<string, string>;
  codeTemplate: string;
}

// ============================================================
// BUTTON
// ============================================================

export const ButtonBlueprint: Blueprint = {
  type: 'button',
  description: 'Interactive button with multiple variants, sizes, and states',
  requiredProps: [
    { name: 'children', type: 'ReactNode', required: true, description: 'Button content' },
  ],
  optionalProps: [
    { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] },
    { name: 'size', type: 'string', required: false, defaultValue: 'md', enumValues: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { name: 'disabled', type: 'boolean', required: false, defaultValue: false },
    { name: 'loading', type: 'boolean', required: false, defaultValue: false },
    { name: 'leftIcon', type: 'ReactNode', required: false },
    { name: 'rightIcon', type: 'ReactNode', required: false },
    { name: 'asChild', type: 'boolean', required: false, description: 'Merge props onto child element (Radix pattern)' },
    { name: 'className', type: 'string', required: false },
    { name: 'onClick', type: 'function', required: false },
  ],
  variants: {
    sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
    intents: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
  },
  states: ['default', 'hover', 'focus', 'active', 'disabled', 'loading'],
  accessibility: {
    role: 'button',
    ariaProps: ['aria-disabled', 'aria-busy', 'aria-label'],
    keyboardInteraction: ['Enter', 'Space'],
  },
  structure: {
    tag: 'button',
    children: ['icon?', 'text', 'icon?'],
  },
  tailwindBase: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  sizeClasses: {
    xs: 'h-7 px-2 text-xs rounded-sm',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
    xl: 'h-12 px-8 text-lg',
  },
  intentClasses: {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline h-auto p-0',
  },
  stateClasses: {
    disabled: 'opacity-50 pointer-events-none',
    loading: 'opacity-70 pointer-events-none',
  },
  codeTemplate: `import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs rounded-sm",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && leftIcon}
        {children}
        {!loading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };`,
};

// ============================================================
// INPUT
// ============================================================

export const InputBlueprint: Blueprint = {
  type: 'input',
  description: 'Text input field with validation states',
  requiredProps: [],
  optionalProps: [
    { name: 'type', type: 'string', required: false, defaultValue: 'text', enumValues: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'] },
    { name: 'placeholder', type: 'string', required: false },
    { name: 'value', type: 'string', required: false },
    { name: 'defaultValue', type: 'string', required: false },
    { name: 'disabled', type: 'boolean', required: false },
    { name: 'error', type: 'string', required: false, description: 'Error message to display' },
    { name: 'label', type: 'string', required: false },
    { name: 'helperText', type: 'string', required: false },
    { name: 'leftIcon', type: 'ReactNode', required: false },
    { name: 'rightIcon', type: 'ReactNode', required: false },
    { name: 'className', type: 'string', required: false },
    { name: 'onChange', type: 'function', required: false },
  ],
  variants: {
    sizes: ['sm', 'md', 'lg'],
    intents: ['default', 'error'],
  },
  states: ['default', 'focus', 'disabled', 'error'],
  accessibility: {
    ariaProps: ['aria-invalid', 'aria-describedby', 'aria-required'],
    keyboardInteraction: ['Tab'],
  },
  structure: {
    tag: 'input',
    children: [],
  },
  tailwindBase: 'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  sizeClasses: {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base px-4',
  },
  intentClasses: {
    default: 'border-input',
    error: 'border-destructive focus-visible:ring-destructive',
  },
  stateClasses: {
    disabled: 'opacity-50 cursor-not-allowed',
    error: 'border-destructive',
  },
  codeTemplate: `import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const errorId = error ? \`\${inputId}-error\` : undefined;
    const helperId = helperText ? \`\${inputId}-helper\` : undefined;
    
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-destructive focus-visible:ring-destructive"
                : "border-input focus-visible:ring-ring",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={[errorId, helperId].filter(Boolean).join(" ") || undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p id={helperId} className="text-sm text-muted-foreground">{helperText}</p>
        )}
        {error && (
          <p id={errorId} className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };`,
};

// ============================================================
// BADGE
// ============================================================

export const BadgeBlueprint: Blueprint = {
  type: 'badge',
  description: 'Small label for status, counts, or categories',
  requiredProps: [
    { name: 'children', type: 'ReactNode', required: true, description: 'Badge content' },
  ],
  optionalProps: [
    { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'secondary', 'outline', 'success', 'warning', 'destructive'] },
    { name: 'size', type: 'string', required: false, defaultValue: 'md', enumValues: ['sm', 'md', 'lg'] },
    { name: 'dot', type: 'boolean', required: false, description: 'Show status dot' },
    { name: 'removable', type: 'boolean', required: false },
    { name: 'onRemove', type: 'function', required: false },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['sm', 'md', 'lg'],
    intents: ['default', 'secondary', 'outline', 'success', 'warning', 'destructive'],
  },
  states: ['default'],
  accessibility: {
    ariaProps: ['aria-label'],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'span',
    children: ['dot?', 'text', 'close?'],
  },
  tailwindBase: 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  sizeClasses: {
    sm: 'px-2 py-0 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  },
  intentClasses: {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-500/15 text-green-700 dark:text-green-400',
    warning: 'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
    destructive: 'border-transparent bg-destructive/15 text-destructive',
  },
  stateClasses: {},
  codeTemplate: `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        success: "border-transparent bg-green-500/15 text-green-700 dark:text-green-400",
        warning: "border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
        destructive: "border-transparent bg-destructive/15 text-destructive",
      },
      size: {
        sm: "px-2 py-0 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

function Badge({ className, variant, size, dot, removable, onRemove, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full hover:bg-foreground/20 inline-flex items-center justify-center"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export { Badge, badgeVariants };`,
};

// ============================================================
// AVATAR
// ============================================================

export const AvatarBlueprint: Blueprint = {
  type: 'avatar',
  description: 'User avatar with image, initials fallback, and status indicator',
  requiredProps: [],
  optionalProps: [
    { name: 'src', type: 'string', required: false, description: 'Image URL' },
    { name: 'alt', type: 'string', required: false, description: 'Alt text' },
    { name: 'fallback', type: 'string', required: false, description: 'Initials to show when no image' },
    { name: 'size', type: 'string', required: false, defaultValue: 'md', enumValues: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { name: 'status', type: 'string', required: false, enumValues: ['online', 'offline', 'away', 'busy'] },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
    intents: ['default'],
  },
  states: ['default', 'loading'],
  accessibility: {
    ariaProps: ['aria-label', 'role="img"'],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'span',
    children: ['image', 'fallback', 'status?'],
  },
  tailwindBase: 'relative flex shrink-0 overflow-hidden rounded-full',
  sizeClasses: {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  },
  intentClasses: {},
  stateClasses: {},
  codeTemplate: `import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
  busy: "bg-red-500",
};

export interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: keyof typeof statusColors;
}

function Avatar({ className, size, src, alt, fallback, status, ...props }: AvatarProps) {
  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root className={cn(avatarVariants({ size }), className)} {...props}>
        <AvatarPrimitive.Image
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt}
        />
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium">
          {fallback}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

export { Avatar, avatarVariants };`,
};

// ============================================================
// EXPORTS
// ============================================================

export const PRIMITIVE_BLUEPRINTS: Record<string, Blueprint> = {
  button: ButtonBlueprint,
  input: InputBlueprint,
  badge: BadgeBlueprint,
  avatar: AvatarBlueprint,
};

