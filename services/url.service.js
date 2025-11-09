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


export const deleteUrlByShortCode = async (shortCode, userId) => {
    // First check if the URL exists and belongs to the user
    const [url] = await db.select().from(urlsTable)
        .where(eq(urlsTable.shortCode, shortCode));
    
    if (!url) {
        return null;
    }
    
    // Check if the URL belongs to the user
    if (url.userId !== userId) {
        throw new Error('Unauthorized to delete this URL');
    }
    
    // Delete the URL
    const [deletedUrl] = await db.delete(urlsTable)
        .where(eq(urlsTable.shortCode, shortCode))
        .returning({ shortCode: urlsTable.shortCode });
    
    return deletedUrl;
};
