import express from 'express';
import { urlSchema } from '../validation/request.validation.js';
import { createShortUrl, getUserUrls, getUrlByShortCode } from '../services/url.service.js';
import { authenticationMiddleware, requireUserId } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/shorten', authenticationMiddleware, requireUserId, async (req, res) => {
    const userId = req.user.id;

    try {
        const urlValidation = await urlSchema.safeParseAsync(req.body);
        if (!urlValidation.success) {
            return res.status(400).json({ error: 'Invalid URL data', issues: urlValidation.error.issues });
        }

        const { originalUrl, shortCode } = urlValidation.data;

        const newUrl = await createShortUrl({ originalUrl, shortCode, userId });

        return res.status(201).json({
            id: newUrl.id,
            shortCode: newUrl.shortCode,
            originalUrl: newUrl.originalUrl
        });
    } catch (error) {
        console.error('Error shortening URL:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// get all urls for a user
router.get('/', authenticationMiddleware, requireUserId, async (req, res) => {
    const userId = req.user.id;

    try {
        const userUrls = await getUserUrls(userId);
        return res.status(200).json({ data: userUrls });
    } catch (error) {
        console.error('Error fetching user URLs:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// redirect to original URL (public route - no authentication)
router.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        const url = await getUrlByShortCode(shortCode);
        if (!url) {
            return res.status(404).json({ error: 'URL not found' });
        }
        return res.redirect(url.originalUrl);
    } catch (error) {
        console.error('Error redirecting to original URL:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export const urlRouter = router;