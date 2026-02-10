import crypto from 'crypto';

export function hashPassword(password) {
    return new Promise((resolve, reject) => {
        try {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            resolve(hash);
        } catch (err) {
            reject(err);
        }
    });
}

export function comparePassword(password, hashed) {
    return new Promise((resolve, reject) => {
        try {
            const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
            resolve(passwordHash === hashed);
        } catch (err) {
            reject(err);
        }
    });
}
