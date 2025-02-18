import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const JIRA_BASE_URL = process.env.JIRA_BASE_URL || '';
const JIRA_USERNAME = process.env.JIRA_USERNAME || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || '';

/**
 * Fetches Acceptance Criteria (AC) from a Jira issue and injects it into a Playwright test file.
 * @param issueKey - The Jira issue key (e.g., "CRM-1")
 * @param testFilePath - Path to the Playwright test file
 */
export async function importJiraAcceptanceCriteria(issueKey: string, testFilePath: string) {
    try {
        const jiraApiUrl = `${JIRA_BASE_URL}/rest/api/2/issue/${issueKey}`;

        // Fetch Jira issue details
        const response = await axios.get(jiraApiUrl, {
            auth: { username: JIRA_USERNAME, password: JIRA_API_TOKEN },
            headers: { 'Accept': 'application/json' }
        });

        const issueData = response.data;
        const title = issueData.fields.summary || 'No Title';
        const description = issueData.fields.description || 'No AC found.';

        // Format AC properly
        const formattedAC = `/*
 * Jira Issue: ${issueKey}
 * Title: ${title}
 * Acceptance Criteria:
 * ${description.split('\n').map((line: string) => ` * ${line}`).join('\n')}
 */\n`;

        // Read existing test file content (if any)
        let testFileContent = fs.existsSync(testFilePath) ? fs.readFileSync(testFilePath, 'utf-8') : '';

        // Prevent duplicate AC by checking if it already exists
        if (testFileContent.includes(formattedAC.trim())) {
            console.log(`⚠️ AC for ${issueKey} already exists in ${testFilePath}. Skipping write.`);
            return;
        }

        // Remove any previous AC block before inserting new one
        testFileContent = testFileContent.replace(/\/\* Jira Issue: .*?\*\//gs, '').trim();

        // Inject AC at the top of the file
        const updatedContent = `${formattedAC}\n${testFileContent}`;

        // Write back to the test file
        fs.writeFileSync(testFilePath, updatedContent, 'utf-8');

        console.log(`✅ Successfully imported AC from ${issueKey} into ${testFilePath}`);

    } catch (error) {
        console.error(`❌ Failed to import AC from Jira issue ${issueKey}:`, error);
    }
}
