/**
 * Component Generation API
 * Uses the structured pipeline for high-quality component generation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createPipeline } from '../src/generator/pipeline.js';
import { normalizer } from '../src/generator/normalizer.js';
import { calculateScore } from '../src/generator/scoring.js';
import { findClosestBlueprint } from '../src/generator/blueprints/index.js';
import type { OutputTarget } from '../src/generator/schema.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { 
      prompt, 
      target = 'react-tailwind-shadcn',
      includeStory = true,
      includeDemo = true,
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Validate target
    const validTargets: OutputTarget[] = [
      'react-tailwind',
      'react-tailwind-shadcn', 
      'vue-tailwind',
      'html-tailwind',
      'react-css-modules'
    ];
    
    if (!validTargets.includes(target)) {
      return res.status(400).json({ 
        error: 'Invalid target',
        validTargets 
      });
    }

    // Create pipeline and generate
    const pipeline = createPipeline(apiKey, {
      includeStory,
      includeDemo,
    });

    const result = await pipeline.generate(prompt, {
      outputTarget: target as OutputTarget,
    });

    // Return structured result
    return res.status(200).json({
      success: true,
      spec: {
        name: result.spec.name,
        componentType: result.spec.componentType,
        description: result.spec.description,
        variants: {
          sizes: result.spec.sizes,
          intents: result.spec.intents,
          states: result.spec.states,
        },
      },
      files: result.files.map(f => ({
        path: f.path,
        content: f.content,
        language: f.language,
      })),
      usageExample: result.usageExample,
      storySnippet: result.storySnippet,
      propsDocumentation: result.propsDocumentation,
      quality: {
        score: result.qualityScore,
        grade: result.qualityScore >= 90 ? 'A' : 
               result.qualityScore >= 80 ? 'B' :
               result.qualityScore >= 70 ? 'C' :
               result.qualityScore >= 60 ? 'D' : 'F',
        passed: result.validationPassed,
        issues: result.validationErrors,
      },
      generationTimeMs: result.generationTimeMs,
    });

  } catch (error) {
    console.error('Generation API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate component',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Quick spec preview endpoint (no code generation)
 */
export async function previewSpec(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Quick normalization without LLM call
    const spec = normalizer.normalize(prompt);
    const blueprint = findClosestBlueprint(spec.componentType);

    return res.status(200).json({
      spec: {
        name: spec.name,
        componentType: spec.componentType,
        description: spec.description,
        layout: spec.layout,
        tone: spec.tone,
        variants: {
          sizes: spec.sizes,
          intents: spec.intents,
          states: spec.states,
        },
        hasLoadingState: spec.hasLoadingState,
        hasErrorState: spec.hasErrorState,
        hasEmptyState: spec.hasEmptyState,
        isInteractive: spec.isInteractive,
        props: spec.props,
      },
      blueprint: {
        type: blueprint.type,
        description: blueprint.description,
        requiredProps: blueprint.requiredProps,
        optionalProps: blueprint.optionalProps,
      },
    });

  } catch (error) {
    console.error('Preview API error:', error);
    return res.status(500).json({
      error: 'Failed to preview spec',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

