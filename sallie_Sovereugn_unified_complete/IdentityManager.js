/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: User identity management and authentication.
 * Got it, love.
 */


import crypto from 'crypto';

export class IdentityManager {
    constructor() {
        this.users = new Map();
        this.currentUser = null;
    }

    registerUser(userId, profile) {
        if (!userId || typeof userId !== 'string' || userId.length < 3) {
            throw new Error('Invalid userId');
        }
        if (this.users.has(userId)) throw new Error('User already exists');
        if (!profile || !profile.password) throw new Error('Profile must include a password');
        // Securely hash password
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(profile.password, salt, 1000, 64, 'sha512').toString('hex');
        this.users.set(userId, {
            ...profile,
            passwordHash: hash,
            salt,
            created: Date.now()
        });
        console.info(`[IdentityManager] Registered user: ${userId}`);
    }

    authenticate(userId, password) {
        if (!this.users.has(userId)) throw new Error('User not found');
        const user = this.users.get(userId);
        const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
        if (user.passwordHash !== hash) throw new Error('Invalid password');
        this.currentUser = user;
        console.info(`[IdentityManager] Authenticated user: ${userId}`);
        return true;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        console.info('[IdentityManager] User logged out');
    }

    // Performance: Fast lookup and audit
    getUserCount() {
        return this.users.size;
    }
}
