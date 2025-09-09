const os = require('os');
const crypto = require('crypto');

// Sallie Persona Module
// fingerprintRuntime.js


function getRuntimeFingerprint() {
    try {
        const fingerprint = {
            platform: os.platform(),
            osType: os.type(),
            osRelease: os.release(),
            architecture: os.arch(),
            cpuModel: os.cpus()[0]?.model || 'Unknown',
            cpuCores: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            nodeVersion: process.version,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timestamp: Date.now(),
            processId: process.pid
        };

        // Generate a hash of the fingerprint for easier comparison
        const fingerprintString = JSON.stringify(fingerprint);
        fingerprint.hash = crypto.createHash('sha256').update(fingerprintString).digest('hex');

        return fingerprint;
    } catch (error) {
        return {
            error: 'Failed to generate complete fingerprint',
            timestamp: Date.now()
        };
    }
}

module.exports = { getRuntimeFingerprint };
