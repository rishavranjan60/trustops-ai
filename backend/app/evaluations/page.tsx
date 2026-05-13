const getScoreLabel = (score: number) => {
  if (score >= 0.85) return "Excellent";
  if (score >= 0.65) return "Good";
  if (score >= 0.45) return "Weak";
  return "Poor";
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 0.85) {
    return "bg-green-100 text-green-800 border-green-200";
  }

  if (score >= 0.65) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (score >= 0.45) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  return "bg-red-100 text-red-800 border-red-200";
};

const getProviderLabel = (modelName: string) => {
  if (modelName === "mock-fallback") {
    return "Mock Fallback";
  }

  if (modelName.toLowerCase().startsWith("gemini")) {
    return "Gemini";
  }

  return modelName;
};

const getProviderBadgeClass = (modelName: string) => {
  if (modelName === "mock-fallback") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  if (modelName.toLowerCase().startsWith("gemini")) {
    return "bg-green-100 text-green-800 border-green-200";
  }

  return "bg-gray-100 text-gray-800 border-gray-200";
};