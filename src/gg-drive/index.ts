/**
 * Google Drive Feature Library
 * @description A framework-agnostic library for interacting with Google Drive API.
 * Provides easy-to-use methods for file upload, sharing, and storage management.
 * @module gg-drive
 *
 * @example
 * ```typescript
 * import { GoogleDriveClient } from 'bodevops-features/gg-drive';
 *
 * const client = new GoogleDriveClient({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Upload a file
 * const result = await client.uploadFile({
 *   localFilePath: './document.pdf',
 *   driveFolder: 'MyFolder/Documents'
 * });
 *
 * // Get storage info
 * const storage = await client.getStorageInfo();
 * console.log(`Used: ${storage.formattedUsed}`);
 * ```
 */

// Export main client class
export { GoogleDriveClient } from './google-drive';

// Export configuration class
export { GoogleDriveConfig, DEFAULT_DRIVE_SCOPES } from './config';

// Export all types
export type {
  IGoogleDriveConfig,
  IGoogleServiceAccountCredentials,
  IUploadFileResult,
  IFileInfo,
  IStorageInfo,
  TRoleShare,
  IUploadFileParams,
  IUploadFileAndShareParams,
  IListFilesParams,
  IDeleteFileParams,
  IMakeFilePublicParams,
  ITransferOwnershipParams,
  IShareFolderParams,
  IGetFolderIdParams,
  IFileExistsParams,
} from './types';

// Export utility functions
export {
  formatBytes,
  normalizeFilePath,
  validateFileExists,
  getFileInfo,
  parseFolderPath,
  createFileReadStream,
} from './utils';
