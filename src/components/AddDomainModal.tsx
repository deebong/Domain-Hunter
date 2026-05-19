import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, AlertCircle } from 'lucide-react';

interface AddDomainModalProps {
  onClose: () => void;
  onAdd: (domains: string[]) => Promise<void>;
}

export default function AddDomainModal({ onClose, onAdd }: AddDomainModalProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Parse domains from textarea
    const domains = input
      .split(/[\n, ]+/)
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (domains.length === 0) {
      setError('Please enter at least one domain.');
      return;
    }

    // Basic validation (case-insensitive)
    const invalidDomains = domains.filter(d => !/^[a-zA-Z0-9]+([-.][a-zA-Z0-9]+)*\.[a-zA-Z]{2,10}$/.test(d));
    if (invalidDomains.length > 0) {
      setError(`Invalid domain format: ${invalidDomains.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(domains);
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Add Domains</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="domains" className="block text-sm font-medium text-slate-700 mb-2">
              Enter Domains (one per line, comma separated)
            </label>
            <textarea
              id="domains"
              rows={6}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="example.com&#10;another-domain.net&#10;awesome-startup.io"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none font-mono"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{isSubmitting ? 'Adding...' : 'Add Domains'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
