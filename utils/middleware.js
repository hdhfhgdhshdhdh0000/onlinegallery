import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export function verifyAuthToken(req) {
    try {
        if (!req.headers.cookie) {
            console.error('Cookies отсутствуют в заголовке');
            throw new Error('Cookies отсутствуют');
        }

        const cookies = parse(req.headers.cookie);
        const token = cookies.authToken;

        if (!token) {
            console.error('Токен отсутствует в cookies');
            throw new Error('Токен отсутствует');
        }

        const decoded = jwt.verify(token, SECRET_KEY);

        return decoded;
    } catch (error) {
        console.error('Ошибка проверки токена:', error.message);
        return null;
    }
}
