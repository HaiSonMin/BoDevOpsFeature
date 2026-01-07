/**
 * Google Drive Feature Library - Main Client Class
 * @description A framework-agnostic client for interacting with Google Drive API.
 * Provides methods for file upload, download, sharing, and storage management.
 * @module gg-drive/google-drive
 */

import { google, drive_v3 } from 'googleapis';
import { GoogleDriveConfig } from './config';
import {
  IGoogleDriveConfig,
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
import {
  formatBytes,
  normalizeFilePath,
  validateFileExists,
  parseFolderPath,
  createFileReadStream,
} from './utils';

/**
 * Google Drive Client for managing files and folders in Google Drive.
 *
 * @example
 * ```typescript
 * import { GoogleDriveClient } from 'bodevops-features/gg-drive';
 *
 * const client = new GoogleDriveClient({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Get storage information
 * const storage = await client.getStorageInfo();
 * console.log(`Used: ${storage.formattedUsed} of ${storage.formattedTotal}`);
 *
 * // Upload a file
 * const result = await client.uploadFile({
 *   localFilePath: './document.pdf',
 *   driveFolder: 'MyFolder/Documents',
 *   fileName: 'my-document.pdf'
 * });
 * console.log(`Uploaded: ${result.webViewLink}`);
 * ```
 */
export class GoogleDriveClient {
  private readonly config: GoogleDriveConfig;

  /**
   * Creates a new GoogleDriveClient instance.
   *
   * @param configOptions - Configuration options for the Google Drive client
   */
  constructor(configOptions: IGoogleDriveConfig) {
    this.config = new GoogleDriveConfig(configOptions);
  }

  /**
   * Creates and returns an authenticated Google Drive API client.
   *
   * @returns A Promise that resolves to an authenticated Drive API client
   */
  private async getDriveClient(): Promise<drive_v3.Drive> {
    const authOptions = this.config.getAuthOptions();

    const auth = new google.auth.GoogleAuth({
      keyFile: authOptions.keyFile,
      credentials: authOptions.credentials,
      scopes: authOptions.scopes,
    });

    const authClient = await auth.getClient();

    return google.drive({
      version: 'v3',
      auth: authClient as Parameters<typeof google.drive>[0]['auth'],
    });
  }

  /**
   * Retrieves storage quota information for the Google Drive account.
   *
   * @returns A Promise that resolves to storage information including used/total space
   * @throws Error if unable to retrieve storage information
   *
   * @example
   * ```typescript
   * const storage = await client.getStorageInfo();
   * console.log(`Storage: ${storage.formattedUsed} / ${storage.formattedTotal} (${storage.percentage}%)`);
   * ```
   */
  public async getStorageInfo(): Promise<IStorageInfo> {
    const driveInstance = await this.getDriveClient();

    const response = await driveInstance.about.get({
      fields: 'storageQuota',
    });

    const quota = response.data.storageQuota;

    if (!quota) {
      throw new Error('Unable to retrieve storage quota information');
    }

    const used = parseInt(quota.usage || '0', 10);
    const total = parseInt(quota.limit || '0', 10);
    const usedInDrive = parseInt(quota.usageInDrive || '0', 10);
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return {
      used,
      total,
      usedInDrive,
      percentage: parseFloat(percentage.toFixed(2)),
      formattedUsed: formatBytes({ bytes: used }),
      formattedTotal: formatBytes({ bytes: total }),
      formattedUsedInDrive: formatBytes({ bytes: usedInDrive }),
    };
  }

  /**
   * Gets an existing folder by name or creates it if it doesn't exist.
   *
   * @param folderName - The name of the folder to find or create
   * @param parentId - The ID of the parent folder (default: 'root')
   * @returns A Promise that resolves to the folder ID
   */
  private async getOrCreateFolder({
    folderName,
    parentId = 'root',
  }: {
    folderName: string;
    parentId?: string;
  }): Promise<string> {
    const driveInstance = await this.getDriveClient();

    // Search for existing folder
    const query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;

    const response = await driveInstance.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    const folders = response.data.files || [];

    if (folders.length > 0 && folders[0].id) {
      // Folder exists, return its ID
      return folders[0].id;
    }

    // Folder doesn't exist, create it
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    };

    const folder = await driveInstance.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    if (!folder.data.id) {
      throw new Error(`Failed to create folder: ${folderName}`);
    }

    return folder.data.id;
  }

  /**
   * Creates a folder hierarchy from a path string (e.g., "a/b/c") and returns the ID of the final folder.
   *
   * @param folderPath - The folder path to create (e.g., "folder1/folder2/folder3")
   * @returns A Promise that resolves to the ID of the innermost folder
   */
  private async createFolderHierarchy({ folderPath }: { folderPath: string }): Promise<string> {
    const folders = parseFolderPath({ folderPath });

    if (folders.length === 0) {
      return 'root';
    }

    let currentParentId = 'root';

    for (const folderName of folders) {
      currentParentId = await this.getOrCreateFolder({
        folderName,
        parentId: currentParentId,
      });
    }

    return currentParentId;
  }

  /**
   * Uploads a file to Google Drive and automatically makes it public.
   *
   * @param params - Upload parameters including local file path and destination folder
   * @returns A Promise that resolves to the upload result containing file ID and links
   * @throws Error if the local file doesn't exist or upload fails
   *
   * @example
   * ```typescript
   * const result = await client.uploadFile({
   *   localFilePath: './document.pdf',
   *   driveFolder: 'MyFolder/Documents',
   *   fileName: 'my-document.pdf'  // Optional
   * });
   * console.log(`View at: ${result.webViewLink}`);
   * ```
   */
  public async uploadFile({
    localFilePath,
    driveFolder,
    fileName,
  }: IUploadFileParams): Promise<IUploadFileResult> {
    // Normalize and validate the local file path
    const normalizedPath = normalizeFilePath({ filePath: localFilePath });

    if (!validateFileExists({ filePath: normalizedPath })) {
      throw new Error(
        `File does not exist: ${normalizedPath}. Please check the file path and ensure the file exists.`
      );
    }

    // Use the local filename if fileName is not provided
    const finalFileName = fileName || normalizedPath.split(/[\\/]/).pop() || 'unnamed';

    const driveInstance = await this.getDriveClient();

    // Create the folder hierarchy and get the ID of the innermost folder
    const folderId = await this.createFolderHierarchy({ folderPath: driveFolder });

    // File metadata
    const fileMetadata = {
      name: finalFileName,
      parents: [folderId],
    };

    // Create media upload
    const media = {
      mimeType: 'application/octet-stream',
      body: createFileReadStream({ filePath: normalizedPath }),
    };

    const file = await driveInstance.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink',
    });

    const result: IUploadFileResult = {
      id: file.data.id || '',
      name: file.data.name || '',
      webViewLink: file.data.webViewLink || undefined,
      webContentLink: file.data.webContentLink || undefined,
    };

    // Always make file public
    await this.makeFilePublic({ fileId: result.id });

    return result;
  }

  /**
   * Uploads a file and shares it with a specified email address.
   *
   * @param params - Upload and share parameters
   * @returns A Promise that resolves to the upload result
   *
   * @example
   * ```typescript
   * const result = await client.uploadFileAndShare({
   *   localFilePath: './report.pdf',
   *   driveFolder: 'SharedReports',
   *   shareWithEmail: 'colleague@example.com',
   *   role: 'writer'
   * });
   * ```
   */
  public async uploadFileAndShare({
    localFilePath,
    driveFolder,
    fileName,
    shareWithEmail,
    role = 'reader',
  }: IUploadFileAndShareParams): Promise<IUploadFileResult> {
    // Upload file normally
    const result = await this.uploadFile({
      localFilePath,
      driveFolder,
      fileName,
    });

    // Get folder ID and share it with specified role
    const folderId = await this.getFolderIdByPath({ folderPath: driveFolder });
    await this.shareFolderWithEmail({
      folderId,
      emailAddress: shareWithEmail,
      role,
    });

    return result;
  }

  /**
   * Deletes a file from Google Drive.
   * Note: Only the file owner can delete the file.
   *
   * @param params - Delete parameters including file ID
   * @returns A Promise that resolves to true if deletion was successful
   * @throws Error if deletion fails (e.g., permission denied)
   *
   * @example
   * ```typescript
   * await client.deleteFile({ fileId: '1abc123def456' });
   * ```
   */
  public async deleteFile({ fileId }: IDeleteFileParams): Promise<boolean> {
    const driveInstance = await this.getDriveClient();

    await driveInstance.files.delete({
      fileId: fileId,
    });

    return true;
  }

  /**
   * Lists all files and folders in a specified folder.
   *
   * @param params - List parameters including folder ID
   * @returns A Promise that resolves to an array of file information objects
   *
   * @example
   * ```typescript
   * const files = await client.listFilesInFolder({ folderId: 'root' });
   * for (const file of files) {
   *   console.log(`${file.name} (${file.mimeType})`);
   * }
   * ```
   */
  public async listFilesInFolder({ folderId = 'root' }: IListFilesParams = {}): Promise<
    IFileInfo[]
  > {
    const driveInstance = await this.getDriveClient();

    const query = `'${folderId}' in parents and trashed=false`;

    const response = await driveInstance.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, parents)',
      orderBy: 'name',
    });

    const files = response.data.files || [];

    return files.map((file: drive_v3.Schema$File) => ({
      id: file.id || '',
      name: file.name || '',
      mimeType: file.mimeType || '',
      webViewLink: file.webViewLink || undefined,
      parents: file.parents || undefined,
    }));
  }

  /**
   * Makes a file publicly accessible to anyone with the link.
   *
   * @param params - Parameters including file ID
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.makeFilePublic({ fileId: '1abc123def456' });
   * // File is now accessible via its webViewLink
   * ```
   */
  public async makeFilePublic({ fileId }: IMakeFilePublicParams): Promise<boolean> {
    const driveInstance = await this.getDriveClient();

    await driveInstance.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return true;
  }

  /**
   * Transfers ownership of a file to another user.
   *
   * @param params - Transfer parameters including file ID and new owner email
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.transferFileOwnership({
   *   fileId: '1abc123def456',
   *   newOwnerEmail: 'newowner@example.com'
   * });
   * ```
   */
  public async transferFileOwnership({
    fileId,
    newOwnerEmail,
    role = 'reader',
  }: ITransferOwnershipParams): Promise<boolean> {
    const driveInstance = await this.getDriveClient();

    await driveInstance.permissions.create({
      fileId: fileId,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: newOwnerEmail,
      },
      transferOwnership: true,
      sendNotificationEmail: true,
    });

    return true;
  }

  /**
   * Shares a folder with a specified email address.
   *
   * @param params - Share parameters including folder ID, email, and role
   * @returns A Promise that resolves to true if successful
   *
   * @example
   * ```typescript
   * await client.shareFolderWithEmail({
   *   folderId: '1abc123def456',
   *   emailAddress: 'user@example.com',
   *   role: 'writer'
   * });
   * ```
   */
  public async shareFolderWithEmail({
    folderId,
    emailAddress,
    role = 'writer',
  }: IShareFolderParams): Promise<boolean> {
    const driveInstance = await this.getDriveClient();

    const requestBody: drive_v3.Schema$Permission = {
      role: role,
      type: 'user',
      emailAddress: emailAddress,
    };

    const requestOptions: drive_v3.Params$Resource$Permissions$Create = {
      fileId: folderId,
      requestBody: requestBody,
    };

    // Configure notification email based on role
    if (role === 'owner') {
      requestOptions.transferOwnership = true;
      requestOptions.sendNotificationEmail = true;
    } else {
      requestOptions.sendNotificationEmail = false;
    }

    await driveInstance.permissions.create(requestOptions);

    return true;
  }

  /**
   * Gets a folder ID by its path, creating the folder hierarchy if it doesn't exist.
   *
   * @param params - Parameters including folder path
   * @returns A Promise that resolves to the folder ID
   *
   * @example
   * ```typescript
   * const folderId = await client.getFolderIdByPath({
   *   folderPath: 'folder1/folder2/folder3'
   * });
   * ```
   */
  public async getFolderIdByPath({ folderPath }: IGetFolderIdParams): Promise<string> {
    return this.createFolderHierarchy({ folderPath });
  }

  /**
   * Checks if a file with the specified name exists in a folder.
   *
   * @param params - Parameters including file name and folder ID
   * @returns A Promise that resolves to the file ID if found, or null if not found
   *
   * @example
   * ```typescript
   * const fileId = await client.fileExistsInFolder({
   *   fileName: 'document.pdf',
   *   folderId: 'root'
   * });
   * if (fileId) {
   *   console.log(`File exists with ID: ${fileId}`);
   * }
   * ```
   */
  public async fileExistsInFolder({
    fileName,
    folderId = 'root',
  }: IFileExistsParams): Promise<string | null> {
    const driveInstance = await this.getDriveClient();

    const query = `name='${fileName}' and '${folderId}' in parents and trashed=false`;

    const response = await driveInstance.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    const files = response.data.files || [];

    if (files.length > 0 && files[0].id) {
      return files[0].id;
    }

    return null;
  }
}
