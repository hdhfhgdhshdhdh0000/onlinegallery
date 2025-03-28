import { useState } from 'react';
import ArtworkCard from '../components/ArtworkCard';
import EditArtworkModal from '../components/EditArtworkModal';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

export async function getServerSideProps({ req }) {
    const userPayload = req.cookies.authToken
        ? JSON.parse(atob(req.cookies.authToken.split('.')[1]))
        : null;

    let user = null;
    let artworks = [];

    try {
        if (userPayload?.userId) {
            const userRef = doc(db, 'users', userPayload.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                user = { id: userSnap.id, ...userSnap.data() };
            }

            const artworksRef = collection(db, 'artworks');
            const artworksQuery = query(artworksRef, where('userId', '==', userPayload.userId));
            const artworksSnapshot = await getDocs(artworksQuery);

            artworks = artworksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
        }

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: user || null,
                artworks: artworks || [],
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error);

        return {
            props: {
                isLoggedIn: !!userPayload,
                user: null,
                artworks: [],
            },
        };
    }
}

const ManageArtworks = ({ artworks: initialArtworks, user }) => {
    const [artworks, setArtworks] = useState(initialArtworks);
    const [sortOption, setSortOption] = useState('date');
    const [selectedArtwork, setSelectedArtwork] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sortedArtworks = [...artworks].sort((a, b) => {
        if (sortOption === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortOption === 'title') {
            return a.title.localeCompare(b.title);
        }
    });

    const handleEdit = (artwork) => {
        setSelectedArtwork(artwork);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedArtwork) => {
        try {
            const artworkRef = doc(db, 'artworks', updatedArtwork.id);
            await updateDoc(artworkRef, { ...updatedArtwork });

            setArtworks((prev) =>
                prev.map((art) =>
                    art.id === updatedArtwork.id ? { ...art, ...updatedArtwork } : art
                )
            );
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating artwork:', error);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Управление артами</h1>
                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="ml-4 px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                >
                    <option value="date">Сортировать по дате</option>
                    <option value="title">Сортировать по названию</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedArtworks.map((artwork) => (
                    <ArtworkCard
                        key={artwork.id}
                        artwork={artwork}
                        showAuthorInfo={false}
                        isManagePage={true}
                        onEdit={() => handleEdit(artwork)}
                    />
                ))}
            </div>

            {isModalOpen && (
                <EditArtworkModal
                    artwork={selectedArtwork}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default ManageArtworks;
