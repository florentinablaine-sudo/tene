import React from 'react';
import { HeartIcon, SendIcon } from './';

export const groupComments = (commentsList) => {
    const commentMap = {};
    const topLevelComments = [];
    commentsList.forEach(comment => {
        commentMap[comment.id] = { ...comment, replies: [] };
    });
    commentsList.forEach(comment => {
        if (comment.replyTo && commentMap[comment.replyTo]) {
            commentMap[comment.replyTo].replies.push(commentMap[comment.id]);
        } else {
            topLevelComments.push(commentMap[comment.id]);
        }
    });
    return topLevelComments;
};

export const Comment = React.memo(({ comment, onReply, onLike, onEdit, onDelete, onUpdate, isUserAdmin, currentUserId, editingCommentId, editingText, setEditingText, replyingTo, replyText, setReplyText, onCommentSubmit }) => {
    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="flex flex-col">
            <div className="p-3 rounded-lg bg-component-bg border border-border-color">
                <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                    <p className="font-bold text-sm text-text-main opacity-100">{comment.userName}</p>
                    <span>{formatDate(comment.timestamp)}</span>
                </div>
                {editingCommentId === comment.id ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input type="text" value={editingText} autoFocus onChange={(e) => setEditingText(e.target.value)} className="w-full bg-background border border-border-color rounded-lg py-1 px-2 text-text-main text-sm" />
                        <button onClick={() => onUpdate(comment.id)} className="p-1 rounded-full bg-green-500 text-white">✓</button>
                        <button onClick={() => onEdit(null)} className="p-1 rounded-full bg-gray-500 text-white">✕</button>
                    </div>
                ) : (<p className="text-sm mt-1 opacity-90">{comment.text}</p>)}

                <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => onLike(comment.id)} className="flex items-center gap-1 text-xs text-gray-500">
                        <HeartIcon filled={comment.userHasLiked} className={`w-4 h-4 ${comment.userHasLiked ? 'text-accent' : ''}`} />
                        <span>{comment.likeCount || 0}</span>
                    </button>
                    <button onClick={() => onReply(comment.id)} className="text-xs text-gray-500">Ответить</button>
                    {(currentUserId === comment.userId || isUserAdmin) && (
                        <>
                            <button onClick={() => onEdit(comment)} className="text-xs text-gray-500">Редактировать</button>
                            <button onClick={() => onDelete(comment.id)} className="text-xs text-red-500">Удалить</button>
                        </>
                    )}
                </div>
            </div>

            {replyingTo === comment.id && (
                <form onSubmit={(e) => onCommentSubmit(e, comment.id)} className="flex items-center gap-2 mt-2">
                    <input type="text" value={replyText} autoFocus onChange={(e) => setReplyText(e.target.value)} placeholder={`Ответ для ${comment.userName}...`} className="w-full bg-background border border-border-color rounded-lg py-1 px-3 text-sm" />
                    <button type="submit" className="p-1.5 rounded-full bg-accent text-white"><SendIcon className="w-4 h-4" /></button>
                </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-2 border-l-2 border-border-color pl-2">
                    {comment.replies.map(reply =>
                        <Comment
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onLike={onLike}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                            isUserAdmin={isUserAdmin}
                            currentUserId={currentUserId}
                            editingCommentId={editingCommentId}
                            editingText={editingText}
                            setEditingText={setEditingText}
                            replyingTo={replyingTo}
                            replyText={replyText}
                            setReplyText={setReplyText}
                            onCommentSubmit={onCommentSubmit}
                        />
                    )}
                </div>
            )}
        </div>
    );
});