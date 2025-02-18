/**
 * Formats Jira Acceptance Criteria (AC) into structured comments for Playwright.
 */
export class AcceptanceCriteriaFormatter {
    /**
     * Formats a Jira issue's AC into a structured Playwright comment block.
     * @param issue Jira issue object
     * @returns Formatted AC comment block
     */
    public static format(issue: { key: string; title: string; acceptanceCriteria: string }): string {
        return `
/*
 * Jira Issue: ${issue.key}
 * Title: ${issue.title}
 * Acceptance Criteria:
${issue.acceptanceCriteria.split("\n").map((line) => ` * ${line}`).join("\n")}
 */
`;
    }
}
