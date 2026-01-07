/**
 * Generator Module
 * Main export for the component generation pipeline
 */

// Schema & Types
export {
  ComponentSpecSchema,
  GenerationResultSchema,
  ComponentTypes,
  OutputTargets,
  type ComponentSpec,
  type GenerationResult,
  type GeneratedFile,
  type PropDefinition,
  type ComponentType,
  type OutputTarget,
} from './schema.js';

// Normalizer
export { normalizer, IntentNormalizer } from './normalizer.js';

// Blueprints
export {
  BLUEPRINTS,
  getBlueprint,
  findClosestBlueprint,
  getAllBlueprintTypes,
  hasBlueprint,
  type Blueprint,
} from './blueprints/index.js';

// Style Guide
export { STYLE_GUIDE } from './style-guide.js';

// Validator
export { validator, CodeValidator, type ValidationReport } from './validator.js';

// Targets
export {
  TARGET_CONFIGS,
  getTargetConfig,
  generateFilePath,
  detectBestTarget,
} from './targets.js';

// Scoring
export { calculateScore, quickScore, type ScoreBreakdown } from './scoring.js';

// Pipeline
export { GeneratorPipeline, createPipeline } from './pipeline.js';

// Tests
export { GOLDEN_TESTS, runGoldenTest, runAllGoldenTests } from './tests/golden-tests.js';

