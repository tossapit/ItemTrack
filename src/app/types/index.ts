export interface ResourceData {
    name: string;
    total: number;
    available: number;
    inUse: number;
  }
  
  export interface RecentActivity {
    id: number;
    type: 'check-in' | 'check-out';
    item: string;
    time: string;
    user: string;
  }
  
  export interface Alert {
    id: number;
    item: string;
    current: number;
    threshold: number;
  }