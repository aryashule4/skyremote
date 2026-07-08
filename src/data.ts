import { Device, ActivityLog } from './types';

export const devices: Device[] = [
  {
    id: 'dev-1',
    name: 'Workstation Alpha',
    type: 'desktop',
    os: 'windows',
    status: 'online',
    ip: '192.168.1.104',
    lastSeen: 'Just now',
    cpu: 12,
    ram: 45,
    networkSpeed: '124 Mbps'
  },
  {
    id: 'dev-2',
    name: 'MacBook Pro 16"',
    type: 'laptop',
    os: 'mac',
    status: 'online',
    ip: '192.168.1.112',
    lastSeen: 'Just now',
    cpu: 8,
    ram: 60,
    networkSpeed: '85 Mbps'
  },
  {
    id: 'dev-3',
    name: 'Home Server',
    type: 'server',
    os: 'linux',
    status: 'offline',
    ip: '192.168.1.200',
    lastSeen: '2 hours ago',
    cpu: 0,
    ram: 0,
    networkSpeed: '0 Mbps'
  },
  {
    id: 'dev-4',
    name: 'Design Studio PC',
    type: 'desktop',
    os: 'windows',
    status: 'sleeping',
    ip: '10.0.0.45',
    lastSeen: '15 mins ago',
    cpu: 2,
    ram: 20,
    networkSpeed: '5 Mbps'
  }
];

export const activityLogs: ActivityLog[] = [
  { id: 1, action: 'Connected to', device: 'Workstation Alpha', time: '10:45 AM', user: 'Arya' },
  { id: 2, action: 'File Transfer (2.4GB)', device: 'Home Server', time: '09:12 AM', user: 'System' },
  { id: 3, action: 'System Update', device: 'MacBook Pro 16"', time: 'Yesterday', user: 'System' },
  { id: 4, action: 'Disconnected from', device: 'Design Studio PC', time: 'Yesterday', user: 'Arya' },
];
