import { useState, useRef } from 'react';
import Masonry from 'react-masonry-css';
import ArtworkCard from '../components/ArtworkCard';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export async function getServerSideProps({ req }) {
    const userPayload = req.cookies.authToken
        ? JSON.parse(atob(req.cookies.authToken.split('.')[1]))
        : null;

    let user = null;
    let artworks = [];

    try {
        const artworksRef = collection(db, 'artworks');
        const artworksSnapshot = await getDocs(artworksRef);
        artworks = artworksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                user = { id: userSnap.id, ...userSnap.data() };
            }
        }

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: user || null,
                artworks: artworks || [],
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: null,
                artworks: [],
            },
        };
    }
}

const Gallery = ({ artworks }) => {
    const [selectedTags, setSelectedTags] = useState([]);
    const [filteredArtworks, setFilteredArtworks] = useState(artworks);
    const [searchQuery, setSearchQuery] = useState('');

    const scrollContainerRef = useRef(null);

    const getTagCount = (tag) => {
        return artworks.filter((artwork) => artwork.tags.includes(tag)).length;
    };

    const handleTagClick = (tag) => {
        let updatedTags = [...selectedTags];

        if (selectedTags.includes(tag)) {
            updatedTags = updatedTags.filter((t) => t !== tag);
        } else {
            updatedTags = [tag, ...updatedTags];
        }

        setSelectedTags(updatedTags);

        if (updatedTags.length > 0) {
            const filtered = artworks.filter((artwork) =>
                updatedTags.every((tag) => artwork.tags.includes(tag))
            );
            setFilteredArtworks(filtered);
        } else {
            setFilteredArtworks(artworks);
        }
    };

    const popularTags = [...new Set(artworks.flatMap((artwork) => artwork.tags))];

    const filteredTags = searchQuery
        ? popularTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        : popularTags;

    const handleMouseDown = (e) => {
        const container = scrollContainerRef.current;
        container.isDragging = true;
        container.startX = e.pageX - container.offsetLeft;
        container.scrollLeftStart = container.scrollLeft;
    };

    const handleMouseMove = (e) => {
        const container = scrollContainerRef.current;
        if (!container.isDragging) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - container.startX) * 1.5;
        container.scrollLeft = container.scrollLeftStart - walk;
    };

    const handleMouseUpOrLeave = () => {
        const container = scrollContainerRef.current;
        container.isDragging = false;
    };

    return (
        <div className="container mx-auto p-4">
            {artworks.length === 0 ? (
                <div className="flex justify-center min-h-screen mt-10">
                    <p className="text-gray-500 text-lg">Нет загруженных работ.</p>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div
                            ref={scrollContainerRef}
                            className="flex overflow-x-hidden space-x-4 cursor-grab select-none"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUpOrLeave}
                            onMouseLeave={handleMouseUpOrLeave}
                            style={{ flex: 1 }}
                        >
                            {filteredTags.map((tag) => (
                                <div
                                    key={tag}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTagClick(tag);
                                    }}
                                    className={`rounded-full px-3 py-1 text-sm cursor-pointer flex items-center transition-opacity duration-200 ${
                                        selectedTags.includes(tag)
                                            ? 'bg-stone-950/50 text-white hover:brightness-70 transition duration-300'
                                            : 'bg-stone-950/80 text-white hover:brightness-70 transition duration-300'
                                    }`}
                                    style={{
                                        order: selectedTags.includes(tag) ? -1 : 0,
                                    }}
                                >
                                    {tag}
                                    <span className="ml-2 text-gray-300">
                                        {getTagCount(tag)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <input
                            type="text"
                            placeholder="Поиск тега..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="ml-4 px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                    </div>

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
                        {filteredArtworks.map((artwork) => (
                            <ArtworkCard key={artwork.id} artwork={artwork} showAuthorInfo={true} />
                        ))}
                    </Masonry>
                </div>
            )}
        </div>
    );
};

export default Gallery;
