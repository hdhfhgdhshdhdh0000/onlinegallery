import { useEffect, useState } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

const ArtworkCard = ({ artwork, showAuthorInfo = true, isManagePage = false, onEdit }) => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (artwork.userId) {
                try {
                    const userRef = doc(db, 'users', artwork.userId);
                    const userSnapshot = await getDoc(userRef);

                    if (userSnapshot.exists()) {
                        setUserData(userSnapshot.data());
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [artwork.userId]);

    const MAX_TAGS = 3;
    const MAX_TAG_LENGTH = 10;

    const getDisplayTags = (tags) => {
        const limitedTags = tags.slice(0, MAX_TAGS);
        return limitedTags.map((tag) =>
            tag.length > MAX_TAG_LENGTH ? `${tag.slice(0, MAX_TAG_LENGTH)}...` : tag
        );
    };

    const displayTags = artwork.tags ? getDisplayTags(artwork.tags) : [];
    const remainingTagsCount = artwork.tags.length - displayTags.length;

    const content = (
        <div className="break-inside bg-white rounded-lg">
            <div className="relative group">
                <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-auto rounded-lg group-hover:brightness-75 transition duration-300 cursor-pointer"
                    onClick={() => isManagePage && onEdit(artwork)}
                />

                {displayTags.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition duration-300">
                        {displayTags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-black bg-opacity-50 text-white rounded-full px-3 py-1 text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                        {remainingTagsCount > 0 && (
                            <span className="bg-black bg-opacity-50 text-white rounded-full px-3 py-1 text-sm">
                                +{remainingTagsCount}
                            </span>
                        )}
                    </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 text-white rounded-md p-2 opacity-0 group-hover:opacity-100 transition duration-300 overflow-hidden">
                    <p
                        className="text-sm"
                        style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                        }}
                    >
                        {artwork.description}
                    </p>
                </div>
            </div>

            <h3 className="text-lg font-bold m-2">{artwork.title}</h3>

            {showAuthorInfo && userData && (
                <div className="flex items-center gap-2 m-2">
                    <img
                        src={userData.avatarUrl || '/default-avatar.png'}
                        alt={userData.username || 'Anonymous'}
                        className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{userData.username || 'Anonymous'}</span>
                </div>
            )}
        </div>
    );

    return isManagePage ? (
        content
    ) : (
        <Link href={`/artworks/${artwork.id}`}>
            {content}
        </Link>
    );
};

export default ArtworkCard;
