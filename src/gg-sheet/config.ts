/**
 * Google Sheet Feature Library - Configuration Module
 * @description Configuration management for Google Sheet client initialization and authentication.
 * @module gg-sheet/config
 */

import { IGoogleSheetConfig, IGoogleServiceAccountCredentials } from './types';

/**
 * Default OAuth scope required for Google Sheets operations.
 */
export const DEFAULT_SHEET_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

/**
 * Google Sheet Configuration Manager.
 * Handles validation and normalization of configuration options for the Google Sheet client.
 *
 * @example
 * ```typescript
 * // Using key file path
 * const config = new GoogleSheetConfig({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Using credentials object
 * const config = new GoogleSheetConfig({
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
export class GoogleSheetConfig {
  /** Path to the service account key file */
  public readonly keyFilePath?: string;

  /** Service account credentials object */
  public readonly credentials?: IGoogleServiceAccountCredentials;

  /** OAuth scopes for Google Sheets API */
  public readonly scopes: string[];

  /**
   * Creates a new GoogleSheetConfig instance.
   *
   * @param config - Configuration options for Google Sheet client
   * @throws Error if neither keyFilePath nor credentials is provided
   */
  constructor({ keyFilePath, credentials, scopes }: IGoogleSheetConfig) {
    // Validate that at least one authentication method is provided
    if (!keyFilePath && !credentials) {
      throw new Error('GoogleSheetConfig: Either keyFilePath or credentials must be provided');
    }

    this.keyFilePath = keyFilePath;
    this.credentials = credentials;
    this.scopes = scopes || DEFAULT_SHEET_SCOPES;

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
        throw new Error(`GoogleSheetConfig: Missing required credential field: ${field}`);
      }
    }

    if (credentials.type !== 'service_account') {
      throw new Error(
        `GoogleSheetConfig: Invalid credential type. Expected 'service_account', got '${credentials.type}'`
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
