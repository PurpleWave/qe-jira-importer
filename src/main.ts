import { Config } from "./config/Config";
import { Logger } from "./logging/Logger";
import { ProjectHandler } from "./services/ProjectHandler";
import { FileAppender } from "./writers/FileAppender";
import path from "path";

/**
 * Entry point for extracting Jira AC and appending it to Playwright test files.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} A promise that resolves when the process is complete.
 */
async function main() {
    /**
     * Logger instance for logging messages.
     * @type {Logger}
     */
    const logger = new Logger();

    /**
     * Path to the Playwright test file.
     * @type {string}
     */
    const testFilePath = path.resolve(__dirname, "./tests/crm.spec.ts");

    // Log configuration settings and start extraction process
    logger.log("info", `🛠 Starting AC extraction for projects: ${Config.PROJECTS.join(", ")} on boards: ${Config.BOARDS.join(", ")}`);
    
    // Log dry run mode status
    logger.log("info", `🔍 Dry Run Mode: ${Config.DRY_RUN ? "Enabled" : "Disabled"}`);

    // Fetch issues from Jira
    /**
     * Fetches all issues from Jira.
     */
    const issues = await ProjectHandler.fetchAllIssues();

    if (issues.length === 0) {
        logger.log("info", "⚠️ No Jira issues with AC found. Exiting.");
        return;
    }

    // Append AC to Playwright test file
    /**
     * Appends acceptance criteria to the specified test file.
     * 
     * @param {Array} issues - The list of issues with acceptance criteria.
     * @param {string} filePath - The path to the test file.
     * @param {string} projectName - The name of the project.
     */
    FileAppender.appendAcceptanceCriteria(issues, testFilePath, "CRM");

    logger.log("info", `✅ AC extraction complete!`);
}

main().catch((error) => {
    console.error("❌ Unhandled Error:", error);
});
