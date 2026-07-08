export interface Device {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'server';
  os: 'windows' | 'mac' | 'linux';
  status: 'online' | 'offline' | 'sleeping';
  ip: string;
  lastSeen: string;
  cpu: number;
  ram: number;
  networkSpeed: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  device: string;
  time: string;
  user: string;
}

