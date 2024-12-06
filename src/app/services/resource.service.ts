import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Resource } from '../types';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  // TODO: ย้ายไปเป็น environment variable เมื่อมี backend จริง
  private apiUrl = 'http://localhost:3000/api/resources';

  // Mock data - จะถูกแทนที่ด้วย MongoDB ในอนาคต
  private mockResources: Resource[] = [
    {
      id: '1',
      name: 'Tour Bus A1',
      type: 'Vehicle',
      totalQuantity: 5,
      availableQuantity: 3,
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'Camera Set Pro',
      type: 'Equipment',
      totalQuantity: 10,
      availableQuantity: 7,
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: '3',
      name: 'Tour Guide Equipment',
      type: 'Equipment',
      totalQuantity: 15,
      availableQuantity: 12,
      status: 'maintenance',
      lastUpdated: new Date(),
    },
    // เพิ่ม mock data ตามต้องการ
  ];

  constructor(private http: HttpClient) {}

  getResources(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
    sortField?: keyof Resource;
    sortDirection?: 'asc' | 'desc';
  }): Observable<{ resources: Resource[]; total: number }> {
    // TODO: เปลี่ยนเป็น HTTP request เมื่อมี backend
    let filtered = [...this.mockResources];

    // จำลองการค้นหา
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(search) ||
          resource.type.toLowerCase().includes(search)
      );
    }

    // จำลองการกรอง type
    if (params?.type) {
      filtered = filtered.filter((resource) => resource.type === params.type);
    }

    // จำลองการกรอง status
    if (params?.status) {
      filtered = filtered.filter(
        (resource) => resource.status === params.status
      );
    }

    // จำลองการเรียงลำดับ
    if (params?.sortField) {
      filtered.sort((a, b) => {
        const aValue = a[params.sortField as keyof Resource];
        const bValue = b[params.sortField as keyof Resource];
        const direction = params.sortDirection === 'desc' ? -1 : 1;

        if (aValue && bValue) {
          if (aValue > bValue) return direction;
          if (aValue < bValue) return -direction;
        }
        return 0;
      });
    }

    // จำลองการแบ่งหน้า
    const start = ((params?.page || 1) - 1) * (params?.limit || 10);
    const paged = filtered.slice(start, start + (params?.limit || 10));

    return of({
      resources: paged,
      total: filtered.length,
    });
  }

  // GET: ดึงทรัพยากรตาม ID
  getResourceById(id: string): Observable<Resource> {
    // TODO: เปลี่ยนเป็น HTTP request
    const resource = this.mockResources.find((r) => r.id === id);
    if (!resource) {
      throw new Error('Resource not found');
    }
    return of(resource);
  }

  // POST: เพิ่มทรัพยากรใหม่
  addResource(
    resource: Omit<Resource, 'id' | 'lastUpdated'>
  ): Observable<Resource> {
    // TODO: เปลี่ยนเป็น HTTP POST request
    const newResource = {
      ...resource,
      id: Date.now().toString(),
      lastUpdated: new Date(),
    };
    this.mockResources.push(newResource);
    return of(newResource);
  }

  // PUT: อัพเดททรัพยากร
  updateResource(
    id: string,
    resource: Partial<Resource>
  ): Observable<Resource> {
    // TODO: เปลี่ยนเป็น HTTP PUT request
    const index = this.mockResources.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Resource not found');
    }

    this.mockResources[index] = {
      ...this.mockResources[index],
      ...resource,
      lastUpdated: new Date(),
    };

    return of(this.mockResources[index]);
  }

  // DELETE: ลบทรัพยากร
  deleteResource(id: string): Observable<void> {
    // TODO: เปลี่ยนเป็น HTTP DELETE request
    const index = this.mockResources.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Resource not found');
    }

    this.mockResources.splice(index, 1);
    return of(void 0);
  }
}
