import { Config } from "./config/Config";
import { Logger } from "./logging/Logger";
import { ProjectHandler } from "./services/ProjectHandler";
import { FileAppender } from "./writers/FileAppender";
import path from "path";

/**
 * Entry point for extracting Jira AC and appending it to Playwright test files.
 */
async function main() {
    const logger = new Logger();
    const testFilePath = path.resolve(__dirname, "./tests/crm.spec.ts");

    logger.log("info", `🛠 Starting AC extraction for projects: ${Config.PROJECTS.join(", ")} on boards: ${Config.BOARDS.join(", ")}`);
    logger.log("info", `🔍 Dry Run Mode: ${Config.DRY_RUN ? "Enabled" : "Disabled"}`);

    // Fetch issues from Jira
    const issues = await ProjectHandler.fetchAllIssues();

    if (issues.length === 0) {
        logger.log("info", "⚠️ No Jira issues with AC found. Exiting.");
        return;
    }

    // Append AC to Playwright test file
    FileAppender.appendAcceptanceCriteria(issues, testFilePath);

    logger.log("info", `✅ AC extraction complete!`);
}

main().catch((error) => {
    console.error("❌ Unhandled Error:", error);
});
