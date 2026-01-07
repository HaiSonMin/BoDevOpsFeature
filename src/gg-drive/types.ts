/**
 * Google Drive Feature Library - Type Definitions
 * @description Type definitions for Google Drive operations including file upload, download, sharing, and storage management.
 * @module gg-drive/types
 */

/**
 * Configuration options for Google Drive client initialization.
 * Supports either a path to a service account key file or a direct credentials object.
 */
export interface IGoogleDriveConfig {
  /** Path to the service account JSON key file */
  keyFilePath?: string;

  /** Service account credentials object (alternative to keyFilePath) */
  credentials?: IGoogleServiceAccountCredentials;

  /** OAuth scopes for Google Drive API access */
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
 * Result returned after successfully uploading a file to Google Drive.
 */
export interface IUploadFileResult {
  /** The unique identifier of the uploaded file in Google Drive */
  id: string;

  /** The name of the file as stored in Google Drive */
  name: string;

  /** URL to view the file in a web browser (optional) */
  webViewLink?: string;

  /** URL to directly download the file content (optional) */
  webContentLink?: string;
}

/**
 * Information about a file or folder in Google Drive.
 */
export interface IFileInfo {
  /** The unique identifier of the file */
  id: string;

  /** The name of the file */
  name: string;

  /** The MIME type of the file (e.g., "application/pdf", "application/vnd.google-apps.folder") */
  mimeType: string;

  /** URL to view the file in a web browser (optional) */
  webViewLink?: string;

  /** Array of parent folder IDs (optional) */
  parents?: string[];
}

/**
 * Storage quota information for Google Drive account.
 */
export interface IStorageInfo {
  /** Total storage used in bytes */
  used: number;

  /** Total storage limit in bytes */
  total: number;

  /** Storage used specifically by Drive files in bytes */
  usedInDrive: number;

  /** Percentage of storage used (0-100) */
  percentage: number;

  /** Human-readable format of used storage (e.g., "1.5 GB") */
  formattedUsed: string;

  /** Human-readable format of total storage (e.g., "15 GB") */
  formattedTotal: string;

  /** Human-readable format of storage used in Drive (e.g., "500 MB") */
  formattedUsedInDrive: string;
}

/**
 * Available permission roles for sharing files and folders.
 * - 'reader': Can view files
 * - 'writer': Can view and edit files
 * - 'owner': Full ownership with all permissions
 */
export type TRoleShare = 'reader' | 'writer' | 'owner';

/**
 * Parameters for uploading a file to Google Drive.
 */
export interface IUploadFileParams {
  /** Absolute path to the local file to upload */
  localFilePath: string;

  /** Target folder path in Google Drive (e.g., "MyFolder/SubFolder"). Use empty string or "/" for root. */
  driveFolder: string;

  /** Optional custom file name. If not provided, the original file name is used. */
  fileName?: string;
}

/**
 * Parameters for uploading a file and sharing it with another user.
 */
export interface IUploadFileAndShareParams extends IUploadFileParams {
  /** Email address to share the file with */
  shareWithEmail: string;

  /** Permission role for the shared user (default: 'reader') */
  role?: TRoleShare;
}

/**
 * Parameters for listing files in a folder.
 */
export interface IListFilesParams {
  /** The folder ID to list files from. Use 'root' for the root folder. Default: 'root' */
  folderId?: string;
}

/**
 * Parameters for deleting a file from Google Drive.
 */
export interface IDeleteFileParams {
  /** The unique identifier of the file to delete */
  fileId: string;
}

/**
 * Parameters for making a file publicly accessible.
 */
export interface IMakeFilePublicParams {
  /** The unique identifier of the file to make public */
  fileId: string;
}

/**
 * Parameters for transferring file ownership to another user.
 */
export interface ITransferOwnershipParams {
  /** The unique identifier of the file */
  fileId: string;

  /** Email address of the new owner */
  newOwnerEmail: string;

  /** Permission role to assign (default: 'reader') */
  role?: TRoleShare;
}

/**
 * Parameters for sharing a folder with another user.
 */
export interface IShareFolderParams {
  /** The unique identifier of the folder */
  folderId: string;

  /** Email address to share the folder with */
  emailAddress: string;

  /** Permission role for the shared user (default: 'writer') */
  role?: TRoleShare;
}

/**
 * Parameters for getting folder ID by path.
 */
export interface IGetFolderIdParams {
  /** Folder path (e.g., "folder1/folder2/folder3") */
  folderPath: string;
}

/**
 * Parameters for checking if a file exists in a folder.
 */
export interface IFileExistsParams {
  /** The name of the file to check */
  fileName: string;

  /** The folder ID to search in. Default: 'root' */
  folderId?: string;
}
