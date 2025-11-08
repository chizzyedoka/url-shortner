import express from 'express';
import {db} from '../db/drizzle.js';
import {usersTable} from '../models/user.model.js';
import { randomBytes, createHmac } from 'crypto';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
    const {firstname, lastName, email, password} = req.body;

    const [existingUser] = await db.select(
        {
            id: usersTable.id
        }
    ).from(usersTable).where(eq(usersTable.email,email));

    if (existingUser) {
        return res.status(400).json({error: `User with email ${email} already exists`});
    }
    
    const salt = randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt).update(password).digest('hex');

    const [user] = await db.insert(usersTable).values({
        firstname,
        lastName,
        email,
        salt,
        hashedPassword
    })
.returning({id: usersTable.id});
    return res.status(201).json({message: 'User registered successfully',
        data: user.id});

    } catch (error) {
        res.status(500).json({error: 'Internal server error'});
    }
});