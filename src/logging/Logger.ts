import fs from "fs";
import path from "path";
import chalk from "chalk";
import { Config } from "../config/Config";

/**
 * Logger class that manages real-time logging and log file generation.
 */
export class Logger {
    private static readonly LOGS_DIR = Config.LOGS_DIR;
    private static readonly TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");
    private static readonly LOG_FILE = path.join(Logger.LOGS_DIR, `ac_import_${Logger.TIMESTAMP}.log`);

    constructor() {
        this.ensureLogsDirExists();
        this.cleanOldLogs();
    }

    /**
     * Ensures the logs directory exists.
     */
    private ensureLogsDirExists(): void {
        if (!fs.existsSync(Logger.LOGS_DIR)) {
            fs.mkdirSync(Logger.LOGS_DIR, { recursive: true });
        }
    }

    /**
     * Logs a message to the console and appends it to the log file.
     * @param level Log level ("info", "debug", "error")
     * @param message Message to log
     */
    public log(level: "info" | "debug" | "error", message: string): void {
        const formattedMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
        if (Config.LOG_LEVEL === "debug" || level !== "debug") {
            console.log(this.colorize(level, message));
        }
        fs.appendFileSync(Logger.LOG_FILE, formattedMessage + "\n");
    }

    /**
     * Applies color formatting to logs based on log level.
     * @param level Log level
     * @param message Message to colorize
     */
    private colorize(level: "info" | "debug" | "error", message: string): string {
        switch (level) {
            case "info":
                return chalk.green(message);
            case "debug":
                return chalk.blue(message);
            case "error":
                return chalk.red(message);
        }
    }

    /**
     * Deletes logs older than the configured retention period.
     */
    private cleanOldLogs(): void {
        const files = fs.readdirSync(Logger.LOGS_DIR);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(Logger.LOGS_DIR, file);
            const stats = fs.statSync(filePath);
            const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);

            if (ageInDays > Config.LOG_RETENTION_DAYS) {
                fs.unlinkSync(filePath);
                console.log(chalk.yellow(`🗑 Deleted old log file: ${file}`));
            }
        }
    }
}
