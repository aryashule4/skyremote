import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DeviceCard from './components/DeviceCard';
import RemoteSession from './components/RemoteSession';
import AddDeviceModal from './components/AddDeviceModal';
import { devices as initialDevices, activityLogs as initialLogs } from './data';
import { Device, ActivityLog } from './types';
import { 
  Monitor, Users, Zap, Clock, Settings2, ShieldCheck, HardDrive, Menu,
  Cloud, Search, Building2, MonitorSmartphone, Puzzle, Info, AlertCircle, XCircle, Sigma, Download, Settings as SettingsIcon, Globe
} from 'lucide-react';

const translations = {
  en: {
    support: 'Remote Support',
    access: 'Unattended Access',
    reports: 'Reports',
    settings: 'Settings',
    search: 'Search',
    org: 'Organization',
    general: 'General',
    security: 'Security &\nCompliance',
    integrations: 'Integrations',
    privacy: 'Privacy Settings',
    actionLog: 'Action Log Viewer',
    twoFA: 'Two-factor Authentication',
    cleanup: 'Data Cleanup',
    overview: 'Overview',
  },
  id: {
    support: 'Dukungan Jarak Jauh',
    access: 'Akses Tanpa Pengawasan',
    reports: 'Laporan',
    settings: 'Pengaturan',
    search: 'Pencarian',
    org: 'Organisasi',
    general: 'Umum',
    security: 'Keamanan &\nKepatuhan',
    integrations: 'Integrasi',
    privacy: 'Pengaturan Privasi',
    actionLog: 'Log Aktivitas',
    twoFA: 'Autentikasi Dua Faktor',
    cleanup: 'Pembersihan Data',
    overview: 'Ringkasan',
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('demo@company.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginPassword) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsAuthenticated(true);
        showToast('Login successful');
      }, 1500);
    }
  };

  const [lang, setLang] = useState<'en' | 'id'>('id'); // Default to Indonesian
  const t = translations[lang];

  const [toastMessage, setToastMessage] = useState('');
  
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [devicesList, setDevicesList] = useState<Device[]>(initialDevices);

  const [logsList, setLogsList] = useState<ActivityLog[]>(initialLogs);
  const [activeTab, setActiveTab] = useState('reports'); // Map to top nav
  const [activeSubTab, setActiveSubTab] = useState('action-log'); // Map to inner nav
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30 Minutes');
  const [hardwareAcceleration, setHardwareAcceleration] = useState(true);

  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [wakingDeviceId, setWakingDeviceId] = useState<string | null>(null);

  const handleConnect = (device: Device) => {
    if (device.status === 'sleeping') {
      setWakingDeviceId(device.id);
      setTimeout(() => {
        setDevicesList(prev => prev.map(d => d.id === device.id ? { ...d, status: 'online' } : d));
        setWakingDeviceId(null);
        initiateConnection(device);
      }, 2000);
    } else {
      initiateConnection(device);
    }
  };

  const initiateConnection = (device: Device) => {
    setActiveDevice(device);
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      const newLog: ActivityLog = {
        id: Date.now() + Math.random(),
        action: 'Connected to',
        device: device.name,
        time: 'Just now',
        user: 'Arya'
      };
      setLogsList(prev => [newLog, ...prev]);
    }, 1800);
  };

  const handleDisconnect = () => {
    if (activeDevice) {
       const newLog: ActivityLog = {
        id: Date.now() + Math.random(),
        action: 'Disconnected from',
        device: activeDevice.name,
        time: 'Just now',
        user: 'Arya'
      };
      setLogsList(prev => [newLog, ...prev]);
    }
    setConnectionStatus('idle');
    setActiveDevice(null);
  };

  const handleAddDevice = (newDevice: Omit<Device, 'id' | 'lastSeen' | 'cpu' | 'ram' | 'networkSpeed'>) => {
    const device: Device = {
      ...newDevice,
      id: `dev-${Date.now()}-${Math.random()}`,
      lastSeen: 'Just now',
      cpu: Math.floor(Math.random() * 20) + 1,
      ram: Math.floor(Math.random() * 40) + 10,
      networkSpeed: `${Math.floor(Math.random() * 200) + 50} Mbps`,
    };
    setDevicesList(prev => [...prev, device]);
    setIsAddModalOpen(false);
    showToast(`Device ${device.name} added successfully`);

    setLogsList(prev => [{
        id: Date.now() + Math.random(),
        action: 'Added new device',
        device: device.name,
        time: 'Just now',
        user: 'Arya'
    }, ...prev]);
  };

  const onlineCount = devicesList.filter(d => d.status === 'online').length;
  const sleepingCount = devicesList.filter(d => d.status === 'sleeping').length;
  const activeSessionsCount = activeDevice ? 1 : 0;

  const filteredDevices = useMemo(() => {
    return devicesList.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ip.includes(searchQuery)
    );
  }, [devicesList, searchQuery]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex items-center justify-center p-4">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2"
            >
              <Info className="w-5 h-5 text-sky-400" />
              <span className="font-medium text-sm">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md"
        >
          <div className="flex items-center gap-2 text-sky-600 mb-8 justify-center">
            <Cloud className="w-8 h-8" />
            <span className="font-bold text-2xl tracking-tight">SkyAssist</span>
          </div>
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-center text-slate-500 mb-8">Sign in to your organization</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="you@company.com" 
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                required
              />
            </div>
            <div className="flex items-center justify-between pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500" />
                Remember me
              </label>
              <a href="#" className="text-sm font-medium text-sky-600 hover:text-sky-700">Forgot password?</a>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-sky-600 text-white font-medium py-2.5 rounded-lg hover:bg-sky-700 transition-colors shadow-sm shadow-sky-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-[44px]">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <a href="#" className="font-medium text-sky-600 hover:text-sky-700">Contact Sales</a>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-sky-100 selection:text-sky-900">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2"
          >
            <Info className="w-5 h-5 text-sky-400" />
            <span className="font-medium text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {connectionStatus === 'connected' && activeDevice ? (
          <motion.div
            key="session"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <RemoteSession device={activeDevice} onDisconnect={handleDisconnect} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col bg-slate-50 font-sans"
          >
            {/* Top Navigation Bar */}
            <header className="h-[55px] bg-white text-slate-600 flex items-center justify-between px-6 border-b border-sky-100 text-sm font-medium shrink-0 z-50">
              <div className="flex items-center h-full">
                <div className="flex items-center gap-2 text-sky-600 pr-8">
                  <Cloud className="w-6 h-6" />
                  <span className="font-bold text-xl tracking-tight">SkyAssist</span>
                </div>
                <div className="flex h-full">
                  <button onClick={() => setActiveTab('support')} className={`px-5 h-full flex items-center transition-all border-b-2 font-semibold ${activeTab === 'support' ? 'border-sky-500 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{t.support}</button>
                  <button onClick={() => setActiveTab('access')} className={`px-5 h-full flex items-center transition-all border-b-2 font-semibold ${activeTab === 'access' ? 'border-sky-500 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{t.access}</button>
                  <button onClick={() => { setActiveTab('reports'); setActiveSubTab('action-log'); }} className={`px-5 h-full flex items-center transition-all border-b-2 font-semibold ${activeTab === 'reports' ? 'border-sky-500 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{t.reports}</button>
                  <button onClick={() => { setActiveTab('settings'); setActiveSubTab('privacy'); }} className={`px-5 h-full flex items-center transition-all border-b-2 font-semibold ${activeTab === 'settings' ? 'border-sky-500 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>{t.settings}</button>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value as 'en' | 'id')}
                    className="bg-transparent text-slate-700 font-semibold text-xs border-none focus:ring-0 cursor-pointer uppercase p-0"
                  >
                    <option value="en">EN</option>
                    <option value="id">ID</option>
                  </select>
                </div>
                <button onClick={() => showToast('No new notifications')} className="text-slate-400 hover:text-sky-600 transition-colors relative">
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-sky-500 rounded-full border-2 border-white"></span>
                  </div>
                </button>
                <div className="relative border-l border-slate-200 pl-5">
                  <div 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                    className="flex items-center gap-2 cursor-pointer hover:text-sky-600 transition-colors group"
                  >
                      <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold group-hover:bg-sky-200 transition-colors">A</div>
                      <span className="font-semibold text-slate-700 group-hover:text-sky-600 transition-colors">Arya</span>
                  </div>
                  <AnimatePresence>
                    {isProfileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 text-slate-800"
                        >
                          <div className="px-4 py-2 border-b border-slate-100 mb-2">
                            <p className="font-semibold text-slate-800">Arya Stark</p>
                            <p className="text-xs text-slate-500 truncate">arya@company.com</p>
                          </div>
                          <button onClick={() => { setIsProfileMenuOpen(false); showToast('Profile opened'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors text-slate-700">
                            Your Profile
                          </button>
                          <button onClick={() => { setIsProfileMenuOpen(false); showToast('Billing opened'); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors text-slate-700">
                            Billing
                          </button>
                          <div className="h-px bg-slate-100 my-2" />
                          <button 
                            onClick={() => { 
                              setIsProfileMenuOpen(false); 
                              setIsAuthenticated(false);
                              setLoginEmail('');
                              setLoginPassword('');
                            }} 
                            className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors text-red-600 font-medium"
                          >
                            Sign Out
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </header>

            <div className="flex flex-1 h-[calc(100vh-50px)] overflow-hidden">
              {/* Primary Icon Sidebar */}
              <aside className="w-[80px] bg-white border-r border-sky-100 flex-col items-center py-4 gap-6 shrink-0 z-40 flex">
                <button onClick={() => setIsSearchOpen(true)} className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors">
                  <Search className="w-5 h-5" />
                  <span className="text-[10px] mt-1 font-medium">{t.search}</span>
                </button>
                <button onClick={() => setActiveTab('organization')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'organization' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight">{t.org}</span>
                </button>
                <button onClick={() => setActiveTab('general')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'general' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <SettingsIcon className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight">{t.general}</span>
                </button>
                <button onClick={() => setActiveTab('support')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'support' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <MonitorSmartphone className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight">{t.support.split(' ')[0]}<br/>{t.support.split(' ').slice(1).join(' ')}</span>
                </button>
                <button onClick={() => setActiveTab('access')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'access' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <Monitor className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight">{t.access.split(' ')[0]}<br/>{t.access.split(' ').slice(1).join(' ')}</span>
                </button>
                <button onClick={() => { setActiveTab('reports'); setActiveSubTab('action-log'); }} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' || activeTab === 'reports' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight whitespace-pre-line">{t.security}</span>
                </button>
                <button onClick={() => setActiveTab('integrations')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'integrations' ? 'text-sky-600 font-semibold' : 'text-slate-500 font-medium hover:text-slate-800'}`}>
                  <Puzzle className="w-5 h-5" />
                  <span className="text-[10px] mt-1 text-center leading-tight">{t.integrations}</span>
                </button>
              </aside>

              {/* Secondary Nav Sidebar */}
              {(activeTab === 'reports' || activeTab === 'settings') && (
                <aside className="w-64 bg-slate-50 border-r border-sky-100 flex flex-col shrink-0 z-30">
                  <div className="py-2">
                    <button onClick={() => setActiveSubTab('privacy')} className={`w-full text-left px-6 py-2.5 text-sm font-medium ${activeSubTab === 'privacy' ? 'bg-sky-100 text-sky-800 border-l-4 border-sky-500' : 'text-slate-600 hover:bg-slate-100'}`}>{t.privacy}</button>
                    <button onClick={() => setActiveSubTab('action-log')} className={`w-full text-left px-6 py-2.5 text-sm font-medium ${activeSubTab === 'action-log' ? 'bg-sky-100 text-sky-800 border-l-4 border-sky-500' : 'text-slate-600 hover:bg-slate-100'}`}>
                      {t.actionLog}
                    </button>
                    <button onClick={() => setActiveSubTab('2fa')} className={`w-full text-left px-6 py-2.5 text-sm font-medium ${activeSubTab === '2fa' ? 'bg-sky-100 text-sky-800 border-l-4 border-sky-500' : 'text-slate-600 hover:bg-slate-100'}`}>{t.twoFA}</button>
                    <button onClick={() => setActiveSubTab('cleanup')} className={`w-full text-left px-6 py-2.5 text-sm font-medium ${activeSubTab === 'cleanup' ? 'bg-sky-100 text-sky-800 border-l-4 border-sky-500' : 'text-slate-600 hover:bg-slate-100'}`}>{t.cleanup}</button>
                  </div>
                </aside>
              )}
              
              <main className="flex-1 h-full overflow-y-auto relative">

                {connectionStatus === 'connecting' ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full mb-8 shadow-lg shadow-sky-500/20"
                  />
                  <h2 className="text-2xl font-bold text-slate-800 mb-3">Connecting to {activeDevice?.name}</h2>
                  <p className="text-sky-600 font-medium bg-sky-50 px-4 py-2 rounded-full text-sm">Securing remote connection channel...</p>
                </div>
              ) : (
                <div className="w-full px-8 py-8">
                  {activeTab !== 'reports' && (
                    <header className="mb-10 flex flex-row justify-between items-end gap-4">
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 mb-2 capitalize">
                          {activeTab === 'support' ? 'Overview' : activeTab}
                        </h2>
                        <p className="text-slate-500">
                          {activeTab === 'support' && 'Monitor and access your remote infrastructure.'}
                          {activeTab === 'access' && 'Manage all your connected workstations and servers.'}
                          {activeTab === 'settings' && 'Configure application preferences and security.'}
                          {activeTab === 'organization' && 'Manage your company details and support team.'}
                          {activeTab === 'general' && 'Customize your platform experience.'}
                          {activeTab === 'integrations' && 'Connect third-party tools to your workflow.'}
                        </p>
                      </div>
                      <div className="text-left md:text-right text-sm text-slate-500">
                        <p className="font-medium">Last updated: <span className="text-slate-800">Just now</span></p>
                      </div>
                    </header>
                  )}

                  {activeTab === 'support' && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      <div className="grid grid-cols-4 gap-6 mb-10">
                         <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                               <Monitor className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-slate-500 text-sm font-medium">Total Devices</p>
                               <p className="text-2xl font-bold text-slate-800">{devicesList.length}</p>
                            </div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                               <Zap className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-slate-500 text-sm font-medium">Online</p>
                               <p className="text-2xl font-bold text-slate-800">{onlineCount}</p>
                            </div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                               <Clock className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-slate-500 text-sm font-medium">Sleeping</p>
                               <p className="text-2xl font-bold text-slate-800">{sleepingCount}</p>
                            </div>
                         </div>
                         <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                               <Users className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-slate-500 text-sm font-medium">Active Sessions</p>
                               <p className="text-2xl font-bold text-slate-800">{activeSessionsCount}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex gap-8 flex-row">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">My Devices</h3>
                            <div className="flex gap-2">
                               <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-all">Add Device</button>
                            </div>
                          </div>
                          
                          {filteredDevices.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <Monitor className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                              <h3 className="text-lg font-semibold text-slate-700">No devices found</h3>
                              <p className="text-slate-500 mt-1">Try adjusting your search criteria.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-6">
                              {filteredDevices.slice(0, 6).map(device => (
                                <DeviceCard key={device.id} device={device} onConnect={handleConnect} isWaking={wakingDeviceId === device.id} />
                              ))}
                            </div>
                          )}
                          
                          {filteredDevices.length > 6 && (
                             <div className="mt-6 text-center">
                               <button onClick={() => setActiveTab('access')} className="text-sky-600 font-semibold text-sm hover:text-sky-700">View all {filteredDevices.length} devices</button>
                             </div>
                          )}
                        </div>

                        <div className="w-80 flex-shrink-0">
                          <h3 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h3>
                          <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-6">
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                              {logsList.slice(0, 5).map((log, i) => (
                                <div key={log.id} className="relative pl-6">
                                  <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ${i === 0 ? 'bg-sky-500 shadow-[0_0_0_4px_#e0f2fe]' : 'bg-slate-300'}`}></div>
                                  <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                                  <p className="text-sm text-sky-600 font-medium my-0.5">{log.device}</p>
                                  <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-slate-400">{log.time}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{log.user}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => { setActiveTab('reports'); setActiveSubTab('action-log'); }} className="w-full mt-8 py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">View All Logs</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'access' && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                       <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">All Devices ({filteredDevices.length})</h3>
                            <div className="flex gap-2">
                               <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 shadow-sm shadow-sky-600/20 transition-all">Add Device</button>
                            </div>
                       </div>
                       
                       {filteredDevices.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm text-center">
                              <Monitor className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                              <h3 className="text-lg font-semibold text-slate-700">No devices found</h3>
                              <p className="text-slate-500 mt-1">Try adjusting your search query.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-6">
                              {filteredDevices.map(device => (
                                <DeviceCard key={device.id} device={device} onConnect={handleConnect} isWaking={wakingDeviceId === device.id} />
                              ))}
                            </div>
                        )}
                    </motion.div>
                  )}

                  {activeTab === 'organization' && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-4xl">
                      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-sky-500" />
                          Organization Profile
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                            <input type="text" defaultValue="Acme Corp" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                            <input type="email" defaultValue="support@acme.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                              <option>UTC-08:00 Pacific Time</option>
                              <option>UTC-05:00 Eastern Time</option>
                              <option>UTC+00:00 London</option>
                              <option>UTC+07:00 Jakarta</option>
                            </select>
                          </div>
                          <button onClick={() => showToast('Settings saved successfully')} className="px-5 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors">Save Changes</button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'general' && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-4xl">
                      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <SettingsIcon className="w-5 h-5 text-sky-500" />
                          General Preferences
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                            <div>
                              <p className="font-semibold text-slate-800">Theme</p>
                              <p className="text-sm text-slate-500 mt-1">Choose your preferred visual style.</p>
                            </div>
                            <select className="border border-slate-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500">
                              <option>Light Mode</option>
                              <option>Dark Mode</option>
                              <option>System Default</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                            <div>
                              <p className="font-semibold text-slate-800">Desktop Notifications</p>
                              <p className="text-sm text-slate-500 mt-1">Receive alerts for incoming support requests.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'integrations' && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="max-w-4xl">
                      <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-8">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                          <Puzzle className="w-5 h-5 text-sky-500" />
                          Connected Apps
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xl">J</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">Jira Service Desk</h4>
                              <p className="text-xs text-slate-500 mt-1 mb-3">Sync support tickets directly to remote sessions.</p>
                              <button onClick={() => showToast('Jira configuration coming soon')} className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors">Configure</button>
                            </div>
                          </div>
                          <div className="border border-slate-200 rounded-xl p-5 flex items-start gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center font-bold text-xl">S</div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">Slack</h4>
                              <p className="text-xs text-slate-500 mt-1 mb-3">Receive notifications for connection events.</p>
                              <button onClick={() => showToast('Slack integration settings opened')} className="text-xs font-semibold px-3 py-1.5 bg-sky-50 text-sky-600 rounded hover:bg-sky-100 transition-colors">Connected</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(activeTab === 'reports' || activeTab === 'settings') && (
                    <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                      {activeSubTab === 'action-log' && (
                        <>
                          <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center gap-4 shadow-sm mb-6 -mx-8 -mt-8">
                            <select className="border border-slate-300 text-sm rounded px-3 py-1.5 text-slate-600 min-w-[140px] focus:outline-none">
                              <option>All Technicians</option>
                            </select>
                            <select className="border border-slate-300 text-sm rounded px-3 py-1.5 text-slate-600 min-w-[120px] focus:outline-none">
                              <option>All Levels</option>
                            </select>
                            <select className="border border-slate-300 text-sm rounded px-3 py-1.5 text-slate-600 min-w-[140px] focus:outline-none">
                              <option>All Modules</option>
                            </select>
                            <select className="border border-slate-300 text-sm rounded px-3 py-1.5 text-slate-600 min-w-[140px] focus:outline-none">
                              <option>Last 7 days</option>
                            </select>
                            <button onClick={() => showToast('Filters applied')} className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-1.5 rounded text-sm font-medium transition-colors">Submit</button>
                            <div className="ml-auto flex items-center">
                              <button onClick={() => showToast('Advanced settings opened')} className="text-sky-600 text-sm flex items-center gap-1 font-medium hover:text-sky-700">
                                <SettingsIcon className="w-4 h-4" /> Settings
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-4 mb-6">
                            <div className="bg-white p-4 flex items-center gap-4 min-w-[200px] border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-t-2 border-t-[#619cdd]">
                              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center">
                                <Sigma className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider">ALL</p>
                                <p className="text-2xl font-light text-slate-700">{logsList.length}</p>
                              </div>
                            </div>
                            <div className="bg-white p-4 flex items-center gap-4 min-w-[200px] border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                              <div className="w-10 h-10 rounded-full border-2 border-sky-500 text-sky-500 flex items-center justify-center">
                                <Info className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider">INFO</p>
                                <p className="text-2xl font-light text-slate-700">8</p>
                              </div>
                            </div>
                            <div className="bg-white p-4 flex items-center gap-4 min-w-[200px] border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                              <div className="w-10 h-10 rounded-full border-2 border-amber-500 text-amber-500 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider">WARNING</p>
                                <p className="text-2xl font-light text-slate-700">2</p>
                              </div>
                            </div>
                            <div className="bg-white p-4 flex items-center gap-4 min-w-[200px] border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                              <div className="w-10 h-10 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center">
                                <XCircle className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider">ERROR</p>
                                <p className="text-2xl font-light text-slate-700">0</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50">
                              <span className="text-sm text-slate-600 font-medium">Displaying {logsList.length} out of {logsList.length} records</span>
                              <div className="flex gap-4">
                                <button onClick={() => setIsSearchOpen(true)} className="text-sky-600 text-sm flex items-center gap-1 font-medium hover:text-sky-700"><Search className="w-4 h-4"/> Search</button>
                                <button onClick={() => showToast('Logs exported to CSV')} className="text-slate-500 text-sm flex items-center gap-1 font-medium hover:text-slate-700"><Download className="w-4 h-4"/> Export to CSV</button>
                              </div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[13px]">
                                 <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                   <tr>
                                     <th className="px-4 py-3 font-semibold w-12 text-center">Type</th>
                                     <th className="px-4 py-3 font-semibold">Time <span className="text-[10px]">▼</span></th>
                                     <th className="px-4 py-3 font-semibold">Module</th>
                                     <th className="px-4 py-3 font-semibold">User Name</th>
                                     <th className="px-4 py-3 font-semibold">Remarks</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                   {logsList.map((log, index) => (
                                     <tr key={log.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                                       <td className="px-4 py-3 text-center">
                                          {index % 3 === 0 ? <Info className="w-4 h-4 text-sky-400 mx-auto inline" /> : <AlertCircle className="w-4 h-4 text-amber-400 mx-auto inline" />}
                                       </td>
                                       <td className="px-4 py-3 text-slate-700">{log.time}</td>
                                       <td className="px-4 py-3 text-slate-700">Settings</td>
                                       <td className="px-4 py-3 text-slate-700">{log.user}</td>
                                       <td className="px-4 py-3 text-slate-700">{log.action} {log.device}</td>
                                     </tr>
                                   ))}
                                 </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}

                      {activeSubTab === 'privacy' && (
                        <div className="bg-white shadow-sm border border-slate-200 max-w-3xl">
                          <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-medium text-slate-800">Privacy Settings</h3>
                            <p className="text-sm text-slate-500 mt-1">Configure data collection and privacy preferences for remote sessions.</p>
                          </div>
                          <div className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-700 text-sm">Session Recording</p>
                                <p className="text-xs text-slate-500 mt-1">Allow administrators to record remote support sessions.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                              <div>
                                <p className="font-semibold text-slate-700 text-sm">End-User Consent</p>
                                <p className="text-xs text-slate-500 mt-1">Require explicit consent before initiating a remote session.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>
                            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                              <div>
                                <p className="font-semibold text-slate-700 text-sm">Anonymize Usage Data</p>
                                <p className="text-xs text-slate-500 mt-1">Remove personally identifiable information from analytics.</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSubTab === '2fa' && (
                        <div className="bg-white shadow-sm border border-slate-200 max-w-3xl">
                          <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-medium text-slate-800">Two-factor Authentication</h3>
                            <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your organization's accounts.</p>
                          </div>
                          <div className="p-6">
                            <div className="bg-sky-50 text-sky-800 p-4 rounded-lg mb-6 text-sm border border-sky-100">
                              Two-factor authentication is currently <strong>enabled</strong> for your account.
                            </div>
                            
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-slate-700 text-sm">Enforce 2FA for all technicians</p>
                                  <p className="text-xs text-slate-500 mt-1">Require all users in the organization to set up 2FA.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} />
                                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                </label>
                              </div>
                              <div className="pt-6 border-t border-slate-100">
                                <h4 className="font-semibold text-slate-700 text-sm mb-4">Authentication Methods</h4>
                                <div className="space-y-3">
                                  <label className="flex items-center gap-3">
                                    <input type="radio" name="2fa-method" className="text-sky-500" defaultChecked />
                                    <span className="text-sm text-slate-600">Authenticator App (Recommended)</span>
                                  </label>
                                  <label className="flex items-center gap-3">
                                    <input type="radio" name="2fa-method" className="text-sky-500" />
                                    <span className="text-sm text-slate-600">SMS / Text Message</span>
                                  </label>
                                  <label className="flex items-center gap-3">
                                    <input type="radio" name="2fa-method" className="text-sky-500" />
                                    <span className="text-sm text-slate-600">Email OTP</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeSubTab === 'cleanup' && (
                        <div className="bg-white shadow-sm border border-slate-200 max-w-3xl">
                          <div className="px-6 py-4 border-b border-slate-200">
                            <h3 className="text-lg font-medium text-slate-800">Data Cleanup</h3>
                            <p className="text-sm text-slate-500 mt-1">Manage data retention policies and manually clear stored information.</p>
                          </div>
                          <div className="p-6 space-y-6">
                            <div>
                              <p className="font-semibold text-slate-700 text-sm mb-2">Session Data Retention</p>
                              <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-sky-300 text-slate-700 w-full max-w-xs">
                                <option>Keep indefinitely</option>
                                <option>Delete after 30 days</option>
                                <option>Delete after 90 days</option>
                                <option>Delete after 1 year</option>
                              </select>
                            </div>
                            
                            <div className="pt-6 border-t border-slate-100">
                              <p className="font-semibold text-slate-700 text-sm mb-2">Action Logs Retention</p>
                              <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-sky-300 text-slate-700 w-full max-w-xs">
                                <option>Keep indefinitely</option>
                                <option>Delete after 30 days</option>
                                <option>Delete after 90 days</option>
                                <option>Delete after 1 year</option>
                              </select>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                              <h4 className="font-semibold text-slate-700 text-sm mb-4">Manual Cleanup</h4>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">Clear Session History</p>
                                    <p className="text-xs text-slate-500">Deletes all recorded session data immediately.</p>
                                  </div>
                                  <button onClick={() => { setLogsList([]); showToast('Data cleared'); }} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition-colors">Clear Data</button>
                                </div>
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                                  <div>
                                    <p className="text-sm font-medium text-slate-800">Clear Action Logs</p>
                                    <p className="text-xs text-slate-500">Deletes all action logs and audit trails.</p>
                                  </div>
                                  <button onClick={() => { setLogsList([]); showToast('Logs cleared'); }} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded hover:bg-red-100 transition-colors">Clear Logs</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                </div>
              )}
            </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isAddModalOpen && <AddDeviceModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddDevice} />}
      
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div 
              initial={{ y: -20, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              exit={{ y: -20, opacity: 0, scale: 0.95 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center px-4 py-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder={t.search + "..."}
                  className="flex-1 text-lg font-medium text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0"
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-2">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 py-6 bg-slate-50/50">
                <p className="text-sm text-center font-medium text-slate-500 py-8">Start typing to search across devices, users, and logs.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
