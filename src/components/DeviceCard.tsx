import { Monitor, Server, Laptop, ChevronRight, Wifi, WifiOff, Moon, HardDrive, Cpu, Activity, Loader2 } from 'lucide-react';
import { Device } from '../types';

interface Props {
  key?: string | number;
  device: Device;
  onConnect: (device: Device) => void;
  isWaking?: boolean;
}

export default function DeviceCard({ device, onConnect, isWaking }: Props) {
  const isOnline = device.status === 'online';
  const isSleeping = device.status === 'sleeping';
  
  const Icon = device.type === 'desktop' ? Monitor : device.type === 'laptop' ? Laptop : Server;

  const statusColor = isOnline ? 'bg-emerald-50 text-emerald-600' : isSleeping ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500';
  const statusIcon = isOnline ? <Wifi className="w-3 h-3" /> : isSleeping ? <Moon className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />;

  return (
    <div className="bg-white rounded-2xl p-5 border border-sky-100 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group flex flex-col justify-between h-[280px]">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${isOnline ? 'bg-sky-50 text-sky-500 group-hover:bg-sky-100' : 'bg-slate-50 text-slate-400'} transition-colors`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
            {statusIcon}
            <span className="capitalize">{device.status}</span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-800 text-lg truncate" title={device.name}>{device.name}</h3>
          <p className="text-slate-500 text-sm font-medium mt-0.5">{device.ip} • {device.os.toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            <Cpu className="w-3.5 h-3.5 text-sky-500" />
            <span>{device.cpu}% CPU</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
            <HardDrive className="w-3.5 h-3.5 text-sky-500" />
            <span>{device.ram}% RAM</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg col-span-2">
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>{device.networkSpeed}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onConnect(device)}
        disabled={device.status === 'offline' || isWaking}
        className={`w-full py-2.5 mt-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
          isOnline
            ? 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white hover:shadow-md hover:shadow-sky-500/20'
            : isSleeping 
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'bg-slate-50 text-slate-400 cursor-not-allowed'
        }`}
      >
        {isWaking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Waking up...
          </>
        ) : isSleeping ? (
          <>
            Wake & Connect
            <ChevronRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Connect
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
