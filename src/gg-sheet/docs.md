# Google Sheets Feature - Complete Documentation

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Authentication](#authentication)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Update Methods Guide](#update-methods-guide)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Google Sheets feature provides a powerful, type-safe interface for reading, writing, and managing spreadsheet data. Built with TypeScript, it offers comprehensive methods for all common sheet operations.

### Key Features

- ✅ Read sheet data
- ✅ Export data (Append/Overwrite modes)
- ✅ Update cells, rows, and columns
- ✅ Find row by value
- ✅ Delete rows
- ✅ Convert sheet data to typed objects
- ✅ Column name/index conversion utilities
- ✅ Batch operations for performance

---

## Installation

```bash
npm install bodevops-features
```

**Dependencies:**

- `googleapis` - Automatically installed

---

## Authentication

### Creating a Service Account

1. **Go to Google Cloud Console**

   - Visit [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API**

   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**

   - Go to "IAM & Admin" → "Service Accounts"
   - Click "Create Service Account"
   - Enter name and description
   - Click "Create and Continue"
   - Skip role assignment (optional)
   - Click "Done"

4. **Generate JSON Key**

   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" format
   - Download the key file

5. **Share Spreadsheet with Service Account**
   - Open your Google Spreadsheet
   - Click "Share" button
   - Add the service account email (found in JSON key file)
   - Set appropriate permissions (Editor/Viewer)

### Configuration Options

```typescript
import { GGSheet } from 'bodevops-features';

// Option 1: Using key file path (Recommended)
const client = new GGSheet.GoogleSheetClient({
  keyFilePath: './service-account.json',
});

// Option 2: Using credentials object
const client = new GGSheet.GoogleSheetClient({
  credentials: {
    type: 'service_account',
    project_id: 'your-project-id',
    private_key_id: 'key-id',
    private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
    client_email: 'service-account@project.iam.gserviceaccount.com',
    client_id: '123456789',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/...',
  },
});

// Option 3: Custom scopes
const client = new GGSheet.GoogleSheetClient({
  keyFilePath: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

---

## Quick Start

### Read Data

```typescript
import { GGSheet } from 'bodevops-features';

const client = new GGSheet.GoogleSheetClient({
  keyFilePath: './service-account.json',
});

// Read all data
const data = await client.getValues({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
});

console.log(data);
// [
//   ['Name', 'Email', 'Age'],
//   ['John', 'john@example.com', '30'],
//   ['Jane', 'jane@example.com', '25']
// ]
```

### Convert to Typed Objects

```typescript
interface User {
  Name: string;
  Email: string;
  Age: string;
}

const users = GGSheet.convertValueSheet<User>({
  values: data,
  rowOffset: 0, // First row is header
});

console.log(users);
// [
//   { Name: 'John', Email: 'john@example.com', Age: '30' },
//   { Name: 'Jane', Email: 'jane@example.com', Age: '25' }
// ]
```

### Export Data

```typescript
await client.export({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  listCols: ['Name', 'Email', 'Age'],
  valsExport: [
    ['John Doe', 'john@example.com', '30'],
    ['Jane Smith', 'jane@example.com', '25'],
  ],
  typeExport: GGSheet.ETypeExport.Overwrite,
});
```

---

## Core Concepts

### Understanding Row Indexing

Google Sheets uses **1-based indexing** for actual sheet rows, but this library uses **0-based indexing** for data rows (excluding header).

```
Sheet View:
Row 1: [Name, Email, Status]        ← Header (not counted in data index)
Row 2: [John, john@..., Active]     ← Data row 0
Row 3: [Jane, jane@..., Pending]    ← Data row 1
Row 4: [Bob, bob@..., Active]       ← Data row 2
```

### Understanding `rowOffset`

The `rowOffset` parameter handles different sheet structures:

- **`rowOffset: 0`** (default): Header at row 1, data starts at row 2
- **`rowOffset: 1`**: Header at row 1, skip row 2, data starts at row 3
- **`rowOffset: 2`**: Header at row 1, skip rows 2-3, data starts at row 4

**Example with rowOffset:**

```
rowOffset = 0:
Row 1: [Name, Email]      ← Header
Row 2: [John, john@...]   ← Data row 0

rowOffset = 1:
Row 1: [Name, Email]           ← Header
Row 2: [Enter name, email...]  ← Description (skipped)
Row 3: [John, john@...]        ← Data row 0
```

### Column Indexing

Columns use **0-based indexing**:

- Column A = 0
- Column B = 1
- Column C = 2
- Column Z = 25
- Column AA = 26
- Column AB = 27

**Conversion utilities:**

```typescript
// Index to column name
const colName = GGSheet.convertIndexToColumnName({ columnIndex: 0 });
console.log(colName); // "A"

const colName2 = GGSheet.convertIndexToColumnName({ columnIndex: 26 });
console.log(colName2); // "AA"

// Column name to index
const colIndex = GGSheet.convertColumnNameToIndex({ columnName: 'A' });
console.log(colIndex); // 0

const colIndex2 = GGSheet.convertColumnNameToIndex({ columnName: 'AA' });
console.log(colIndex2); // 26
```

---

## API Reference

### Constructor

#### `new GoogleSheetClient(config)`

Creates a new Google Sheets client instance.

**Parameters:**

- `config.keyFilePath` (string, optional): Path to service account JSON file
- `config.credentials` (object, optional): Service account credentials object
- `config.scopes` (string[], optional): Custom OAuth scopes

---

### Read Methods

#### `getSheetInfo(params)`

Get spreadsheet metadata including all sheet tabs.

**Parameters:**

```typescript
{
  sheetUrl: string;
}
```

**Returns:** `Promise<ISpreadsheetInfo>`

**Example:**

```typescript
const info = await client.getSheetInfo({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
});

console.log(info.spreadsheetTitle);
console.log(info.sheets); // Array of sheet tabs
```

---

#### `getValues(params)`

Read all values from a specific sheet tab.

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  endRow?: number;  // Optional: limit rows
}
```

**Returns:** `Promise<string[][]>`

**Example:**

```typescript
// Read all data
const data = await client.getValues({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
});

// Read first 100 rows only
const limitedData = await client.getValues({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  endRow: 100,
});
```

---

#### `getIdxRow(params)`

Find row index where a specific value appears in a column.

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  colName: string; // Column letter (A, B, C, ...)
  value: string; // Value to search for
}
```

**Returns:** `Promise<number>` (0-based row index, or -1 if not found)

**Example:**

```typescript
const rowIndex = await client.getIdxRow({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Users',
  colName: 'B', // Email column
  value: 'john@example.com',
});

if (rowIndex >= 0) {
  console.log(`Found at row: ${rowIndex}`);
}
```

---

### Write Methods

#### `export(params)`

Export data to sheet with Append or Overwrite mode.

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  listCols: string[];      // Column headers
  valsExport: string[][]; // Data rows
  typeExport: ETypeExport; // Append or Overwrite
}
```

**Returns:** `Promise<boolean>`

**Example:**

```typescript
// Overwrite all data
await client.export({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Users',
  listCols: ['Name', 'Email', 'Status'],
  valsExport: [
    ['John', 'john@example.com', 'Active'],
    ['Jane', 'jane@example.com', 'Pending'],
  ],
  typeExport: GGSheet.ETypeExport.Overwrite,
});

// Append new data
await client.export({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Users',
  listCols: ['Name', 'Email', 'Status'],
  valsExport: [['Bob', 'bob@example.com', 'Active']],
  typeExport: GGSheet.ETypeExport.Append,
});
```

---

## Update Methods Guide

### 1. `updateValuesMultiCells()` - Update Specific Cells

Update multiple cells at specific positions.

**When to use:** Scattered cell updates across the sheet

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  cells: Array<{
    row: number;      // 0-based data row
    col: number;      // 0-based column
    content: string;
  }>;
  rowOffset?: number; // Default: 0
}
```

**Example:**

```typescript
await client.updateValuesMultiCells({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Sheet1',
  cells: [
    { row: 0, col: 0, content: 'John Doe' }, // A2
    { row: 0, col: 2, content: 'Active' }, // C2
    { row: 1, col: 1, content: 'jane@new.com' }, // B3
    { row: 5, col: 3, content: 'Updated' }, // D7
  ],
});
```

---

### 2. `updateValuesMultiColsByRow()` - Update Columns in One Row

Update multiple columns in a single row.

**When to use:** Update a complete record/user

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  row: number;        // 0-based data row
  values: Array<{
    col: number;      // 0-based column
    content: string;
  }>;
  rowOffset?: number;
}
```

**Example:**

```typescript
// Update user record at row 2
await client.updateValuesMultiColsByRow({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Users',
  row: 2,
  values: [
    { col: 0, content: 'Updated Name' },
    { col: 1, content: 'new@email.com' },
    { col: 2, content: 'Active' },
  ],
});
```

---

### 3. `updateValuesMultiRowsByCol()` - Update Rows in One Column

Update multiple rows in a single column.

**When to use:** Batch update status/category for multiple items

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  col: number;        // 0-based column
  values: Array<{
    row: number;      // 0-based data row
    content: string;
  }>;
  rowOffset?: number;
}
```

**Example:**

```typescript
// Update status column for multiple rows
await client.updateValuesMultiRowsByCol({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Tasks',
  col: 3, // Status column (D)
  values: [
    { row: 0, content: 'Completed' },
    { row: 2, content: 'Completed' },
    { row: 5, content: 'In Progress' },
  ],
});
```

---

### 4. `updateValuesMultiRowsMultiCols()` - Batch Update Range

Update a rectangular range of cells.

**When to use:** Update a table section, paste data block

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  values: string[][];  // 2D array of values
  startRow?: number;   // Default: 0
  endRow?: number;     // Optional
  startCol?: number;   // Default: 0
  rowOffset?: number;  // Default: 0
}
```

**Example:**

```typescript
// Update 3x3 range
await client.updateValuesMultiRowsMultiCols({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Data',
  values: [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3'],
  ],
  startRow: 0,
  startCol: 0,
});

// Update specific range (rows 10-13, columns D-F)
await client.updateValuesMultiRowsMultiCols({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Report',
  values: [
    ['Q1', '1000', '95%'],
    ['Q2', '1200', '98%'],
    ['Q3', '1100', '96%'],
    ['Q4', '1300', '99%'],
  ],
  startRow: 10,
  endRow: 13,
  startCol: 3,
});
```

---

### 5. `deleteRowSheet()` - Delete a Row

Delete a specific row from the sheet.

**When to use:** Remove a record

**Parameters:**

```typescript
{
  sheetUrl: string;
  sheetName: string;
  row: number;        // 0-based data row
  rowOffset?: number; // Default: 0
}
```

**Example:**

```typescript
// Delete row 5
await client.deleteRowSheet({
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1abc123...',
  sheetName: 'Users',
  row: 5,
});

// Delete by finding row first
const rowIndex = await client.getIdxRow({
  sheetUrl: SHEET_URL,
  sheetName: 'Users',
  colName: 'B',
  value: 'user@example.com',
});

if (rowIndex >= 0) {
  await client.deleteRowSheet({
    sheetUrl: SHEET_URL,
    sheetName: 'Users',
    row: rowIndex,
  });
}
```

**⚠️ Important:**

- Deleting a row shifts all rows below it up by one
- Cannot be undone
- Use with caution

---

## Advanced Usage

### Database to Sheet Sync

```typescript
import { GGSheet } from 'bodevops-features';

async function syncDatabaseToSheet(
  client: GGSheet.GoogleSheetClient,
  sheetUrl: string,
  sheetName: string
) {
  // Fetch from database
  const users = await database.query(`
    SELECT name, email, status, created_at 
    FROM users 
    WHERE active = true
  `);

  // Define column mapping
  const colsMapping = {
    name: 'Full Name',
    email: 'Email Address',
    status: 'Account Status',
    created_at: 'Registration Date',
  };

  // Extract columns and values
  const { listCols, valsExport } = GGSheet.getListColsAndValsExport({
    colsForSheet: colsMapping,
    resultItems: users,
  });

  // Export to sheet
  await client.export({
    sheetUrl,
    sheetName,
    listCols,
    valsExport,
    typeExport: GGSheet.ETypeExport.Overwrite,
  });

  console.log(`Synced ${users.length} users to sheet`);
}
```

### Conditional Updates

```typescript
async function updateIfChanged(
  client: GGSheet.GoogleSheetClient,
  sheetUrl: string,
  sheetName: string,
  rowIndex: number,
  newStatus: string
) {
  // Read current data
  const data = await client.getValues({ sheetUrl, sheetName });
  const currentStatus = data[rowIndex + 1][2]; // +1 for header, column C

  // Only update if changed
  if (currentStatus !== newStatus) {
    await client.updateValuesMultiCells({
      sheetUrl,
      sheetName,
      cells: [{ row: rowIndex, col: 2, content: newStatus }],
    });
    console.log(`Updated row ${rowIndex}: ${currentStatus} → ${newStatus}`);
  } else {
    console.log(`Row ${rowIndex} already has status: ${newStatus}`);
  }
}
```

### Batch Processing with Progress

```typescript
async function batchUpdateWithProgress(
  client: GGSheet.GoogleSheetClient,
  sheetUrl: string,
  sheetName: string,
  updates: Array<{ row: number; col: number; content: string }>
) {
  const batchSize = 50;
  const totalBatches = Math.ceil(updates.length / batchSize);

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    await client.updateValuesMultiCells({
      sheetUrl,
      sheetName,
      cells: batch,
    });

    console.log(`Progress: ${batchNum}/${totalBatches} batches completed`);

    // Delay between batches to avoid rate limits
    if (i + batchSize < updates.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
```

### Data Validation Before Update

```typescript
interface UserUpdate {
  row: number;
  name?: string;
  email?: string;
  status?: string;
}

async function updateUserWithValidation(
  client: GGSheet.GoogleSheetClient,
  sheetUrl: string,
  sheetName: string,
  update: UserUpdate
) {
  const values: Array<{ col: number; content: string }> = [];

  // Validate and prepare updates
  if (update.name) {
    if (update.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    values.push({ col: 0, content: update.name });
  }

  if (update.email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
      throw new Error('Invalid email format');
    }
    values.push({ col: 1, content: update.email });
  }

  if (update.status) {
    const validStatuses = ['Active', 'Pending', 'Inactive'];
    if (!validStatuses.includes(update.status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    values.push({ col: 2, content: update.status });
  }

  if (values.length === 0) {
    throw new Error('No valid updates provided');
  }

  // Perform update
  await client.updateValuesMultiColsByRow({
    sheetUrl,
    sheetName,
    row: update.row,
    values,
  });
}
```

---

## Best Practices

### 1. Use Batch Operations

```typescript
// ❌ Bad: Multiple individual updates
for (const item of items) {
  await client.updateValuesMultiCells({
    sheetUrl: SHEET_URL,
    sheetName: 'Data',
    cells: [{ row: item.id, col: 2, content: item.status }],
  });
}

// ✅ Good: Single batch update
await client.updateValuesMultiRowsByCol({
  sheetUrl: SHEET_URL,
  sheetName: 'Data',
  col: 2,
  values: items.map((item) => ({
    row: item.id,
    content: item.status,
  })),
});
```

### 2. Handle rowOffset Correctly

```typescript
// Sheet with description row
// Row 1: [Name, Email]           ← Header
// Row 2: [Enter name, email...]  ← Description
// Row 3: [John, john@...]        ← First data row

await client.updateValuesMultiCells({
  sheetUrl: SHEET_URL,
  sheetName: 'Sheet1',
  cells: [{ row: 0, col: 0, content: 'Updated' }],
  rowOffset: 1, // Skip description row
});
// This updates row 3 (first data row)
```

### 3. Validate Before Delete

```typescript
// Always confirm before deleting
async function safeDelete(
  client: GGSheet.GoogleSheetClient,
  sheetUrl: string,
  sheetName: string,
  rowIndex: number
) {
  // Read row data first
  const data = await client.getValues({ sheetUrl, sheetName });
  const rowData = data[rowIndex + 1]; // +1 for header

  console.log('About to delete:', rowData);

  // Confirm (in real app, ask user)
  const confirmed = true; // Replace with actual confirmation

  if (confirmed) {
    await client.deleteRowSheet({
      sheetUrl,
      sheetName,
      row: rowIndex,
    });
    console.log('Row deleted');
  }
}
```

### 4. Error Handling

```typescript
try {
  await client.updateValuesMultiCells({
    sheetUrl: SHEET_URL,
    sheetName: 'Sheet1',
    cells: [{ row: 0, col: 0, content: 'Test' }],
  });
} catch (error) {
  if (error.message.includes('Sheet not found')) {
    console.error('Sheet name is incorrect');
  } else if (error.message.includes('Invalid Google Sheet URL')) {
    console.error('Check the sheet URL');
  } else {
    console.error('Update failed:', error.message);
  }
}
```

### 5. Type Safety

```typescript
// Define interfaces for your data
interface User {
  Name: string;
  Email: string;
  Status: 'Active' | 'Pending' | 'Inactive';
}

// Use typed conversion
const data = await client.getValues({
  sheetUrl: SHEET_URL,
  sheetName: 'Users',
});

const users = GGSheet.convertValueSheet<User>({
  values: data,
  rowOffset: 0,
});

// Now users is typed!
users.forEach((user) => {
  console.log(user.Name); // TypeScript knows this exists
});
```

---

## Troubleshooting

### Common Issues

#### 1. "Sheet not found" Error

**Problem:** Sheet name doesn't match

**Solution:**

```typescript
// Get all sheet names first
const info = await client.getSheetInfo({ sheetUrl: SHEET_URL });
console.log(
  'Available sheets:',
  info.sheets.map((s) => s.title)
);

// Use exact name (case-sensitive)
const data = await client.getValues({
  sheetUrl: SHEET_URL,
  sheetName: 'Sheet1', // Must match exactly
});
```

#### 2. "Invalid Google Sheet URL" Error

**Problem:** URL format is incorrect

**Solution:**

```typescript
// Correct format
const url = 'https://docs.google.com/spreadsheets/d/1abc123def456/edit';

// Validate URL
const isValid = GGSheet.isValidSheetUrl({ sheetUrl: url });
if (!isValid) {
  console.error('Invalid sheet URL');
}
```

#### 3. Row/Column Index Confusion

**Problem:** Wrong row/column being updated

**Solution:**

```typescript
// Remember: 0-based indexing for data rows
// Sheet row 2 = data row 0
// Sheet row 3 = data row 1

// To update sheet row 5 (data row 3):
await client.updateValuesMultiCells({
  sheetUrl: SHEET_URL,
  sheetName: 'Sheet1',
  cells: [{ row: 3, col: 0, content: 'Updated' }],
});
```

#### 4. Permission Denied

**Problem:** Service account doesn't have access

**Solution:**

1. Share spreadsheet with service account email
2. Grant "Editor" permission
3. Wait a few minutes for permissions to propagate

#### 5. Rate Limit Errors

**Problem:** Too many requests

**Solution:**

```typescript
// Add delays between operations
await client.updateValuesMultiCells({ ... });
await new Promise(resolve => setTimeout(resolve, 1000));
await client.updateValuesMultiCells({ ... });

// Or use batch operations
```

---

## Utility Functions

### Column Conversion

```typescript
// Index to column name
GGSheet.convertIndexToColumnName({ columnIndex: 0 }); // "A"
GGSheet.convertIndexToColumnName({ columnIndex: 25 }); // "Z"
GGSheet.convertIndexToColumnName({ columnIndex: 26 }); // "AA"

// Column name to index
GGSheet.convertColumnNameToIndex({ columnName: 'A' }); // 0
GGSheet.convertColumnNameToIndex({ columnName: 'Z' }); // 25
GGSheet.convertColumnNameToIndex({ columnName: 'AA' }); // 26
```

### Data Conversion

```typescript
// Convert sheet values to typed objects
const data = [
  ['Name', 'Email', 'Age'],
  ['John', 'john@example.com', '30'],
  ['Jane', 'jane@example.com', '25'],
];

interface Person {
  Name: string;
  Email: string;
  Age: string;
}

const people = GGSheet.convertValueSheet<Person>({
  values: data,
  rowOffset: 0,
});
```

### Extract Columns and Values

```typescript
const users = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
];

const colsMapping = {
  id: 'ID',
  name: 'Full Name',
  email: 'Email Address',
};

const { listCols, valsExport } = GGSheet.getListColsAndValsExport({
  colsForSheet: colsMapping,
  resultItems: users,
});

// listCols: ['ID', 'Full Name', 'Email Address']
// valsExport: [['1', 'John', 'john@example.com'], ['2', 'Jane', 'jane@example.com']]
```

---

## Type Definitions

```typescript
interface ISpreadsheetInfo {
  spreadsheetTitle: string;
  sheets: ISheetChildrenInfo[];
}

interface ISheetChildrenInfo {
  title: string;
  sheetId: number;
  rowCount: number;
  columnCount: number;
}

interface ISheetValUpdateCell {
  row: number;
  col: number;
  content: string;
}

enum ETypeExport {
  Append = 'Append',
  Overwrite = 'Overwrite',
}
```

---

## Support

- 📧 Email: support@bodevops.com
- 🐛 Issues: [GitHub Issues](https://github.com/HaiSonMin/BoDevOpsFeature/issues)
- 📖 Main Docs: [README.md](../../README.md)
