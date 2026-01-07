/**
 * Google Sheet Feature Library - Main Client Class
 * @description A framework-agnostic client for interacting with Google Sheets API.
 * Provides methods for reading, writing, and managing spreadsheet data.
 * @module gg-sheet/google-sheet
 */

import { google, sheets_v4 } from 'googleapis';
import { GoogleSheetConfig } from './config';
import {
  IGoogleSheetConfig,
  ISheetChildrenInfo,
  ISpreadsheetInfo,
  ETypeExport,
  IGetSheetInfoParams,
  IGetValuesParams,
  IGetIdxRowParams,
  IExportParams,
  IUpdateMultiCellsParams,
  IUpdateMultiColsByRowParams,
  IUpdateMultiRowsByColParams,
  IUpdateMultiRowsMultiColsParams,
  IDeleteRowParams,
} from './types';
import { getSheetIdFromUrl, convertIndexToColumnName, calculateActualRow } from './utils';

/**
 * Google Sheet Client for managing spreadsheet data.
 *
 * @example
 * ```typescript
 * import { GoogleSheetClient } from 'bodevops-features/gg-sheet';
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
 * // Update specific cells
 * await client.updateValuesMultiCells({
 *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
 *   sheetName: 'Sheet1',
 *   cells: [
 *     { row: 0, col: 0, content: 'Hello' },
 *     { row: 0, col: 1, content: 'World' }
 *   ]
 * });
 * ```
 */
export class GoogleSheetClient {
  private readonly config: GoogleSheetConfig;

  /**
   * Creates a new GoogleSheetClient instance.
   *
   * @param configOptions - Configuration options for the Google Sheet client
   */
  constructor(configOptions: IGoogleSheetConfig) {
    this.config = new GoogleSheetConfig(configOptions);
  }

  /**
   * Creates and returns an authenticated Google Sheets API client.
   *
   * @returns A Promise that resolves to an authenticated Sheets API client
   */
  private async getSheetsClient(): Promise<sheets_v4.Sheets> {
    const authOptions = this.config.getAuthOptions();

    const auth = new google.auth.GoogleAuth({
      keyFile: authOptions.keyFile,
      credentials: authOptions.credentials,
      scopes: authOptions.scopes,
    });

    const authClient = await auth.getClient();

    return google.sheets({
      version: 'v4',
      auth: authClient as Parameters<typeof google.sheets>[0]['auth'],
    });
  }

  /**
   * Extracts the spreadsheet ID from a URL and validates it.
   *
   * @param sheetUrl - The Google Sheets URL
   * @returns The spreadsheet ID
   * @throws Error if the URL is invalid
   */
  private extractSheetId({ sheetUrl }: { sheetUrl: string }): string {
    const sheetId = getSheetIdFromUrl({ sheetUrl });

    if (!sheetId) {
      throw new Error(`Invalid Google Sheet URL: ${sheetUrl}`);
    }

    return sheetId;
  }

  /**
   * Retrieves information about a Google Spreadsheet, including all sheet tabs.
   *
   * @param params - Parameters including the sheet URL
   * @returns A Promise that resolves to spreadsheet information
   *
   * @example
   * ```typescript
   * const info = await client.getSheetInfo({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...'
   * });
   * console.log(`Spreadsheet: ${info.spreadsheetTitle}`);
   * console.log(`Sheets: ${info.sheets.map(s => s.title).join(', ')}`);
   * ```
   */
  public async getSheetInfo({ sheetUrl }: IGetSheetInfoParams): Promise<ISpreadsheetInfo> {
    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    const response = await sheetsInstance.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const spreadsheetTitle = response.data.properties?.title || '';
    const sheets: ISheetChildrenInfo[] =
      response.data.sheets?.map((sheet: sheets_v4.Schema$Sheet) => ({
        title: sheet.properties?.title || '',
        sheetId: sheet.properties?.sheetId || 0,
        rowCount: sheet.properties?.gridProperties?.rowCount || 0,
        columnCount: sheet.properties?.gridProperties?.columnCount || 0,
      })) || [];

    return {
      spreadsheetTitle,
      sheets,
    };
  }

  /**
   * Reads all values from a specific sheet tab.
   *
   * @param params - Parameters including sheet URL, sheet name, and optional row limit
   * @returns A Promise that resolves to a 2D array of string values
   *
   * @example
   * ```typescript
   * const data = await client.getValues({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   endRow: 100  // Optional: limit to first 100 rows
   * });
   *
   * for (const row of data) {
   *   console.log(row.join(', '));
   * }
   * ```
   */
  public async getValues({ sheetUrl, sheetName, endRow }: IGetValuesParams): Promise<string[][]> {
    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    // Get sheet info to determine column count
    const sheetInfo = await this.getSheetInfo({ sheetUrl });
    const sheet = sheetInfo.sheets.find((s) => s.title === sheetName);

    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    // Build the range
    let range = sheetName;

    if (endRow) {
      const endCol = convertIndexToColumnName({
        columnIndex: sheet.columnCount - 1,
      });
      range = `${sheetName}!A1:${endCol}${endRow}`;
    }

    const result = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return (result.data.values as string[][]) || [];
  }

  /**
   * Finds the row index (0-based) where a specific value appears in a column.
   *
   * @param params - Parameters including sheet URL, sheet name, column name, and value to find
   * @returns A Promise that resolves to the row index (0-based), or -1 if not found
   *
   * @example
   * ```typescript
   * const rowIndex = await client.getIdxRow({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   colName: 'A',
   *   value: 'John Doe'
   * });
   *
   * if (rowIndex >= 0) {
   *   console.log(`Found at row index: ${rowIndex}`);
   * }
   * ```
   */
  public async getIdxRow({
    sheetUrl,
    sheetName,
    colName,
    value,
  }: IGetIdxRowParams): Promise<number> {
    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    // Get sheet info to determine row count
    const sheetInfo = await this.getSheetInfo({ sheetUrl });
    const sheet = sheetInfo.sheets.find((s) => s.title === sheetName);

    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const range = `${sheetName}!${colName}1:${colName}${sheet.rowCount}`;

    const result = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = result.data.values || [];

    // Find the index (0-based)
    const index = values.findIndex((row: string[]) => {
      if (!row || row.length === 0) return false;
      return row[0] === value;
    });

    return index;
  }

  /**
   * Exports data to a Google Sheet with either Append or Overwrite mode.
   *
   * @param params - Export parameters including data and export type
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * // Overwrite existing data
   * await client.export({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   listCols: ['Name', 'Email', 'Age'],
   *   valsExport: [
   *     ['John', 'john@example.com', '30'],
   *     ['Jane', 'jane@example.com', '25']
   *   ],
   *   typeExport: ETypeExport.Overwrite
   * });
   *
   * // Append to existing data
   * await client.export({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   listCols: ['Name', 'Email', 'Age'],
   *   valsExport: [['New User', 'new@example.com', '28']],
   *   typeExport: ETypeExport.Append
   * });
   * ```
   */
  public async export({
    sheetUrl,
    sheetName,
    listCols,
    valsExport,
    typeExport,
  }: IExportParams): Promise<boolean> {
    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    if (typeExport === ETypeExport.Overwrite) {
      return this.executeOverwriteExport({
        sheetsInstance,
        spreadsheetId,
        sheetName,
        listCols,
        valsExport,
      });
    } else if (typeExport === ETypeExport.Append) {
      return this.executeAppendExport({
        sheetsInstance,
        spreadsheetId,
        sheetName,
        listCols,
        valsExport,
      });
    } else {
      throw new Error(`Invalid export type: ${typeExport}`);
    }
  }

  /**
   * Executes an overwrite export - writes headers and data from row 1.
   */
  private async executeOverwriteExport({
    sheetsInstance,
    spreadsheetId,
    sheetName,
    listCols,
    valsExport,
  }: {
    sheetsInstance: sheets_v4.Sheets;
    spreadsheetId: string;
    sheetName: string;
    listCols: string[];
    valsExport: string[][];
  }): Promise<boolean> {
    // Prepare data matrix: headers + data rows
    const exportData: string[][] = [listCols, ...valsExport];

    const numCols = listCols.length;
    const numRows = exportData.length;

    // Calculate range: A1 to [LastCol][LastRow]
    const endCol = convertIndexToColumnName({ columnIndex: numCols - 1 });
    const range = `${sheetName}!A1:${endCol}${numRows}`;

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range,
            values: exportData,
          },
        ],
      },
    });

    return true;
  }

  /**
   * Executes an append export - finds empty rows and appends data.
   */
  private async executeAppendExport({
    sheetsInstance,
    spreadsheetId,
    sheetName,
    listCols,
    valsExport,
  }: {
    sheetsInstance: sheets_v4.Sheets;
    spreadsheetId: string;
    sheetName: string;
    listCols: string[];
    valsExport: string[][];
  }): Promise<boolean> {
    // Get sheet info to determine max rows
    const sheetInfo = await sheetsInstance.spreadsheets.get({
      spreadsheetId,
      ranges: [sheetName],
      includeGridData: false,
    });

    const sheet = sheetInfo.data.sheets?.find(
      (s: sheets_v4.Schema$Sheet) => s.properties?.title === sheetName
    );
    const maxRows = sheet?.properties?.gridProperties?.rowCount || 1000;

    // Read current data to find the last used row
    const readRange = `${sheetName}!A1:A${maxRows}`;
    const readResponse = await sheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: readRange,
    });

    const currentData = readResponse.data.values || [];

    // Find the first empty row (last row with data + 1)
    let startRow = 1;

    if (currentData.length > 0) {
      let lastUsedRow = 0;
      for (let i = currentData.length - 1; i >= 0; i--) {
        if (
          currentData[i] &&
          currentData[i].length > 0 &&
          currentData[i][0] &&
          String(currentData[i][0]).trim() !== ''
        ) {
          lastUsedRow = i + 1;
          break;
        }
      }
      startRow = lastUsedRow + 1;
    }

    // Check if we need to write headers
    let dataToWrite = valsExport;
    const writeStartRow = startRow;

    // If sheet is empty, include headers
    if (startRow === 1) {
      dataToWrite = [listCols, ...valsExport];
    }

    // Calculate range for writing
    const numCols = listCols.length;
    const numRows = dataToWrite.length;
    const endCol = convertIndexToColumnName({ columnIndex: numCols - 1 });
    const endRow = writeStartRow + numRows - 1;
    const writeRange = `${sheetName}!A${writeStartRow}:${endCol}${endRow}`;

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: writeRange,
            values: dataToWrite,
          },
        ],
      },
    });

    return true;
  }

  /**
   * Updates multiple cells at specific row and column positions.
   *
   * @param params - Update parameters including cells to update
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.updateValuesMultiCells({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   cells: [
   *     { row: 0, col: 0, content: 'Updated A2' },
   *     { row: 1, col: 1, content: 'Updated B3' },
   *     { row: 2, col: 2, content: 'Updated C4' }
   *   ],
   *   rowOffset: 0  // Header at row 1, data starts at row 2
   * });
   * ```
   */
  public async updateValuesMultiCells({
    sheetUrl,
    sheetName,
    cells,
    rowOffset = 0,
  }: IUpdateMultiCellsParams): Promise<boolean> {
    if (!cells || cells.length === 0) {
      throw new Error('No cells provided for update');
    }

    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    // Create update requests for each cell
    const requests = cells.map((cell) => {
      const colName = convertIndexToColumnName({ columnIndex: cell.col });
      const actualRow = calculateActualRow({
        dataRowIndex: cell.row,
        rowOffset,
      });
      const sheetRange = `${sheetName}!${colName}${actualRow}`;

      return {
        range: sheetRange,
        values: [[cell.content]],
      };
    });

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: requests,
      },
    });

    return true;
  }

  /**
   * Updates multiple columns in a single row.
   *
   * @param params - Update parameters including row and column values
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.updateValuesMultiColsByRow({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   row: 5,
   *   values: [
   *     { col: 0, content: 'Value for A7' },
   *     { col: 1, content: 'Value for B7' },
   *     { col: 2, content: 'Value for C7' }
   *   ]
   * });
   * ```
   */
  public async updateValuesMultiColsByRow({
    sheetUrl,
    sheetName,
    row,
    values,
    rowOffset = 0,
  }: IUpdateMultiColsByRowParams): Promise<boolean> {
    if (!values || values.length === 0) {
      throw new Error('No values provided for update');
    }

    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    const actualRow = calculateActualRow({ dataRowIndex: row, rowOffset });

    const requests = values.map((valPair) => {
      const colName = convertIndexToColumnName({ columnIndex: valPair.col });
      const sheetRange = `${sheetName}!${colName}${actualRow}`;

      return {
        range: sheetRange,
        values: [[valPair.content]],
      };
    });

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: requests,
      },
    });

    return true;
  }

  /**
   * Updates multiple rows in a single column.
   *
   * @param params - Update parameters including column and row values
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.updateValuesMultiRowsByCol({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   col: 2,
   *   values: [
   *     { row: 0, content: 'Row 1 Col C' },
   *     { row: 1, content: 'Row 2 Col C' },
   *     { row: 2, content: 'Row 3 Col C' }
   *   ]
   * });
   * ```
   */
  public async updateValuesMultiRowsByCol({
    sheetUrl,
    sheetName,
    col,
    values,
    rowOffset = 0,
  }: IUpdateMultiRowsByColParams): Promise<boolean> {
    if (!values || values.length === 0) {
      throw new Error('No values provided for update');
    }

    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    const colName = convertIndexToColumnName({ columnIndex: col });

    const requests = values.map((valPair) => {
      const actualRow = calculateActualRow({
        dataRowIndex: valPair.row,
        rowOffset,
      });
      const sheetRange = `${sheetName}!${colName}${actualRow}`;

      return {
        range: sheetRange,
        values: [[valPair.content]],
      };
    });

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: requests,
      },
    });

    return true;
  }

  /**
   * Updates a range of multiple rows and columns at once.
   *
   * @param params - Update parameters including value matrix
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.updateValuesMultiRowsMultiCols({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   values: [
   *     ['A1', 'B1', 'C1'],
   *     ['A2', 'B2', 'C2'],
   *     ['A3', 'B3', 'C3']
   *   ],
   *   startRow: 0,
   *   startCol: 0
   * });
   * ```
   */
  public async updateValuesMultiRowsMultiCols({
    sheetUrl,
    sheetName,
    values,
    startRow = 0,
    endRow,
    startCol = 0,
    rowOffset = 0,
  }: IUpdateMultiRowsMultiColsParams): Promise<boolean> {
    if (!values || values.length === 0 || values[0].length === 0) {
      throw new Error('Invalid values matrix: no data to update');
    }

    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    const numRows = values.length;
    const numCols = values[0].length;

    const startColName = convertIndexToColumnName({ columnIndex: startCol });
    const endColName = convertIndexToColumnName({
      columnIndex: startCol + numCols - 1,
    });

    const startRowIndex = calculateActualRow({
      dataRowIndex: startRow,
      rowOffset,
    });

    let endRowIndex: number;
    if (endRow !== undefined) {
      endRowIndex = calculateActualRow({ dataRowIndex: endRow, rowOffset });
    } else {
      endRowIndex = startRowIndex + numRows - 1;
    }

    const sheetRange = `${sheetName}!${startColName}${startRowIndex}:${endColName}${endRowIndex}`;

    await sheetsInstance.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: sheetRange,
            values,
          },
        ],
      },
    });

    return true;
  }

  /**
   * Deletes a row from a sheet.
   *
   * @param params - Delete parameters including row index
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.deleteRowSheet({
   *   sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
   *   sheetName: 'Sheet1',
   *   row: 5  // Delete data row at index 5
   * });
   * ```
   */
  public async deleteRowSheet({
    sheetUrl,
    sheetName,
    row,
    rowOffset = 0,
  }: IDeleteRowParams): Promise<boolean> {
    const sheetsInstance = await this.getSheetsClient();
    const spreadsheetId = this.extractSheetId({ sheetUrl });

    // Get sheet ID
    const sheetInfo = await sheetsInstance.spreadsheets.get({
      spreadsheetId,
      ranges: [sheetName],
      includeGridData: false,
    });

    const sheet = sheetInfo.data.sheets?.find(
      (s: sheets_v4.Schema$Sheet) => s.properties?.title === sheetName
    );

    const sheetId = sheet?.properties?.sheetId;

    if (sheetId === undefined || sheetId === null) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    // Calculate actual row index
    // +1 for header row, +rowOffset
    const actualRowIndex = row + 1 + rowOffset;

    const request = {
      deleteDimension: {
        range: {
          sheetId,
          dimension: 'ROWS',
          startIndex: actualRowIndex,
          endIndex: actualRowIndex + 1,
        },
      },
    };

    await sheetsInstance.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [request],
      },
    });

    return true;
  }
}
