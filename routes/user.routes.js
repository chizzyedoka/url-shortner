import express from 'express';
import {createUserSchema, loginUserSchema} from '../validation/request.validation.js';
import { registerUser, loginUser } from '../services/user.service.js';
import { generateToken } from '../utils/jwt.js';
import { asyncHandler } from '../middlewares/errors.middleware.js';
import ApiError from '../utils/ApiError.js';



const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
    console.log('Request Body:', req.body);
    const userValidation = await createUserSchema.safeParseAsync(req.body);

    if (!userValidation.success) {
        throw ApiError.badRequest('Validation failed', userValidation.error.format());
    }

    console.log('Validated Data:', userValidation.data);

    const { firstname, lastname, email, password } = userValidation.data;

    const user = await registerUser({ firstname, lastname, email, password });
    return res.status(201).json({
        message: 'User registered successfully',
        data: {
            user_id: user.id
        }
    });
}));

router.post('/login', asyncHandler(async (req, res) => {
    console.log('calling the endpoint')
    const loginValidation = await loginUserSchema.safeParseAsync(req.body);
    
    if (!loginValidation.success) {
        throw ApiError.badRequest('Validation failed', loginValidation.error.format());
    }
    console.log("validation successful")

    const { email, password } = loginValidation.data;
    console.log(email)
    const user = await loginUser({ email, password });
    console.log("user logged in successfully")
    console.log("User object:", user); 
    
    // Generate JWT token with user id and email
    const token = generateToken({ id: user.id, email: user.email });
    console.log("Token generated:", token); 
    
    return res.status(200).json({ 
        message: 'Login successful', 
        data: { 
            user_id: user.id,
            token 
        } 
    });
}));

export const userRouter = router;