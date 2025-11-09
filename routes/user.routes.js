import express from 'express';
import {createUserSchema, loginUserSchema} from '../validation/request.validation.js';
import { registerUser, loginUser } from '../services/user.service.js';
import { generateToken } from '../utils/jwt.js';


const router = express.Router();

router.post('/register', async (req, res) => {
    try {
    console.log('Request Body:', req.body);
    const userValidation = await createUserSchema.safeParseAsync(req.body);

    if (!userValidation.success) {
        return res.status(400).json({ error: userValidation.error.format() });
    }

    console.log('Validated Data:', userValidation.data);

    const { firstname, lastname, email, password } = userValidation.data;

    const user = await registerUser({ firstname, lastname, email, password });
    return res.status(201).json({message: 'User registered successfully',
        data: 
        {user_id: user.id}
    });

    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({error: error.message});
        }
        res.status(500).json({error: 'Internal server error'});
    }
});

router.post('/login', async (req, res) => {
    console.log('calling the endpoint')
    try {
        const loginValidation = await loginUserSchema.safeParseAsync(req.body);
        if (!loginValidation.success) {
            return res.status(400).json({ error: loginValidation.error.format() });
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
    } catch (error) {
        console.error("Login error:", error); 
        if (error.message.includes('Invalid email or password')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

export const userRouter = router;