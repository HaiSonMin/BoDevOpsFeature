/**
 * Google Drive Feature Library - Utility Functions
 * @description Helper functions for file handling, formatting, and validation in Google Drive operations.
 * @module gg-drive/utils
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Size units for human-readable byte formatting.
 */
const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Base value for byte conversions (1024 bytes = 1 KB).
 */
const BYTE_BASE = 1024;

/**
 * Converts a byte count into a human-readable string format.
 *
 * @param bytes - The number of bytes to format
 * @returns A human-readable string representation (e.g., "1.5 GB")
 *
 * @example
 * ```typescript
 * formatBytes(0);          // "0 Bytes"
 * formatBytes(1024);       // "1 KB"
 * formatBytes(1536);       // "1.5 KB"
 * formatBytes(1073741824); // "1 GB"
 * ```
 */
export function formatBytes({ bytes }: { bytes: number }): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const exponent = Math.floor(Math.log(bytes) / Math.log(BYTE_BASE));
  const value = bytes / Math.pow(BYTE_BASE, exponent);
  const formattedValue = parseFloat(value.toFixed(2));

  return `${formattedValue} ${SIZE_UNITS[exponent]}`;
}

/**
 * Normalizes a file path to use the correct path separators for the current OS.
 * Also resolves relative paths to absolute paths.
 *
 * @param filePath - The file path to normalize
 * @returns The normalized absolute file path
 *
 * @example
 * ```typescript
 * normalizeFilePath({ filePath: './documents/file.pdf' });
 * // Returns: "D:\\MyFolder\\documents\\file.pdf" (on Windows)
 * ```
 */
export function normalizeFilePath({ filePath }: { filePath: string }): string {
  // Resolve to absolute path if relative
  const absolutePath = path.resolve(filePath);

  // Normalize path separators for current OS
  return path.normalize(absolutePath);
}

/**
 * Validates that a file exists at the specified path.
 *
 * @param filePath - The absolute path to the file to validate
 * @returns True if the file exists, false otherwise
 *
 * @example
 * ```typescript
 * const exists = validateFileExists({ filePath: 'D:\\MyFolder\\file.pdf' });
 * if (!exists) {
 *   console.log('File not found!');
 * }
 * ```
 */
export function validateFileExists({ filePath }: { filePath: string }): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Gets detailed information about a local file.
 *
 * @param filePath - The absolute path to the file
 * @returns File information object or null if file doesn't exist
 *
 * @example
 * ```typescript
 * const info = getFileInfo({ filePath: './document.pdf' });
 * if (info) {
 *   console.log(`File size: ${info.sizeFormatted}`);
 * }
 * ```
 */
export function getFileInfo({ filePath }: { filePath: string }): {
  name: string;
  extension: string;
  directory: string;
  size: number;
  sizeFormatted: string;
} | null {
  const normalizedPath = normalizeFilePath({ filePath });

  if (!validateFileExists({ filePath: normalizedPath })) {
    return null;
  }

  const stats = fs.statSync(normalizedPath);

  return {
    name: path.basename(normalizedPath),
    extension: path.extname(normalizedPath).slice(1),
    directory: path.dirname(normalizedPath),
    size: stats.size,
    sizeFormatted: formatBytes({ bytes: stats.size }),
  };
}

/**
 * Parses a folder path string into an array of folder names.
 *
 * @param folderPath - The folder path to parse (e.g., "folder1/folder2/folder3")
 * @returns An array of folder names
 *
 * @example
 * ```typescript
 * parseFolderPath({ folderPath: 'a/b/c' });  // ['a', 'b', 'c']
 * parseFolderPath({ folderPath: '/' });      // []
 * parseFolderPath({ folderPath: '' });       // []
 * ```
 */
export function parseFolderPath({ folderPath }: { folderPath: string }): string[] {
  if (!folderPath || folderPath === '/' || folderPath === '') {
    return [];
  }

  return folderPath.split('/').filter((folder) => folder.trim() !== '');
}

/**
 * Creates a readable stream for a local file.
 *
 * @param filePath - The absolute path to the file
 * @returns A readable stream for the file
 * @throws Error if the file doesn't exist
 *
 * @example
 * ```typescript
 * const stream = createFileReadStream({ filePath: './document.pdf' });
 * // Use stream for upload
 * ```
 */
export function createFileReadStream({ filePath }: { filePath: string }): fs.ReadStream {
  const normalizedPath = normalizeFilePath({ filePath });

  if (!validateFileExists({ filePath: normalizedPath })) {
    throw new Error(`File does not exist: ${normalizedPath}`);
  }

  return fs.createReadStream(normalizedPath);
}
