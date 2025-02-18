# BDD Importer

## Overview
The **BDD Importer** automates the process of importing Jira Acceptance Criteria (AC) into Playwright test files. It fetches AC from Jira issues and appends them to test files in a structured format, ensuring test coverage remains synchronized with documented requirements.

## Features
- Fetches Jira issues with Acceptance Criteria (AC)
- Appends AC to Playwright test files before `@TESTGEN`
- Prevents duplicate AC entries (unless explicitly allowed)
- Supports numerical sorting of Jira issue keys (CRM-1, CRM-2, etc.)
- Integrated logging for debugging and tracking

---

## Setup

### Prerequisites
- Node.js (v16+ recommended)
- TypeScript
- Playwright
- Jira API Access
- GitHub Actions (if using CI/CD)

### Installation
```sh
# Clone the repository
$ git clone https://github.com/your-org/bdd-importer.git
$ cd bdd-importer

# Install dependencies
$ npm install
```

### Configuration
Create a `.env` file for Jira API credentials and configuration.
```sh
JIRA_API_TOKEN=your_token
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_PROJECT_KEY=CRM
JIRA_BOARD_ID=1
ALLOW_DUPLICATES=false
DRY_RUN=false
```

Update `config/Config.ts` to match your project setup.

---

## Usage

### Running the Importer
To fetch Jira issues and append AC to Playwright tests:
```sh
$ ts-node main.ts --project CRM --board 1
```
- `--project`: Jira project key
- `--board`: Jira board ID

Example output:
```
🛠 Starting AC extraction for projects: CRM on boards: 1
📊 Total Jira issues extracted: 6
✅ AC for 6 issue(s) appended to src/tests/crm.spec.ts in numerical order.
```

### Playwright Test File Example
#### **Before Import**
```typescript
/**
 * THIS IS A TEST FOR THE JIRA IMPORTER
 */

// @TESTGEN - for AI generated scaffolding

/**
 * AC SHOULD BE ABOVE THE @TESTGEN MARKER
 */
```

#### **After Import**
```typescript
/**
 * THIS IS A TEST FOR THE JIRA IMPORTER
 */

/*
 * Jira Issue: CRM-1
 * Title: Customer Interaction Tracking
 * Acceptance Criteria:
 * Track and manage customer interactions and communications.
 */

/*
 * Jira Issue: CRM-2
 * Title: User Management
 * Acceptance Criteria:
 * Manage user accounts and permissions within the CRM system.
 */

// @TESTGEN - for AI generated scaffolding

/**
 * AC SHOULD BE ABOVE THE @TESTGEN MARKER
 */
```

---

## File Structure
```
📂 bdd-importer
├── 📂 src
│   ├── 📂 config
│   │   ├── Config.ts
│   ├── 📂 formatters
│   │   ├── AcceptanceCriteriaFormatter.ts
│   ├── 📂 logging
│   │   ├── Logger.ts
│   ├── 📂 services
│   │   ├── JiraService.ts
│   │   ├── ProjectHandler.ts
│   ├── 📂 writers
│   │   ├── FileAppender.ts
│   ├── 📂 tests
│   │   ├── crm.spec.ts
│   ├── main.ts
├── .env
├── package.json
├── tsconfig.json
```

---

## Development

### Debugging
Enable verbose logging in `Config.ts`:
```ts
export const Config = {
  LOG_LEVEL: "debug", // Set to "info" for less verbosity
  ALLOW_DUPLICATES: false,
  DRY_RUN: false,
};
```
Run with logging:
```sh
$ ts-node main.ts --project CRM --board 1
```

### Testing
Run Playwright tests:
```sh
$ npx playwright test
```

---

## CI/CD Integration
For automated Jira imports in GitHub Actions:

#### **`.github/workflows/import.yml`**
```yaml
name: Jira Importer
on:
  schedule:
    - cron: '0 2 * * *' # Runs daily at 2 AM UTC
  workflow_dispatch:

jobs:
  import:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16
      - name: Install dependencies
        run: npm install
      - name: Run BDD Importer
        run: ts-node src/main.ts --project CRM --board 1
        env:
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
```

---

## Troubleshooting

| Issue | Solution |
|--------|----------|
| `⚠️ No AC to append.` | Check if Jira API credentials are correct. |
| `✅ AC for 1 issue(s) appended` repeatedly | Ensure the loop processes all issues. |
| `Jira API rate limit exceeded` | Reduce requests or implement caching. |
| `CRM-1 appears after CRM-3` | Sorting issue; ensure numerical sorting in `FileAppender.ts`. |

---

## Contributing
1. Fork the repo
2. Create a new branch (`feature/my-feature`)
3. Commit changes
4. Submit a PR

---

## License
MIT License. See `LICENSE` for details.

---

## Authors
- **Your Name** - Initial Work
- **Contributors Welcome!**

