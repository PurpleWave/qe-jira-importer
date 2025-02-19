# Source Code Overview

This directory contains the core source code for the **BDD Importer** project. Below is an overview of the key components and their responsibilities.

## Modules

### Config
- **[Config.ts](config/Config.ts)**: Manages configuration settings, including environment variables and CLI arguments.

### Formatters
- **[AcceptanceCriteriaFormatter.ts](formatters/AcceptanceCriteriaFormatter.ts)**: Formats Jira Acceptance Criteria (AC) into structured comments for Playwright test files.

### Logging
- **[Logger.ts](logging/Logger.ts)**: Handles logging, including real-time console output and log file generation.

### Logs
- **logs/**: Directory for storing log files generated during the import process.

### Main
- **[main.ts](main.ts)**: Entry point for the application. Orchestrates the extraction of Jira AC and appending it to Playwright test files.

### Services
- **[JiraService.ts](services/JiraService.ts)**: Fetches Jira issues dynamically based on board type (Scrum or Kanban).
- **[ProjectHandler.ts](services/ProjectHandler.ts)**: Manages multi-project AC extraction and Jira API calls.

### Tests
- **[crm.spec.ts](tests/crm.spec.ts)**: Sample Playwright test file for CRM module.
- **[example.spec.ts](tests/example.spec.ts)**: Example Playwright test file.

### Writers
- **[FileAppender.ts](writers/FileAppender.ts)**: Handles writing formatted AC to Playwright test files.

## Usage

Refer to the main [README.md](../README.md) for setup and usage instructions.

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
```TS
$ ts-node main.ts --project CRM --board 1
```