import { useState } from 'react';
import { verifyAuthToken } from '../utils/middleware';
import { useRouter } from "next/router";


export async function getServerSideProps(context) {
    const user = verifyAuthToken(context.req);

    if (user) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }

    return { props: {} };
}

const AuthPage = () => {
    const router = useRouter();
    const [isSignIn, setIsSignIn] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        try {
            if (isSignIn) {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                    credentials: 'include',
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Ошибка входа');

                document.cookie = `authToken=${data.token}; path=/; max-age=3600`;

                setSuccessMessage('Успешный вход!');
                router.push("/");
            } else {
                if (formData.name.length < 5 || formData.name.length > 32) {
                    throw new Error('Имя пользователя должно быть от 5 до 32 символов');
                }

                if (formData.password.length < 6 || formData.password.length > 64) {
                    throw new Error('Пароль должен быть от 6 до 64 символов');
                }

                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Пароли не совпадают');
                }

                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Ошибка регистрации');

                setSuccessMessage('Регистрация прошла успешно!');
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                router.push("/");
            }
        } catch (error) {
            setErrorMessage(error.message || 'Что-то пошло не так');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    {isSignIn ? 'Войти' : 'Регистрация'}
                </h2>
                <div className="flex justify-center mb-6">
                    <button
                        className={`px-4 py-2 rounded-l-xl ${
                            isSignIn ? 'bg-stone-950/80 text-white '  : 'bg-gray-200 text-black/70 hover:bg-stone-950/50 transition duration-200'
                        }`}
                        onClick={() => setIsSignIn(true)}
                    >
                        Войти
                    </button>
                    <button
                        className={`px-4 py-2 rounded-r-xl ${
                            !isSignIn ? 'bg-stone-950/80 text-white' : 'bg-gray-200 text-black/70 hover:bg-stone-950/50 transition duration-200'
                        }`}
                        onClick={() => setIsSignIn(false)}
                    >
                        Регистрация
                    </button>
                </div>
                {errorMessage && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-xl">{errorMessage}</div>
                )}
                {successMessage && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-xl">{successMessage}</div>
                )}
                <form onSubmit={handleSubmit}>
                    {!isSignIn && (
                        <div className="mb-4">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border-2 border-black/25  rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                            />
                        </div>
                    )}
                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border-2 border-black/25  rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border-2 border-black/25  rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                    </div>
                    {!isSignIn && (
                        <div className="mb-4">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border-2 border-black/25  rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-stone-950/80 text-white font-semibold rounded-xl hover:bg-stone-950/50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                    >
                        {isSignIn ? 'Войти' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
};

AuthPage.hideNavbar = true;

export default AuthPage;
