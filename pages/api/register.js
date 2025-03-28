import { collection, doc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig'; 
import bcrypt from 'bcrypt';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Метод не разрешен' });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    try {
        const usersRef = collection(db, 'users');
        const emailQuery = query(usersRef, where('email', '==', email));
        const querySnapshot = await getDocs(emailQuery);

        if (!querySnapshot.empty) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userRef = doc(usersRef); 
        await setDoc(userRef, {
            username,
            email,
            passwordHash,
            avatarUrl: 'https://i1.sndcdn.com/artworks-g7kIKaunKMhFmEzL-qvSs4g-t500x500.jpg',
            bio: '', 
            roles: ['user'], 
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        

        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
}
