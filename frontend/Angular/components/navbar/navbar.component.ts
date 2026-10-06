import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-container">
        <div class="brand">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
              <path d="M7 7h.01"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h1>TaskFlow</h1>
            <span class="badge-tech">Angular + Express + MongoDB</span>
          </div>
        </div>

        <div class="header-actions">
          <button class="btn btn-primary" (click)="newTaskClick.emit()" type="button" id="create-task-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Task</span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
    }

    .logo-icon svg {
      width: 22px;
      height: 22px;
    }

    .brand-text h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .badge-tech {
      font-size: 0.72rem;
      font-weight: 500;
      color: #64748b;
      letter-spacing: 0.02em;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
    }

    .btn-primary:hover {
      background: #4338ca;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
      transform: translateY(-1px);
    }

    .btn-primary svg {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 640px) {
      .badge-tech {
        display: none;
      }
      .btn span {
        display: none;
      }
      .btn {
        padding: 0.65rem;
      }
    }
  `]
})
export class NavbarComponent {
  newTaskClick = output<void>();
}

