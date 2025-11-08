import {z} from 'zod';

export const createUserSchema = z.object({
    firstname: z.string(),
    lastname: z.string(),
    email: z.string().email(),
    password: z.string().min(3, 'Password must be at least 3 characters long')
});

export const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(3, 'Password must be at least 3 characters long')
});