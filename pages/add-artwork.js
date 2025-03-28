import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, addDoc, getDoc, doc} from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export async function getServerSideProps({ req }) {
    const userPayload = req.cookies.authToken
        ? JSON.parse(atob(req.cookies.authToken.split('.')[1]))
        : null;

    let user = null;

    try {
        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnapshot = await getDoc(userRef);

            if (userSnapshot.exists()) {
                user = { id: userSnapshot.id, ...userSnapshot.data() };
            }
        } else {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                },
            };
        }

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: user || null,
            },
        };
    } catch (error) {
        console.error('Error fetching user data:', error);

        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        };
    }
}

const TagsInput = ({ tags, setTags }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === ' ' && inputValue.trim()) {
            const newTag = inputValue.trim();

            if (!tags.some((tag) => tag.toLowerCase() === newTag.toLowerCase()) && newTag.length <= 50 && tags.length < 10) {
                setTags([newTag, ...tags]);
            }
            

            setInputValue('');
            e.preventDefault();
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 w-full px-3 py-2 border-2 border-black/25 rounded-xl focus-within:ring-2 focus-within:ring-black/25 focus-within:border-black/25">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="bg-stone-950/80 text-white px-3 py-1 rounded-full flex items-center gap-2"
                >
                    {tag}
                    <button
                        onClick={() => removeTag(tag)}
                        className="text-sm bg-white text-stone-950/80 rounded-full px-1"
                    >
                        ✕
                    </button>
                </span>
            ))}

            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 border-none focus:outline-none"
                placeholder="Введите тег и нажмите пробел (максимум 50 символов, до 10 тегов)"
            />
        </div>
    );
};

export default function AddArtwork({ isLoggedIn, user }) {
    const router = useRouter();

    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/');
        }
    }, [isLoggedIn, router]);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [tags, setTags] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !description || !imageUrl) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        try {
            const newArtwork = {
                title,
                description,
                imageUrl,
                userId: user?.id, 
                tags,
                createdAt: new Date().toISOString(),
            };

            const artworksRef = collection(db, 'artworks');
            await addDoc(artworksRef, newArtwork);

            setSuccessMessage('Арт успешно добавлен!');
            setTitle('');
            setDescription('');
            setImageUrl('');
            setTags([]);
            router.back();
        } catch (err) {
            console.error(err);
            setError('Произошла ошибка');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Добавить новый арт</h1>

            {error && <p className="text-red-500 mb-2">{error}</p>}
            {successMessage && <p className="text-green-500 mb-2">{successMessage}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm mb-2">
                        Название
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        placeholder="Добавить название"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm mb-2">
                        Описание
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        maxLength={500}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25 resize-none"
                        placeholder="Добавьте подробное описание"
                    />
                    <p className="text-sm text-gray-500">{description.length}/500</p>
                </div>

                <div>
                    <label htmlFor="imageUrl" className="block text-sm mb-2">
                        Ссылка на изображение
                    </label>
                    <input
                        id="imageUrl"
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        placeholder="Введите URL изображения"
                    />
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm mb-2">
                        Теги
                    </label>
                    <TagsInput tags={tags} setTags={setTags} />
                </div>

                <button
                    type="submit"
                    className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                >
                    Опубликовать
                </button>
            </form>
        </div>
    );
}
