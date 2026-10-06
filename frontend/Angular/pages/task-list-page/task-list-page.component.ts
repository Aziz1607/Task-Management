import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { CreateTaskDto, Task, TaskFilterOptions, UpdateTaskDto } from '../../models/task.model';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { TaskFilterComponent } from '../../components/task-filter/task-filter.component';
import { TaskItemComponent } from '../../components/task-item/task-item.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { ToastComponent } from '../../components/toast/toast.component';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    TaskFilterComponent,
    TaskItemComponent,
    TaskFormComponent,
    ToastComponent
  ],
  template: `
    <div class="app-layout">
      <!-- Navbar -->
      <app-navbar (newTaskClick)="openCreateModal()"></app-navbar>

      <!-- Main Content Container -->
      <main class="main-content">
        <!-- Overview Stats Cards -->
        <section class="stats-grid">
          <div class="stat-card" (click)="setFilterStatus('all')" [class.active-stat]="taskService.filter().status === 'all'">
            <div class="stat-info">
              <span class="stat-label">Total Tasks</span>
              <span class="stat-number">{{ taskService.totalCount() }}</span>
            </div>
            <div class="stat-icon icon-total">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card" (click)="setFilterStatus('pending')" [class.active-stat]="taskService.filter().status === 'pending'">
            <div class="stat-info">
              <span class="stat-label">Pending</span>
              <span class="stat-number">{{ taskService.pendingCount() }}</span>
            </div>
            <div class="stat-icon icon-pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>

          <div class="stat-card" (click)="setFilterStatus('in-progress')" [class.active-stat]="taskService.filter().status === 'in-progress'">
            <div class="stat-info">
              <span class="stat-label">In Progress</span>
              <span class="stat-number">{{ taskService.inProgressCount() }}</span>
            </div>
            <div class="stat-icon icon-progress">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
              </svg>
            </div>
          </div>

          <div class="stat-card" (click)="setFilterStatus('completed')" [class.active-stat]="taskService.filter().status === 'completed'">
            <div class="stat-info">
              <span class="stat-label">Completed</span>
              <span class="stat-number">{{ taskService.completedCount() }}</span>
            </div>
            <div class="stat-icon icon-completed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
        </section>

        <!-- Filter & Search Controls -->
        <app-task-filter
          [filter]="taskService.filter()"
          [totalCount]="taskService.totalCount()"
          [pendingCount]="taskService.pendingCount()"
          [inProgressCount]="taskService.inProgressCount()"
          [completedCount]="taskService.completedCount()"
          (filterChange)="onFilterChange($event)"
        ></app-task-filter>

        <!-- Task List Section -->
        <section class="task-section">
          <!-- Error banner if server error -->
          @if (taskService.error()) {
            <div class="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <div class="error-content">
                <strong>Unable to reach server</strong>
                <p>{{ taskService.error() }}</p>
                <small>Ensure the Express backend is running (<code>node server.js</code> on port 5000) and MongoDB is connected.</small>
              </div>
              <button class="retry-btn" (click)="retryLoad()">Retry</button>
            </div>
          }

          <!-- Loading state -->
          @if (taskService.loading() && taskService.filteredTasks().length === 0) {
            <div class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading tasks from MongoDB...</p>
            </div>
          }

          <!-- Tasks list -->
          @if (taskService.filteredTasks().length > 0) {
            <div class="task-list">
              @for (task of taskService.filteredTasks(); track task.id || task._id) {
                <app-task-item
                  [task]="task"
                  (toggleComplete)="onToggleComplete($event)"
                  (editTask)="openEditModal($event)"
                  (deleteTask)="onDeleteTask($event)"
                ></app-task-item>
              }
            </div>
          }

          <!-- Empty State -->
          @if (!taskService.loading() && taskService.filteredTasks().length === 0 && !taskService.error()) {
            <div class="empty-state">
              <div class="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path>
                </svg>
              </div>
              <h3>No tasks found</h3>
              <p>
                @if (taskService.filter().status !== 'all' || taskService.filter().search) {
                  No tasks match your current filter or search criteria.
                } @else {
                  You don't have any tasks scheduled yet. Start by adding one!
                }
              </p>
              <div class="empty-actions">
                @if (taskService.filter().status !== 'all' || taskService.filter().search) {
                  <button class="btn btn-outline" (click)="taskService.resetFilter()">
                    Clear Filters
                  </button>
                }
                <button class="btn btn-primary" (click)="openCreateModal()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Create Task
                </button>
              </div>
            </div>
          }
        </section>
      </main>

      <!-- Task Form Modal -->
      <app-task-form
        [isOpen]="isModalOpen()"
        [taskToEdit]="currentEditingTask()"
        (closeModal)="closeModal()"
        (saveTask)="onSaveTask($event)"
      ></app-task-form>

      <!-- Toast Alerts -->
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
      background-color: #f8fafc;
      color: #0f172a;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.5rem 4rem 1.5rem;
      box-sizing: border-box;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .stat-card:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .stat-card.active-stat {
      border-color: #4f46e5;
      background: #fdfdfe;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-label {
      font-size: 0.82rem;
      font-weight: 500;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-number {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1;
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon svg {
      width: 22px;
      height: 22px;
    }

    .icon-total {
      background: #eef2ff;
      color: #4f46e5;
    }

    .icon-pending {
      background: #fef3c7;
      color: #d97706;
    }

    .icon-progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .icon-completed {
      background: #d1fae5;
      color: #059669;
    }

    /* Task Section */
    .task-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    /* Error Banner */
    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      color: #991b1b;
      margin-bottom: 1rem;
    }

    .error-banner svg {
      width: 24px;
      height: 24px;
      color: #dc2626;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    .error-content {
      flex: 1;
    }

    .error-content strong {
      font-size: 0.95rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .error-content p {
      margin: 0 0 0.4rem 0;
      font-size: 0.88rem;
    }

    .error-content small {
      color: #b91c1c;
      font-size: 0.8rem;
    }

    .error-content code {
      background: #fee2e2;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .retry-btn {
      background: #dc2626;
      color: white;
      border: none;
      padding: 0.5rem 0.95rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      align-self: center;
      transition: background 0.2s;
    }

    .retry-btn:hover {
      background: #b91c1c;
    }

    /* Loading State */
    .loading-state {
      padding: 4rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #64748b;
    }

    .loading-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e2e8f0;
      border-top-color: #4f46e5;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Empty State */
    .empty-state {
      background: #ffffff;
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      background: #f1f5f9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }

    .empty-icon svg {
      width: 32px;
      height: 32px;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
      max-width: 400px;
    }

    .empty-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1rem;
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
      border: 1px solid transparent;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #4338ca;
    }

    .btn-primary svg {
      width: 16px;
      height: 16px;
    }

    .btn-outline {
      background: #ffffff;
      color: #475569;
      border-color: #cbd5e1;
    }

    .btn-outline:hover {
      background: #f8fafc;
      border-color: #94a3b8;
    }
  `]
})
export class TaskListPageComponent {
  taskService = inject(TaskService);

  isModalOpen = signal<boolean>(false);
  currentEditingTask = signal<Task | null>(null);

  setFilterStatus(status: 'all' | 'pending' | 'in-progress' | 'completed'): void {
    this.taskService.setFilter({ status });
  }

  onFilterChange(changes: Partial<TaskFilterOptions>): void {
    this.taskService.setFilter(changes);
  }

  retryLoad(): void {
    this.taskService.loadTasks();
  }

  openCreateModal(): void {
    this.currentEditingTask.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    this.currentEditingTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.currentEditingTask.set(null);
  }

  onSaveTask(payload: { id?: string; data: CreateTaskDto | UpdateTaskDto }): void {
    if (payload.id) {
      // Edit task
      this.taskService.updateTask(payload.id, payload.data).subscribe({
        next: () => this.closeModal()
      });
    } else {
      // Create task
      this.taskService.createTask(payload.data as CreateTaskDto).subscribe({
        next: () => this.closeModal()
      });
    }
  }

  onToggleComplete(task: Task): void {
    this.taskService.toggleTaskComplete(task).subscribe();
  }

  onDeleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
  }
}

