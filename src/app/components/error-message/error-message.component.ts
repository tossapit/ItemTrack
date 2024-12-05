import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-red-50 p-4 rounded-lg text-red-700" *ngIf="message">
      {{ message }}
      <button 
        *ngIf="showRetry"
        (click)="onRetry.emit()" 
        class="ml-2 text-sm underline hover:no-underline">
        Try again
      </button>
    </div>
  `
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Input() showRetry = false;
  @Output() onRetry = new EventEmitter<void>();
}