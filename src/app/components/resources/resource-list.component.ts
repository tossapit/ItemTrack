import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ResourceService } from '../../services/resource.service';
import { Resource } from '../../types';
import { ErrorMessageComponent } from '../error-message/error-message.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-resource-list',
  styleUrls: ['./resource-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="container mx-auto p-6">
      <!-- Error Message -->
      <app-error-message
        *ngIf="error"
        [message]="error"
        [showRetry]="true"
        (onRetry)="loadResources()"
      ></app-error-message>

      <!-- Loading Spinner -->
      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <!-- Header Section -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 fade-in">
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0"
        >
          <div>
            <h1 class="text-2xl font-bold text-indigo-700 tracking-tight">
              Resource Management
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage and track your travel resources inventory
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <!-- PDF Button -->
            <button
              (click)="exportToPDF()"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors hover-scale"
            >
              <svg
                class="w-3.5 h-3.5 mr-1.5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              PDF
            </button>

            <!-- Excel Button -->
            <button
              (click)="exportToExcel()"
              class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors hover-scale"
            >
              <svg
                class="w-3.5 h-3.5 mr-1.5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              Excel
            </button>

            <!-- Add Button -->
            <button
              (click)="navigateToAdd()"
              class="inline-flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors hover-scale"
            >
              <svg
                class="w-3.5 h-3.5 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm p-4 mb-4 fade-in">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none"
              >
                <svg
                  class="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                [formControl]="searchControl"
                type="text"
                class="block w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Search resources..."
              />
            </div>
          </div>

          <!-- Type Filter -->
          <div>
            <select
              [(ngModel)]="selectedType"
              (change)="filterResources()"
              class="block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option *ngFor="let type of resourceTypes" [value]="type">
                {{ type }}
              </option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterResources()"
              class="block w-full pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option *ngFor="let status of statusOptions" [value]="status">
                {{ status }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Basic Search and Filter Section -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search Input -->
          <div>
            <input
              [formControl]="searchControl"
              type="text"
              placeholder="Search resources..."
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <!-- Type Filter -->
          <div>
            <select
              [(ngModel)]="selectedType"
              (change)="filterResources()"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option *ngFor="let type of resourceTypes" [value]="type">
                {{ type }}
              </option>
            </select>
          </div>
          <!-- Status Filter -->
          <div>
            <select
              [(ngModel)]="selectedStatus"
              (change)="filterResources()"
              class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option *ngFor="let status of statusOptions" [value]="status">
                {{ status }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="bg-white p-4 rounded-lg shadow mb-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Min Quantity</label
            >
            <input
              type="number"
              [(ngModel)]="advancedFilters.minQuantity"
              class="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Max Quantity</label
            >
            <input
              type="number"
              [(ngModel)]="advancedFilters.maxQuantity"
              class="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Date From</label
            >
            <input
              type="date"
              [(ngModel)]="advancedFilters.dateFrom"
              class="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Date To</label
            >
            <input
              type="date"
              [(ngModel)]="advancedFilters.dateTo"
              class="mt-1 w-full rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <!-- Resource Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                (click)="sortResources('name')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Name
                <span *ngIf="sortField === 'name'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                (click)="sortResources('type')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Type
                <span *ngIf="sortField === 'type'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                (click)="sortResources('totalQuantity')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Total Quantity
                <span *ngIf="sortField === 'totalQuantity'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                (click)="sortResources('availableQuantity')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Available
                <span *ngIf="sortField === 'availableQuantity'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                (click)="sortResources('status')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Status
                <span *ngIf="sortField === 'status'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                (click)="sortResources('lastUpdated')"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Last Updated
                <span *ngIf="sortField === 'lastUpdated'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let resource of resources">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ resource.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ resource.type }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ resource.totalQuantity }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ resource.availableQuantity }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  [ngClass]="{
                    'px-2 py-1 text-xs font-medium rounded-full': true,
                    'bg-green-100 text-green-800':
                      resource.status === 'available',
                    'bg-yellow-100 text-yellow-800':
                      resource.status === 'maintenance',
                    'bg-red-100 text-red-800': resource.status === 'unavailable'
                  }"
                >
                  {{ resource.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ resource.lastUpdated | date : 'short' }}
                </div>
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
              >
                <button
                  (click)="editResource(resource)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  (click)="deleteResource(resource)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Table Section -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden fade-in">
          <!-- Table Header -->
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              Resources List
            </h3>
          </div>

          <!-- Table Content -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <!-- ... table content คงเดิม ... -->
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1 flex justify-between sm:hidden">
                <button
                  [disabled]="currentPage === 1"
                  (click)="changePage(currentPage - 1)"
                  class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  [disabled]="currentPage * itemsPerPage >= totalItems"
                  (click)="changePage(currentPage + 1)"
                  class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div
                class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p class="text-sm text-gray-700">
                    Showing
                    <span class="font-medium">{{
                      (currentPage - 1) * itemsPerPage + 1
                    }}</span>
                    to
                    <span class="font-medium">{{
                      Math.min(currentPage * itemsPerPage, totalItems)
                    }}</span>
                    of
                    <span class="font-medium">{{ totalItems }}</span>
                    results
                  </p>
                </div>
                <div>
                  <nav
                    class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      [disabled]="currentPage === 1"
                      (click)="changePage(currentPage - 1)"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Previous</span>
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15 19l-7-7 7-7"></path>
                      </svg>
                    </button>
                    <button
                      [disabled]="currentPage * itemsPerPage >= totalItems"
                      (click)="changePage(currentPage + 1)"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span class="sr-only">Next</span>
                      <svg
                        class="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ResourceListComponent implements OnInit {
  resources: Resource[] = [];
  isLoading = false;
  error: string | null = null;
  searchControl = new FormControl('');
  selectedType = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  sortField: keyof Resource | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math;

  resourceTypes = ['Vehicle', 'Equipment', 'Staff', 'Facility'];
  statusOptions = ['available', 'maintenance', 'unavailable'];

  advancedFilters = {
    minQuantity: null as number | null,
    maxQuantity: null as number | null,
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  };

  constructor(private resourceService: ResourceService) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.loadResources();
      });

    this.loadResources();
  }

  loadResources() {
    this.isLoading = true;
    this.error = null;

    this.resourceService
      .getResources({
        page: this.currentPage,
        limit: this.itemsPerPage,
        search: this.searchControl.value || undefined,
        type: this.selectedType || undefined,
        status: this.selectedStatus || undefined,
        sortField: this.sortField || undefined,
        sortDirection: this.sortDirection,
      })
      .subscribe({
        next: (response) => {
          this.resources = response.resources;
          this.totalItems = response.total;
        },
        error: (err) => {
          this.error = 'Failed to load resources. Please try again.';
          console.error('Error loading resources:', err);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  filterResources() {
    this.currentPage = 1;
    this.loadResources();
  }

  sortResources(field: keyof Resource) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadResources();
  }

  changePage(newPage: number) {
    this.currentPage = newPage;
    this.loadResources();
  }

  deleteResource(resource: Resource) {
    if (confirm(`Are you sure you want to delete ${resource.name}?`)) {
      this.isLoading = true;
      this.resourceService.deleteResource(resource.id).subscribe({
        next: () => {
          this.loadResources();
        },
        error: (err) => {
          this.error = 'Failed to delete resource. Please try again.';
          console.error('Error deleting resource:', err);
          this.isLoading = false;
        },
      });
    }
  }

  exportToPDF() {
    // TODO: Implement PDF export
    console.log('Exporting to PDF');
  }

  exportToExcel() {
    // TODO: Implement Excel export
    console.log('Exporting to Excel');
  }

  navigateToAdd() {
    // TODO: Implement navigation
    console.log('Navigating to add resource page');
  }

  editResource(resource: Resource) {
    // TODO: Implement navigation
    console.log('Editing resource:', resource);
  }
}
