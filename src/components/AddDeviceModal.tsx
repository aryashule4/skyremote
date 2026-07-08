
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { Device } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (device: Omit<Device, 'id' | 'lastSeen' | 'cpu' | 'ram' | 'networkSpeed'>) => void;
}

export default function AddDeviceModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'desktop' | 'laptop' | 'server'>('desktop');
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [ip, setIp] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onAdd({ name, type, os, ip, status: 'online' });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Add New Device</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Studio Mac" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-slate-700" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">IP Address</label>
            <input required type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="e.g. 192.168.1.50" className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-slate-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Device Type</label>
              <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-slate-700">
                <option value="desktop">Desktop</option>
                <option value="laptop">Laptop</option>
                <option value="server">Server</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Operating System</label>
              <select value={os} onChange={e => setOs(e.target.value as any)} className="w-full bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 transition-all text-slate-700">
                <option value="windows">Windows</option>
                <option value="mac">macOS</option>
                <option value="linux">Linux</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm shadow-sky-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[110px]">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
