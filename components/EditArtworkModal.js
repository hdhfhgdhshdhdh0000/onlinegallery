import { useState } from "react";
import { useRouter } from 'next/router';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

const EditArtworkModal = ({ artwork, onClose, onSave }) => {
    const router = useRouter();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [formData, setFormData] = useState({
        title: artwork.title,
        description: artwork.description,
        imageUrl: artwork.imageUrl,
        tags: artwork.tags || [],
    });
    const [tagInput, setTagInput] = useState("");

    const handleTagInputChange = (e) => {
        setTagInput(e.target.value);
    };

    const handleTagKeyDown = (e) => {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();

            const newTag = tagInput.trim();

            if (
                newTag &&
                newTag.length <= 50 &&
                !formData.tags.includes(newTag) &&
                formData.tags.length < 10
            ) {
                setFormData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, newTag],
                }));
            }

            setTagInput("");
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedArtwork = {
            title: formData.title,
            description: formData.description,
            imageUrl: formData.imageUrl,
            tags: formData.tags,
        };

        try {
            const artworkRef = doc(db, 'artworks', artwork.id); // Firestore ID вместо `_id`
            await updateDoc(artworkRef, updatedArtwork);
            onSave({ id: artwork.id, ...updatedArtwork }); // Передача обновленных данных
            router.reload();
        } catch (error) {
            console.error("Error updating artwork:", error);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const artworkRef = doc(db, 'artworks', artwork.id); // Firestore ID вместо `_id`
            await deleteDoc(artworkRef);
            router.back();
        } catch (error) {
            console.error("Error deleting artwork:", error);
        }
        setShowDeleteConfirm(false);
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center"
            onClick={handleBackgroundClick}
        >
            <div className="bg-white p-6 rounded w-200" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6">Редактировать арт</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm mb-2">
                            Название
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm mb-2">
                            Описание
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            maxLength={500}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25 resize-none"
                        />
                        <p className="text-sm text-gray-500">{formData.description.length}/500</p>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="imageUrl" className="block text-sm mb-2">
                            URL изображения
                        </label>
                        <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="tags" className="block text-sm mb-2">
                            Теги
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map((tag, index) => (
                                <div
                                    key={index}
                                    className="bg-stone-950/80 text-white px-3 py-1 rounded-full flex items-center gap-2"
                                >
                                    <span>{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tag)}
                                        className="text-sm bg-white text-stone-950/80 rounded-full px-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={tagInput}
                            onChange={handleTagInputChange}
                            onKeyDown={handleTagKeyDown}
                            placeholder="Введите тег и нажмите пробел"
                            className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25"
                        />
                        <p className="text-sm text-gray-500">
                            Теги до 50 символов. Максимум 10 тегов.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200">
                            Отменить
                        </button>
                        <button type="submit" className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200">
                            Сохранить
                        </button>
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className="bg-red-600 text-white mt-2 px-6 py-2 rounded-xl hover:bg-red-400 transition duration-200"
                        >
                            Удалить
                        </button>
                    </div>
                </form>

                {showDeleteConfirm && (
                    <div
                        className="fixed inset-0 bg-black/50 flex justify-center items-center"
                        onClick={handleDeleteCancel}
                    >
                        <div
                            className="bg-white p-6 rounded w-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Вы уверены, что хотите удалить этот арт?</h3>
                            <div className="flex justify-between">
                                <button
                                    onClick={handleDeleteCancel}
                                    className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="bg-red-600 text-white mt-2 px-6 py-2 rounded-xl hover:bg-red-400 transition duration-200"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditArtworkModal;
