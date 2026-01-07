/**
 * Composite Component Blueprints
 * Complex components built from primitives
 */

import type { Blueprint } from './primitives.js';

// ============================================================
// CARD
// ============================================================

export const CardBlueprint: Blueprint = {
  type: 'card',
  description: 'Container for grouping related content with optional header, image, and footer',
  requiredProps: [
    { name: 'children', type: 'ReactNode', required: true, description: 'Card content' },
  ],
  optionalProps: [
    { name: 'title', type: 'string', required: false },
    { name: 'description', type: 'string', required: false },
    { name: 'image', type: 'string', required: false, description: 'Header image URL' },
    { name: 'footer', type: 'ReactNode', required: false },
    { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'outline', 'ghost'] },
    { name: 'padding', type: 'string', required: false, defaultValue: 'md', enumValues: ['none', 'sm', 'md', 'lg'] },
    { name: 'hoverable', type: 'boolean', required: false },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['sm', 'md', 'lg'],
    intents: ['default', 'outline', 'ghost'],
  },
  states: ['default', 'hover'],
  accessibility: {
    role: 'article',
    ariaProps: ['aria-labelledby'],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'article',
    children: ['image?', 'header?', 'content', 'footer?'],
  },
  tailwindBase: 'rounded-xl border bg-card text-card-foreground shadow',
  sizeClasses: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  intentClasses: {
    default: 'bg-card shadow',
    outline: 'bg-transparent border-2',
    ghost: 'bg-transparent border-none shadow-none',
  },
  stateClasses: {
    hover: 'hover:shadow-md transition-shadow',
  },
  codeTemplate: `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all",
  {
    variants: {
      variant: {
        default: "bg-card shadow",
        outline: "bg-transparent border-2",
        ghost: "bg-transparent border-transparent shadow-none",
      },
      padding: {
        none: "",
        sm: "[&>*:not(img)]:px-4 [&>*:not(img)]:py-3",
        md: "[&>*:not(img)]:px-6 [&>*:not(img)]:py-4",
        lg: "[&>*:not(img)]:px-8 [&>*:not(img)]:py-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean;
}

function Card({ className, variant, padding, hoverable, ...props }: CardProps) {
  return (
    <article
      className={cn(
        cardVariants({ variant, padding }),
        hoverable && "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-0", className)} {...props} />;
}

function CardImage({ className, src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("w-full object-cover rounded-t-xl", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage, cardVariants };`,
};

// ============================================================
// PRICING CARD
// ============================================================

export const PricingBlueprint: Blueprint = {
  type: 'pricing',
  description: 'Pricing plan card with features list and CTA',
  requiredProps: [
    { name: 'name', type: 'string', required: true, description: 'Plan name' },
    { name: 'price', type: 'string', required: true, description: 'Price (e.g., "$29")' },
    { name: 'features', type: 'string[]', required: true, description: 'List of features' },
  ],
  optionalProps: [
    { name: 'description', type: 'string', required: false },
    { name: 'period', type: 'string', required: false, defaultValue: '/month' },
    { name: 'highlighted', type: 'boolean', required: false, description: 'Highlight as recommended' },
    { name: 'badge', type: 'string', required: false, description: 'Badge text (e.g., "Popular")' },
    { name: 'ctaText', type: 'string', required: false, defaultValue: 'Get Started' },
    { name: 'ctaVariant', type: 'string', required: false, defaultValue: 'default' },
    { name: 'onSelect', type: 'function', required: false },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['md'],
    intents: ['default', 'highlighted'],
  },
  states: ['default', 'hover'],
  accessibility: {
    role: 'article',
    ariaProps: ['aria-labelledby'],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'article',
    children: ['badge?', 'header', 'price', 'features', 'cta'],
  },
  tailwindBase: 'rounded-2xl border bg-card p-6 text-card-foreground shadow-sm flex flex-col',
  sizeClasses: {},
  intentClasses: {
    default: 'border-border',
    highlighted: 'border-primary ring-2 ring-primary/20',
  },
  stateClasses: {},
  codeTemplate: `import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description?: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText?: string;
  onSelect?: () => void;
}

function PricingCard({
  name,
  description,
  price,
  period = "/month",
  features,
  highlighted,
  badge,
  ctaText = "Get Started",
  onSelect,
  className,
  ...props
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative rounded-2xl border bg-card p-6 text-card-foreground shadow-sm flex flex-col",
        highlighted && "border-primary ring-2 ring-primary/20",
        className
      )}
      {...props}
    >
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
          {badge}
        </Badge>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="mb-6">
        <span className="text-4xl font-bold tracking-tight">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      
      <ul className="mb-6 space-y-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={onSelect}
        variant={highlighted ? "default" : "outline"}
        className="w-full"
      >
        {ctaText}
      </Button>
    </article>
  );
}

export { PricingCard };`,
};

// ============================================================
// TESTIMONIAL
// ============================================================

export const TestimonialBlueprint: Blueprint = {
  type: 'testimonial',
  description: 'Customer testimonial/review card with quote and author',
  requiredProps: [
    { name: 'quote', type: 'string', required: true },
    { name: 'author', type: 'string', required: true },
  ],
  optionalProps: [
    { name: 'role', type: 'string', required: false, description: 'Author role/title' },
    { name: 'company', type: 'string', required: false },
    { name: 'avatar', type: 'string', required: false, description: 'Author avatar URL' },
    { name: 'rating', type: 'number', required: false, description: 'Star rating (1-5)' },
    { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'minimal', 'featured'] },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['md'],
    intents: ['default', 'minimal', 'featured'],
  },
  states: ['default'],
  accessibility: {
    role: 'blockquote',
    ariaProps: [],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'figure',
    children: ['rating?', 'quote', 'author'],
  },
  tailwindBase: 'rounded-xl border bg-card p-6 text-card-foreground',
  sizeClasses: {},
  intentClasses: {
    default: 'bg-card border',
    minimal: 'bg-transparent border-none p-0',
    featured: 'bg-primary/5 border-primary/20',
  },
  stateClasses: {},
  codeTemplate: `import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface TestimonialProps extends React.HTMLAttributes<HTMLElement> {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  variant?: "default" | "minimal" | "featured";
}

function Testimonial({
  quote,
  author,
  role,
  company,
  avatar,
  rating,
  variant = "default",
  className,
  ...props
}: TestimonialProps) {
  return (
    <figure
      className={cn(
        "rounded-xl p-6",
        variant === "default" && "bg-card border text-card-foreground",
        variant === "minimal" && "bg-transparent p-0",
        variant === "featured" && "bg-primary/5 border border-primary/20",
        className
      )}
      {...props}
    >
      {rating && (
        <div className="flex gap-0.5 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
              )}
            />
          ))}
        </div>
      )}
      
      <blockquote className="text-lg leading-relaxed mb-4">
        "{quote}"
      </blockquote>
      
      <figcaption className="flex items-center gap-3">
        {avatar && (
          <Avatar src={avatar} alt={author} fallback={author.slice(0, 2).toUpperCase()} size="sm" />
        )}
        <div>
          <div className="font-medium">{author}</div>
          {(role || company) && (
            <div className="text-sm text-muted-foreground">
              {role}{role && company && " at "}{company}
            </div>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export { Testimonial };`,
};

// ============================================================
// DASHBOARD METRIC CARD
// ============================================================

export const DashboardCardBlueprint: Blueprint = {
  type: 'dashboard-card',
  description: 'Dashboard metric card with value, trend, and optional chart',
  requiredProps: [
    { name: 'title', type: 'string', required: true },
    { name: 'value', type: 'string', required: true },
  ],
  optionalProps: [
    { name: 'description', type: 'string', required: false },
    { name: 'change', type: 'string', required: false, description: 'Change percentage (e.g., "+12%")' },
    { name: 'trend', type: 'string', required: false, enumValues: ['up', 'down', 'neutral'] },
    { name: 'icon', type: 'ReactNode', required: false },
    { name: 'chart', type: 'ReactNode', required: false, description: 'Sparkline or mini chart' },
    { name: 'loading', type: 'boolean', required: false },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['sm', 'md', 'lg'],
    intents: ['default'],
  },
  states: ['default', 'loading'],
  accessibility: {
    role: 'article',
    ariaProps: ['aria-labelledby', 'aria-describedby'],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'article',
    children: ['header', 'value', 'trend?', 'chart?'],
  },
  tailwindBase: 'rounded-xl border bg-card p-6 text-card-foreground shadow-sm',
  sizeClasses: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  intentClasses: {},
  stateClasses: {
    loading: 'animate-pulse',
  },
  codeTemplate: `import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  description?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  loading?: boolean;
}

function DashboardCard({
  title,
  value,
  description,
  change,
  trend = "neutral",
  icon,
  chart,
  loading,
  className,
  ...props
}: DashboardCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground";
  
  if (loading) {
    return (
      <article className={cn("rounded-xl border bg-card p-6 animate-pulse", className)} {...props}>
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-8 w-32 bg-muted rounded mb-2" />
        <div className="h-3 w-16 bg-muted rounded" />
      </article>
    );
  }
  
  return (
    <article className={cn("rounded-xl border bg-card p-6 text-card-foreground shadow-sm", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {change && (
            <div className={cn("flex items-center gap-1 mt-1 text-sm", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{change}</span>
              {description && <span className="text-muted-foreground">vs last period</span>}
            </div>
          )}
        </div>
        {chart && <div className="h-12 w-24">{chart}</div>}
      </div>
    </article>
  );
}

export { DashboardCard };`,
};

// ============================================================
// FEATURE CARD
// ============================================================

export const FeatureBlueprint: Blueprint = {
  type: 'feature',
  description: 'Feature highlight card with icon and description',
  requiredProps: [
    { name: 'title', type: 'string', required: true },
    { name: 'description', type: 'string', required: true },
  ],
  optionalProps: [
    { name: 'icon', type: 'ReactNode', required: false },
    { name: 'image', type: 'string', required: false },
    { name: 'link', type: 'string', required: false },
    { name: 'linkText', type: 'string', required: false, defaultValue: 'Learn more' },
    { name: 'variant', type: 'string', required: false, defaultValue: 'default', enumValues: ['default', 'centered', 'horizontal'] },
    { name: 'className', type: 'string', required: false },
  ],
  variants: {
    sizes: ['md'],
    intents: ['default', 'centered', 'horizontal'],
  },
  states: ['default', 'hover'],
  accessibility: {
    ariaProps: [],
    keyboardInteraction: [],
  },
  structure: {
    tag: 'div',
    children: ['icon|image', 'title', 'description', 'link?'],
  },
  tailwindBase: 'group',
  sizeClasses: {},
  intentClasses: {
    default: 'text-left',
    centered: 'text-center items-center',
    horizontal: 'flex-row gap-4',
  },
  stateClasses: {},
  codeTemplate: `import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon?: React.ReactNode;
  image?: string;
  link?: string;
  linkText?: string;
  variant?: "default" | "centered" | "horizontal";
}

function FeatureCard({
  title,
  description,
  icon,
  image,
  link,
  linkText = "Learn more",
  variant = "default",
  className,
  ...props
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3",
        variant === "centered" && "items-center text-center",
        variant === "horizontal" && "sm:flex-row sm:gap-4",
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
          variant === "horizontal" && "h-14 w-14"
        )}>
          {icon}
        </div>
      )}
      {image && (
        <img src={image} alt="" className="w-full rounded-lg object-cover aspect-video" />
      )}
      
      <div className={cn(variant === "horizontal" && "flex-1")}>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        
        {link && (
          <a
            href={link}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {linkText}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  );
}

export { FeatureCard };`,
};

// ============================================================
// EXPORTS
// ============================================================

export const COMPOSITE_BLUEPRINTS: Record<string, Blueprint> = {
  card: CardBlueprint,
  pricing: PricingBlueprint,
  testimonial: TestimonialBlueprint,
  'dashboard-card': DashboardCardBlueprint,
  feature: FeatureBlueprint,
};

