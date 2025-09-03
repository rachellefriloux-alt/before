/*
 * Persona: Tough love meets soul care.
 * Module: addHeaders
 * Intent: Handle functionality for addHeaders
 * Provenance-ID: 20b027c9-6bf2-4670-a2c4-77657f2acf5a
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

/*
 * Persona: Tough love meets soul care.
 * Module: Provenance Header Injector
 * Intent: Automate adding provenance headers to all code files.
 * Provenance-ID: 550e8400-e29b-41d4-a716-446655440002
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const codeExtensions = ['.js', '.ts', '.kt', '.vue', '.py', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb', '.go', '.rs'];

function hasProvenanceHeader(content) {
    return content.startsWith('/*\n * Persona:');
}

function generateHeader(filePath) {
    const moduleName = path.basename(filePath, path.extname(filePath));
    const intent = `Handle functionality for ${moduleName}`;
    const provenanceId = randomUUID();
    const lastReviewed = new Date().toISOString().split('T')[0] + 'T00:00:00Z';

    return `/*
 * Persona: Tough love meets soul care.
 * Module: ${moduleName}
 * Intent: ${intent}
 * Provenance-ID: ${provenanceId}
 * Last-Reviewed: ${lastReviewed}
 */
`;
}

function processFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (!hasProvenanceHeader(content)) {
            const header = generateHeader(filePath);
            const newContent = header + '\n' + content;
            fs.writeFileSync(filePath, newContent, 'utf8');
        } else {
            // Header already exists
        }
    } catch (error) {
        // Error processing file
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'build' && file !== 'dist') {
            walkDirectory(filePath);
        } else if (stat.isFile() && codeExtensions.includes(path.extname(file))) {
            processFile(filePath);
        }
    }
}

const rootDir = process.cwd();
walkDirectory(rootDir);
