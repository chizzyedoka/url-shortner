import ApiError from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
    let error = err;

    // Handle database connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        error = new ApiError(503, 'Database connection failed. Please try again later.');
    }
    
    // Handle PostgreSQL specific errors
    else if (err.code === '23505') {
        // Unique constraint violation
        error = ApiError.conflict('Duplicate entry. Resource already exists.');
    }
    else if (err.code === '23503') {
        // Foreign key constraint violation
        error = ApiError.badRequest('Invalid reference. Related resource does not exist.');
    }
    else if (err.code === '23502') {
        // Not null constraint violation
        error = ApiError.badRequest('Required field is missing.');
    }
    else if (err.code === '22P02') {
        // Invalid text representation
        error = ApiError.badRequest('Invalid data format.');
    }
    else if (err.code === '28P01') {
        // Invalid password
        error = new ApiError(503, 'Database authentication failed.');
    }
    else if (err.code === '3D000') {
        // Invalid database name
        error = new ApiError(503, 'Database does not exist.');
    }
    
    // If error is not an instance of ApiError, convert it
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message);
    }

    const response = {
        success: false,
        message: error.message,
        ...(error.errors && { errors: error.errors }),
        ...(process.env.NODE_ENV === 'development' && { 
            stack: error.stack,
            ...(err.code && { code: err.code })
        })
    };

    console.error('Error:', {
        statusCode: error.statusCode,
        message: error.message,
        code: err.code,
        stack: error.stack
    });

    return res.status(error.statusCode).json(response);
};

// Async handler wrapper to catch errors in async route handlers
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};