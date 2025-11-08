import { db } from '../db/index.js';
import { usersTable } from '../models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPasswordWithSalt } from '../utils/hash.js';

export const registerUser = async ({ firstname, lastname, email, password }) => {
    // Check if a user with this email already exists in the database
    console.log('Checking for existing user with email:', email);
    const [existingUser] = await db.select({
        id: usersTable.id
    }).from(usersTable).where(eq(usersTable.email, email));

    console.log('Existing User:', existingUser);
    // If user exists, throw an error to prevent duplicate accounts
    if (existingUser) {
        throw new Error(`User with email ${email} already exists`);
    }

    // Generate a random salt and hash the password with it for security
    console.log('No existing user found with email:', email);
    const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

    // Insert the new user into the database with hashed password
    console.log('Hashed Password:', hashedPassword);
    const [user] = await db.insert(usersTable).values({
        firstname,
        lastname,
        email,
        salt, // Store salt to verify password later during login
        password: hashedPassword
    }).returning({ id: usersTable.id });

    return user;
};

export const loginUser = async ({ email, password }) => {
    // Fetch the user from database by email
    console.log('Fetching user with email:', email);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    // If user doesn't exist, throw generic error (don't reveal which field is wrong for security)
    if (!user) {
        console.log('User not found');
        throw new Error('Invalid email or password');
    }

    console.log('User found, verifying password');
    // Hash the provided password with the user's stored salt
    const { password: hashedPassword } = hashPasswordWithSalt(password, user.salt);

    console.log('Comparing passwords');
    // Compare the hashed password with the stored hashed password
    if (hashedPassword !== user.password) {
        console.log('Password mismatch');
        throw new Error('Invalid email or password');
    }

    console.log('Password verified successfully');
    // If passwords match, return the authenticated user
    return user;
};
