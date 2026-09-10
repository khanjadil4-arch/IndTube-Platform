import { useState, useRef } from 'react';
import { UploadCloud, Film, X, Image as ImageIcon } from 'lucide-react';
import { categories } from '@/data/mockData';

export default function UploadPage() {
  const [step, setStep] = useState<'select' | 'details'>('select');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tech');
  const [visibility, setVisibility] = useState('public');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setStep('details');
    }
  };

  const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Backend integration will be added in a later step
    setStep('select');
    setVideoFile(null);
    setThumbnailFile(null);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="px-3 sm:px-4 py-4 max-w-3xl mx-auto">
      <h1 className="text-lg font-bold mb-4">Upload video</h1>

      {step === 'select' && (
        <div
          onClick={() => videoInputRef.current?.click()}
          className="border-2 border-dashed border-ink-700 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-600 hover:bg-ink-900/50 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-ink-800 flex items-center justify-center mb-4">
            <UploadCloud className="w-8 h-8 text-brand-500" />
          </div>
          <p className="font-semibold text-sm">Select a video file to upload</p>
          <p className="text-xs text-ink-500 mt-1">MP4, WebM, or MOV — backend storage will be connected soon</p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 card-surface">
            <Film className="w-5 h-5 text-brand-500 shrink-0" />
            <span className="text-sm font-medium truncate flex-1">
              {videoFile?.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setStep('select');
                setVideoFile(null);
              }}
              className="p-1 rounded hover:bg-ink-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              maxLength={100}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video..."
              rows={4}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm placeholder:text-ink-500 focus:outline-none focus:border-brand-600 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Thumbnail</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-ink-900 border border-ink-800 rounded-lg text-sm hover:bg-ink-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Upload thumbnail
              </button>
              {thumbnailFile && (
                <span className="text-sm text-ink-300 truncate">{thumbnailFile.name}</span>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbSelect}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-600 transition-colors"
            >
              {categories
                .filter((c) => c.id !== 'all')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Visibility</label>
            <div className="flex gap-2">
              {['public', 'unlisted', 'private'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    visibility === v
                      ? 'bg-brand-600 text-white'
                      : 'bg-ink-900 text-ink-300 hover:bg-ink-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('select');
                setVideoFile(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-ink-400 hover:text-ink-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
            >
              Publish
            </button>
          </div>

          <p className="text-xs text-ink-500 leading-relaxed">
            Note: Video and thumbnail files are not yet stored. Backend storage (independently
            controllable) will be connected in the next step.
          </p>
        </form>
      )}
    </div>
  );
}
