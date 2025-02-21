import fs from "fs";

export class NewFileScanner {
    /**
     * Reads an existing test file and extracts key sections.
     * @param {string} testFilePath - Path to the test file.
     * @returns {{ content: string; imports: { fullImport: string; modulePath: string }[] }} 
     * The full file content and structured import data.
     */
    public static scanTestFile(testFilePath: string): { content: string; imports: { fullImport: string; modulePath: string }[] } {
        const testFileContent = NewFileScanner.readTestFile(testFilePath);
        const imports = NewFileScanner.extractImports(testFileContent);

        return {
            content: testFileContent,
            imports
        };
    }

    /**
     * Reads the test file content or returns a default template if it doesn't exist.
     * @param {string} testFilePath - Path to the test file.
     * @returns {string} - The file content as a string.
     */
    private static readTestFile(testFilePath: string): string {
        console.log(`Checking file existence: ${testFilePath}`);
        const exists = fs.existsSync(testFilePath);
        console.log(`File exists: ${exists}`);

        if (!exists) {
            console.log("Returning default content.");
            return "// Playwright test file\n";
        }

        console.log("Reading file content...");
        return fs.readFileSync(testFilePath, "utf-8").trim();
    }

    /**
     * Extracts and logs all import lines from the given test file.
     * @param {string} testFilePath - Path to the test file.
     */
    public static logExistingImports(testFilePath: string): void {
        const testFileContent = NewFileScanner.readTestFile(testFilePath);
        const imports = NewFileScanner.extractImports(testFileContent);

        console.log(`Extracted imports from ${testFilePath}:`);
        console.log(imports.length > 0 ? imports : "No import statements found.");
    }

    /**
     * Extracts structured import statements from the given code.
     * @param {string} code - The file content.
     * @returns {{ fullImport: string; modulePath: string }[]} - Extracted imports.
     */
    public static extractImports(code: string): { fullImport: string; modulePath: string }[] {
        const importRegex = /^import\s+((?:[\w*\s{},*]+\s+from\s+)?['"][^'"]+['"]|['"][^'"]+['"]);?/gm;
        const matches: { fullImport: string; modulePath: string }[] = [];
        let match;

        while ((match = importRegex.exec(code)) !== null) {
            const fullImport = match[0];
            const modulePathMatch = fullImport.match(/['"]([^'"]+)['"]/);
            const modulePath = modulePathMatch ? modulePathMatch[1] : "";

            matches.push({ fullImport, modulePath });
        }

        return matches;
    }
}
