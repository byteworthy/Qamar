import { readFileSync } from "fs";
import { join } from "path";
import { defaultLogger } from "./logger";

const promptLogger = defaultLogger.child({ module: "PromptLoader" });

/**
 * Loads a prompt template from the prompts directory and replaces placeholders
 * @param filename - Name of the prompt file (e.g., "analyze-distortions.txt")
 * @param replacements - Optional key-value pairs for template replacement
 * @returns The processed prompt content
 */
export function loadPrompt(
  filename: string,
  replacements?: Record<string, string>,
): string {
  try {
    const promptPath = join(__dirname, "..", "prompts", filename);
    let content = readFileSync(promptPath, "utf-8");

    // Replace template placeholders if provided
    if (replacements) {
      for (const [key, value] of Object.entries(replacements)) {
        const placeholder = `{{${key}}}`;
        content = content.replace(placeholder, value);
      }
    }

    return content;
  } catch (error) {
    promptLogger.error("Failed to load prompt", error, {
      filename,
      // Do not log prompt content or replacements (may contain sensitive data)
    });
    throw new Error(`Prompt file not found: ${filename}`);
  }
}
