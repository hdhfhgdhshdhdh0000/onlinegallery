import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar({ isLoggedIn, user }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const avatarRef = useRef(null);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleClickOutside = (event) => {
        if (
            menuRef.current && !menuRef.current.contains(event.target) &&
            avatarRef.current && !avatarRef.current.contains(event.target)
        ) {
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white text-black shadow-md">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
                <div className="text-xl font-bold">
                    <Link href="/">Gallery</Link>
                </div>
                <ul className="flex space-x-6 items-center">
                    <li>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-stone-950/80 text-white rounded-xl hover:bg-stone-950/50 transition duration-200"
                        >
                            Главная
                        </Link>
                    </li>
                    {isLoggedIn ? (
                        <>
                            <li>
                                <Link
                                    href="/add-artwork"
                                    className="px-4 py-2 bg-stone-950/80 text-white rounded-xl hover:bg-stone-950/50 transition duration-200"
                                >
                                    Добавить
                                </Link>
                            </li>
                            <li className="relative">
                                <button
                                    ref={avatarRef}
                                    className="rounded-full w-10 h-10 overflow-hidden hover:ring-4 hover:ring-stone-950/50 transition duration-200"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenu();
                                    }}
                                >
                                    <img
                                        src={user?.avatarUrl}
                                        alt="User Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                                {menuOpen && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg py-2 z-10"
                                    >
                                        <div className="px-4 py-2">
                                            <span className="font-bold">
                                                Привет, {user?.username || 'Гость'}!
                                            </span>
                                        </div>
                                        <Link
                                            href={`/profile?userId=${user?.id}`}
                                            className="block px-4 py-2 hover:bg-stone-950/10"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Профиль
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 hover:bg-stone-950/10"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Настройки аккаунта
                                        </Link>
                                        <Link
                                            href="/manage-artworks"
                                            className="block px-4 py-2 hover:bg-stone-950/10"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Управление работами
                                        </Link>
                                        <Link
                                            href="/logout"
                                            className="block px-4 py-2 hover:bg-stone-950/10"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            Выйти
                                        </Link>
                                    </div>
                                )}
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link
                                href="/auth"
                                className="px-4 py-2 bg-stone-950/80 text-white rounded-xl hover:bg-stone-950/50 transition duration-200"
                            >
                                Войти
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
}
