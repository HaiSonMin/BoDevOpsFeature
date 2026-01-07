# BoDevOps Features

A collection of framework-agnostic TypeScript utilities for Google Drive, Google Sheets, and iDrive e2 operations.

[![NPM Version](https://img.shields.io/npm/v/bodevops-features.svg)](https://www.npmjs.com/package/bodevops-features)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🚀 **Framework-agnostic** - Works with any TypeScript/JavaScript project
- 📦 **Tree-shakeable** - Import only what you need
- 🔒 **Type-safe** - Full TypeScript support with no `any` types
- 📚 **Well-documented** - Comprehensive JSDoc comments in English
- ✨ **Easy to use** - Clean, intuitive API design

## Installation

```bash
npm install bodevops-features
```

## Modules

### 🗂️ Google Drive (`GGDrive`)

Manage files and folders in Google Drive with ease.

**Features:**

- Upload files to Drive
- Create folder hierarchies
- Share files and folders
- Transfer ownership
- Get storage quota information
- List files in folders
- Delete files

### 📊 Google Sheets (`GGSheet`)

Read, write, and manage Google Spreadsheet data.

**Features:**

- Read sheet data
- Export data (Append/Overwrite modes)
- Update cells, rows, and columns
- Find row by value
- Delete rows
- Convert sheet data to typed objects
- Column name/index conversion utilities

---

## Quick Start

### Google Drive

```typescript
import { GGDrive } from 'bodevops-features';

// Initialize client
const driveClient = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
});

// Get storage information
const storage = await driveClient.getStorageInfo();
console.log(`Used: ${storage.formattedUsed} / ${storage.formattedTotal}`);

// Upload a file
const result = await driveClient.uploadFile({
  localFilePath: './document.pdf',
  driveFolder: 'MyFolder/SubFolder',
  fileName: 'uploaded-document.pdf',
});
console.log(`View at: ${result.webViewLink}`);

// Upload and share with someone
const sharedResult = await driveClient.uploadFileAndShare({
  localFilePath: './report.pdf',
  driveFolder: 'SharedReports',
  shareWithEmail: 'colleague@example.com',
  role: 'writer',
});

// List files in a folder
const files = await driveClient.listFilesInFolder({ folderId: 'root' });
for (const file of files) {
  console.log(`${file.name} (${file.mimeType})`);
}
```

### Google Sheets

```typescript
import { GGSheet } from 'bodevops-features';

// Initialize client
const sheetClient = new GGSheet.GoogleSheetClient({
  keyFilePath: './service-account.json',
});

// Read data from a sheet
const data = await sheetClient.getValues({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
});

// Convert to typed objects
interface Person {
  name: string;
  email: string;
  age: string;
}

const people = GGSheet.convertValueSheet<Person>({
  values: data,
  rowOffset: 0, // First row is header
});

// Export data (Overwrite mode)
await sheetClient.export({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  listCols: ['Name', 'Email', 'Age'],
  valsExport: [
    ['John Doe', 'john@example.com', '30'],
    ['Jane Smith', 'jane@example.com', '25'],
  ],
  typeExport: GGSheet.ETypeExport.Overwrite,
});

// Update specific cells
await sheetClient.updateValuesMultiCells({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  cells: [
    { row: 0, col: 0, content: 'Updated Value' },
    { row: 1, col: 1, content: 'Another Update' },
  ],
  rowOffset: 0,
});

// Find a row by value
const rowIndex = await sheetClient.getIdxRow({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  colName: 'A',
  value: 'John Doe',
});
```

---

## Authentication

Both Google Drive and Google Sheets require a Google Service Account for authentication.

### Creating a Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API and Google Sheets API
4. Create a Service Account:
   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Fill in the details and create
5. Create a JSON key:
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" and download

### Using Credentials

```typescript
// Option 1: Using key file path
const client = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
});

// Option 2: Using credentials object
const client = new GGDrive.GoogleDriveClient({
  credentials: {
    type: 'service_account',
    project_id: 'your-project-id',
    private_key: '-----BEGIN PRIVATE KEY-----\n...',
    client_email: 'service-account@project.iam.gserviceaccount.com',
    // ... other fields
  },
});
```

---

## API Reference

### Google Drive

#### `GoogleDriveClient`

**Constructor:**

```typescript
new GoogleDriveClient(config: IGoogleDriveConfig)
```

**Methods:**

| Method                          | Description                         |
| ------------------------------- | ----------------------------------- |
| `getStorageInfo()`              | Get Drive storage quota information |
| `uploadFile(params)`            | Upload a file to Drive              |
| `uploadFileAndShare(params)`    | Upload and share with email         |
| `deleteFile(params)`            | Delete a file from Drive            |
| `listFilesInFolder(params)`     | List files in a folder              |
| `makeFilePublic(params)`        | Make file accessible via link       |
| `transferFileOwnership(params)` | Transfer file to another user       |
| `shareFolderWithEmail(params)`  | Share folder with permissions       |
| `getFolderIdByPath(params)`     | Get folder ID from path string      |
| `fileExistsInFolder(params)`    | Check if file exists                |

**Utility Functions:**

- `formatBytes({ bytes })` - Convert bytes to human-readable format
- `normalizeFilePath({ filePath })` - Normalize file path
- `validateFileExists({ filePath })` - Check if file exists
- `getFileInfo({ filePath })` - Get file metadata

---

### Google Sheets

#### `GoogleSheetClient`

**Constructor:**

```typescript
new GoogleSheetClient(config: IGoogleSheetConfig)
```

**Methods:**

| Method                                   | Description                    |
| ---------------------------------------- | ------------------------------ |
| `getSheetInfo(params)`                   | Get spreadsheet metadata       |
| `getValues(params)`                      | Read all values from sheet     |
| `getIdxRow(params)`                      | Find row index by value        |
| `export(params)`                         | Export data (Append/Overwrite) |
| `updateValuesMultiCells(params)`         | Update specific cells          |
| `updateValuesMultiColsByRow(params)`     | Update columns in a row        |
| `updateValuesMultiRowsByCol(params)`     | Update rows in a column        |
| `updateValuesMultiRowsMultiCols(params)` | Batch update range             |
| `deleteRowSheet(params)`                 | Delete a row                   |

**Utility Functions:**

- `convertIndexToColumnName({ columnIndex })` - Convert 0 → "A", 26 → "AA"
- `convertColumnNameToIndex({ columnName })` - Convert "A" → 0, "AA" → 26
- `convertValueSheet({ values, rowOffset })` - Parse sheet to typed objects
- `getSheetIdFromUrl({ sheetUrl })` - Extract spreadsheet ID
- `calculateActualRow({ dataRowIndex, rowOffset })` - Calculate sheet row number

**Enums:**

- `ETypeExport.Append` - Append data to existing
- `ETypeExport.Overwrite` - Replace all data

---

## Advanced Examples

### Google Drive: Batch Upload with Progress

```typescript
const files = ['file1.pdf', 'file2.pdf', 'file3.pdf'];

for (const file of files) {
  const result = await driveClient.uploadFile({
    localFilePath: `./documents/${file}`,
    driveFolder: 'Uploads/2024',
    fileName: file,
  });
  console.log(`✓ Uploaded: ${result.name}`);
}
```

### Google Sheets: Export Database Query Results

```typescript
import { GGSheet } from 'bodevops-features';

// Assume you have query results
const users = await database.query('SELECT name, email, created_at FROM users');

// Map to column definitions
const colsMapping = {
  name: 'Full Name',
  email: 'Email Address',
  created_at: 'Registration Date',
};

// Extract columns and values
const { listCols, valsExport } = GGSheet.getListColsAndValsExport({
  colsForSheet: colsMapping,
  resultItems: users,
});

// Export to sheet
await sheetClient.export({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Users',
  listCols,
  valsExport,
  typeExport: GGSheet.ETypeExport.Overwrite,
});
```

### Google Sheets: Update Multiple Rows

```typescript
// Update column C for rows 0-4
await sheetClient.updateValuesMultiRowsByCol({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Sheet1',
  col: 2, // Column C (0-based)
  values: [
    { row: 0, content: 'Status: Complete' },
    { row: 1, content: 'Status: Pending' },
    { row: 2, content: 'Status: Complete' },
    { row: 3, content: 'Status: Failed' },
    { row: 4, content: 'Status: Complete' },
  ],
});
```

---

## Google Sheets Update & Delete Methods - Detailed Guide

### 📝 Understanding `rowOffset`

All update and delete methods support a `rowOffset` parameter to handle different sheet structures:

- **`rowOffset: 0`** (default): Header at row 1, data starts at row 2
- **`rowOffset: 1`**: Header at row 1, skip row 2, data starts at row 3
- **`rowOffset: 2`**: Header at row 1, skip rows 2-3, data starts at row 4

**Example Sheet Structure:**

```
Row 1: [Name, Email, Status]        ← Header
Row 2: [John, john@example.com, Active]   ← Data row 0 (with rowOffset=0)
Row 3: [Jane, jane@example.com, Pending]  ← Data row 1 (with rowOffset=0)
```

---

### 1️⃣ `updateValuesMultiCells()` - Update Specific Cells

Update multiple cells at specific row and column positions.

**Use Case:** Update scattered cells across the sheet

```typescript
await sheetClient.updateValuesMultiCells({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Sheet1',
  cells: [
    { row: 0, col: 0, content: 'John Doe' }, // A2
    { row: 0, col: 2, content: 'Active' }, // C2
    { row: 1, col: 1, content: 'jane@new.com' }, // B3
    { row: 5, col: 3, content: 'Updated' }, // D7
  ],
  rowOffset: 0, // Optional, default is 0
});
```

**Parameters:**

- `cells`: Array of `{ row, col, content }` objects
  - `row`: 0-based data row index
  - `col`: 0-based column index (0=A, 1=B, 2=C, ...)
  - `content`: String value to write

---

### 2️⃣ `updateValuesMultiColsByRow()` - Update Multiple Columns in One Row

Update several columns in a single row.

**Use Case:** Update a complete user record

```typescript
// Update row 3 (data row index 2) - columns A, B, C
await sheetClient.updateValuesMultiColsByRow({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Users',
  row: 2, // Data row index (actual sheet row 4 with rowOffset=0)
  values: [
    { col: 0, content: 'Updated Name' }, // Column A
    { col: 1, content: 'new@email.com' }, // Column B
    { col: 2, content: 'Active' }, // Column C
    { col: 4, content: '2026-01-07' }, // Column E
  ],
  rowOffset: 0,
});
```

**Real-world Example:**

```typescript
// Update user status and last login
await sheetClient.updateValuesMultiColsByRow({
  sheetUrl: SHEET_URL,
  sheetName: 'Users',
  row: userId,
  values: [
    { col: 5, content: 'Online' }, // Status column
    { col: 6, content: new Date().toISOString() }, // Last login column
  ],
});
```

---

### 3️⃣ `updateValuesMultiRowsByCol()` - Update Multiple Rows in One Column

Update several rows in a single column.

**Use Case:** Batch update status for multiple items

```typescript
// Update status column (C) for multiple rows
await sheetClient.updateValuesMultiRowsByCol({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Tasks',
  col: 2, // Column C (0-based)
  values: [
    { row: 0, content: 'Completed' },
    { row: 1, content: 'In Progress' },
    { row: 2, content: 'Completed' },
    { row: 5, content: 'Pending' },
    { row: 8, content: 'Completed' },
  ],
  rowOffset: 0,
});
```

**Real-world Example:**

```typescript
// Mark all selected tasks as completed
const completedTaskIds = [0, 3, 5, 7];

await sheetClient.updateValuesMultiRowsByCol({
  sheetUrl: SHEET_URL,
  sheetName: 'Tasks',
  col: 3, // Status column
  values: completedTaskIds.map((taskId) => ({
    row: taskId,
    content: 'Completed ✓',
  })),
});
```

---

### 4️⃣ `updateValuesMultiRowsMultiCols()` - Batch Update a Range

Update a rectangular range of cells (multiple rows and columns).

**Use Case:** Update a table section or paste data block

```typescript
// Update a 3x3 range starting at row 0, column 0
await sheetClient.updateValuesMultiRowsMultiCols({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Data',
  values: [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3'],
  ],
  startRow: 0, // Start at data row 0 (sheet row 2)
  startCol: 0, // Start at column A
  rowOffset: 0,
});
```

**Advanced Example with Custom Range:**

```typescript
// Update columns D-F (indices 3-5) for rows 10-15
await sheetClient.updateValuesMultiRowsMultiCols({
  sheetUrl: SHEET_URL,
  sheetName: 'Report',
  values: [
    ['Q1', '1000', '95%'],
    ['Q2', '1200', '98%'],
    ['Q3', '1100', '96%'],
    ['Q4', '1300', '99%'],
  ],
  startRow: 10, // Data row 10
  endRow: 13, // Data row 13 (4 rows total)
  startCol: 3, // Column D
  rowOffset: 0,
});
```

**Paste Clipboard Data:**

```typescript
// Paste a copied table from Excel/Sheets
const clipboardData = [
  ['Product', 'Price', 'Stock'],
  ['Item A', '100', '50'],
  ['Item B', '200', '30'],
  ['Item C', '150', '40'],
];

await sheetClient.updateValuesMultiRowsMultiCols({
  sheetUrl: SHEET_URL,
  sheetName: 'Inventory',
  values: clipboardData,
  startRow: 0,
  startCol: 0,
});
```

---

### 5️⃣ `deleteRowSheet()` - Delete a Row

Delete a specific row from the sheet.

**Use Case:** Remove a record from the sheet

```typescript
// Delete data row 5 (actual sheet row 7 with rowOffset=0)
await sheetClient.deleteRowSheet({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/...',
  sheetName: 'Users',
  row: 5, // Data row index
  rowOffset: 0,
});
```

**Real-world Example:**

```typescript
// Delete user by finding their row first
const userEmail = 'user@example.com';

// Find the row
const rowIndex = await sheetClient.getIdxRow({
  sheetUrl: SHEET_URL,
  sheetName: 'Users',
  colName: 'B', // Email column
  value: userEmail,
});

if (rowIndex >= 0) {
  // Delete the row
  await sheetClient.deleteRowSheet({
    sheetUrl: SHEET_URL,
    sheetName: 'Users',
    row: rowIndex,
  });
  console.log(`Deleted user: ${userEmail}`);
}
```

**⚠️ Important Notes:**

- Deleting a row shifts all rows below it up by one
- The row index is 0-based for data rows (excluding header)
- Cannot be undone - use with caution!

---

### 🎯 Method Selection Guide

| Scenario                            | Recommended Method                 |
| ----------------------------------- | ---------------------------------- |
| Update 1-2 specific cells           | `updateValuesMultiCells()`         |
| Update entire user record (one row) | `updateValuesMultiColsByRow()`     |
| Batch update status column          | `updateValuesMultiRowsByCol()`     |
| Update a table section/range        | `updateValuesMultiRowsMultiCols()` |
| Remove a record                     | `deleteRowSheet()`                 |

---

### 💡 Pro Tips

**1. Batch Operations for Performance:**

```typescript
// ❌ Bad: Multiple individual updates
for (const item of items) {
  await sheetClient.updateValuesMultiCells({
    sheetUrl: SHEET_URL,
    sheetName: 'Data',
    cells: [{ row: item.id, col: 2, content: item.status }],
  });
}

// ✅ Good: Single batch update
await sheetClient.updateValuesMultiRowsByCol({
  sheetUrl: SHEET_URL,
  sheetName: 'Data',
  col: 2,
  values: items.map((item) => ({ row: item.id, content: item.status })),
});
```

**2. Handle rowOffset Correctly:**

```typescript
// If your sheet has a description row after header:
// Row 1: [Name, Email, Status]        ← Header
// Row 2: [Enter name, Enter email, ...]  ← Description
// Row 3: [John, john@example.com, Active]  ← First data row

await sheetClient.updateValuesMultiCells({
  sheetUrl: SHEET_URL,
  sheetName: 'Sheet1',
  cells: [{ row: 0, col: 0, content: 'Updated' }],
  rowOffset: 1, // Skip the description row
});
// This updates row 3 (first data row)
```

**3. Validate Before Delete:**

```typescript
// Always confirm before deleting
const confirmDelete = await getUserConfirmation();
if (confirmDelete) {
  await sheetClient.deleteRowSheet({
    sheetUrl: SHEET_URL,
    sheetName: 'Users',
    row: rowIndex,
  });
}
```

---

## TypeScript Support

This library is written in TypeScript and provides full type definitions.

```typescript
import { GGDrive, GGSheet } from 'bodevops-features';

// All types are exported
type UploadResult = GGDrive.IUploadFileResult;
type SheetInfo = GGSheet.ISpreadsheetInfo;
type ExportMode = GGSheet.ETypeExport;
```

---

## Error Handling

All methods throw descriptive errors. Wrap calls in try-catch:

```typescript
try {
  const result = await driveClient.uploadFile({
    localFilePath: './document.pdf',
    driveFolder: 'MyFolder',
  });
} catch (error) {
  console.error('Upload failed:', error.message);
  // Handle error appropriately
}
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write clean, documented code
4. Add tests if applicable
5. Submit a pull request

---

## License

MIT © [BoDevOps](https://github.com/HaiSonMin)

---

## Support

- 📧 Email: support@bodevops.com
- 🐛 Issues: [GitHub Issues](https://github.com/HaiSonMin/BoDevOpsFeature/issues)
- 📖 Documentation: [Full API Docs](https://github.com/HaiSonMin/BoDevOpsFeature#readme)

---

## Changelog

### v1.0.0 (2026-01-07)

- ✨ Initial release
- 🗂️ Google Drive module
- 📊 Google Sheets module
- 📚 Full TypeScript support
- 📝 Comprehensive documentation
