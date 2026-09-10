import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Mic,
  X,
  Clock,
  ArrowUpLeft,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import type { SearchHistoryItem, SearchSuggestion } from '@/types';
import { mockSearchHistory, mockSearchSuggestions } from '@/data/searchData';

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<SearchHistoryItem[]>(mockSearchHistory);
  const [voiceActive, setVoiceActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const suggestions: SearchSuggestion[] = query.trim()
    ? mockSearchSuggestions.filter((s) =>
        s.text.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const newItem: SearchHistoryItem = {
      id: `h-${Date.now()}`,
      query: q,
      searchedAt: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev.filter((h) => h.query !== q)]);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const pickHistory = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  const removeHistory = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const handleVoice = () => {
    // Voice search stub — real Web Speech API or backend voice recognition
    // can be connected here later. Do not pretend it works.
    setVoiceActive(true);
    setTimeout(() => setVoiceActive(false), 1500);
  };

  const highlightMatch = (text: string, match: string) => {
    if (!match.trim()) return text;
    const idx = text.toLowerCase().indexOf(match.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="font-semibold text-gray-900">{text.slice(idx, idx + match.length)}</span>
        {text.slice(idx + match.length)}
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white animate-fade-in flex flex-col">
      {/* Top search bar */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <button
          onClick={onClose}
          className="p-2 -ml-1 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search IndTube"
              className="w-full bg-gray-100 border border-gray-200 rounded-full pl-4 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Clear"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </form>

        <button
          onClick={handleVoice}
          className={`p-2.5 rounded-full transition-all shrink-0 ${
            voiceActive
              ? 'bg-brand-100 text-brand-600 scale-110'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          aria-label="Voice search"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions while typing */}
        {query.trim() && suggestions.length > 0 && (
          <div className="py-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setQuery(s.text);
                  navigate(`/search?q=${encodeURIComponent(s.text)}`);
                  onClose();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                {s.thumbnailUrl ? (
                  <img
                    src={s.thumbnailUrl}
                    alt=""
                    className={`shrink-0 object-cover ${
                      s.type === 'channel' ? 'w-7 h-7 rounded-full' : 'w-10 h-7 rounded'
                    }`}
                  />
                ) : (
                  <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {highlightMatch(s.text, query.trim())}
                </span>
                {s.type === 'channel' && (
                  <span className="text-[10px] font-medium text-gray-400 uppercase shrink-0">
                    Channel
                  </span>
                )}
                <ArrowUpLeft className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {query.trim() && suggestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No suggestions for "{query}"</p>
            <p className="text-xs mt-1">Press search to see all results.</p>
          </div>
        )}

        {/* Search history when empty */}
        {!query.trim() && history.length > 0 && (
          <div className="py-2">
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Recent searches
              </span>
              <button
                onClick={clearHistory}
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear history
              </button>
            </div>
            {history.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors group"
              >
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <button
                  onClick={() => pickHistory(h.query)}
                  className="flex-1 text-sm text-gray-700 text-left truncate"
                >
                  {h.query}
                </button>
                {h.thumbnailUrl && (
                  <img
                    src={h.thumbnailUrl}
                    alt=""
                    className="w-10 h-7 rounded object-cover shrink-0"
                  />
                )}
                <button
                  onClick={() => pickHistory(h.query)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors shrink-0"
                  aria-label="Edit search"
                >
                  <ArrowUpLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => removeHistory(h.id)}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors shrink-0"
                  aria-label="Remove"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!query.trim() && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Search className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-500">Search IndTube</p>
            <p className="text-xs mt-1 text-gray-400">
              Find videos, channels, shorts, and more
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Try searching for music, gaming, or cooking</span>
            </div>
          </div>
        )}

        {/* Voice search hint */}
        {voiceActive && (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mb-4 animate-pulse">
              <Mic className="w-8 h-8 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">Listening...</p>
            <p className="text-xs text-gray-400 mt-1">
              Voice search will be connected to a real backend soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
