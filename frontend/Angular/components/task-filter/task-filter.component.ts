import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskFilterOptions, TaskStatus } from '../../models/task.model';

@Component({
  selector: 'app-task-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-wrapper">
      <!-- Status Tabs -->
      <div class="status-tabs" role="tablist" aria-label="Task status filters">
        <button
          type="button"
          class="tab-btn"
          [class.active]="filter().status === 'all'"
          (click)="onStatusChange('all')"
        >
          <span>All Tasks</span>
          <span class="count-badge">{{ totalCount() }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="filter().status === 'pending'"
          (click)="onStatusChange('pending')"
        >
          <span class="status-indicator pending"></span>
          <span>Pending</span>
          <span class="count-badge">{{ pendingCount() }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="filter().status === 'in-progress'"
          (click)="onStatusChange('in-progress')"
        >
          <span class="status-indicator in-progress"></span>
          <span>In Progress</span>
          <span class="count-badge">{{ inProgressCount() }}</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          [class.active]="filter().status === 'completed'"
          (click)="onStatusChange('completed')"
        >
          <span class="status-indicator completed"></span>
          <span>Completed</span>
          <span class="count-badge">{{ completedCount() }}</span>
        </button>
      </div>

      <!-- Search & Sort Row -->
      <div class="search-sort-bar">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            [ngModel]="filter().search || ''"
            (ngModelChange)="onSearchChange($event)"
            aria-label="Search tasks"
          />
          @if (filter().search) {
            <button class="clear-search-btn" (click)="onSearchChange('')" title="Clear search" type="button">
              ✕
            </button>
          }
        </div>

        <div class="sort-controls">
          <label for="sortBySelect" class="sort-label">Sort by:</label>
          <select
            id="sortBySelect"
            [ngModel]="filter().sortBy"
            (ngModelChange)="onSortByChange($event)"
            class="sort-select"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title (A-Z)</option>
          </select>

          <button
            type="button"
            class="order-toggle-btn"
            (click)="toggleOrder()"
            [title]="filter().sortOrder === 'asc' ? 'Ascending (click for Desc)' : 'Descending (click for Asc)'"
          >
            @if (filter().sortOrder === 'asc') {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 8 4-4 4 4"></path>
                <path d="M7 4v16"></path>
                <path d="M11 12h10"></path>
                <path d="M11 16h7"></path>
                <path d="M11 20h4"></path>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 16 4 4 4-4"></path>
                <path d="M7 20V4"></path>
                <path d="M11 4h10"></path>
                <path d="M11 8h7"></path>
                <path d="M11 12h4"></path>
              </svg>
            }
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .filter-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .status-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      background: #f1f5f9;
      padding: 0.4rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.55rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 500;
      color: #64748b;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn:hover {
      color: #1e293b;
      background: rgba(255, 255, 255, 0.6);
    }

    .tab-btn.active {
      background: #ffffff;
      color: #0f172a;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .count-badge {
      background: #e2e8f0;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      transition: all 0.2s ease;
    }

    .tab-btn.active .count-badge {
      background: #4f46e5;
      color: #ffffff;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.pending {
      background-color: #f59e0b;
    }

    .status-indicator.in-progress {
      background-color: #3b82f6;
    }

    .status-indicator.completed {
      background-color: #10b981;
    }

    .search-sort-bar {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 260px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      width: 18px;
      height: 18px;
      color: #94a3b8;
      pointer-events: none;
    }

    .search-box input {
      width: 100%;
      padding: 0.65rem 2.2rem 0.65rem 2.4rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #ffffff;
      transition: all 0.2s ease;
      outline: none;
    }

    .search-box input:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .clear-search-btn {
      position: absolute;
      right: 0.65rem;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.2rem;
    }

    .clear-search-btn:hover {
      color: #475569;
    }

    .sort-controls {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .sort-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }

    .sort-select {
      padding: 0.6rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.88rem;
      background: #ffffff;
      color: #334155;
      outline: none;
      cursor: pointer;
    }

    .sort-select:focus {
      border-color: #4f46e5;
    }

    .order-toggle-btn {
      padding: 0.55rem;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 8px;
      cursor: pointer;
      color: #475569;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .order-toggle-btn:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }

    .order-toggle-btn svg {
      width: 18px;
      height: 18px;
    }
  `]
})
export class TaskFilterComponent {
  filter = input.required<TaskFilterOptions>();
  totalCount = input<number>(0);
  pendingCount = input<number>(0);
  inProgressCount = input<number>(0);
  completedCount = input<number>(0);

  filterChange = output<Partial<TaskFilterOptions>>();

  onStatusChange(status: 'all' | TaskStatus): void {
    this.filterChange.emit({ status });
  }

  onSearchChange(search: string): void {
    this.filterChange.emit({ search });
  }

  onSortByChange(sortBy: any): void {
    this.filterChange.emit({ sortBy });
  }

  toggleOrder(): void {
    const nextOrder = this.filter().sortOrder === 'asc' ? 'desc' : 'asc';
    this.filterChange.emit({ sortOrder: nextOrder });
  }
}

