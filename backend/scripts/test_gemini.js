import { geminiService } from '../src/services/gemini.service.js';

console.log("==================================================");
console.log("🔍 BIS Sahayak V2 — Gemini Service Diagnostic Test");
console.log("==================================================");
console.log(`• Gemini Service Initialized: ${Boolean(geminiService)}`);
console.log(`• Gemini API Key Configured: ${geminiService.isAvailable()}`);
console.log(`• Target Model: ${geminiService.model}`);
console.log(`• Temperature: ${geminiService.temperature}`);
console.log("--------------------------------------------------");

async function runTests() {
  console.log("\n[Test 1] Testing System Prompt Generation:");
  const simplePrompt = geminiService.getSystemPrompt("simple");
  console.log(`  - System prompt character count: ${simplePrompt.length}`);
  console.log(`  - Contains anti-hallucination mandate: ${simplePrompt.includes("NEVER invent IS numbers")}`);
  console.log(`  - Contains HSN caution: ${simplePrompt.includes("NEVER assume that an HSN")}`);

  console.log("\n[Test 2] Testing Dynamic Confidence Score Calculation:");
  const testConfidenceOfficial = geminiService.calculateConfidence(
    "Under mandatory Quality Control Order, IS 17803:2022 is mandatory for vacuum flasks.",
    [{ is_official: true, url: "https://bis.gov.in" }],
    true
  );
  console.log(`  - Confidence with official BIS citation: ${testConfidenceOfficial}% (Expected > 90%)`);

  const testConfidenceUncertain = geminiService.calculateConfidence(
    "Could not establish mandatory certification from available records.",
    [],
    false
  );
  console.log(`  - Confidence with uncertain finding: ${testConfidenceUncertain}% (Expected 60%)`);

  console.log("\n[Test 3] Testing Live Gemini Chat Completion:");
  const query = "Does a stainless steel vacuum flask require mandatory ISI mark in India?";
  console.log(`  - User Query: "${query}"`);
  
  const result = await geminiService.chatCompletion({
    query,
    mode: "simple",
    enableSearch: true
  });
  
  console.log("\n[Result]:");
  console.log(`  - Mode: ${result.mode}`);
  console.log(`  - Confidence: ${result.confidence}%`);
  console.log(`  - Citations count: ${result.citations?.length || 0}`);
  console.log(`  - Answer excerpt:\n${result.answer.slice(0, 300)}...`);
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
