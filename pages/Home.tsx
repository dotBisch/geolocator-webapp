import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { supabaseService } from '../services/supabaseService';
import { GeoData, User, HistoryItem } from '../types';
import { Map } from '../components/Map';
import { Button } from '../components/Button';
import { 
  Search, 
  MapPin, 
  History, 
  LogOut, 
  Trash2, 
  Globe, 
  Navigation,
  CheckSquare,
  Square,
  X,
  Menu
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [currentData, setCurrentData] = useState<GeoData | null>(null);
  const [searchIp, setSearchIp] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const loadHistory = async () => {
      if (parsedUser.id) {
        try {
          const remoteHistory = await supabaseService.getHistory();
          setHistory(remoteHistory);
        } catch (err) {
          console.warn('Failed to load history from Supabase, falling back to local', err);
          const storedHistory = localStorage.getItem('searchHistory');
          if (storedHistory) setHistory(JSON.parse(storedHistory));
        }
      } else {
        const storedHistory = localStorage.getItem('searchHistory');
        if (storedHistory) setHistory(JSON.parse(storedHistory));
      }
    };
    loadHistory();

    // Initial fetch (Current User IP)
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync history to local storage (Backup)
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  const fetchData = async (ip?: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.getGeoData(ip);
      setCurrentData(data);
      
      // Add to history if it's a specific search and unique
      if (ip && !history.some(h => h.data.ip === data.ip)) {
        let newItem: HistoryItem;
        
        if (user?.id) {
          try {
            newItem = await supabaseService.addToHistory(data);
          } catch (err) {
            console.error('Failed to save to Supabase', err);
            // Fallback
            newItem = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              data
            };
          }
        } else {
          newItem = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            data
          };
        }
        
        setHistory(prev => [newItem, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(searchIp)) {
      setError('Please enter a valid IP address (e.g., 8.8.8.8)');
      return;
    }
    fetchData(searchIp);
  };

  const clearSearch = () => {
    setSearchIp('');
    fetchData(); // Revert to user IP
  };

  const handleLogout = async () => {
    await supabaseService.logout();
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleHistorySelection = (id: string) => {
    setSelectedHistory(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const deleteSelectedHistory = async () => {
    if (user?.id) {
      // Delete from Supabase
      for (const id of selectedHistory) {
        try {
          await supabaseService.deleteHistory(id);
        } catch (e) {
          console.error('Failed to delete history item from Supabase', id, e);
        }
      }
    }
    
    setHistory(prev => prev.filter(item => !selectedHistory.includes(item.id)));
    setSelectedHistory([]);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setCurrentData(item.data);
    setSearchIp(item.data.ip);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 overflow-hidden font-sans">
      
      {/* Top Navigation Bar */}
      <header className="h-16 bg-white shadow-sm z-20 flex items-center justify-between px-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-lamar-green font-bold text-xl">
             <div className="border-2 border-lamar-green rounded-full p-1">
               <MapPin size={16} fill="currentColor" />
             </div>
             <span>GEOLOCATOR</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button variant="secondary" onClick={handleLogout} className="!px-3">
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative flex">
        
        {/* Map Layer (Absolute Background) */}
        <div className="absolute inset-0 z-0">
          <Map 
            geoData={currentData} 
            label={
              currentData && history.some(h => h.data.ip === currentData.ip)
                ? (history.length - history.findIndex(h => h.data.ip === currentData.ip)).toString()
                : '★'
            }
          />
        </div>

        {/* Floating Sidebar / Overlay */}
        <div className={`
          absolute top-4 right-4 bottom-4 w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden transition-transform duration-300 border border-white/50
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-[120%]'}
          max-w-[calc(100vw-2rem)]
        `}>
          
          {/* Panel Header: Search */}
          <div className="p-5 border-b border-gray-100 bg-white">
             <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchIp}
                  onChange={(e) => setSearchIp(e.target.value)}
                  placeholder="Enter IP Address..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-lamar-green focus:border-transparent outline-none text-sm transition-all"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                
                {searchIp && (
                   <button 
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                   >
                     <X size={16} />
                   </button>
                )}
             </form>
             {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
             
             <div className="mt-3 flex gap-2">
               <Button onClick={handleSearch} isLoading={loading} className="flex-1 py-2 text-xs">
                 Search Location
               </Button>
               {searchIp && (
                 <Button variant="secondary" onClick={clearSearch} className="flex-1 py-2 text-xs">
                    Reset to Me
                 </Button>
               )}
             </div>
          </div>

          {/* Panel Body: Content */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-200">
            
            {/* Current Geo Info Card */}
            {currentData && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-lamar-light p-2 rounded-full text-lamar-green">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{currentData.city}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{currentData.region}, {currentData.country}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <InfoRow label="IP Address" value={currentData.ip} icon={<Navigation size={14}/>} />
                  <InfoRow label="Coordinates" value={currentData.loc} icon={<MapPin size={14}/>} />
                  <InfoRow label="Organization" value={currentData.org || 'N/A'} />
                  <InfoRow label="Timezone" value={currentData.timezone || 'N/A'} />
                  <InfoRow label="Postal" value={currentData.postal || 'N/A'} />
                </div>
              </div>
            )}

            {/* History Section */}
            <div className="mt-2">
               <div className="flex items-center justify-between mb-3">
                 <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <History size={16} /> Search History
                 </h4>
                 {selectedHistory.length > 0 && (
                   <button 
                    onClick={deleteSelectedHistory}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded"
                   >
                     <Trash2 size={12} /> Delete ({selectedHistory.length})
                   </button>
                 )}
               </div>

               {history.length === 0 ? (
                 <p className="text-center text-gray-400 text-sm py-4">No recent searches.</p>
               ) : (
                 <div className="space-y-2">
                   {history.map(item => (
                     <div 
                      key={item.id} 
                      className={`
                        group flex items-center p-3 rounded-lg border transition-all cursor-pointer
                        ${currentData?.ip === item.data.ip ? 'border-lamar-green bg-lamar-light/30' : 'border-gray-100 hover:border-gray-300 bg-white'}
                      `}
                      onClick={() => loadHistoryItem(item)}
                     >
                       <div 
                        className="mr-3 text-gray-400 hover:text-lamar-green"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHistorySelection(item.id);
                        }}
                       >
                         {selectedHistory.includes(item.id) ? (
                           <CheckSquare size={18} className="text-lamar-green" />
                         ) : (
                           <Square size={18} />
                         )}
                       </div>
                       <div className="flex-1 overflow-hidden">
                         <p className="font-medium text-gray-800 text-sm truncate">{item.data.city || 'Unknown'}</p>
                         <p className="text-xs text-gray-500 font-mono">{item.data.ip}</p>
                       </div>
                       <div className="text-[10px] text-gray-400">
                         {new Date(item.created_at || item.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
          
          {/* Footer of Panel */}
          <div className="p-3 bg-gray-50 border-t border-gray-200 text-center text-[10px] text-gray-400">
            Data provided by ipinfo.io
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Info Rows
const InfoRow: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-500 flex items-center gap-2">
      {icon} {label}
    </span>
    <span className="text-sm font-medium text-gray-800 text-right truncate max-w-[60%]">{value}</span>
  </div>
);
