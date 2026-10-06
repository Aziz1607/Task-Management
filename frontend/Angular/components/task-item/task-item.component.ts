import { Component, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="task-card" [class.is-completed]="task().completed || task().status === 'completed'">
      <!-- Left: Status Checkbox -->
      <div class="checkbox-container">
        <label class="custom-checkbox">
          <input
            type="checkbox"
            [checked]="task().completed || task().status === 'completed'"
            (change)="toggleComplete.emit(task())"
            [attr.aria-label]="'Mark ' + task().title + ' as ' + (task().completed ? 'pending' : 'completed')"
          />
          <span class="checkmark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </span>
        </label>
      </div>

      <!-- Center: Content -->
      <div class="task-content">
        <div class="task-header">
          <h3 class="task-title" [class.completed-title]="task().completed || task().status === 'completed'">
            {{ task().title }}
          </h3>

          <div class="badges-row">
            <!-- Status Badge -->
            <span class="badge status-badge" [ngClass]="'status-' + task().status">
              {{ formatStatus(task().status) }}
            </span>

            <!-- Priority Badge -->
            <span class="badge priority-badge" [ngClass]="'priority-' + task().priority">
              <span class="dot"></span>
              {{ task().priority | titlecase }}
            </span>
          </div>
        </div>

        @if (task().description) {
          <p class="task-desc">{{ task().description }}</p>
        }

        <!-- Footer Meta -->
        <div class="task-meta">
          @if (task().dueDate) {
            <span class="meta-item due-date" [class.overdue]="isOverdue(task().dueDate)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Due: {{ task().dueDate | date:'mediumDate' }}</span>
              @if (isOverdue(task().dueDate)) {
                <span class="overdue-tag">Overdue</span>
              }
            </span>
          }

          <span class="meta-item created-date">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Created {{ task().createdAt | date:'shortDate' }}</span>
          </span>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="task-actions">
        <button
          type="button"
          class="action-btn edit-btn"
          (click)="editTask.emit(task())"
          title="Edit task"
          aria-label="Edit task"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
          </svg>
        </button>

        @if (!confirmingDelete()) {
          <button
            type="button"
            class="action-btn delete-btn"
            (click)="promptDelete()"
            title="Delete task"
            aria-label="Delete task"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        } @else {
          <div class="delete-confirmation">
            <button
              type="button"
              class="confirm-delete-btn"
              (click)="onConfirmDelete()"
              title="Confirm Delete"
            >
              Delete
            </button>
            <button
              type="button"
              class="cancel-delete-btn"
              (click)="cancelDelete()"
              title="Cancel"
            >
              ✕
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.15rem 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      position: relative;
    }

    .task-card:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }

    .task-card.is-completed {
      background: #fafbfc;
      border-color: #e2e8f0;
      opacity: 0.85;
    }

    /* Checkbox */
    .checkbox-container {
      padding-top: 0.2rem;
    }

    .custom-checkbox {
      display: inline-block;
      position: relative;
      cursor: pointer;
      user-select: none;
    }

    .custom-checkbox input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }

    .checkmark {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background-color: #ffffff;
      border: 2px solid #cbd5e1;
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .checkmark svg {
      width: 14px;
      height: 14px;
      color: #ffffff;
      display: none;
    }

    .custom-checkbox:hover input ~ .checkmark {
      border-color: #4f46e5;
    }

    .custom-checkbox input:checked ~ .checkmark {
      background-color: #10b981;
      border-color: #10b981;
    }

    .custom-checkbox input:checked ~ .checkmark svg {
      display: block;
    }

    /* Content */
    .task-content {
      flex: 1;
      min-width: 0;
    }

    .task-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .task-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: #1e293b;
      word-break: break-word;
      line-height: 1.35;
      flex: 1;
    }

    .completed-title {
      text-decoration: line-through;
      color: #94a3b8;
    }

    .badges-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      text-transform: capitalize;
    }

    /* Status Badges */
    .status-pending {
      background: #fef3c7;
      color: #b45309;
    }

    .status-in-progress {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .status-completed {
      background: #d1fae5;
      color: #047857;
    }

    /* Priority Badges */
    .priority-low {
      background: #f1f5f9;
      color: #475569;
    }
    .priority-low .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #64748b;
    }

    .priority-medium {
      background: #e0e7ff;
      color: #4338ca;
    }
    .priority-medium .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4f46e5;
    }

    .priority-high {
      background: #fee2e2;
      color: #b91c1c;
    }
    .priority-high .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #dc2626;
    }

    .task-desc {
      margin: 0.45rem 0 0 0;
      font-size: 0.9rem;
      color: #64748b;
      line-height: 1.45;
      word-break: break-word;
      white-space: pre-line;
    }

    .task-meta {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .meta-item svg {
      width: 14px;
      height: 14px;
    }

    .due-date.overdue {
      color: #dc2626;
      font-weight: 500;
    }

    .overdue-tag {
      background: #fee2e2;
      color: #b91c1c;
      font-size: 0.65rem;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-weight: 700;
      margin-left: 0.2rem;
    }

    /* Actions */
    .task-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 6px;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .action-btn svg {
      width: 16px;
      height: 16px;
    }

    .edit-btn:hover {
      background: #eef2ff;
      color: #4f46e5;
    }

    .delete-btn:hover {
      background: #fef2f2;
      color: #ef4444;
    }

    .delete-confirmation {
      display: flex;
      align-items: center;
      gap: 0.3rem;
      background: #fee2e2;
      padding: 0.2rem 0.4rem;
      border-radius: 6px;
    }

    .confirm-delete-btn {
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .confirm-delete-btn:hover {
      background: #b91c1c;
    }

    .cancel-delete-btn {
      background: transparent;
      color: #7f1d1d;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.2rem;
    }
  `]
})
export class TaskItemComponent {
  task = input.required<Task>();

  toggleComplete = output<Task>();
  editTask = output<Task>();
  deleteTask = output<string>();

  confirmingDelete = signal<boolean>(false);

  formatStatus(status: string): string {
    if (status === 'in-progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  isOverdue(dueDateString?: string | null): boolean {
    if (!dueDateString) return false;
    const task = this.task();
    if (task.completed || task.status === 'completed') return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  promptDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  onConfirmDelete(): void {
    const id = this.task().id || this.task()._id;
    if (id) {
      this.deleteTask.emit(id);
    }
    this.confirmingDelete.set(false);
  }
}

