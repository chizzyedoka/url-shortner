import express from 'express';
import {db} from '../db/index.js';
import {usersTable} from '../models/user.model.js';
import { randomBytes, createHmac } from 'crypto';
import {createUserSchema} from '../validation/request.validation.js';
import { eq } from 'drizzle-orm';


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

    console.log('Checking for existing user with email:', email);
    const [existingUser] = await db.select(
        {
            id: usersTable.id
        }
    ).from(usersTable).where(eq(usersTable.email,email));

    console.log('Existing User:', existingUser);
    if (existingUser) {
        return res.status(400).json({error: `User with email ${email} already exists`});
    }
    console.log('No existing user found with email:', email);
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    console.log('Hashed Password:', hashedPassword);
    const [user] = await db.insert(usersTable).values({
        firstname,
        lastname,
        email,
        salt,
        password: hashedPassword
    })
.returning({id: usersTable.id});
    return res.status(201).json({message: 'User registered successfully',
        data: 
        {user_id: user.id}
    });

    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});

export const userRouter = router;