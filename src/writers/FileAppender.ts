import fs from "fs";
import { Config } from "../config/Config";
import { Logger } from "../logging/Logger";
import { AcceptanceCriteriaFormatter } from "../formatters/AcceptanceCriteriaFormatter";
import { testProfiles } from '../config/testProfiles';

/**
 * Handles writing formatted AC to Playwright test files.
 */
export class FileAppender {
    private static logger = new Logger();

    /**
     * Appends formatted AC to Playwright test files, updating existing tests or inserting before `@TESTGEN`.
     * 
     * @param {Array} issues - Jira issues with AC
     * @param {string} testFilePath - Path to the Playwright test file
     * @param {string} appName - The application profile name
     */
    public static appendAcceptanceCriteria(
        issues: { key: string; title: string; acceptanceCriteria: string }[],
        testFilePath: string,
        appName: string
    ): void {
        if (issues.length === 0) {
            this.logger.log("info", "⚠️ No AC to append.");
            return;
        }

        // Read the existing test file content or initialize with a default comment
        let testFileContent = fs.existsSync(testFilePath)
            ? fs.readFileSync(testFilePath, "utf-8")
            : "// Playwright test file\n";      // TODO: Add default imports

        // Marker to insert new tests before if it exists in the file content
        const testGenMarker = "// @TESTGEN";
        let addedIssues: string[] = [];

        // Extract existing test blocks using regex
        const existingTests: Record<string, string> = {};
        const describeRegex = /test\.describe\('(.+?) @(.+?)', \(\) => \{([\s\S]*?)\n\}\);/gm;
        let match;
        while ((match = describeRegex.exec(testFileContent)) !== null) {
            existingTests[match[2]] = match[0]; // Store full existing test block
        }

        // Extract existing import statements using regex
        const importRegex = /^import .+?;$/gm;
        const existingImports = new Set(testFileContent.match(importRegex) || []);
        console.log(existingImports);
        
        // Collect all needed test blocks and new imports
        let formattedTests: string[] = [];
        let newImports = new Set<string>();
        
        issues.forEach(issue => {
            const formattedAC = AcceptanceCriteriaFormatter.format(issue, appName);
            const profile = testProfiles[appName];

            // Ensure imports are included only once
            profile.imports.forEach(imp => newImports.add(imp));

            if (existingTests[issue.key]) {
                // Replace existing test block with updated AC
                testFileContent = testFileContent.replace(existingTests[issue.key], formattedAC);
            } else {
                // Add new formatted test block
                formattedTests.push(formattedAC);
            }

            addedIssues.push(issue.key);
        });
        /** */
        // Rebuild file content with updated imports and tests
        let finalContent = `${[...existingImports, ...newImports].join("\n")}\n\n`;

        // Insert updated tests before the test generation marker if it exists
        const testGenIndex = testFileContent.indexOf(testGenMarker);
        if (testGenIndex !== -1) {
            finalContent += testFileContent.substring(0, testGenIndex).trim();
            finalContent += `\n\n${formattedTests.join("\n\n")}\n\n${testGenMarker}`;
        } else {
            finalContent += testFileContent.trim();
            finalContent += `\n\n${formattedTests.join("\n\n")}`;
        }

        // Write final output to the file if not in dry run mode
        if (!Config.DRY_RUN) {
            fs.writeFileSync(testFilePath, finalContent, "utf-8");
            this.logger.log("info", `✅ AC for ${addedIssues.length} issue(s) appended to ${testFilePath}.`);
        } else {
            this.logger.log("info", "🔍 Dry Run: AC would be written to file.");
        }
    }
}
