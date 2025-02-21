import fs from "fs";
import { Config } from "../config/Config";
import { Logger } from "../logging/Logger";
import { AcceptanceCriteriaFormatter } from "../formatters/AcceptanceCriteriaFormatter";
import { testProfiles } from '../config/testProfiles';
import { FileScanner } from "./FileScanner";

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

        const { content, existingTests, existingImports, testGenMarkerIndex } = FileScanner.scanTestFile(testFilePath);

        let updatedContent = content;
        let addedIssues: string[] = [];
        let formattedTests: string[] = [];

        // Ensure we don't re-add existing imports
        let newImports = new Set<string>(existingImports);
        console.log("FILE APPENDER New Imports:", Array.from(newImports));


        issues.forEach(issue => {
            const formattedAC = AcceptanceCriteriaFormatter.format(issue, appName);
            const profile = testProfiles[appName];

            // Only add imports if they are not already present
            profile.imports.forEach(imp => {
                if (!existingImports.has(imp)) {
                    newImports.add(imp);
                }
            });

            if (existingTests[issue.key]) {
                // Replace existing test block with updated AC
                updatedContent = updatedContent.replace(existingTests[issue.key], formattedAC);
            } else {
                // Add new formatted test block
                formattedTests.push(formattedAC);
            }

            addedIssues.push(issue.key);
        });

// Step 1: Convert newImports into a sorted, unique string
console.log("Step 1: Original Imports Set:", newImports);
let finalImports = [...newImports].sort().join("\n");
console.log("Step 1 Result: Sorted Unique Imports:\n", finalImports);

// Step 2: Initialize an array to hold the final content
let finalContentArray: string[] = [];
console.log("Step 2: Initialized Final Content Array:", finalContentArray);

// Step 3: Add imports first, preventing duplication
if (finalImports.trim()) {
    finalContentArray.push(finalImports);
    console.log("Step 3: Added Final Imports to Content Array:", finalContentArray);
} else {
    console.log("Step 3: No imports to add");
}

// Step 4: Add the updated file content without modifying structure
console.log("Step 4: Original Updated Content:\n", updatedContent);
if (updatedContent.trim()) {
    finalContentArray.push(updatedContent.trim());
    console.log("Step 4 Result: Added Updated Content to Content Array:", finalContentArray);
} else {
    console.log("Step 4: No updated content to add");
}

// Step 5: Log the final assembled content



        // Handle @TESTGEN marker placement
        if (testGenMarkerIndex !== -1) {
            let beforeMarker = updatedContent.substring(0, testGenMarkerIndex).trim();
            let afterMarker = formattedTests.length > 0 ? `\n\n${formattedTests.join("\n\n")}` : "";
            finalContentArray.push(beforeMarker + afterMarker + "\n\n// @TESTGEN");
        } else if (formattedTests.length > 0) {
            finalContentArray.push(formattedTests.join("\n\n"));
        }

        // Join everything with a single newline separator to avoid extra blank lines
        let finalContent = finalContentArray.join("\n\n").trim() + "\n";
        // console.log("Step 5: Final Rebuilt File Content:\n", finalContent);

        // Write final output to the file if not in dry run mode
        if (!Config.DRY_RUN) {
            fs.writeFileSync(testFilePath, finalContent, "utf-8");
            this.logger.log("info", `✅ AC for ${addedIssues.length} issue(s) appended to ${testFilePath}.`);
        } else {
            this.logger.log("info", "🔍 Dry Run: AC would be written to file.");
        }
    }
}
