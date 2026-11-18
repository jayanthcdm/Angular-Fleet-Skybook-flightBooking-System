import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1 class="page-header__title">{{ title }}</h1>
      @if (subtitle) {
        <p class="page-header__subtitle">{{ subtitle }}</p>
      }
    </div>
  `,
  styles: [`
    .page-header {
      padding: 2rem 0 1.5rem;
    }

    .page-header__title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #1a237e;
      margin-bottom: 0.35rem;
      letter-spacing: -0.01em;
    }

    .page-header__subtitle {
      font-size: 0.95rem;
      color: #64748b;
      font-weight: 400;
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}
