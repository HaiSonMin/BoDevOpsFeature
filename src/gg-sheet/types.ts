/**
 * Google Sheet Feature Library - Type Definitions
 * @description Type definitions for Google Sheet operations including reading, writing, and exporting data.
 * @module gg-sheet/types
 */

/**
 * Configuration options for Google Sheet client initialization.
 * Supports either a path to a service account key file or a direct credentials object.
 */
export interface IGoogleSheetConfig {
  /** Path to the service account JSON key file */
  keyFilePath?: string;

  /** Service account credentials object (alternative to keyFilePath) */
  credentials?: IGoogleServiceAccountCredentials;

  /** OAuth scopes for Google Sheets API access */
  scopes?: string[];
}

/**
 * Google Service Account credentials structure.
 * This matches the structure of the downloaded JSON key file from Google Cloud Console.
 */
export interface IGoogleServiceAccountCredentials {
  /** The type of account, typically "service_account" */
  type: string;

  /** The unique identifier for the project */
  project_id: string;

  /** The private key identifier */
  private_key_id: string;

  /** The private key in PEM format */
  private_key: string;

  /** The service account email address */
  client_email: string;

  /** The unique client identifier */
  client_id: string;

  /** The authentication URI */
  auth_uri: string;

  /** The token URI for obtaining access tokens */
  token_uri: string;

  /** The authentication provider certificate URL */
  auth_provider_x509_cert_url: string;

  /** The client certificate URL */
  client_x509_cert_url: string;
}

/**
 * Information about a sheet (tab) within a Google Spreadsheet.
 */
export interface ISheetChildrenInfo {
  /** The title/name of the sheet tab */
  title: string;

  /** The unique identifier of the sheet within the spreadsheet */
  sheetId: number;

  /** The total number of rows in the sheet */
  rowCount: number;

  /** The total number of columns in the sheet */
  columnCount: number;
}

/**
 * Structure for updating a single cell in a sheet.
 */
export interface ISheetValUpdateCell {
  /** Row index (0-based) */
  row: number;

  /** Column index (0-based) */
  col: number;

  /** The content to write to the cell */
  content: string;
}

/**
 * Export type enumeration for sheet export operations.
 */
export enum ETypeExport {
  /** Append data to the end of existing data */
  Append = 'Append',

  /** Overwrite all existing data starting from row 1 */
  Overwrite = 'Overwrite',
}

/**
 * Information about a Google Spreadsheet.
 */
export interface ISpreadsheetInfo {
  /** The title of the spreadsheet */
  spreadsheetTitle: string;

  /** Array of sheet tabs within the spreadsheet */
  sheets: ISheetChildrenInfo[];
}

/**
 * Parameters for getting sheet information.
 */
export interface IGetSheetInfoParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;
}

/**
 * Parameters for reading values from a sheet.
 */
export interface IGetValuesParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab to read from */
  sheetName: string;

  /** Optional limit on the number of rows to read */
  endRow?: number;
}

/**
 * Parameters for finding a row index by column value.
 */
export interface IGetIdxRowParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** The column name to search in (e.g., "A", "B", "AB") */
  colName: string;

  /** The value to search for */
  value: string;
}

/**
 * Parameters for exporting data to a sheet.
 */
export interface IExportParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab to write to */
  sheetName: string;

  /** Array of column headers */
  listCols: string[];

  /** Matrix of data values to export (each inner array is a row) */
  valsExport: string[][];

  /** Export type: Append or Overwrite */
  typeExport: ETypeExport;
}

/**
 * Parameters for updating multiple cells at specific positions.
 */
export interface IUpdateMultiCellsParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** Array of cell updates with row, column, and content */
  cells: ISheetValUpdateCell[];

  /**
   * Row offset for data rows.
   * - 0: Header at row 1, data starts at row 2 (default)
   * - 1: Header at row 1, skip row 2, data starts at row 3
   */
  rowOffset?: number;
}

/**
 * Structure for column-value pair when updating multiple columns in a row.
 */
export interface IColValuePair {
  /** The content to write */
  content: string;

  /** Column index (0-based) */
  col: number;
}

/**
 * Parameters for updating multiple columns in a single row.
 */
export interface IUpdateMultiColsByRowParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** The row index to update (0-based) */
  row: number;

  /** Array of column-value pairs to update */
  values: IColValuePair[];

  /** Row offset for data rows (default: 0) */
  rowOffset?: number;
}

/**
 * Structure for row-value pair when updating multiple rows in a column.
 */
export interface IRowValuePair {
  /** The content to write */
  content: string;

  /** Row index (0-based) */
  row: number;
}

/**
 * Parameters for updating multiple rows in a single column.
 */
export interface IUpdateMultiRowsByColParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** The column index to update (0-based) */
  col: number;

  /** Array of row-value pairs to update */
  values: IRowValuePair[];

  /** Row offset for data rows (default: 0) */
  rowOffset?: number;
}

/**
 * Parameters for updating a range of rows and columns.
 */
export interface IUpdateMultiRowsMultiColsParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** Matrix of values to write (rows x columns) */
  values: string[][];

  /** Starting row index (0-based, default: 0) */
  startRow?: number;

  /** Ending row index (0-based, optional) */
  endRow?: number;

  /** Starting column index (0-based, default: 0) */
  startCol?: number;

  /** Row offset for data rows (default: 0) */
  rowOffset?: number;
}

/**
 * Parameters for deleting a row from a sheet.
 */
export interface IDeleteRowParams {
  /** The URL of the Google Spreadsheet */
  sheetUrl: string;

  /** The name of the specific sheet tab */
  sheetName: string;

  /** The row index to delete (0-based) */
  row: number;

  /** Row offset for data rows (default: 0) */
  rowOffset?: number;
}

/**
 * Parameters for converting raw sheet values to typed objects.
 */
export interface IConvertValueSheetParams<T> {
  /** Raw values from the sheet (2D array) */
  values: string[][] | null | undefined;

  /**
   * Row offset to skip before the header row.
   * - 0: First row is the header (default)
   * - 1: First row is skipped, second row is header
   */
  rowOffset?: number;
}

/**
 * Result structure for column and value extraction.
 */
export interface IListColsAndValsExport {
  /** Array of column headers */
  listCols: string[];

  /** Matrix of data values */
  valsExport: string[][];
}
