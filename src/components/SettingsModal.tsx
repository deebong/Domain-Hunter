import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Server, Database, Save, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  appsScriptUrl: string;
  onSave: (url: string) => void;
}

export default function SettingsModal({ onClose, appsScriptUrl: initialUrl, onSave }: SettingsModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!url.trim()) {
      setError('Google Apps Script Web App URL is required.');
      return;
    }
    if (!url.startsWith('https://script.google.com/')) {
      setError('Please enter a valid Google Apps Script Web App URL.');
      return;
    }
    
    onSave(url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Server className="w-5 h-5 mr-2 text-blue-600" />
            Storage Settings
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center text-blue-700 font-medium mb-1">
                <Server className="w-4 h-4 mr-2" />
                Google Apps Script
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                This app uses Google Sheets as a database via Apps Script. This is the most reliable method for shared hosting.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-medium text-slate-700">
                Web App URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste the URL from your Apps Script deployment here.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
