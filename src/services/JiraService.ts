import axios from "axios";
import https from "https";
import { Config } from "../config/Config";
import { Logger } from "../logging/Logger";

/**
 * Interface representing a Jira issue with key, title, and AC.
 */
export interface JiraIssue {
    key: string;
    title: string;
    acceptanceCriteria: string;
}

/**
 * Service to fetch Jira issues dynamically based on project and board selection.
 */
export class JiraService {
    private static logger = new Logger();

    /**
     * Fetches issues dynamically based on the selected projects and boards.
     * @param projectKey Jira project key (e.g., "CRM")
     * @param boardId Jira board ID (e.g., 123)
     * @returns Promise<JiraIssue[]> List of Jira issues with extracted AC.
     */
    public static async fetchIssues(projectKey: string, boardId: string): Promise<JiraIssue[]> {
        this.logger.log("info", `🔍 Fetching issues for Project: ${projectKey}, Board: ${boardId}`);

        const jiraApiUrl = `${Config.JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}/issue`;
        const issues: JiraIssue[] = [];

        try {
            let startAt = 0;
            let totalIssues = 0;
            do {
                const response = await axios.get(jiraApiUrl, {
                    params: { startAt, maxResults: 50, jql: `project=${projectKey}` },
                    auth: { username: Config.JIRA_USERNAME, password: Config.JIRA_API_TOKEN },
                    headers: { "Accept": "application/json" },
                    httpsAgent: new https.Agent({ rejectUnauthorized: false }), // Ignore SSL issues
                });

                const data = response.data;
                totalIssues = data.total || 0;
                startAt += data.issues.length;

                for (const issue of data.issues) {
                    const title = issue.fields.summary || "No Title";
                    const acField = issue.fields.description || "No AC found"; // Modify if AC is in a custom field

                    if (acField !== "No AC found") {
                        issues.push({ key: issue.key, title, acceptanceCriteria: acField });
                        this.logger.log("info", `✅ Fetched AC for ${issue.key}: ${title}`);
                    } else {
                        this.logger.log("debug", `⚠️ Skipping ${issue.key} (No AC found)`);
                    }
                }
            } while (startAt < totalIssues);

        } catch (error) {
            this.logger.log("error", `❌ Failed to fetch issues for ${projectKey} (Board ${boardId}): ${error}`);
        }

        return issues;
    }
}
