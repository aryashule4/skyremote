import { Monitor, X, Maximize, Settings, SignalHigh, Keyboard, MousePointer2, FolderOpen, Video, Wifi, Terminal, Activity, FileUp, FileDown, CheckCircle2, Send } from 'lucide-react';
import { Device } from '../types';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  device: Device;
  onDisconnect: () => void;
}

export default function RemoteSession({ device, onDisconnect }: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [activePanel, setActivePanel] = useState<'none' | 'files' | 'display'>('none');
  const [keyboardActive, setKeyboardActive] = useState(true);
  const [mouseActive, setMouseActive] = useState(true);
  const [notification, setNotification] = useState('');

  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'input', text: `systemctl status remote-desktop` },
    { type: 'output', text: `● remote-desktop.service - Remote Desktop Protocol Server\n   Loaded: loaded (/lib/systemd/system/remote-desktop.service; enabled; vendor preset: enabled)\n   Active: active (running) since ${new Date().toLocaleTimeString()}\n Main PID: 14592 (rdp-server)\n    Tasks: 14 (limit: 18882)` }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const newHistory = [...terminalHistory, { type: 'input', text: terminalInput }];
    setTerminalHistory(newHistory);
    setTerminalInput('');

    setTimeout(() => {
      let response = `bash: ${terminalInput}: command not found`;
      if (terminalInput === 'ls') response = 'Desktop\nDocuments\nDownloads\nPictures\nPublic\nTemplates\nVideos';
      if (terminalInput === 'pwd') response = `/home/user`;
      if (terminalInput === 'whoami') response = `user`;
      if (terminalInput === 'ping google.com') response = `PING google.com (142.250.190.46) 56(84) bytes of data.\n64 bytes from 142.250.190.46: icmp_seq=1 ttl=117 time=14.2 ms`;
      if (terminalInput === 'clear') {
        setTerminalHistory([]);
        return;
      }
      
      setTerminalHistory([...newHistory, { type: 'output', text: response }]);
    }, 400);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col font-sans">
      {/* Top Floating Bar */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl px-2 py-1.5 flex items-center gap-1 z-50"
      >
        <div className="px-3 py-1 flex items-center gap-2 border-r border-slate-200">
           <Monitor className="w-4 h-4 text-sky-600" />
           <span className="text-sm font-semibold text-slate-800">{device.name}</span>
           <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
        </div>
        
        <div className="flex items-center px-1">
          <button 
            onClick={() => setKeyboardActive(!keyboardActive)}
            className={`p-2 rounded-xl transition-colors ${keyboardActive ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'}`} 
            title="Toggle Keyboard"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setMouseActive(!mouseActive)}
            className={`p-2 rounded-xl transition-colors ${mouseActive ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'}`} 
            title="Toggle Mouse"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActivePanel(activePanel === 'files' ? 'none' : 'files')}
            className={`p-2 rounded-xl transition-colors ${activePanel === 'files' ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'}`} 
            title="File Transfer"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActivePanel(activePanel === 'display' ? 'none' : 'display')}
            className={`p-2 rounded-xl transition-colors ${activePanel === 'display' ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'}`} 
            title="Display Settings"
          >
            <Video className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded-xl transition-colors ${showStats ? 'bg-sky-100 text-sky-700' : 'hover:bg-sky-50 text-slate-600 hover:text-sky-600'}`}
            onClick={() => setShowStats(!showStats)} 
            title="Session Stats"
          >
            <Activity className="w-4 h-4" />
          </button>
        </div>

        <div className="px-2 border-l border-slate-200 flex items-center gap-1">
          <button
            className="p-2 hover:bg-sky-50 text-slate-600 hover:text-sky-600 rounded-xl transition-colors"
            onClick={toggleFullscreen}
            title="Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={onDisconnect}
            className="px-3 py-1.5 ml-1 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            End
          </button>
        </div>
      </motion.div>

      {/* Simulated Desktop Area */}
      <div className="flex-1 bg-slate-800 relative overflow-hidden flex items-center justify-center">
        {/* Remote Desktop Background */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop")' }}></div>

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-slate-700 z-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fake Window Content */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 20 }}
          className="w-full max-w-5xl h-[700px] max-h-[85vh] bg-white/95 backdrop-blur rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/20 z-10"
        >
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 justify-between shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="font-semibold text-xs text-slate-500 flex items-center gap-2">
                    <Terminal className="w-3 h-3" />
                    bash - {device.name}
                </div>
                <div className="w-10"></div>
            </div>
            <div className="flex-1 p-6 font-mono text-[13px] text-slate-700 flex flex-col gap-2 bg-slate-50 overflow-y-auto">
                <p className="text-emerald-600 font-semibold mb-2">Login successful from {device.ip}</p>
                
                {terminalHistory.map((item, index) => (
                  <div key={index} className="mb-2">
                    {item.type === 'input' && (
                      <div className="flex">
                        <span className="mr-2 text-sky-700">{`user@${device.name.replace(/\s+/g, '-').toLowerCase()}:~$`}</span>
                        <span className="text-slate-800">{item.text}</span>
                      </div>
                    )}
                    {item.type === 'output' && (
                      <div className="whitespace-pre-wrap text-slate-600 mt-1">{item.text}</div>
                    )}
                  </div>
                ))}
                
                <form onSubmit={handleTerminalSubmit} className="mt-2 flex items-center">
                    <span className="mr-2 text-sky-700 shrink-0">{`user@${device.name.replace(/\s+/g, '-').toLowerCase()}:~$`}</span>
                    <input 
                      type="text" 
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      autoFocus
                      className="bg-transparent border-none outline-none flex-1 text-slate-800 w-full"
                      placeholder="Type a command (e.g., ls, pwd, ping google.com, clear)"
                    />
                </form>
                <div ref={terminalEndRef} />
            </div>
        </motion.div>

        {/* Side Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className="absolute right-6 top-24 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-4 text-slate-200 shadow-2xl z-20"
            >
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <SignalHigh className="w-3.5 h-3.5" />
                Connection Stats
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Latency</span>
                    <span className="text-emerald-400 font-mono">14ms</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[15%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Bandwidth</span>
                    <span className="text-sky-400 font-mono">2.4 MB/s</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 w-[45%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Framerate</span>
                    <span className="text-amber-400 font-mono">60 FPS</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[95%]"></div>
                  </div>
                </div>
                
                <div className="pt-3 mt-3 border-t border-slate-700/50 text-[10px] text-slate-500 font-mono">
                  <p>Protocol: RDP (Secure)</p>
                  <p>Resolution: 2560x1440</p>
                  <p>Encryption: AES-256-GCM</p>
                </div>
              </div>
            </motion.div>
          )}

          {activePanel === 'files' && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute left-6 top-24 w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-5 text-slate-200 shadow-2xl z-20"
            >
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-sky-400" />
                File Transfer
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    showNotification('Initiating file upload dialog...');
                    setActivePanel('none');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors group"
                >
                  <div className="w-10 h-10 bg-slate-700 group-hover:bg-sky-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FileUp className="w-5 h-5 text-sky-400" />
                  </div>
                  <span className="text-sm font-medium">Upload to Device</span>
                </button>
                <button 
                  onClick={() => {
                    showNotification('Requesting files from remote device...');
                    setActivePanel('none');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors group"
                >
                  <div className="w-10 h-10 bg-slate-700 group-hover:bg-emerald-500/20 rounded-full flex items-center justify-center transition-colors">
                    <FileDown className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm font-medium">Download from Device</span>
                </button>
              </div>
            </motion.div>
          )}

          {activePanel === 'display' && (
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className="absolute left-6 top-24 w-72 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-5 text-slate-200 shadow-2xl z-20"
            >
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-sky-400" />
                Display Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Resolution</label>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500">
                    <option>Native (2560x1440)</option>
                    <option>1920x1080</option>
                    <option>1280x720</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Quality</label>
                  <select className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500">
                    <option>High (60 FPS)</option>
                    <option>Balanced (30 FPS)</option>
                    <option>Low (Data Saver)</option>
                  </select>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      showNotification('Display settings applied successfully.');
                      setActivePanel('none');
                    }} 
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Apply Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
