import { test } from '@playwright/test';
import { testProfiles } from '../config/testProfiles';

export class AcceptanceCriteriaFormatter {
  public static format(issue: { key: string; title: string; acceptanceCriteria: string }, appName: string): string {
    const profile = testProfiles[appName]; 
    if (!profile) throw new Error(`Test profile for ${appName} not found`);

    // ✅ Format Jira Acceptance Criteria as a checklist
    const formattedAC = issue.acceptanceCriteria
      .split("\n")
      .map(line => ` * - [ ] ${line.trim()}`)
      .join("\n");

    // ✅ Generate Describe Block Header
    const describeBlockHeader = profile.topLevelDescribe(issue.title, issue.key);

    // ✅ Convert Jira AC into test steps
    const testSteps = issue.acceptanceCriteria
      .split("\n")
      .map((step, index) => `await step${index + 1}(page);`);

    // ✅ Generate and return a formatted test block (no file modification)
    return `
${describeBlockHeader}
  /**
   * Acceptance Criteria:
${formattedAC}
   */

  ${profile.testBlock(issue.title, testSteps)}

  ${profile.afterEach()}
  ${profile.afterAll()}
});
    `.trim();
  }
}
