import fs from "fs";

export class FileScanner {
    /**
     * Reads an existing test file and extracts key sections.
     * 
     * @param {string} testFilePath - Path to the Playwright test file
     * @returns {object} Extracted file content details
     */
    public static scanTestFile(testFilePath: string): {
        content: string;
        existingTests: Record<string, string>;
        existingImports: Set<string>;
        testGenMarkerIndex: number;
    } {
        const testFileContent = FileScanner.readTestFile(testFilePath);
        const existingTests = FileScanner.extractExistingTests(testFileContent);
        const existingImports = FileScanner.extractExistingImports(testFileContent);
        const testGenMarkerIndex = FileScanner.findTestGenMarker(testFileContent);

        return {
            content: testFileContent,
            existingTests,
            existingImports,
            testGenMarkerIndex,
        };
    }

    /**
     * Reads the test file content or returns a default template if it doesn't exist.
     * @param {string} testFilePath 
     * @returns {string} File content as a string
     */
    private static readTestFile(testFilePath: string): string {
        return fs.existsSync(testFilePath)
            ? fs.readFileSync(testFilePath, "utf-8").trim()  // Trim whitespace
            : "// Playwright test file\n"; // Default content
    }

    /**
     * Extracts existing test blocks from the test file.
     * @param {string} content 
     * @returns {Record<string, string>} A map of test IDs to their full test block content.
     */
    private static extractExistingTests(content: string): Record<string, string> {
        const existingTests: Record<string, string> = {};
        const describeRegex = /test\.describe\s*\(\s*['"](.+?) @(.+?)['"]\s*,\s*\(\)\s*=>\s*\{([\s\S]*?)\n\}\);/gm;
        let match;

        while ((match = describeRegex.exec(content)) !== null) {
            existingTests[match[2].trim()] = match[0].trim(); // Store full test block
        }

        return existingTests;
    }

    /**
 * Extracts existing import statements from the test file.
 * @param {string} content 
 * @returns {Set<string>} A set of existing import statements.
 */
private static extractExistingImports(content: string): Set<string> {
    const importRegex = /^import\s+.*?from\s+['"].+?['"];\s*$/gm;
    const imports = new Set(content.match(importRegex) || []);
    
    console.log("Extracted Imports:", Array.from(imports));

    return imports;
}


    /**
 * Finds the position of the `@TESTGEN` marker in the file and logs the result.
 * @param {string} content 
 * @returns {number} The index of the `@TESTGEN` marker, or -1 if not found.
 */
private static findTestGenMarker(content: string): number {
    const index = content.indexOf("// @TESTGEN - for AI generated scaffolding");

    if (index !== -1) {
        console.log(`@TESTGEN marker found at index: ${index}`);
    } else {
        console.log("@TESTGEN marker not found.");
    }

    return index;
}

}
