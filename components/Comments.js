import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, addDoc, deleteDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig';

const Comments = ({ artworkId, isLoggedIn, user }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const commentsRef = collection(db, 'comments');
                const commentsQuery = query(commentsRef, where('artworkId', '==', artworkId));
                const querySnapshot = await getDocs(commentsQuery);

                const fetchedComments = await Promise.all(
                    querySnapshot.docs.map(async (document) => { // Переименовали `doc` в `document`
                        const commentData = { id: document.id, ...document.data() };
                        if (commentData.userId) {
                            const userRef = doc(db, 'users', commentData.userId);
                            const userSnapshot = await getDoc(userRef);
                            if (userSnapshot.exists()) {
                                commentData.user = userSnapshot.data();
                            }
                        }
                        return commentData;
                    })
                );

                setComments(fetchedComments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [artworkId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            const newCommentData = {
                artworkId,
                content: newComment,
                userId: user?.id,
                createdAt: new Date().toISOString(),
            };

            const commentsRef = collection(db, 'comments');
            const docRef = await addDoc(commentsRef, newCommentData);

            setComments([{ id: docRef.id, ...newCommentData, user: { avatarUrl: user.avatarUrl, username: user.username } }, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const commentRef = doc(db, 'comments', commentId);
            await deleteDoc(commentRef);

            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="comments-section">
            <h2 className="text-xl font-bold mb-4">Комментарии</h2>

            {isLoggedIn && (
                <div className="add-comment mb-4">
                    <textarea
                        placeholder="Добавьте комментарий..."
                        value={newComment}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 500) {
                                setNewComment(value);
                            }
                        }}
                        className="w-full px-3 py-2 border-2 border-black/25 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/25 focus:border-black/25 resize-none"
                    />
                    <p className="text-sm text-gray-500 mt-2">{newComment.length}/500</p>
                    <button
                        onClick={handleAddComment}
                        className="bg-stone-950/80 text-white mt-2 px-6 py-2 rounded-xl hover:bg-stone-950/50 transition duration-200"
                    >
                        Отправить
                    </button>
                </div>
            )}

            {loading ? (
                <p className="text-black/30">Загрузка комментариев...</p>
            ) : (
                <div className="comments-list">
                    {comments.length === 0 ? (
                        <p className="text-black/50">Комментариев пока нет</p>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-3 mb-4">
                                <img
                                    src={comment.user?.avatarUrl || '/default-avatar.png'}
                                    alt={comment.user?.username || 'Anonymous'}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1 max-w-full pr-16">
                                    <div className="inline mt-1">
                                        <Link href={`/profile?userId=${comment.userId}`}>
                                            <span className="font-semibold hover:underline cursor-pointer">
                                                {comment.user?.username || 'Anonymous'}
                                            </span>
                                        </Link>
                                        <span className="ml-1 break-words">{comment.content}</span>
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </p>
                                    {isLoggedIn && comment.userId === user.id && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="mt-1 text-red-600 hover:text-red-800"
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Comments;
