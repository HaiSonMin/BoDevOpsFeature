/**
 * Google Sheet Feature Library - Utility Functions
 * @description Helper functions for sheet operations, column conversion, and data transformation.
 * @module gg-sheet/utils
 */

import { IListColsAndValsExport } from './types';

/**
 * Regular expression pattern to extract spreadsheet ID from a Google Sheets URL.
 */
const SPREADSHEET_ID_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;

/**
 * Extracts the spreadsheet ID from a Google Sheets URL.
 *
 * @param sheetUrl - The full URL of the Google Spreadsheet
 * @returns The spreadsheet ID or null if not found
 *
 * @example
 * ```typescript
 * const id = getSheetIdFromUrl({
 *   sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123def/edit'
 * });
 * // Returns: '1abc123def'
 * ```
 */
export function getSheetIdFromUrl({ sheetUrl }: { sheetUrl: string }): string | null {
  const match = sheetUrl.match(SPREADSHEET_ID_PATTERN);

  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Converts a 0-based column index to a column letter (e.g., 0 → A, 25 → Z, 26 → AA).
 *
 * @param columnIndex - The 0-based column index
 * @returns The column letter(s) (e.g., "A", "B", "AA", "AB")
 *
 * @example
 * ```typescript
 * convertIndexToColumnName({ columnIndex: 0 });  // "A"
 * convertIndexToColumnName({ columnIndex: 25 }); // "Z"
 * convertIndexToColumnName({ columnIndex: 26 }); // "AA"
 * convertIndexToColumnName({ columnIndex: 701 }); // "ZZ"
 * ```
 */
export function convertIndexToColumnName({ columnIndex }: { columnIndex: number }): string {
  let columnName = '';
  let index = columnIndex;

  while (index >= 0) {
    columnName = String.fromCharCode((index % 26) + 'A'.charCodeAt(0)) + columnName;
    index = Math.floor(index / 26) - 1;
  }

  return columnName;
}

/**
 * Converts a column letter to a 0-based column index (e.g., A → 0, Z → 25, AA → 26).
 *
 * @param columnName - The column letter(s) (e.g., "A", "B", "AA")
 * @returns The 0-based column index
 * @throws Error if the column name contains invalid characters
 *
 * @example
 * ```typescript
 * convertColumnNameToIndex({ columnName: 'A' });  // 0
 * convertColumnNameToIndex({ columnName: 'Z' });  // 25
 * convertColumnNameToIndex({ columnName: 'AA' }); // 26
 * convertColumnNameToIndex({ columnName: 'ZZ' }); // 701
 * ```
 */
export function convertColumnNameToIndex({ columnName }: { columnName: string }): number {
  // Convert to uppercase to handle both lower and upper case
  const upperColumnName = columnName.toUpperCase().trim();

  // Validate input - only accept A-Z characters
  if (!/^[A-Z]+$/.test(upperColumnName)) {
    throw new Error(`Invalid column name: '${columnName}'. Only letters A-Z are allowed.`);
  }

  let result = 0;

  for (let i = 0; i < upperColumnName.length; i++) {
    const charCode = upperColumnName.charCodeAt(i) - 'A'.charCodeAt(0);
    result = result * 26 + (charCode + 1);
  }

  // Convert to 0-based index
  return result - 1;
}

/**
 * Converts raw sheet values (2D array) into an array of typed objects.
 * Uses the first row (or row at rowOffset) as keys for the objects.
 *
 * @param values - Raw 2D array from sheet
 * @param rowOffset - Number of rows to skip before the header row (default: 0)
 * @returns Array of typed objects, or null if values is null/undefined
 *
 * @example
 * ```typescript
 * const rawData = [
 *   ['name', 'age', 'email'],
 *   ['John', '30', 'john@example.com'],
 *   ['Jane', '25', 'jane@example.com']
 * ];
 *
 * interface Person { name: string; age: string; email: string; }
 *
 * const people = convertValueSheet<Person>({ values: rawData });
 * // Returns: [
 * //   { name: 'John', age: '30', email: 'john@example.com' },
 * //   { name: 'Jane', age: '25', email: 'jane@example.com' }
 * // ]
 * ```
 */
export function convertValueSheet<T>({
  values,
  rowOffset = 0,
}: {
  values: string[][] | null | undefined;
  rowOffset?: number;
}): T[] | null {
  if (!values || values.length === 0) {
    return null;
  }

  // Get header row (keys for the objects)
  const keys = values[rowOffset];

  if (!keys || keys.length === 0) {
    return null;
  }

  // Map remaining rows to objects
  return values.slice(rowOffset + 1).map((row) => {
    return keys.reduce((acc, key, index) => {
      (acc as Record<string, string>)[key] = row[index] || '';
      return acc;
    }, {} as T);
  });
}

/**
 * Gets the index of a column key in the list of keys.
 *
 * @param key - The key to find
 * @param listKeys - Array of all keys
 * @returns The index of the key, or -1 if not found
 *
 * @example
 * ```typescript
 * interface Person { id: string; name: string; email: string; }
 * const keys: (keyof Person)[] = ['id', 'name', 'email'];
 *
 * getIndexCol({ key: 'name', listKeys: keys }); // 1
 * getIndexCol({ key: 'email', listKeys: keys }); // 2
 * ```
 */
export function getIndexCol<T>({ key, listKeys }: { key: keyof T; listKeys: (keyof T)[] }): number {
  return listKeys.indexOf(key);
}

/**
 * Extracts column headers and data values from a result set for export.
 * Takes an object mapping field keys to column names and an array of items.
 *
 * @param colsForSheet - Object mapping field keys to column header names
 * @param resultItems - Array of items to export
 * @returns Object containing listCols (headers) and valsExport (data matrix)
 *
 * @example
 * ```typescript
 * const colsMapping = { id: 'ID', name: 'Full Name', email: 'Email Address' };
 * const items = [
 *   { id: '1', name: 'John Doe', email: 'john@example.com' },
 *   { id: '2', name: 'Jane Doe', email: 'jane@example.com' }
 * ];
 *
 * const { listCols, valsExport } = getListColsAndValsExport({
 *   colsForSheet: colsMapping,
 *   resultItems: items
 * });
 * // listCols: ['ID', 'Full Name', 'Email Address']
 * // valsExport: [['1', 'John Doe', 'john@example.com'], ['2', 'Jane Doe', 'jane@example.com']]
 * ```
 */
export function getListColsAndValsExport<T extends Record<string, unknown>>({
  colsForSheet,
  resultItems,
}: {
  colsForSheet: Record<keyof T, string>;
  resultItems: T[];
}): IListColsAndValsExport {
  // Extract column headers from the mapping values
  const listCols: string[] = Object.values(colsForSheet) as string[];

  // Extract data rows
  const valsExport: string[][] = [];

  for (const item of resultItems) {
    const row: string[] = [];

    // Iterate through colsForSheet keys to ensure correct order
    for (const fieldKey of Object.keys(colsForSheet) as (keyof T)[]) {
      const fieldValue = item[fieldKey];

      // Convert value to string, handling different data types
      let cellValue = '';

      if (fieldValue === null || fieldValue === undefined) {
        cellValue = '';
      } else if (fieldValue instanceof Date) {
        cellValue = fieldValue.toISOString();
      } else if (typeof fieldValue === 'object') {
        // Handle nested objects (like relations)
        cellValue = JSON.stringify(fieldValue);
      } else {
        cellValue = String(fieldValue);
      }

      row.push(cellValue);
    }

    valsExport.push(row);
  }

  return { listCols, valsExport };
}

/**
 * Validates that a sheet URL is in the correct format.
 *
 * @param sheetUrl - The URL to validate
 * @returns True if the URL is valid, false otherwise
 *
 * @example
 * ```typescript
 * isValidSheetUrl({ sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123/edit' }); // true
 * isValidSheetUrl({ sheetUrl: 'https://example.com/sheet' }); // false
 * ```
 */
export function isValidSheetUrl({ sheetUrl }: { sheetUrl: string }): boolean {
  return SPREADSHEET_ID_PATTERN.test(sheetUrl);
}

/**
 * Calculates the actual row index in the sheet based on the data row index and offset.
 * This accounts for header row(s) and any additional offset rows.
 *
 * @param dataRowIndex - The 0-based index in the data (not counting headers)
 * @param rowOffset - Additional rows to skip after the header (default: 0)
 * @returns The 1-based row number in the actual sheet
 *
 * @example
 * ```typescript
 * // With rowOffset=0: header at row 1, data starts at row 2
 * calculateActualRow({ dataRowIndex: 0, rowOffset: 0 }); // 2 (first data row)
 * calculateActualRow({ dataRowIndex: 5, rowOffset: 0 }); // 7 (sixth data row)
 *
 * // With rowOffset=1: header at row 1, skip row 2, data starts at row 3
 * calculateActualRow({ dataRowIndex: 0, rowOffset: 1 }); // 3 (first data row)
 * ```
 */
export function calculateActualRow({
  dataRowIndex,
  rowOffset = 0,
}: {
  dataRowIndex: number;
  rowOffset?: number;
}): number {
  // Row 1 is header, so data starts at row 2
  // Add 2 for: 0-based to 1-based conversion + header row
  return dataRowIndex + 2 + rowOffset;
}
