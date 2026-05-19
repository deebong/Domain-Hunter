import { useState, useEffect } from 'react';
import { Plus, Settings, Server, ExternalLink, RefreshCw, Trash2, Search, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Dashboard from './components/Dashboard';
import AddDomainModal from './components/AddDomainModal';
import SetupGuide from './components/SetupGuide';
import SettingsModal from './components/SettingsModal';

export type DomainRecord = {
  id?: number;
  domain: string;
  status: string;
  registrationDate: string;
  expiryDate: string;
  registrar: string;
  lastChecked: string;
  // Calculated fields for sorting/filtering
  ageDays?: number;
  expiryDays?: number;
};

export type SortConfig = {
  key: keyof DomainRecord | 'age' | 'expiry';
  direction: 'asc' | 'desc';
} | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup'>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['domain', 'status', 'expiryDate', 'registrar', 'lastChecked', 'age', 'expiringIn']);

  // Settings
  const [appsScriptUrl, setAppsScriptUrl] = useState(import.meta.env.VITE_APPS_SCRIPT_URL || '');

  useEffect(() => {
    // Load settings from localStorage
    const savedUrl = localStorage.getItem('appsScriptUrl');
    
    if (savedUrl) {
      setAppsScriptUrl(savedUrl);
    } else if (import.meta.env.VITE_APPS_SCRIPT_URL) {
      setAppsScriptUrl(import.meta.env.VITE_APPS_SCRIPT_URL);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [appsScriptUrl]);

  const fetchDomains = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!appsScriptUrl) {
        setDomains([]);
        setIsLoading(false);
        return;
      }
      const res = await fetch(appsScriptUrl);
      const data = await res.json();
      if (data.success) {
        setDomains(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For Apps Script, we can just re-add the existing domains to trigger a refresh
      if (!appsScriptUrl || domains.length === 0) {
        fetchDomains();
        return;
      }
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'add_domains', domains: domains.map(d => d.domain) }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDomains();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshDomain = async (domain: string) => {
    setIsLoading(true);
    try {
      if (!appsScriptUrl) return;
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'add_domains', domains: [domain] }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDomains();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to refresh domain: ' + String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomains = async (newDomains: string[]) => {
    try {
      if (!appsScriptUrl) {
        alert('Please configure Google Apps Script URL in Settings');
        return;
      }
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'add_domains', domains: newDomains }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDomains();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to add domains: ' + String(err));
    }
  };

  const handleDeleteDomain = async (domain: string) => {
    if (!confirm(`Are you sure you want to delete ${domain}?`)) return;
    
    try {
      if (!appsScriptUrl) {
        alert('Please configure Google Apps Script URL in Settings');
        return;
      }
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({ action: 'delete_domain', domain }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDomains();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to delete domain: ' + String(err));
    }
  };

  const saveSettings = (url: string) => {
    setAppsScriptUrl(url);
    localStorage.setItem('appsScriptUrl', url);
  };

  const filteredDomains = domains
    .filter(d => 
      d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.registrar.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .map(d => {
      const now = new Date();
      let ageDays = undefined;
      let expiryDays = undefined;

      if (d.registrationDate && d.registrationDate !== 'Unknown') {
        const regDate = new Date(d.registrationDate);
        ageDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (d.expiryDate && d.expiryDate !== 'Unknown') {
        const expDate = new Date(d.expiryDate);
        expiryDays = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }

      return { ...d, ageDays, expiryDays };
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const { key, direction } = sortConfig;
      let aValue: any = a[key as keyof DomainRecord];
      let bValue: any = b[key as keyof DomainRecord];

      if (key === 'age') {
        aValue = a.ageDays ?? -Infinity;
        bValue = b.ageDays ?? -Infinity;
      } else if (key === 'expiry') {
        aValue = a.expiryDays ?? Infinity;
        bValue = b.expiryDays ?? Infinity;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Domain Hunter</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('setup')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'setup' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                Apps Script Setup
              </button>
            </nav>
            
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Domains</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <Dashboard 
            domains={filteredDomains} 
            isLoading={isLoading} 
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onRefresh={handleRefresh}
            onRefreshDomain={handleRefreshDomain}
            onDelete={handleDeleteDomain}
            appsScriptUrl={appsScriptUrl}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        ) : (
          <SetupGuide />
        )}
      </main>

      {/* Modals */}
      {isAddModalOpen && (
        <AddDomainModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddDomains} 
        />
      )}
      
      {isSettingsModalOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsModalOpen(false)} 
          appsScriptUrl={appsScriptUrl}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}
