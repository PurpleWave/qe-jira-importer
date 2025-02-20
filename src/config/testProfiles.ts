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
    
    // DEMO PROFILE
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
          ${steps.map(step => `${step}`).join('\n')}
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
    },

    // Inventory Management System Profile
    /**
     * This profile is for the Inventory Management System project.
     * It includes the necessary imports, test lifecycle hooks, and test block formatting.
     * It also includes the Jira mapping configuration for this project.
     * 
     * @see {@link TestProfile}
     * @see {@link testProfiles}
     * @see {@link AcceptanceCriteriaFormatter}
     * @see {@link FileAppender}
     * @see {@link ProjectHandler}
     * @see {@link Logger}
     * @see {@link Config}
     * @see {@link main}
     * 
     * @since 1.0.0
     * @version 1.0.0
     * 
     * @example
     * // Import the IMS test profile
     * import { testProfiles } from '../config/testProfiles';
     * 
     * // Use the IMS test profile
     * const profile = testProfiles['IMS'];
     */
    IMS: {
        imports: [
          `import { test, expect } from '@playwright/test';`,
          `import { setupDemoIMS } from '../utils/DemoSetupIMS';`
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
            await setupDemoIMS(page);
          });
        `,
  
        afterEach: () => `
          test.afterEach(async ({ page }) => {
            console.log('Resetting test state...');
          });
        `,
  
        testBlock: (testName: string, steps: string[]) => `
          test('${testName}', async ({ page }) => {
            ${steps.map(step => `${step}`).join('\n')}
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
      },

      /**
       * This profile is for the CLIQ project.
       * It includes the necessary imports, test lifecycle hooks, and test block formatting.
       * It also includes the Jira mapping configuration for this project.
       * 
       * @see {@link TestProfile}
       * @see {@link testProfiles}
       * @see {@link AcceptanceCriteriaFormatter}
       * @see {@link FileAppender}
       * @see {@link ProjectHandler}
       * @see {@link Logger}
       * @see {@link Config}
       * @see {@link main}
       * 
       * @since 1.0.0
       * @version 1.0.0
       * 
       * @example
       * // Import the CLIQ test profile
       * import { testProfiles } from '../config/testProfiles';
       * 
       * // Use the CLIQ test profile
       * const profile = testProfiles['CLIQ'];
       */
      CLIQ: {
        imports: [
          `import { test, expect } from '@playwright/test';`,
          `import { setupDemoCliq } from '../utils/DemoSetupCliq';`
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
            await setupDemoCLIQ(page);
          });
        `,
  
        afterEach: () => `
          test.afterEach(async ({ page }) => {
            console.log('Resetting test state...');
          });
        `,
  
        testBlock: (testName: string, steps: string[]) => `
          test('${testName}', async ({ page }) => {
            ${steps.map(step => `${step}`).join('\n')}
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
      },

      /**
       * This profile is for the Purple Wave project.
       * It includes the necessary imports, test lifecycle hooks, and test block formatting.
       * It also includes the Jira mapping configuration for this project.
       * 
       * @see {@link TestProfile}
       * @see {@link testProfiles}
       * @see {@link AcceptanceCriteriaFormatter}
       * @see {@link FileAppender}
       * @see {@link ProjectHandler}
       * @see {@link Logger}
       * @see {@link Config}
       * @see {@link main}
       * 
       * @since 1.0.0
       * @version 1.0.0
       * 
       * @example
       * // Import the Purple Wave test profile
       * import { testProfiles } from '../config/testProfiles';
       * 
       * // Use the Purple Wave test profile
       * const profile = testProfiles['PW'];
       */
      PW: {
        imports: [
          `import { test, expect } from '@playwright/test';`,
          `import { setupDemoPW } from '../utils/DemoSetupPW';`
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
            await setupDemoPW(page);
          });
        `,
  
        afterEach: () => `
          test.afterEach(async ({ page }) => {
            console.log('Resetting test state...');
          });
        `,
  
        testBlock: (testName: string, steps: string[]) => `
          test('${testName}', async ({ page }) => {
            ${steps.map(step => `${step}`).join('\n')}
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
