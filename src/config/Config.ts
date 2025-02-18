import dotenv from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";

// Force dotenv to load from the correct location
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Configuration manager that loads CLI arguments and environment variables.
 */
export class Config {
    public static readonly JIRA_BASE_URL = process.env.JIRA_BASE_URL || "";
    public static readonly JIRA_USERNAME = process.env.JIRA_USERNAME || "";
    public static readonly JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";

    public static readonly LOGS_DIR = "./logs";
    public static readonly LOG_RETENTION_DAYS = 90; // Auto-delete logs older than 90 days

    public static readonly argv = yargs(hideBin(process.argv))
    .option("project", { type: "array", alias: "p", describe: "Jira project(s) to fetch issues from" })
    .option("board", { type: "array", alias: "b", describe: "Jira board(s) to fetch issues from" })
    .option("dry-run", { type: "boolean", alias: "d", describe: "Simulate execution without making changes" })
    .option("allow-duplicates", { type: "boolean", alias: "dup", describe: "Allow duplicate AC entries" })
    .option("log-level", { type: "string", alias: "l", default: "info", choices: ["info", "debug", "error"], describe: "Set logging verbosity" })
    .help()
    .parseSync(); // Ensures correct type inference


    public static readonly PROJECTS: string[] = (Config.argv.project as string[]) || [];
    public static readonly BOARDS: string[] = (Config.argv.board as string[]) || [];
    public static readonly DRY_RUN: boolean = Config.argv["dry-run"] as boolean;
    public static readonly ALLOW_DUPLICATES: boolean = Config.argv["allow-duplicates"] as boolean;
    public static readonly LOG_LEVEL: string = Config.argv["log-level"] as string;

}
