/**
 * BoDevOps Features Library
 * @description A collection of framework-agnostic utilities for Google Drive, Google Sheets, and iDrive e2.
 * @module bodevops-features
 *
 * @example
 * ```typescript
 * import { GGDrive, GGSheet } from 'bodevops-features';
 *
 * // Google Drive operations
 * const driveClient = new GGDrive.GoogleDriveClient({
 *   keyFilePath: './service-account.json'
 * });
 *
 * // Google Sheet operations
 * const sheetClient = new GGSheet.GoogleSheetClient({
 *   keyFilePath: './service-account.json'
 * });
 * ```
 */

// Google Drive module
export * as GGDrive from './gg-drive';

// Google Sheet module
export * as GGSheet from './gg-sheet';
