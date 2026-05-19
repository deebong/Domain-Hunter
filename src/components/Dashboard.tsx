import { DomainRecord, SortConfig } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Trash2, ExternalLink, AlertCircle, CheckCircle2, Clock, XCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, Columns, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
  domains: DomainRecord[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  onRefreshDomain: (domain: string) => void;
  onDelete: (domain: string) => void;
  appsScriptUrl: string;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
}

export default function Dashboard({ 
  domains, 
  isLoading, 
  error, 
  searchQuery, 
  setSearchQuery, 
  onRefresh, 
  onRefreshDomain,
  onDelete, 
  appsScriptUrl,
  sortConfig,
  setSortConfig,
  visibleColumns,
  setVisibleColumns
}: DashboardProps) {
  const [isColumnFilterOpen, setIsColumnFilterOpen] = useState(false);

  const allColumns = [
    { id: 'domain', label: 'Domain' },
    { id: 'status', label: 'Status' },
    { id: 'age', label: 'Age' },
    { id: 'expiryDate', label: 'Expiry Date' },
    { id: 'expiringIn', label: 'Expiring In' },
    { id: 'registrar', label: 'Registrar' },
    { id: 'lastChecked', label: 'Last Checked' },
  ];

  const toggleColumn = (id: string) => {
    if (visibleColumns.includes(id)) {
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(c => c !== id));
      }
    } else {
      setVisibleColumns([...visibleColumns, id]);
    }
  };

  const handleSort = (key: any) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" /> : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
  };
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('ok')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s.includes('nearing expiry')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('expired') || s.includes('redemption')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (s.includes('available') || s.includes('not found')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (s.includes('prohibited') || s.includes('hold') || s.includes('unavailable')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('ok')) return <CheckCircle2 className="w-4 h-4 mr-1" />;
    if (s.includes('nearing expiry')) return <Clock className="w-4 h-4 mr-1" />;
    if (s.includes('expired') || s.includes('redemption')) return <XCircle className="w-4 h-4 mr-1" />;
    if (s.includes('available') || s.includes('not found')) return <AlertCircle className="w-4 h-4 mr-1" />;
    if (s.includes('prohibited') || s.includes('hold') || s.includes('unavailable')) return <CheckCircle2 className="w-4 h-4 mr-1" />;
    return <AlertCircle className="w-4 h-4 mr-1" />;
  };

  const getPrimaryStatus = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('available') || s.includes('not found')) return 'Available';
    if (s.includes('expired') || s.includes('redemption')) return 'Expired';
    if (s.includes('nearing expiry')) return 'Nearing Expiry';
    if (s.includes('prohibited') || s.includes('hold') || s.includes('active') || s.includes('ok')) return 'Unavailable';
    return status.split(',')[0] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tracked Domains</h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring {domains.length} domains via Google Apps Script
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <button 
              onClick={() => setIsColumnFilterOpen(!isColumnFilterOpen)}
              className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
              title="Filter Columns"
            >
              <Columns className="w-5 h-5" />
              <ChevronDown className={`w-4 h-4 transition-transform ${isColumnFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isColumnFilterOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsColumnFilterOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-2"
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
                      Visible Columns
                    </div>
                    {allColumns.map(col => (
                      <label key={col.id} className="flex items-center px-4 py-2 hover:bg-slate-50 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns.includes(col.id)}
                          onChange={() => toggleColumn(col.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm text-slate-700">{col.label}</span>
                      </label>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button 
                        onClick={() => setVisibleColumns(allColumns.map(c => c.id))}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        Show All
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {!appsScriptUrl && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium">Apps Script URL Missing</h3>
            <p className="text-sm mt-1">
              Please go to <strong>Settings</strong> and paste your Google Apps Script Web App URL to start tracking domains.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium">Error loading domains</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {visibleColumns.includes('domain') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('domain')}>
                    <div className="flex items-center">Domain {getSortIcon('domain')}</div>
                  </th>
                )}
                {visibleColumns.includes('status') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('status')}>
                    <div className="flex items-center">Status {getSortIcon('status')}</div>
                  </th>
                )}
                {visibleColumns.includes('age') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('age')}>
                    <div className="flex items-center">Age {getSortIcon('age')}</div>
                  </th>
                )}
                {visibleColumns.includes('expiryDate') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('expiryDate')}>
                    <div className="flex items-center">Expiry Date {getSortIcon('expiryDate')}</div>
                  </th>
                )}
                {visibleColumns.includes('expiringIn') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('expiry')}>
                    <div className="flex items-center">Expiring In {getSortIcon('expiry')}</div>
                  </th>
                )}
                {visibleColumns.includes('registrar') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('registrar')}>
                    <div className="flex items-center">Registrar {getSortIcon('registrar')}</div>
                  </th>
                )}
                {visibleColumns.includes('lastChecked') && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('lastChecked')}>
                    <div className="flex items-center">Last Checked {getSortIcon('lastChecked')}</div>
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {isLoading && domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading domains...
                  </td>
                </tr>
              ) : domains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    No domains found. Add some domains to start tracking.
                  </td>
                </tr>
              ) : (
                domains.map((domain, idx) => (
                  <motion.tr 
                    key={domain.domain}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {visibleColumns.includes('domain') && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-slate-900">{domain.domain}</div>
                          <a 
                            href={`https://${domain.domain}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('status') && (
                      <td className="px-6 py-4 whitespace-normal max-w-xs">
                        <div className="group relative inline-flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-help ${getStatusColor(getPrimaryStatus(domain.status))}`}>
                            {getStatusIcon(getPrimaryStatus(domain.status))}
                            {getPrimaryStatus(domain.status)}
                          </span>
                          
                          {/* Tooltip - Fixed visibility with z-index and overflow handling */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs bg-slate-900 text-white text-[10px] leading-tight rounded py-1.5 px-2.5 shadow-2xl z-[100] whitespace-normal ring-1 ring-white/10">
                            <ul className="list-disc pl-3 space-y-0.5">
                              {domain.status.split(', ').map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.includes('age') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {domain.ageDays !== undefined ? (
                          <span>
                            {Math.floor(domain.ageDays / 365)}y {Math.floor((domain.ageDays % 365) / 30)}m
                          </span>
                        ) : 'N/A'}
                      </td>
                    )}
                    {visibleColumns.includes('expiryDate') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">
                        {domain.expiryDate !== 'Unknown' 
                          ? new Date(domain.expiryDate).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            }).replace(',', '')
                          : 'Unknown'}
                      </td>
                    )}
                    {visibleColumns.includes('expiringIn') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {domain.expiryDays !== undefined ? (
                          <span className={`${domain.expiryDays < 30 ? 'text-rose-600 font-semibold' : domain.expiryDays < 90 ? 'text-amber-600' : 'text-slate-600'}`}>
                            {domain.expiryDays} days
                          </span>
                        ) : 'N/A'}
                      </td>
                    )}
                    {visibleColumns.includes('registrar') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {domain.registrar}
                      </td>
                    )}
                    {visibleColumns.includes('lastChecked') && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(domain.lastChecked).toLocaleString()}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => onRefreshDomain(domain.domain)}
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                          title="Refresh Domain"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(domain.domain)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50"
                          title="Delete Domain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
