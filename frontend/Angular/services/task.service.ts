import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { ApiResponse, CreateTaskDto, Task, TaskFilterOptions, UpdateTaskDto } from '../models/task.model';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private notification = inject(NotificationService);

  private readonly apiUrl = 'http://localhost:5000/api/tasks';

  // Signals
  private tasksSignal = signal<Task[]>([]);
  public tasks = this.tasksSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  private errorSignal = signal<string | null>(null);
  public error = this.errorSignal.asReadonly();

  private filterSignal = signal<TaskFilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  public filter = this.filterSignal.asReadonly();

  // Computed signals
  public totalCount = computed(() => this.tasksSignal().length);
  public completedCount = computed(() => this.tasksSignal().filter((t) => t.completed || t.status === 'completed').length);
  public pendingCount = computed(() => this.tasksSignal().filter((t) => t.status === 'pending' && !t.completed).length);
  public inProgressCount = computed(() => this.tasksSignal().filter((t) => t.status === 'in-progress').length);

  public filteredTasks = computed(() => {
    let result = [...this.tasksSignal()];
    const currentFilter = this.filterSignal();

    // Status filter
    if (currentFilter.status !== 'all') {
      result = result.filter((task) => {
        if (currentFilter.status === 'completed') {
          return task.completed || task.status === 'completed';
        }
        return task.status === currentFilter.status;
      });
    }

    // Search query filter
    if (currentFilter.search && currentFilter.search.trim()) {
      const q = currentFilter.search.trim().toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q))
      );
    }

    // Client-side sort fallback / preview
    const sortBy = currentFilter.sortBy || 'createdAt';
    const sortOrder = currentFilter.sortOrder === 'asc' ? 1 : -1;

    result.sort((a, b) => {
      let valA: any = a[sortBy as keyof Task] || '';
      let valB: any = b[sortBy as keyof Task] || '';

      if (sortBy === 'createdAt' || sortBy === 'dueDate') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    return result;
  });

  constructor() {
    this.loadTasks();
  }

  // GET /api/tasks
  loadTasks(options?: Partial<TaskFilterOptions>): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    let params = new HttpParams();
    const current = { ...this.filterSignal(), ...(options || {}) };

    if (current.status && current.status !== 'all') {
      params = params.set('status', current.status);
    }
    if (current.search && current.search.trim()) {
      params = params.set('search', current.search.trim());
    }
    if (current.sortBy) {
      params = params.set('sortBy', current.sortBy);
    }
    if (current.sortOrder) {
      params = params.set('sortOrder', current.sortOrder);
    }

    this.http.get<ApiResponse<Task[]>>(this.apiUrl, { params }).pipe(
      map((res) => res.data || []),
      tap((taskList) => {
        this.tasksSignal.set(taskList);
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        const errorMsg = err.error?.message || err.message || 'Failed to load tasks from server';
        this.errorSignal.set(errorMsg);
        this.loadingSignal.set(false);
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    ).subscribe();
  }

  // GET /api/tasks/:id
  getTaskById(id: string): Observable<Task> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.data),
      catchError((err) => {
        const errorMsg = err.error?.message || `Failed to fetch task ${id}`;
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  // POST /api/tasks
  createTask(dto: CreateTaskDto): Observable<Task> {
    this.loadingSignal.set(true);
    return this.http.post<ApiResponse<Task>>(this.apiUrl, dto).pipe(
      map((res) => res.data),
      tap((newTask) => {
        this.tasksSignal.update((current) => [newTask, ...current]);
        this.loadingSignal.set(false);
        this.notification.success(`Task "${newTask.title}" created successfully!`);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const errorMsg = err.error?.message || err.error?.errors?.join(', ') || 'Failed to create task';
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  // PUT /api/tasks/:id
  updateTask(id: string, dto: UpdateTaskDto): Observable<Task> {
    this.loadingSignal.set(true);
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, dto).pipe(
      map((res) => res.data),
      tap((updated) => {
        this.tasksSignal.update((current) =>
          current.map((t) => (t.id === id || t._id === id ? updated : t))
        );
        this.loadingSignal.set(false);
        this.notification.success(`Task "${updated.title}" updated successfully!`);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const errorMsg = err.error?.message || err.error?.errors?.join(', ') || 'Failed to update task';
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  // Mark task as completed (or toggle completed)
  toggleTaskComplete(task: Task): Observable<Task> {
    const taskId = task.id || task._id!;
    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'pending';

    return this.updateTask(taskId, {
      completed: newCompleted,
      status: newStatus
    }).pipe(
      tap(() => {
        const statusLabel = newCompleted ? 'completed' : 'reopened';
        this.notification.info(`Task marked as ${statusLabel}`);
      })
    );
  }

  // DELETE /api/tasks/:id
  deleteTask(id: string): Observable<Task> {
    this.loadingSignal.set(true);
    return this.http.delete<ApiResponse<Task>>(`${this.apiUrl}/${id}`).pipe(
      map((res) => res.data),
      tap((deleted) => {
        this.tasksSignal.update((current) =>
          current.filter((t) => t.id !== id && t._id !== id)
        );
        this.loadingSignal.set(false);
        this.notification.success(`Task "${deleted.title}" deleted.`);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const errorMsg = err.error?.message || 'Failed to delete task';
        this.notification.error(errorMsg);
        return throwError(() => err);
      })
    );
  }

  // Filter updates
  setFilter(changes: Partial<TaskFilterOptions>): void {
    this.filterSignal.update((prev) => ({ ...prev, ...changes }));
  }

  resetFilter(): void {
    this.filterSignal.set({
      status: 'all',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }
}

