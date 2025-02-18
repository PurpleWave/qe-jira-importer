import fs from "fs";
import path from "path";
import { Config } from "../config/Config";
import { Logger } from "../logging/Logger";
import { AcceptanceCriteriaFormatter } from "../formatters/AcceptanceCriteriaFormatter";

/**
 * Handles writing formatted AC to Playwright test files.
 */
export class FileAppender {
    private static logger = new Logger();

    /**
     * Appends formatted AC to `crm.spec.ts`, inserting before `@TESTGEN` or at the bottom.
     * @param issues Jira issues with AC
     * @param testFilePath Path to the Playwright test file
     */
    public static appendAcceptanceCriteria(issues: { key: string; title: string; acceptanceCriteria: string }[], testFilePath: string): void {
        if (issues.length === 0) {
            this.logger.log("info", "⚠️ No AC to append.");
            return;
        }

        let testFileContent = fs.existsSync(testFilePath) ? fs.readFileSync(testFilePath, "utf-8") : "// Playwright test file\n";
        const testGenMarker = "@TESTGEN";
        let updatedContent = testFileContent;
        let addedIssues: string[] = [];

        for (const issue of issues) {
            const formattedAC = AcceptanceCriteriaFormatter.format(issue);

            // Prevent duplicates unless allow-duplicates flag is set
            if (!Config.ALLOW_DUPLICATES && testFileContent.includes(formattedAC.trim())) {
                this.logger.log("debug", `⚠️ Skipping duplicate AC for ${issue.key}`);
                continue;
            }

            if (testFileContent.includes(testGenMarker)) {
                updatedContent = testFileContent.replace(testGenMarker, `${formattedAC}\n${testGenMarker}`);
            } else {
                updatedContent += `\n${formattedAC}`;
            }
            addedIssues.push(issue.key);
        }

        if (addedIssues.length > 0) {
            if (!Config.DRY_RUN) {
                fs.writeFileSync(testFilePath, updatedContent, "utf-8");
                this.logger.log("info", `✅ AC for ${addedIssues.length} issue(s) appended to ${testFilePath}`);
            } else {
                this.logger.log("info", "🔍 Dry Run: AC would be written to file.");
            }
        }
    }
}
