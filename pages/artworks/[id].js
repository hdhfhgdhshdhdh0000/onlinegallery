import { useState } from 'react';
import { verifyAuthToken } from '../../utils/middleware';
import Comments from '../../components/Comments';
import EditArtworkModal from '../../components/EditArtworkModal';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

export async function getServerSideProps({ req, params }) {
    const userPayload = verifyAuthToken(req);

    try {
        let user = null;
        let artwork = null;
        let author = null;

        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnap = await getDoc(userRef);
            user = userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
        }

        const artworkRef = doc(db, 'artworks', params.id);
        const artworkSnap = await getDoc(artworkRef);
        if (artworkSnap.exists()) {
            artwork = { id: artworkSnap.id, ...artworkSnap.data() };

            if (artwork.userId) {
                const authorRef = doc(db, 'users', artwork.userId);
                const authorSnap = await getDoc(authorRef);
                author = authorSnap.exists() ? { id: authorSnap.id, ...authorSnap.data() } : null;
            }
        }

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: user || null,
                artwork: artwork || null,
                author: author || null,
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: null,
                artwork: null,
                author: null,
            },
        };
    }
}

const ArtworkDetails = ({ artwork, isLoggedIn, user, author }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    if (!artwork) {
        return (
            <div className="flex justify-center min-h-screen mt-10">
                <p className="text-gray-500 text-lg">Арт не найден</p>
            </div>
        );
    }

    const isOwnArtwork = user?.id === artwork.userId;

    const handleEdit = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-8">
            <div className="lg:w-3/5 w-full">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-auto rounded-lg"
                />
            </div>

            <div className="lg:w-2/5 w-full flex flex-col gap-6">
                <h1 className="text-2xl font-bold">{artwork.title}</h1>
                <p className="text-gray-700">{artwork.description}</p>
                <div className="flex items-center gap-4">
                    <img
                        src={author?.avatarUrl || '/default-avatar.png'}
                        alt={author?.username || 'Anonymous Author'}
                        className="w-12 h-12 rounded-full"
                    />
                    <div>
                        {author ? (
                            <Link href={`/profile?userId=${author.id}`}>
                                <p className="font-semibold hover:underline cursor-pointer">
                                    {author.username}
                                </p>
                            </Link>
                        ) : (
                            <p className="font-semibold">Неизвестный автор</p>
                        )}
                    </div>
                </div>
                {artwork.tags && (
                    <div className="flex flex-wrap gap-2">
                        {artwork.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-stone-950/80 text-white rounded-full px-3 py-1 text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {isOwnArtwork && (
                    <div className="mt-2">
                        <button
                            className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                            onClick={() => handleEdit(artwork)}
                        >
                            Редактировать
                        </button>
                    </div>
                )}
                <div>
                    <Comments artworkId={artwork.id} isLoggedIn={isLoggedIn} user={user} />
                </div>
            </div>

            {isModalOpen && (
                <EditArtworkModal
                    artwork={selectedArtwork}
                    onClose={() => setIsModalOpen(false)}
                    onSave={(updatedArtwork) => {
                        if (updatedArtwork.id === artwork.id) {
                            Object.assign(artwork, updatedArtwork);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default ArtworkDetails;
