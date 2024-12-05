import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ResourceData, RecentActivity, Alert } from '../types';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Mock Data
  private mockResourceData: ResourceData[] = [
    { name: 'Vehicles', total: 50, available: 35, inUse: 15 },
    { name: 'Equipment', total: 120, available: 80, inUse: 40 },
    { name: 'Tour Guides', total: 30, available: 22, inUse: 8 },
    { name: 'Hotel Rooms', total: 200, available: 150, inUse: 50 }
  ];

  private mockActivities: RecentActivity[] = [
    {
      id: 1,
      type: 'check-out',
      item: 'Tour Bus #103',
      time: '2 minutes ago',
      user: 'John Smith'
    },
    {
      id: 2,
      type: 'check-in',
      item: 'Camera Kit #15',
      time: '15 minutes ago',
      user: 'Sarah Wilson'
    }
  ];

  private mockAlerts: Alert[] = [
    { id: 1, item: 'First Aid Kits', current: 5, threshold: 10 },
    { id: 2, item: 'Tour Buses', current: 2, threshold: 5 }
  ];

  constructor(private http: HttpClient) {}

  getResourceStats(): Observable<ResourceData[]> {
    return of(this.mockResourceData);  // ส่งคืน mock data แทน HTTP request
  }

  getLowStockAlerts(): Observable<Alert[]> {
    return of(this.mockAlerts);
  }

  getRecentActivities(): Observable<RecentActivity[]> {
    return of(this.mockActivities);
  }
}