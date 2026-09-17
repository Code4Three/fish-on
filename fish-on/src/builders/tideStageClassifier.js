// src/builders/tideStageClassifier.js

export function classifyTideStage(progress, direction) {
  if (progress == null || direction == null) {
    return "Unknown";
  }

  if (direction === "incoming") {
    if (progress < 0.25) return "Run In Start";
    if (progress < 0.5) return "Run In Building";
    if (progress < 0.75) return "Run In Mid";

    return "Run In Late";
  }

  if (direction === "outgoing") {
    if (progress < 0.25) return "Run Out Start";
    if (progress < 0.5) return "Run Out Building";
    if (progress < 0.75) return "Run Out Mid";

    return "Run Out Late";
  }

  return "Unknown";
}