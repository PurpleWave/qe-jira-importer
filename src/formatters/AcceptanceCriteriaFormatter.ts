/**
 * Formats Jira Acceptance Criteria (AC) into structured Playwright tests.
 */
export class AcceptanceCriteriaFormatter {
    /**
     * Formats a Jira issue's AC into a structured Playwright test template.
     * @param issue Jira issue object
     * @param pageName The name of the Page Object Model (POM) class
     * @returns Formatted Playwright test suite as a string
     */
    public static format(issue: { key: string; title: string; acceptanceCriteria: string }, pageName: string): string {
        // Log the original acceptance criteria format
        console.log("Original Acceptance Criteria:\n", issue.acceptanceCriteria);

        // Format the Acceptance Criteria as a structured comment
        const formattedAC = issue.acceptanceCriteria
            .split("\n")
            .map((line) => ` * - [ ] ${line.trim()}`) // Converts to checklist format
            .join("\n");

        return `
test.describe('${issue.title} @${issue.key}', () => {
    /**
     * Acceptance Criteria:
${formattedAC}
     */

    test('Navigate to ${pageName}', async ({ page }) => {
        expect(true).toBe(true); // Placeholder test assertion
    });
});
        `.trim(); // Trim any extra spaces
    }
}
