import {nanoid} from 'nanoid';

export function generateShortCode(length = 6) {
    return nanoid(length);
}