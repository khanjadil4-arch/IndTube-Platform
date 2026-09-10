import { useState } from 'react';
import { Send, ThumbsUp } from 'lucide-react';
import type { Comment } from '@/types';
import { formatRelativeTime, formatCount } from '@/lib/format';
import { mockComments } from '@/data/mockData';

interface Props {
  videoId: string;
}

export default function CommentSection({ videoId }: Props) {
  const comments = mockComments.filter((c) => c.videoId === videoId);
  const [text, setText] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `local-${Date.now()}`,
      videoId,
      authorName: 'You',
      authorAvatarUrl: '',
      text: text.trim(),
      likeCount: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    setLocalComments((prev) => [newComment, ...prev]);
    setText('');
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allComments = [...localComments, ...comments];

  return (
    <div className="mt-6">
      <h2 className="text-base font-bold mb-4">
        {allComments.length} Comments
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-accent-600 flex items-center justify-center text-sm font-semibold shrink-0">
          U
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-b border-ink-700 pb-1 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
          {text && (
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setText('')}
                className="px-3 py-1.5 text-sm text-ink-400 hover:text-ink-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-sm font-semibold bg-brand-600 text-white rounded-full hover:bg-brand-500 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-4">
        {allComments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm font-semibold shrink-0 overflow-hidden">
              {comment.authorAvatarUrl ? (
                <img src={comment.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                comment.authorName.charAt(0)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{comment.authorName}</span>
                <span className="text-xs text-ink-500">{formatRelativeTime(comment.createdAt)}</span>
              </div>
              <p className="text-sm text-ink-200 mt-1 leading-relaxed">{comment.text}</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => toggleLike(comment.id)}
                  className="flex items-center gap-1 text-xs text-ink-400 hover:text-ink-200 transition-colors"
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${likedIds.has(comment.id) ? 'fill-brand-500 text-brand-500' : ''}`}
                  />
                  {formatCount(comment.likeCount + (likedIds.has(comment.id) ? 1 : 0))}
                </button>
                <button className="text-xs text-ink-400 hover:text-ink-200 transition-colors">
                  Reply
                </button>
              </div>

              {comment.replies.length > 0 && (
                <div className="mt-3 flex flex-col gap-3 pl-2 border-l border-ink-800">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-ink-700 flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden">
                        {reply.authorAvatarUrl ? (
                          <img src={reply.authorAvatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          reply.authorName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{reply.authorName}</span>
                          <span className="text-xs text-ink-500">{formatRelativeTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink-200 mt-0.5 leading-relaxed">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
