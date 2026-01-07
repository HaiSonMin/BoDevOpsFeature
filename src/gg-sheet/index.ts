/**
 * Google Sheet Feature Library
 * @description A framework-agnostic library for interacting with Google Sheets API.
 * Provides easy-to-use methods for reading, writing, and managing spreadsheet data.
 * @module gg-sheet
 *
 * @example
 * ```typescript
 * import { GoogleSheetClient, ETypeExport } from 'bodevops-features/gg-sheet';
 *
 * const client = new GoogleSheetClient({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Read data from a sheet
 * const data = await client.getValues({
 *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
 *   sheetName: 'Sheet1'
 * });
 *
 * // Export data
 * await client.export({
 *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
 *   sheetName: 'Sheet1',
 *   listCols: ['Name', 'Email'],
 *   valsExport: [['John', 'john@example.com']],
 *   typeExport: ETypeExport.Append
 * });
 * ```
 */

// Export main client class
export { GoogleSheetClient } from './google-sheet';

// Export configuration class
export { GoogleSheetConfig, DEFAULT_SHEET_SCOPES } from './config';

// Export all types
export type {
  IGoogleSheetConfig,
  IGoogleServiceAccountCredentials,
  ISheetChildrenInfo,
  ISheetValUpdateCell,
  ISpreadsheetInfo,
  IGetSheetInfoParams,
  IGetValuesParams,
  IGetIdxRowParams,
  IExportParams,
  IUpdateMultiCellsParams,
  IColValuePair,
  IUpdateMultiColsByRowParams,
  IRowValuePair,
  IUpdateMultiRowsByColParams,
  IUpdateMultiRowsMultiColsParams,
  IDeleteRowParams,
  IConvertValueSheetParams,
  IListColsAndValsExport,
} from './types';

// Export enum
export { ETypeExport } from './types';

// Export utility functions
export {
  getSheetIdFromUrl,
  convertIndexToColumnName,
  convertColumnNameToIndex,
  convertValueSheet,
  getIndexCol,
  getListColsAndValsExport,
  isValidSheetUrl,
  calculateActualRow,
} from './utils';
