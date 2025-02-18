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
    public static appendAcceptanceCriteria(
        issues: { key: string; title: string; acceptanceCriteria: string }[],
        testFilePath: string
    ): void {
        if (issues.length === 0) {
            this.logger.log("info", "⚠️ No AC to append.");
            return;
        }

        let testFileContent = fs.existsSync(testFilePath)
            ? fs.readFileSync(testFilePath, "utf-8")
            : "// Playwright test file\n";

        const testGenMarker = "@TESTGEN";
        let addedIssues: string[] = [];

        // Sort issues numerically (CRM-1, CRM-2, etc.)
        const sortedIssues = issues.sort((a, b) => {
            const numA = parseInt(a.key.replace(/\D/g, ""), 10);
            const numB = parseInt(b.key.replace(/\D/g, ""), 10);
            return numA - numB;
        });

        // Format ACs in sorted order
        const formattedACs = sortedIssues.map(issue => {
            const formattedAC = AcceptanceCriteriaFormatter.format(issue);

            // Prevent duplicates unless allow-duplicates flag is set
            if (!Config.ALLOW_DUPLICATES && testFileContent.includes(formattedAC.trim())) {
                this.logger.log("debug", `⚠️ Skipping duplicate AC for ${issue.key}`);
                return null;
            }

            addedIssues.push(issue.key);
            return formattedAC;
        }).filter(Boolean); // Remove null entries from skipped duplicates

        if (formattedACs.length > 0) {
            let updatedContent = testFileContent;

            if (testFileContent.includes(testGenMarker)) {
                const markerRegex = /(\/\/\s*@TESTGEN[^\n]*)/g;
                updatedContent = testFileContent.replace(
                    markerRegex,
                    `${formattedACs.join("\n\n")}\n\n$1`
                );
            } else {
                updatedContent += `\n\n${formattedACs.join("\n\n")}`;
            }

            if (!Config.DRY_RUN) {
                fs.writeFileSync(testFilePath, updatedContent, "utf-8");
                this.logger.log("info", `✅ AC for ${addedIssues.length} issue(s) appended to ${testFilePath} in numerical order.`);
            } else {
                this.logger.log("info", "🔍 Dry Run: AC would be written to file.");
            }
        }
    }
}
