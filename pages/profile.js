import Masonry from 'react-masonry-css';
import Link from 'next/link';
import { doc, getDoc, collection, query as firestoreQuery, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';
import ArtworkCard from '../components/ArtworkCard';

export async function getServerSideProps(context) {
    const userPayload = context.req.cookies.authToken
        ? JSON.parse(atob(context.req.cookies.authToken.split('.')[1]))
        : null;

    const { query: params } = context;

    let user = null;
    let profileOwner = null;
    let artworks = [];

    try {
        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                user = { id: userSnap.id, ...userSnap.data() };
            }
        }

        if (params.userId) {
            const profileRef = doc(db, 'users', params.userId);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                profileOwner = { id: profileSnap.id, ...profileSnap.data() };

                const artworksRef = collection(db, 'artworks');
                const artworksQuery = firestoreQuery(artworksRef, where('userId', '==', params.userId));
                const artworksSnapshot = await getDocs(artworksQuery);

                artworks = artworksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            }
        }

        return {
            props: {
                isLoggedIn: !!user,
                user: user || null,
                profileOwner: profileOwner || null,
                artworks: artworks || [],
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);

        return {
            props: {
                isLoggedIn: !!user,
                user: null,
                profileOwner: null,
                artworks: [],
            },
        };
    }
}

export default function Profile({ user, profileOwner, isLoggedIn, artworks }) {
    const isOwnProfile = isLoggedIn && user?.id === profileOwner?.id;

    if (!profileOwner) {
        return (
            <div className="text-center">
                <p className="text-gray-500">Профиль не найден. Возможно, этот пользователь не существует.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center space-x-6">
                <img
                    src={profileOwner?.avatarUrl || '/default-avatar.png'}
                    alt="User Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                    <h1 className="text-2xl font-bold">{profileOwner?.username || 'Неизвестный пользователь'}</h1>
                    <p className="text-sm text-gray-600">{profileOwner?.email || 'Email не указан'}</p>
                    <p className="mt-2">{profileOwner?.bio || 'Информация отсутствует'}</p>
                </div>
            </div>

            {isOwnProfile && (
                <div className="mt-6 space-x-4">
                    <Link href="/settings">
                        <button className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200">
                            Настроить аккаунт
                        </button>
                    </Link>
                    <Link href="/add-artwork">
                        <button className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200">
                            Добавить работу
                        </button>
                    </Link>
                    <Link href="/manage-artworks">
                        <button className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200">
                            Управление работами
                        </button>
                    </Link>
                </div>
            )}

            <div className="mt-8">
                <Masonry
                    breakpointCols={{
                        default: 4,
                        1100: 3,
                        768: 2,
                        500: 1,
                    }}
                    className="flex gap-4"
                    columnClassName="bg-clip-padding"
                >
                    {artworks.map((artwork) => (
                        <ArtworkCard key={artwork.id} artwork={artwork} showAuthorInfo={false} />
                    ))}
                </Masonry>
            </div>
        </div>
    );
}
