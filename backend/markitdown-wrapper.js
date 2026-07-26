import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The markitdown executable is located in the .venv at the workspace root
const markitdownPath = path.join(__dirname, '..', '.venv', 'bin', 'markitdown');

/**
 * Converted given file to Markdown using the local MarkItDown installation.
 * @param {string} filePath - Absolute path to the target file.
 * @returns {Promise<string>} - The converted Markdown string.
 */
export function convertFileToMarkdown(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    execFile(markitdownPath, [filePath], { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        console.error('MarkItDown execution failed:', error.message);
        console.error('CLI Stderr:', stderr);
        return reject(error);
      }
      resolve(stdout);
    });
  });
}
