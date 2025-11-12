import express from 'express';
import { urlSchema } from '../validation/request.validation.js';
import { createShortUrl, getUserUrls, getUrlByShortCode, deleteUrlByShortCode } from '../services/url.service.js';
import { authenticationMiddleware, requireUserId } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/errors.middleware.js';
import ApiError from '../utils/ApiError.js';


const router = express.Router();

router.post('/shorten', authenticationMiddleware, requireUserId, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const urlValidation = await urlSchema.safeParseAsync(req.body);
    if (!urlValidation.success) {
        throw ApiError.badRequest('Invalid URL data', urlValidation.error.issues);
    }

    const { originalUrl, shortCode } = urlValidation.data;
    const newUrl = await createShortUrl({ originalUrl, shortCode, userId });

    return res.status(201).json({
        success: true,
        data: {
            id: newUrl.id,
            shortCode: newUrl.shortCode,
            originalUrl: newUrl.originalUrl
        }
    });
}));


// get all urls for a user
router.get('/', authenticationMiddleware, requireUserId, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userUrls = await getUserUrls(userId);
    
    return res.status(200).json({ 
        success: true,
        data: userUrls 
    });
}));


// redirect to original URL (public route - no authentication)
router.get('/:shortCode', asyncHandler(async (req, res) => {
    const { shortCode } = req.params;

    const url = await getUrlByShortCode(shortCode);
    if (!url) {
        throw ApiError.notFound('URL not found');
    }
    
    return res.redirect(url.originalUrl);
}));

// delete URL by short code (authenticated route)
router.delete('/:shortCode', authenticationMiddleware, requireUserId, asyncHandler(async (req, res) => {
    const { shortCode } = req.params;
    const userId = req.user.id;

    const deletedUrl = await deleteUrlByShortCode(shortCode, userId);
    
    if (!deletedUrl) {
        throw ApiError.notFound('URL not found');
    }
    
    return res.status(200).json({ 
        success: true,
        message: 'URL deleted successfully', 
        data: { shortCode: deletedUrl.shortCode } 
    });
}));

export const urlRouter = router;