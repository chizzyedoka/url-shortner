import { db } from '../db/index.js';
import { urlsTable } from '../models/index.js';
import { generateShortCode } from '../utils/generateShortCode.js';
import { eq } from 'drizzle-orm';

export const createShortUrl = async ({ originalUrl, shortCode, userId }) => {
    const [newUrl] = await db.insert(urlsTable).values({
        originalUrl,
        shortCode: shortCode || generateShortCode(),
        userId
    }).returning({ 
        id: urlsTable.id, 
        shortCode: urlsTable.shortCode, 
        originalUrl: urlsTable.originalUrl 
    });

    return newUrl;
};


export const getUserUrls = async (userId) => {
    const userUrls = await db.select().from(urlsTable).where(eq(urlsTable.userId, userId));
    return userUrls;
};

/**
 * Get URL by short code
 * @param {string} shortCode - The short code to lookup
 * @returns {Object|null} URL object or null if not found
 */
export const getUrlByShortCode = async (shortCode) => {
    const [url] = await db.select().from(urlsTable).where(eq(urlsTable.shortCode, shortCode));
    return url;
};
