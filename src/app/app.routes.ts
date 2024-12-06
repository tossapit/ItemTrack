import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard.component';
import { ResourceListComponent } from './components/resources/resource-list.component';

export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'resources', component: ResourceListComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];