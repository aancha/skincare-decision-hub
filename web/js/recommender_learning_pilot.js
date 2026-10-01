import {
  rankRecommenderV2Shadow,
  validateRecommenderV2Artifact,
} from "./recommender_v2.js";


export const LEARNING_PILOT_ID = "recommender-learning-pilot";


export function validateLearningPilotArtifact(artifact, expectedTaxonomyHash = null) {
  const sharedValidation = validateRecommenderV2Artifact(artifact, expectedTaxonomyHash);
  if (!sharedValidation.valid) return sharedValidation;
  if (artifact.experimentId !== LEARNING_PILOT_ID) {
    return { valid: false, reason: "wrong-pilot-id" };
  }
  if (artifact.stage !== "pilot-development-frozen-awaiting-human-test") {
    return { valid: false, reason: "wrong-pilot-stage" };
  }
  if (!Array.isArray(artifact.selectedFeatureOrder) || !artifact.selectedFeatureOrder.length) {
    return { valid: false, reason: "missing-selected-features" };
  }
  return { valid: true, reason: null };
}


export function rankLearningPilotShadow(products, context, artifact, expectedTaxonomyHash = null) {
  const validation = validateLearningPilotArtifact(artifact, expectedTaxonomyHash);
  if (!validation.valid) throw new Error(validation.reason);
  return rankRecommenderV2Shadow(products, context, artifact);
}
