import { useState } from 'react';
import { useRouter } from 'next/router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export default function AccountSettings({ isLoggedIn, user }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: user?.username || '',
        avatarUrl: user?.avatarUrl || '',
        bio: user?.bio || '',
        currentPassword: '',
        newPassword: '',
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (formData.username.length < 5 || formData.username.length > 32) {
            setErrorMessage('Имя пользователя должно быть от 5 до 32 символов.');
            return;
        }

        if (formData.bio.length > 500) {
            setErrorMessage('Биография не может превышать 500 символов.');
            return;
        }

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                username: formData.username,
                avatarUrl: formData.avatarUrl,
                bio: formData.bio,
            });

            setSuccessMessage('Данные успешно сохранены!');
            setErrorMessage('');
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            setErrorMessage('Не удалось сохранить изменения.');
            setSuccessMessage('');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (formData.newPassword.length < 6 || formData.newPassword.length > 64) {
            setErrorMessage('Пароль должен быть от 6 до 64 символов.');
            return;
        }

        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                passwordHash: formData.newPassword, 
            });

            setSuccessMessage('Пароль успешно изменен!');
            setErrorMessage('');
        } catch (error) {
            console.error('Ошибка изменения пароля:', error);
            setErrorMessage('Не удалось изменить пароль.');
            setSuccessMessage('');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                avatarUrl: 'https://i1.sndcdn.com/artworks-g7kIKaunKMhFmEzL-qvSs4g-t500x500.jpg',
            });

            setFormData((prev) => ({
                ...prev,
                avatarUrl: 'https://i1.sndcdn.com/artworks-g7kIKaunKMhFmEzL-qvSs4g-t500x500.jpg',
            }));
            setSuccessMessage('Аватар успешно удален.');
        } catch (error) {
            console.error('Ошибка удаления аватара:', error);
            setErrorMessage('Не удалось удалить аватар.');
        }
    };

    if (!isLoggedIn) {
        router.push('/');
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Настройки аккаунта</h1>

            <form onSubmit={handleSave} className="space-y-4">
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm mb-2">
                        Имя пользователя
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                    />
                </div>
                <label htmlFor="avatarUrl" className="block text-sm mb-2">
                    URL аватара
                </label>
                <div className="mb-4 flex items-center">
                    <input
                        type="text"
                        id="avatarUrl"
                        name="avatarUrl"
                        value={formData.avatarUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="w-full ml-2 py-2 px-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                    >
                        Удалить аватар
                    </button>
                </div>
                <div className="mb-4">
                    <label htmlFor="bio" className="block text-sm mb-2">
                        Биография
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        rows={4}
                        maxLength={500}
                    />
                    <p className="text-sm text-gray-500">{formData.bio.length}/500</p>
                </div>

                {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
                {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
                <button
                    type="submit"
                    className="w-full bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                >
                    Сохранить изменения
                </button>
            </form>

            <form onSubmit={handlePasswordChange} className="mt-6">
                <h2 className="text-2xl font-bold mb-6">Изменение пароля</h2>
                <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-sm mb-2">
                        Текущий пароль
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm mb-2">
                        Новый пароль
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                >
                    Изменить пароль
                </button>
            </form>
        </div>
    );
}

export async function getServerSideProps({ req }) {
    const userPayload = req.cookies.authToken
        ? JSON.parse(atob(req.cookies.authToken.split('.')[1]))
        : null;

    let user = null;

    try {
        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                user = { id: userSnap.id, ...userSnap.data() };
            }
        }

        return {
            props: {
                isLoggedIn: !!user,
                user: user || null,
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);

        return {
            props: {
                isLoggedIn: false,
                user: null,
            },
        };
    }
}
