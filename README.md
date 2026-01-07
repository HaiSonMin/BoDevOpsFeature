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
