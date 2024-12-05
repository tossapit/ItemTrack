import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface ResourceData {
  name: string;
  total: number;
  available: number;
  inUse: number;
}

interface RecentActivity {
  id: number;
  type: 'check-in' | 'check-out';
  item: string;
  time: string;
  user: string;
}

interface Alert {
  id: number;
  item: string;
  current: number;
  threshold: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ErrorMessageComponent,
    LoadingSpinnerComponent,
  ]
})

export class DashboardComponent implements OnInit {
  isLoading = false;
  error: string | null = null;

  resourceData: ResourceData[] = [];
  recentActivities: RecentActivity[] = [];
  alerts: Alert[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.error = null;

    // Load resource stats
    this.dashboardService.getResourceStats().subscribe({
      next: (data) => {
        this.resourceData = data;
        this.initializeCharts();
      },
      error: (err) => {
        this.error = 'Failed to load resource statistics';
      },
      complete: () => {
        this.isLoading = false;
      },
    });

    // Load alerts
    this.dashboardService.getLowStockAlerts().subscribe({
      next: (data) => {
        this.alerts = data;
      },
      error: (err) => {
        this.error = 'Failed to load alerts';
      },
    });

    // Load recent activities
    this.dashboardService.getRecentActivities().subscribe({
      next: (data) => {
        this.recentActivities = data;
      },
      error: (err) => {
        this.error = 'Failed to load recent activities';
      },
    });
  }

  get totalResources(): number {
    return this.resourceData.reduce((acc, curr) => acc + curr.total, 0);
  }

  get totalAvailable(): number {
    return this.resourceData.reduce((acc, curr) => acc + curr.available, 0);
  }

  get totalInUse(): number {
    return this.resourceData.reduce((acc, curr) => acc + curr.inUse, 0);
  }

  private initializeCharts(): void {
    const ctx = document.getElementById('resourceChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.resourceData.map((item) => item.name),
        datasets: [
          {
            label: 'Available',
            data: this.resourceData.map((item) => item.available),
            backgroundColor: 'rgba(34, 197, 94, 0.9)',
            borderRadius: 6,
            maxBarThickness: 40,
            barPercentage: 0.8, 
            categoryPercentage: 0.9 
          },
          {
            label: 'In Use',
            data: this.resourceData.map((item) => item.inUse),
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderRadius: 6,
            maxBarThickness: 40,
            barPercentage: 0.8,
            categoryPercentage: 0.9
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 12,
                family: "'Inter', sans-serif",
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(107, 114, 128, 0.1)',
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10,
          },
        },
      },
    });
  }
}
