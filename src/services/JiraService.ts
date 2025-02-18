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
 * Jira Service - Fetches Jira issues dynamically based on board type (Scrum or Kanban).
 */
export class JiraService {
    private static logger = new Logger();

    /**
     * Fetches issues from a Jira board, determining the correct approach based on its type.
     * @param boardId Jira board ID (e.g., 123)
     * @returns Promise<JiraIssue[]> List of Jira issues with extracted AC.
     */
    public static async fetchIssuesByBoard(boardId: string): Promise<JiraIssue[]> {
        this.logger.log("info", `🔍 Fetching issues for Board: ${boardId}`);

        try {
            // Step 1: Fetch board details to determine type
            const boardData = await this.fetchBoardDetails(boardId);
            if (!boardData) {
                this.logger.log("error", `❌ Failed to retrieve details for Board ${boardId}`);
                return [];
            }

            const boardType = boardData.type;
            this.logger.log("info", `📌 Board ${boardId} detected as ${boardType.toUpperCase()}`);

            // Step 2: Fetch issues based on board type
            if (boardType === "scrum") {
                return await this.fetchIssuesByScrumBoard(boardData);
            } else if (boardType === "simple" || boardType === "kanban") {
                return await this.fetchIssuesFromKanbanBoard(boardId);
            } else {
                this.logger.log("error", `❌ Unknown board type: ${boardType}`);
                return [];
            }
        } catch (error) {
            this.logger.log("error", `❌ Unexpected error in fetchIssuesByBoard: ${error}`);
            return [];
        }
    }

    /**
     * Fetches details about a Jira board.
     * @param boardId Jira board ID
     * @returns Board details or null if failed.
     */
    private static async fetchBoardDetails(boardId: string): Promise<any | null> {
        const url = `${Config.JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}`;
        this.logger.log("debug", `🧐 Fetching Board Details from: ${url}`);

        try {
            const response = await axios.get(url, {
                auth: { username: Config.JIRA_USERNAME, password: Config.JIRA_API_TOKEN },
                headers: { "Accept": "application/json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });

            this.logger.log("debug", `✅ Board API Response: ${JSON.stringify(response.data, null, 2)}`);
            return response.data;
        } catch (error) {
            this.handleApiError("Board Fetch", url, error);
            return null;
        }
    }

    /**
     * Fetches issues for a Scrum board using its filter ID.
     * @param boardData Board details from Jira API
     * @returns Promise<JiraIssue[]> List of Jira issues
     */
    private static async fetchIssuesByScrumBoard(boardData: any): Promise<JiraIssue[]> {
        const filterId = boardData?.filter?.id;
        if (!filterId) {
            this.logger.log("error", `❌ Scrum Board ${boardData.id} does not have an associated filter.`);
            return [];
        }

        this.logger.log("info", `📌 Scrum Board ${boardData.id} is linked to Filter ID: ${filterId}`);
        return await this.fetchIssuesByFilter(filterId);
    }

    /**
     * Fetches issues directly from a Kanban board.
     * @param boardId Jira board ID
     * @returns Promise<JiraIssue[]> List of Jira issues
     */
    private static async fetchIssuesFromKanbanBoard(boardId: string): Promise<JiraIssue[]> {
        const url = `${Config.JIRA_BASE_URL}/rest/agile/1.0/board/${boardId}/issue`;
        this.logger.log("debug", `🧐 Fetching Issues from Kanban Board: ${url}`);

        try {
            const response = await axios.get(url, {
                auth: { username: Config.JIRA_USERNAME, password: Config.JIRA_API_TOKEN },
                headers: { "Accept": "application/json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });

            this.logger.log("debug", `✅ Issues API Response: ${JSON.stringify(response.data, null, 2)}`);

            return response.data.issues.map((issue: any) => ({
                key: issue.key,
                title: issue.fields.summary || "No Title",
                acceptanceCriteria: issue.fields.description || "No AC found",
            }));
        } catch (error) {
            this.handleApiError("Kanban Issue Fetch", url, error);
            return [];
        }
    }

    /**
     * Fetches issues using a Filter ID (Scrum Boards).
     * @param filterId Jira filter ID
     * @returns Promise<JiraIssue[]> List of Jira issues matching the JQL query.
     */
    private static async fetchIssuesByFilter(filterId: string): Promise<JiraIssue[]> {
        const filterUrl = `${Config.JIRA_BASE_URL}/rest/api/2/filter/${filterId}`;
        this.logger.log("debug", `🧐 Fetching JQL from: ${filterUrl}`);

        try {
            const filterResponse = await axios.get(filterUrl, {
                auth: { username: Config.JIRA_USERNAME, password: Config.JIRA_API_TOKEN },
                headers: { "Accept": "application/json" },
                httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });

            const jqlQuery = filterResponse.data?.jql;
            if (!jqlQuery) {
                this.logger.log("error", `❌ No JQL found for Filter ID: ${filterId}`);
                return [];
            }

            this.logger.log("info", `📝 JQL Query for Filter ${filterId}: ${jqlQuery}`);
            return await this.fetchIssuesByJQL(jqlQuery);
        } catch (error) {
            this.handleApiError("Filter Fetch", filterUrl, error);
            return [];
        }
    }

    /**
     * Fetches issues using a provided JQL query.
     * @param jql JQL query string
     * @returns Promise<JiraIssue[]> List of Jira issues matching the JQL query.
     */
    private static async fetchIssuesByJQL(jql: string): Promise<JiraIssue[]> {
        const issues: JiraIssue[] = [];
        let startAt = 0;
        let totalIssues = 0;

        try {
            do {
                const queryUrl = `${Config.JIRA_BASE_URL}/rest/api/2/search`;
                this.logger.log("debug", `🧐 Fetching Issues with JQL from: ${queryUrl}`);

                let response;
                try {
                    response = await axios.get(queryUrl, {
                        params: { jql, startAt, maxResults: 50 },
                        auth: { username: Config.JIRA_USERNAME, password: Config.JIRA_API_TOKEN },
                        headers: { "Accept": "application/json" },
                        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                    });
                    this.logger.log("debug", `✅ Issues API Response: ${JSON.stringify(response.data, null, 2)}`);
                } catch (error: any) {
                    this.handleApiError("Issue Fetch", queryUrl, error);
                    return [];
                }

                const data = response.data;
                totalIssues = data.total || 0;
                startAt += data.issues.length;

                for (const issue of data.issues) {
                    const title = issue.fields.summary || "No Title";
                    const acField = issue.fields.description || "No AC found"; // Adjust if AC is in a custom field

                    if (acField !== "No AC found") {
                        issues.push({ key: issue.key, title, acceptanceCriteria: acField });
                        this.logger.log("info", `✅ Fetched AC for ${issue.key}: ${title}`);
                    } else {
                        this.logger.log("debug", `⚠️ Skipping ${issue.key} (No AC found)`);
                    }
                }
            } while (startAt < totalIssues);

            return issues;
        } catch (error) {
            this.logger.log("error", `❌ Unexpected error in fetchIssuesByJQL: ${error}`);
            return [];
        }
    }

    /**
     * Handles API errors and logs details for debugging.
     * @param step Description of the step that failed
     * @param url The URL of the request
     * @param error The error object from axios
     */
    private static handleApiError(step: string, url: string, error: any): void {
        if (error.response) {
            this.logger.log("error", `❌ ${step} failed at URL: ${url}`);
            this.logger.log("error", `   Status: ${error.response.status}`);
            this.logger.log("error", `   Response: ${JSON.stringify(error.response.data, null, 2)}`);
        } else if (error.request) {
            this.logger.log("error", `❌ ${step} failed at URL: ${url}`);
            this.logger.log("error", `   No response received. Possible network issue.`);
        } else {
            this.logger.log("error", `❌ ${step} error: ${error.message}`);
        }
    }
}
