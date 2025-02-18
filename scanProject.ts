import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface FileNode {
    id: string;
    type: 'file';
    name: string;
    path: string;
    aiDescription: string | null;
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
                break; // Stop capturing if the line is not a comment
            }
        }
    }

    return descriptionLines.length > 0 ? descriptionLines.join(' ').trim() : null;
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

// Find a file or directory by its name in previous structure
function findNodeByName(name: string, previous: DirectoryNode | null): FileNode | DirectoryNode | null {
    if (!previous) return null;
    
    for (const child of previous.children) {
        if (child.name === name) return child;
        if (child.type === 'directory') {
            const found = findNodeByName(name, child);
            if (found) return found;
        }
    }
    return null;
}

// Recursively scan the directory and retain UUIDs
function scanDirectory(dirPath: string, previous: DirectoryNode | null, root: string = dirPath): DirectoryNode {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    const existingNode = previous ? findNodeByName(path.basename(dirPath), previous) as DirectoryNode : null;

    const structure: DirectoryNode = {
        id: existingNode?.id || uuidv4(),
        type: 'directory',
        name: path.basename(dirPath),
        path: path.relative(root, dirPath),
        children: [],
    };

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        const relativePath = path.relative(root, fullPath);

        if (item.isDirectory()) {
            if (!ignoredDirs.has(item.name)) {
                structure.children.push(scanDirectory(fullPath, previous, root));
            }
        } else {
            let existingFile = previous ? findNodeByName(item.name, previous) as FileNode : null;

            structure.children.push({
                id: existingFile?.id || uuidv4(),
                type: 'file',
                name: item.name,
                path: relativePath,
                aiDescription: extractAIDescription(fullPath),
            });
        }
    }

    return structure;
}

// Run the scan
const previousStructure = loadPreviousStructure();
const projectRoot = process.cwd();
const projectStructure = scanDirectory(projectRoot, previousStructure);

// Save updated structure
fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(projectStructure, null, 2));

console.log('Updated project structure saved to', JSON_FILE_PATH);
