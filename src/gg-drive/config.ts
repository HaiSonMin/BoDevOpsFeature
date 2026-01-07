/**
 * Google Drive Feature Library - Configuration Module
 * @description Configuration management for Google Drive client initialization and authentication.
 * @module gg-drive/config
 */

import { IGoogleDriveConfig, IGoogleServiceAccountCredentials } from './types';

/**
 * Default OAuth scopes required for Google Drive operations.
 * These scopes provide full access to Drive files.
 */
export const DEFAULT_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
];

/**
 * Google Drive Configuration Manager.
 * Handles validation and normalization of configuration options for the Google Drive client.
 *
 * @example
 * ```typescript
 * // Using key file path
 * const config = new GoogleDriveConfig({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Using credentials object
 * const config = new GoogleDriveConfig({
 *   credentials: {
 *     type: 'service_account',
 *     project_id: 'my-project',
 *     private_key: '-----BEGIN PRIVATE KEY-----\n...',
 *     client_email: 'service-account@my-project.iam.gserviceaccount.com',
 *     // ... other fields
 *   }
 * });
 * ```
 */
export class GoogleDriveConfig {
  /** Path to the service account key file */
  public readonly keyFilePath?: string;

  /** Service account credentials object */
  public readonly credentials?: IGoogleServiceAccountCredentials;

  /** OAuth scopes for Google Drive API */
  public readonly scopes: string[];

  /**
   * Creates a new GoogleDriveConfig instance.
   *
   * @param config - Configuration options for Google Drive client
   * @throws Error if neither keyFilePath nor credentials is provided
   */
  constructor({ keyFilePath, credentials, scopes }: IGoogleDriveConfig) {
    // Validate that at least one authentication method is provided
    if (!keyFilePath && !credentials) {
      throw new Error('GoogleDriveConfig: Either keyFilePath or credentials must be provided');
    }

    this.keyFilePath = keyFilePath;
    this.credentials = credentials;
    this.scopes = scopes || DEFAULT_DRIVE_SCOPES;

    // Validate credentials structure if provided
    if (credentials) {
      this.validateCredentials(credentials);
    }
  }

  /**
   * Validates that the credentials object contains all required fields.
   *
   * @param credentials - The credentials object to validate
   * @throws Error if required fields are missing
   */
  private validateCredentials(credentials: IGoogleServiceAccountCredentials): void {
    const requiredFields: (keyof IGoogleServiceAccountCredentials)[] = [
      'type',
      'project_id',
      'private_key',
      'client_email',
    ];

    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`GoogleDriveConfig: Missing required credential field: ${field}`);
      }
    }

    if (credentials.type !== 'service_account') {
      throw new Error(
        `GoogleDriveConfig: Invalid credential type. Expected 'service_account', got '${credentials.type}'`
      );
    }
  }

  /**
   * Returns the authentication configuration object suitable for googleapis.
   *
   * @returns Authentication options for Google Auth
   */
  public getAuthOptions(): {
    keyFile?: string;
    credentials?: IGoogleServiceAccountCredentials;
    scopes: string[];
  } {
    if (this.keyFilePath) {
      return {
        keyFile: this.keyFilePath,
        scopes: this.scopes,
      };
    }

    return {
      credentials: this.credentials,
      scopes: this.scopes,
    };
  }
}
