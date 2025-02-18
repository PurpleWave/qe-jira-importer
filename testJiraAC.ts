import { fetchJiraAcceptanceCriteria, appendAcceptanceCriteriaToTestFile } from './utils/JiraImporter';
import fs from 'fs';
import path from 'path';

// Define Jira issues and the Playwright test file path
const issueKeys = ["CRM-1", "CRM-2", "CRM-3"];
const testFilePath = path.resolve(__dirname, './tests/crm.spec.ts');
const allowDuplicates = false; // Set to true to allow multiple AC entries

(async () => {
    try {
        console.log(`🛠️ Fetching AC for Jira issues: ${issueKeys.join(', ')}`);

        // Ensure test file exists before appending
        if (!fs.existsSync(testFilePath)) {
            console.log(`📂 Test file not found. Creating: ${testFilePath}`);
            fs.writeFileSync(testFilePath, "// Playwright test file\n", 'utf-8');
        }

        // Fetch and append AC
        const issues = await fetchJiraAcceptanceCriteria(issueKeys);
        appendAcceptanceCriteriaToTestFile(testFilePath, issues, allowDuplicates);

        console.log(`✅ AC Successfully appended to ${testFilePath}!`);
    } catch (error) {
        console.error(`❌ Failed to append AC:`, error);
    }
})();
