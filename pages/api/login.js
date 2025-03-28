import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { db } from '../../lib/firebaseConfig';

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Метод не разрешен' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    try {
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(emailQuery);

        if (querySnapshot.empty) {
            return res.status(400).json({ message: 'Неверный адрес электронной почты' });
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Неверный пароль' });
        }

        const token = jwt.sign({ userId: userDoc.id }, SECRET_KEY, { expiresIn: '1h' });

        res.setHeader(
            'Set-Cookie',
            serialize('authToken', token, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 3600,
                path: '/',
            })
        );

        res.status(200).json({ message: 'Успешный вход', userId: userDoc.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}
