import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface FileNode {
    id: string;
    type: 'file';
    name: string;
    path: string;
    aiDescription: string | null;
    imports: (string | { id: string })[];
}

interface DirectoryNode {
    id: string;
    type: 'directory';
    name: string;
    path: string;
    children: (FileNode | DirectoryNode)[];
}

const ignoredDirs = new Set(['node_modules', '.git', 'dist', 'out']);
const JSON_FILE_PATH = 'project_structure.json';

// Extract @AIDescription from file comments
function extractAIDescription(filePath: string): string | null {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    let capture = false;
    let descriptionLines: string[] = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('* @AIDescription') || trimmed.startsWith('// @AIDescription')) {
            capture = true;
            descriptionLines.push(trimmed.replace(/\/\/\s*@AIDescription\s*-?\s*|\*\s*@AIDescription\s*-?\s*/i, ''));
        } else if (capture) {
            if (trimmed.startsWith('*') || trimmed.startsWith('//')) {
                descriptionLines.push(trimmed.replace(/^\*\s*|\/\/\s*/g, ''));
            } else {
                break;
            }
        }
    }

    return descriptionLines.length > 0 ? descriptionLines.join(' ').trim() : null;
}

// Extract imported file paths from TypeScript/JavaScript files

function extractImports(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Capture all import variations:
    const importRegex = /import\s+(?:\* as\s+)?(?:[\w{},\s]+)\s+from\s+["']([^"']+)["']|require\(["']([^"']+)["']\)/g;
    
    const imports: Set<string> = new Set(); // Use a Set to prevent duplicates
    let match;

    while ((match = importRegex.exec(content)) !== null) {
        const resolvedImport = match[1] || match[2]; // Match either import or require
        if (resolvedImport && resolvedImport !== "module") { // Exclude false positives
            imports.add(resolvedImport);
        }
    }

    return Array.from(imports); // Convert back to array
}



// Load previous scan results
function loadPreviousStructure(): DirectoryNode | null {
    if (fs.existsSync(JSON_FILE_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf-8'));
        } catch (error) {
            console.error('Error reading previous JSON file:', error);
        }
    }
    return null;
}

// Type guard to check if a node is a directory
function isDirectoryNode(node: FileNode | DirectoryNode | null): node is DirectoryNode {
    return node !== null && node.type === 'directory';
}

// Find a node by its full relative path
function findNodeByPath(relativePath: string, node: DirectoryNode): FileNode | DirectoryNode | null {
    if (node.path === relativePath) return node;

    for (const child of node.children) {
        if (child.path === relativePath) return child;
        if (child.type === 'directory') {
            const found = findNodeByPath(relativePath, child);
            if (found) return found;
        }
    }
    return null;
}

// Recursively scan the directory and retain UUIDs
function scanDirectory(dirPath: string, previous: DirectoryNode | null, root: string = dirPath): DirectoryNode {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    const existingNode = previous ? findNodeByPath(path.relative(root, dirPath), previous) : null;
    const existingDirectory = isDirectoryNode(existingNode) ? existingNode : null;

    const structure: DirectoryNode = {
        id: existingDirectory?.id || uuidv4(),
        type: 'directory',
        name: path.basename(dirPath),
        path: path.relative(root, dirPath).replace(/\\/g, "/"), // Normalize paths
        children: [],
    };

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(root, fullPath).replace(/\\/g, "/"); // Normalize paths

        if (item.isDirectory()) {
            if (!ignoredDirs.has(item.name)) {
                structure.children.push(scanDirectory(fullPath, previous, root));
            }
        } else {
            let existingFile = previous ? findNodeByPath(relativePath, previous) as FileNode : null;

            structure.children.push({
                id: existingFile?.id || uuidv4(),
                type: 'file',
                name: item.name,
                path: relativePath,
                aiDescription: extractAIDescription(fullPath),
                imports: extractImports(fullPath), // Keep one entry per file
            });
        }
    }

    return structure;
}

// Run the scan
const previousStructure = loadPreviousStructure();
const projectRoot = process.cwd();
const projectStructure = scanDirectory(projectRoot, previousStructure);

// Create a map of files by their relative path for easy lookup
const fileMap: { [key: string]: string } = {};
function mapFiles(node: DirectoryNode) {
    for (const child of node.children) {
        if (child.type === 'file') {
            fileMap[child.path.replace(/\.(ts|js|tsx|jsx)$/, '')] = child.id;
        } else {
            mapFiles(child);
        }
    }
}
mapFiles(projectStructure);

// Resolve imports to UUIDs
function resolveImports(node: DirectoryNode) {
    for (const child of node.children) {
        if (child.type === 'file') {
            child.imports = child.imports.map((importPath) => {
                if (typeof importPath !== 'string') return importPath; // Already resolved

                // Skip external module imports like "fs" or "dotenv"
                if (!importPath.startsWith(".")) return importPath;

                // Normalize and resolve the path correctly
                let resolvedPath = path
                    .normalize(path.join(path.dirname(child.path), importPath))
                    .replace(/\\/g, "/") // Normalize Windows paths
                    .replace(/\.(ts|js|tsx|jsx)?$/, ""); // Remove file extensions

                // Ensure directory-based imports also resolve correctly (e.g., ./config -> ./config/Config)
                if (!fileMap[resolvedPath]) {
                    resolvedPath += "/index"; // Handle index.ts cases
                }

                // Check if resolved path exists in the map
                return fileMap[resolvedPath] ? { id: fileMap[resolvedPath] } : importPath;
            });
        } else {
            resolveImports(child); // Recursively resolve imports
        }
    }
}

resolveImports(projectStructure); // 🔥 Call resolveImports() to update references!

// Save updated structure
fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(projectStructure, null, 2));

console.log('✅ Updated project structure saved to', JSON_FILE_PATH);
