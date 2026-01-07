# Google Drive Feature - Complete Documentation

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Authentication](#authentication)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Google Drive feature provides a clean, type-safe interface for managing files and folders in Google Drive. Built with TypeScript, it offers full type definitions and comprehensive error handling.

### Key Features

- ✅ Upload files to Drive
- ✅ Create folder hierarchies automatically
- ✅ Share files and folders with specific permissions
- ✅ Transfer file ownership
- ✅ Get storage quota information
- ✅ List files in folders
- ✅ Delete files
- ✅ Make files publicly accessible
- ✅ Check file existence

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

2. **Enable Google Drive API**

   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Drive API"
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

5. **Share Drive Folder with Service Account**
   - Open Google Drive
   - Right-click on the folder you want to access
   - Click "Share"
   - Add the service account email (found in JSON key file)
   - Set appropriate permissions (Editor/Viewer)

### Configuration Options

```typescript
import { GGDrive } from 'bodevops-features';

// Option 1: Using key file path (Recommended)
const client = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
});

// Option 2: Using credentials object
const client = new GGDrive.GoogleDriveClient({
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
const client = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.file'],
});
```

---

## Quick Start

### Basic Upload

```typescript
import { GGDrive } from 'bodevops-features';

const client = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
});

// Upload a file
const result = await client.uploadFile({
  localFilePath: './documents/report.pdf',
  driveFolder: 'Reports/2024',
  fileName: 'monthly-report.pdf', // Optional
});

console.log('File uploaded:', result.webViewLink);
```

### Get Storage Information

```typescript
const storage = await client.getStorageInfo();

console.log(`Used: ${storage.formattedUsed}`);
console.log(`Total: ${storage.formattedTotal}`);
console.log(`Percentage: ${storage.percentage}%`);
```

---

## API Reference

### Constructor

#### `new GoogleDriveClient(config)`

Creates a new Google Drive client instance.

**Parameters:**

- `config.keyFilePath` (string, optional): Path to service account JSON file
- `config.credentials` (object, optional): Service account credentials object
- `config.scopes` (string[], optional): Custom OAuth scopes

**Example:**

```typescript
const client = new GGDrive.GoogleDriveClient({
  keyFilePath: './service-account.json',
});
```

---

### Methods

#### `getStorageInfo()`

Get storage quota information for the Google Drive account.

**Returns:** `Promise<IStorageInfo>`

**Response:**

```typescript
{
  used: number; // Bytes used
  total: number; // Total bytes
  usedInDrive: number; // Bytes used in Drive
  percentage: number; // Usage percentage
  formattedUsed: string; // "1.5 GB"
  formattedTotal: string; // "15 GB"
  formattedUsedInDrive: string; // "500 MB"
}
```

**Example:**

```typescript
const storage = await client.getStorageInfo();
console.log(`Storage: ${storage.formattedUsed} / ${storage.formattedTotal}`);
```

---

#### `uploadFile(params)`

Upload a file to Google Drive and automatically make it public.

**Parameters:**

```typescript
{
  localFilePath: string;   // Absolute path to local file
  driveFolder: string;     // Target folder path (e.g., "Folder1/Folder2")
  fileName?: string;       // Optional custom file name
}
```

**Returns:** `Promise<IUploadFileResult>`

**Response:**

```typescript
{
  id: string;              // File ID in Drive
  name: string;            // File name
  webViewLink?: string;    // URL to view file
  webContentLink?: string; // URL to download file
}
```

**Example:**

```typescript
const result = await client.uploadFile({
  localFilePath: 'D:/Documents/report.pdf',
  driveFolder: 'Reports/2024/January',
  fileName: 'monthly-report.pdf',
});

console.log(`View: ${result.webViewLink}`);
console.log(`Download: ${result.webContentLink}`);
```

**Notes:**

- Creates folder hierarchy automatically if it doesn't exist
- File is automatically made public (anyone with link can view)
- Throws error if local file doesn't exist

---

#### `uploadFileAndShare(params)`

Upload a file and share it with a specific email address.

**Parameters:**

```typescript
{
  localFilePath: string;
  driveFolder: string;
  fileName?: string;
  shareWithEmail: string;  // Email to share with
  role?: 'reader' | 'writer'; // Default: 'reader'
}
```

**Returns:** `Promise<IUploadFileResult>`

**Example:**

```typescript
const result = await client.uploadFileAndShare({
  localFilePath: './contract.pdf',
  driveFolder: 'Contracts',
  shareWithEmail: 'client@example.com',
  role: 'reader',
});
```

---

#### `deleteFile(params)`

Delete a file from Google Drive.

**Parameters:**

```typescript
{
  fileId: string; // File ID to delete
}
```

**Returns:** `Promise<boolean>`

**Example:**

```typescript
await client.deleteFile({ fileId: '1abc123def456' });
```

**Notes:**

- Only the file owner can delete the file
- Throws error if permission denied

---

#### `listFilesInFolder(params)`

List all files and folders in a specific folder.

**Parameters:**

```typescript
{
  folderId?: string;  // Folder ID (default: 'root')
}
```

**Returns:** `Promise<IFileInfo[]>`

**Response:**

```typescript
[
  {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
    parents?: string[];
  }
]
```

**Example:**

```typescript
// List files in root
const files = await client.listFilesInFolder({ folderId: 'root' });

for (const file of files) {
  console.log(`${file.name} (${file.mimeType})`);
}

// List files in specific folder
const folderId = await client.getFolderIdByPath({
  folderPath: 'Reports/2024',
});
const reports = await client.listFilesInFolder({ folderId });
```

---

#### `makeFilePublic(params)`

Make a file publicly accessible to anyone with the link.

**Parameters:**

```typescript
{
  fileId: string;
}
```

**Returns:** `Promise<boolean>`

**Example:**

```typescript
await client.makeFilePublic({ fileId: '1abc123def456' });
```

---

#### `transferFileOwnership(params)`

Transfer ownership of a file to another user.

**Parameters:**

```typescript
{
  fileId: string;
  newOwnerEmail: string;
  role?: 'reader' | 'writer';  // Default: 'reader'
}
```

**Returns:** `Promise<boolean>`

**Example:**

```typescript
await client.transferFileOwnership({
  fileId: '1abc123def456',
  newOwnerEmail: 'newowner@example.com',
});
```

**Notes:**

- Sends notification email to new owner (required by Google)
- File will count against new owner's storage quota
- Cannot be undone

---

#### `shareFolderWithEmail(params)`

Share a folder with a specific email address.

**Parameters:**

```typescript
{
  folderId: string;
  emailAddress: string;
  role?: 'reader' | 'writer' | 'owner';  // Default: 'writer'
}
```

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const folderId = await client.getFolderIdByPath({
  folderPath: 'SharedFolder',
});

await client.shareFolderWithEmail({
  folderId,
  emailAddress: 'colleague@example.com',
  role: 'writer',
});
```

---

#### `getFolderIdByPath(params)`

Get folder ID from a path string, creating the hierarchy if needed.

**Parameters:**

```typescript
{
  folderPath: string; // e.g., "Folder1/Folder2/Folder3"
}
```

**Returns:** `Promise<string>` (Folder ID)

**Example:**

```typescript
const folderId = await client.getFolderIdByPath({
  folderPath: 'Reports/2024/January',
});
```

**Notes:**

- Creates folders if they don't exist
- Returns 'root' for empty path

---

#### `fileExistsInFolder(params)`

Check if a file with a specific name exists in a folder.

**Parameters:**

```typescript
{
  fileName: string;
  folderId?: string;  // Default: 'root'
}
```

**Returns:** `Promise<string | null>` (File ID if exists, null otherwise)

**Example:**

```typescript
const fileId = await client.fileExistsInFolder({
  fileName: 'report.pdf',
  folderId: 'root',
});

if (fileId) {
  console.log(`File exists with ID: ${fileId}`);
} else {
  console.log('File not found');
}
```

---

## Advanced Usage

### Batch Upload with Progress Tracking

```typescript
const files = ['file1.pdf', 'file2.pdf', 'file3.pdf'];

for (let i = 0; i < files.length; i++) {
  const file = files[i];

  try {
    const result = await client.uploadFile({
      localFilePath: `./documents/${file}`,
      driveFolder: 'Uploads/Batch',
      fileName: file,
    });

    console.log(`[${i + 1}/${files.length}] ✓ ${file} uploaded`);
  } catch (error) {
    console.error(`[${i + 1}/${files.length}] ✗ ${file} failed:`, error.message);
  }
}
```

### Upload with Retry Logic

```typescript
async function uploadWithRetry(
  client: GGDrive.GoogleDriveClient,
  params: GGDrive.IUploadFileParams,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.uploadFile(params);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Usage
const result = await uploadWithRetry(client, {
  localFilePath: './large-file.zip',
  driveFolder: 'Uploads',
});
```

### Organize Files by Date

```typescript
async function uploadWithDateFolder(client: GGDrive.GoogleDriveClient, localFilePath: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  const folderPath = `Uploads/${year}/${month}/${day}`;

  return await client.uploadFile({
    localFilePath,
    driveFolder: folderPath,
  });
}

// Usage
const result = await uploadWithDateFolder(client, './report.pdf');
// Uploads to: Uploads/2024/01/07/report.pdf
```

### Check Storage Before Upload

```typescript
async function uploadIfSpaceAvailable(
  client: GGDrive.GoogleDriveClient,
  localFilePath: string,
  driveFolder: string
) {
  // Get file size
  const fileInfo = GGDrive.getFileInfo({ filePath: localFilePath });
  if (!fileInfo) throw new Error('File not found');

  // Check storage
  const storage = await client.getStorageInfo();
  const availableBytes = storage.total - storage.used;

  if (fileInfo.size > availableBytes) {
    throw new Error(
      `Not enough storage. Need ${fileInfo.sizeFormatted}, ` +
        `available ${GGDrive.formatBytes({ bytes: availableBytes })}`
    );
  }

  // Upload
  return await client.uploadFile({
    localFilePath,
    driveFolder,
  });
}
```

### Duplicate File Detection

```typescript
async function uploadIfNotExists(
  client: GGDrive.GoogleDriveClient,
  localFilePath: string,
  driveFolder: string
) {
  const fileName = localFilePath.split(/[\\/]/).pop() || 'unnamed';

  // Get folder ID
  const folderId = await client.getFolderIdByPath({ folderPath: driveFolder });

  // Check if file exists
  const existingFileId = await client.fileExistsInFolder({
    fileName,
    folderId,
  });

  if (existingFileId) {
    console.log(`File already exists with ID: ${existingFileId}`);
    return { id: existingFileId, name: fileName };
  }

  // Upload new file
  return await client.uploadFile({
    localFilePath,
    driveFolder,
    fileName,
  });
}
```

---

## Best Practices

### 1. Error Handling

Always wrap Drive operations in try-catch blocks:

```typescript
try {
  const result = await client.uploadFile({
    localFilePath: './file.pdf',
    driveFolder: 'Uploads',
  });
  console.log('Success:', result.webViewLink);
} catch (error) {
  if (error.message.includes('File does not exist')) {
    console.error('Local file not found');
  } else if (error.message.includes('quota')) {
    console.error('Storage quota exceeded');
  } else {
    console.error('Upload failed:', error.message);
  }
}
```

### 2. Path Validation

Validate file paths before upload:

```typescript
const filePath = './document.pdf';

if (!GGDrive.validateFileExists({ filePath })) {
  throw new Error(`File not found: ${filePath}`);
}

const fileInfo = GGDrive.getFileInfo({ filePath });
console.log(`Uploading ${fileInfo.name} (${fileInfo.sizeFormatted})`);
```

### 3. Folder Structure

Use consistent folder naming:

```typescript
// Good: Clear hierarchy
const folderPath = 'Projects/ClientA/Documents/2024';

// Bad: Flat structure
const folderPath = 'ClientA_Documents_2024';
```

### 4. File Naming

Use descriptive, unique file names:

```typescript
// Good: Descriptive with timestamp
const fileName = `report_${Date.now()}.pdf`;

// Better: Human-readable timestamp
const timestamp = new Date().toISOString().split('T')[0];
const fileName = `report_${timestamp}.pdf`;
```

### 5. Batch Operations

Process files in batches to avoid rate limits:

```typescript
async function uploadBatch(files: string[], batchSize = 5) {
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);

    await Promise.all(
      batch.map((file) =>
        client.uploadFile({
          localFilePath: file,
          driveFolder: 'Uploads',
        })
      )
    );

    // Delay between batches
    if (i + batchSize < files.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "File does not exist" Error

**Problem:** Local file path is incorrect

**Solution:**

```typescript
// Use absolute paths
const path = require('path');
const absolutePath = path.resolve('./document.pdf');

// Or normalize path
const normalizedPath = GGDrive.normalizeFilePath({
  filePath: './document.pdf',
});
```

#### 2. "Invalid Google Sheet URL" Error

**Problem:** Incorrect URL format

**Solution:**

```typescript
// Correct format
const url = 'https://docs.google.com/spreadsheets/d/1abc123def456/edit';

// Extract ID if needed
const id = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
```

#### 3. Permission Denied

**Problem:** Service account doesn't have access to folder

**Solution:**

1. Share the Drive folder with service account email
2. Grant "Editor" permission
3. Wait a few minutes for permissions to propagate

#### 4. Quota Exceeded

**Problem:** Storage limit reached

**Solution:**

```typescript
const storage = await client.getStorageInfo();
if (storage.percentage > 90) {
  console.warn('Storage almost full!');
  // Delete old files or upgrade storage
}
```

#### 5. Rate Limit Errors

**Problem:** Too many requests in short time

**Solution:**

```typescript
// Add delays between operations
await client.uploadFile({ ... });
await new Promise(resolve => setTimeout(resolve, 1000));
await client.uploadFile({ ... });
```

---

## Utility Functions

### `formatBytes({ bytes })`

Convert bytes to human-readable format.

```typescript
const formatted = GGDrive.formatBytes({ bytes: 1536 });
console.log(formatted); // "1.5 KB"
```

### `normalizeFilePath({ filePath })`

Normalize file path for current OS.

```typescript
const normalized = GGDrive.normalizeFilePath({
  filePath: './documents/file.pdf',
});
```

### `validateFileExists({ filePath })`

Check if file exists.

```typescript
const exists = GGDrive.validateFileExists({
  filePath: './file.pdf',
});
```

### `getFileInfo({ filePath })`

Get detailed file information.

```typescript
const info = GGDrive.getFileInfo({ filePath: './file.pdf' });
console.log(info);
// {
//   name: 'file.pdf',
//   extension: 'pdf',
//   directory: 'D:/documents',
//   size: 1024,
//   sizeFormatted: '1 KB'
// }
```

---

## Type Definitions

```typescript
interface IStorageInfo {
  used: number;
  total: number;
  usedInDrive: number;
  percentage: number;
  formattedUsed: string;
  formattedTotal: string;
  formattedUsedInDrive: string;
}

interface IUploadFileResult {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

interface IFileInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  parents?: string[];
}

type TRoleShare = 'reader' | 'writer' | 'owner';
```

---

## Support

- 📧 Email: support@bodevops.com
- 🐛 Issues: [GitHub Issues](https://github.com/HaiSonMin/BoDevOpsFeature/issues)
- 📖 Main Docs: [README.md](../../README.md)
