// src/builders/tideStageClassifier.js

export function classifyTideStage(prevHeight, currentHeight, nextHeight) {
  if (currentHeight === null) return "Unknown";

  if (prevHeight < currentHeight && currentHeight < nextHeight) {
    return "Incoming";
  }

  if (prevHeight > currentHeight && currentHeight > nextHeight) {
    return "Outgoing";
  }

  if (prevHeight < currentHeight && currentHeight > nextHeight) {
    return "High Tide Peak";
  }

  if (prevHeight > currentHeight && currentHeight < nextHeight) {
    return "Low Tide Trough";
  }

  return "Flat";
}
