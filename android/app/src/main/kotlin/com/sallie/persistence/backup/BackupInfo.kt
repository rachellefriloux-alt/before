/**
 * 💜 Sallie: Your personal companion AI with both modern capabilities and traditional values
 * Loyal, protective, empathetic, adaptable, and growing with your guidance
 * 
 * BackupInfo - Model class for backup information
 */

package com.sallie.persistence.backup

import java.util.Date

/**
 * Information about a backup file
 * 
 * Contains metadata about a backup such as creation time,
 * content summary, and version
 */
data class BackupInfo(
    val creationTime: Date,
    val version: String,
    val entryCount: Int,
    val fileSizeBytes: Long,
    val isEncrypted: Boolean,
    val appVersion: String,
    val deviceInfo: String,
    val contentSummary: Map<String, Int> // Category -> Count
)
