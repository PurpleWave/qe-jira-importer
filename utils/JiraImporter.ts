import fs from 'fs';
import path from 'path';
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
const JIRA_USERNAME = process.env.JIRA_USERNAME || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';

/**
 * Interface representing a Jira issue with key, title, and Acceptance Criteria.
 */
interface JiraIssue {
    key: string;
    title: string;
    acceptanceCriteria: string;
}

/**
 * Fetches Acceptance Criteria (AC) from multiple Jira issues.
 * @param issueKeys - Array of Jira issue keys (e.g., ["CRM-1", "CRM-2"])
 * @returns {Promise<JiraIssue[]>} - List of Jira issues with extracted AC.
 */
export async function fetchJiraAcceptanceCriteria(issueKeys: string[]): Promise<JiraIssue[]> {
    const issues: JiraIssue[] = [];

    for (const issueKey of issueKeys) {
        try {
            const jiraApiUrl = `${JIRA_BASE_URL}/rest/api/2/issue/${issueKey}`;
            
            // Axios request with SSL verification disabled
            const response = await axios.get(jiraApiUrl, {
                auth: { username: JIRA_USERNAME, password: JIRA_API_TOKEN },
                headers: { 'Accept': 'application/json' },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false, // Ignore certificate issues
                }),
            });

            const issueData = response.data || {};
            const fields = issueData.fields || {};
            const title = fields.summary || 'No Title';
            const customACField = fields['customfield_XXXXX']; // Adjust field ID if necessary
            const description = customACField || fields.description || 'No AC found.';

            issues.push({
                key: issueKey,
                title,
                acceptanceCriteria: description
            });

        } catch (error) {
            console.error(`❌ Failed to fetch Jira issue ${issueKey}:`, error);
        }
    }
    
    return issues;
}

/**
 * Formats Acceptance Criteria (AC) into a structured comment block.
 * @param issue - JiraIssue object
 * @returns {string} - Formatted AC block
 */
function formatAcceptanceCriteria(issue: JiraIssue): string {
    return `\n/*\n * Jira Issue: ${issue.key}\n * Title: ${issue.title}\n * Acceptance Criteria:\n * ${issue.acceptanceCriteria.split('\n').map((line: string) => ` * ${line}`).join('\n')}\n */\n`;
}

/**
 * Appends Acceptance Criteria (AC) to the `crm.spec.ts` file in the `tests` folder.
 * @param testFilePath - Path to the Playwright test file
 * @param issues - List of Jira issues with AC
 * @param allowDuplicates - Whether to allow duplicate AC entries (default: false)
 */
export function appendAcceptanceCriteriaToTestFile(testFilePath: string, issues: JiraIssue[], allowDuplicates = false): void {
    let testFileContent = fs.existsSync(testFilePath) ? fs.readFileSync(testFilePath, 'utf-8') : '';

    // Insert AC above @TESTGEN or at the bottom if not found
    const testGenMarker = "@TESTGEN";

    for (const issue of issues) {
        const formattedAC = formatAcceptanceCriteria(issue);

        // Prevent duplicate AC unless allowed
        if (!allowDuplicates && testFileContent.includes(formattedAC.trim())) {
            console.log(`⚠️ AC for ${issue.key} already exists in ${testFilePath}. Skipping.`);
            continue;
        }

        if (testFileContent.includes(testGenMarker)) {
            testFileContent = testFileContent.replace(testGenMarker, `${formattedAC}\n${testGenMarker}`);
        } else {
            testFileContent += `\n${formattedAC}`;
        }
    }

    fs.writeFileSync(testFilePath, testFileContent, 'utf-8');
    console.log(`✅ AC for ${issues.length} issue(s) appended to ${testFilePath}`);
}
