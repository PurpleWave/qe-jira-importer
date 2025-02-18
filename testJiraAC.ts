import { importJiraAcceptanceCriteria } from './utils/JiraImporter';
import fs from 'fs';
import path from 'path';

// Define the Jira issue key and test file path
const issueKey = "CRM-1";
const testFilePath = path.resolve(__dirname, './tests/crm.spec.ts');

(async () => {
    try {
        console.log(`🛠️ Testing Jira AC Importer for issue: ${issueKey}`);

        // Ensure test file exists before running import
        if (!fs.existsSync(testFilePath)) {
            console.log(`📂 Test file not found. Creating: ${testFilePath}`);
            fs.writeFileSync(testFilePath, "// Playwright test file\n", 'utf-8');
        }

        // Run the import function
        await importJiraAcceptanceCriteria(issueKey, testFilePath);

        // Read the updated test file content
        const updatedContent = fs.readFileSync(testFilePath, 'utf-8');
        console.log(`✅ AC Import Successful! Updated Test File Content:\n`);
        console.log(updatedContent);

    } catch (error) {
        console.error(`❌ Test failed:`, error);
    }
})();
