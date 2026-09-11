import { useState } from 'react';
import { Save, Globe, Shield, Database, HardDrive, Server } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'IndTube',
    description: 'A video sharing platform',
    allowRegistration: true,
    requireEmailVerification: false,
    maxUploadSize: '2GB',
    defaultVideoVisibility: 'public',
    enableComments: true,
    enableLikes: true,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Platform Settings</h1>

      <div className="flex flex-col gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-sm">General</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-ink-400 mb-1 block">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1 block">Description</label>
              <input
                type="text"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-accent-400" />
            <h2 className="font-semibold text-sm">Access & Security</h2>
          </div>
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Allow new registrations"
              value={settings.allowRegistration}
              onChange={() => handleToggle('allowRegistration')}
            />
            <ToggleRow
              label="Require email verification"
              value={settings.requireEmailVerification}
              onChange={() => handleToggle('requireEmailVerification')}
            />
            <ToggleRow
              label="Enable comments"
              value={settings.enableComments}
              onChange={() => handleToggle('enableComments')}
            />
            <ToggleRow
              label="Enable likes/dislikes"
              value={settings.enableLikes}
              onChange={() => handleToggle('enableLikes')}
            />
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="w-4 h-4 text-success-400" />
            <h2 className="font-semibold text-sm">Storage & Upload</h2>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs text-ink-400 mb-1 block">Max Upload Size</label>
              <input
                type="text"
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1 block">Default Video Visibility</label>
              <select
                value={settings.defaultVideoVisibility}
                onChange={(e) => setSettings({ ...settings, defaultVideoVisibility: e.target.value })}
                className="w-full bg-ink-900 border border-ink-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-600 transition-colors"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-4 h-4 text-warning-400" />
            <h2 className="font-semibold text-sm">Backend Architecture (Portable)</h2>
          </div>
          <div className="flex flex-col gap-2 text-xs text-ink-400">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5" />
              <span>Database: Supabase (PostgreSQL) — independently accessible & exportable</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage: Independently controllable video file storage (to be connected)</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Auth: Supabase Auth — replaceable with any auth provider</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-500 transition-colors w-fit ml-auto"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-200">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-ink-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  );
}
