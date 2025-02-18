import { JiraService, JiraIssue } from "../services/JiraService";
import { Config } from "../config/Config";
import { Logger } from "../logging/Logger";

/**
 * Handles multi-project AC extraction and manages Jira API calls.
 */
export class ProjectHandler {
    private static logger = new Logger();

    /**
     * Fetches AC from all selected projects and boards.
     * @returns Promise<JiraIssue[]> Aggregated list of Jira issues with AC.
     */
    public static async fetchAllIssues(): Promise<JiraIssue[]> {
        if (Config.PROJECTS.length === 0 || Config.BOARDS.length === 0) {
            ProjectHandler.logger.log("error", "❌ No projects or boards specified. Use --project and --board.");
            return [];
        }

        let allIssues: JiraIssue[] = [];

        for (const project of Config.PROJECTS) {
            for (const board of Config.BOARDS) {
                const issues = await JiraService.fetchIssues(project, board);
                allIssues = allIssues.concat(issues);
            }
        }

        ProjectHandler.logger.log("info", `📊 Total Jira issues extracted: ${allIssues.length}`);
        return allIssues;
    }
}
