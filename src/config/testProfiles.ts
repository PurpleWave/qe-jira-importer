export interface TestProfile {
    imports: string[];
    topLevelDescribe: (jiraTitle: string, jiraKey: string) => string;
    beforeAll: () => string;
    afterAll: () => string;
    beforeEach: () => string;
    afterEach: () => string;
    testBlock: (testName: string, steps: string[]) => string;
    timeout: number;
    retries: number;
    jiraMapping: {
      epicAsDescribe: boolean;
      storyAsNestedDescribe: boolean;
      testTitleFromIssue: boolean;
      stepsFromJira: boolean;
    };
}

// ✅ Define testProfiles as an indexed object
export const testProfiles: Record<string, TestProfile> = {
    CRM: {
      imports: [
        `import { test, expect } from '@playwright/test';`,
        `import { setupDemo } from '../utils/DemoSetup';`
      ],
      
      topLevelDescribe: (jiraTitle: string, jiraKey: string) => 
        `test.describe('${jiraTitle} @${jiraKey}', () => {`, // ✅ JIRA title + issue key
      
      beforeAll: () => `
        test.beforeAll(async ({ browser }) => {
          console.log('Initializing test suite...');
        });
      `,

      afterAll: () => `
        test.afterAll(async () => {
          console.log('Cleaning up test suite...');
        });
      `,

      beforeEach: () => `
        test.beforeEach(async ({ page }) => {
          await setupDemo(page);
        });
      `,

      afterEach: () => `
        test.afterEach(async ({ page }) => {
          console.log('Resetting test state...');
        });
      `,

      testBlock: (testName: string, steps: string[]) => `
        test('${testName}', async ({ page }) => {
          ${steps.map(step => `await ${step};`).join('\n')}
        });
      `,

      timeout: 20000,
      retries: 2,

      jiraMapping: {
        epicAsDescribe: false,  // ✅ No longer grouping by epic
        storyAsNestedDescribe: false, // ✅ No nested describes
        testTitleFromIssue: true,
        stepsFromJira: true
      }
    }
};
