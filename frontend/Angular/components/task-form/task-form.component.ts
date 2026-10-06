import { Component, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateTaskDto, Task, TaskPriority, TaskStatus, UpdateTaskDto } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-backdrop" (click)="onBackdropClick($event)">
        <div class="modal-dialog" role="dialog" aria-modal="true" [attr.aria-labelledby]="'modal-title'">
          <!-- Modal Header -->
          <div class="modal-header">
            <h2 id="modal-title" class="modal-title">
              {{ taskToEdit() ? 'Edit Task' : 'Create New Task' }}
            </h2>
            <button
              type="button"
              class="close-btn"
              (click)="closeModal.emit()"
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>

          <!-- Form -->
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="modal-body">
            <!-- Title Field -->
            <div class="form-group">
              <label for="task-title" class="form-label">
                Task Title <span class="required">*</span>
              </label>
              <input
                id="task-title"
                type="text"
                formControlName="title"
                placeholder="What needs to be done?"
                class="form-input"
                [class.has-error]="isFieldInvalid('title')"
                maxlength="150"
                autofocus
              />
              @if (isFieldInvalid('title')) {
                <span class="field-error">Title is required (max 150 characters)</span>
              }
            </div>

            <!-- Description Field -->
            <div class="form-group">
              <label for="task-desc" class="form-label">Description</label>
              <textarea
                id="task-desc"
                formControlName="description"
                placeholder="Add optional notes, links, or instructions..."
                class="form-textarea"
                rows="3"
                maxlength="1000"
              ></textarea>
            </div>

            <!-- Grid: Status & Priority -->
            <div class="form-row">
              <div class="form-group col">
                <label for="task-status" class="form-label">Status</label>
                <select id="task-status" formControlName="status" class="form-select">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div class="form-group col">
                <label for="task-priority" class="form-label">Priority</label>
                <select id="task-priority" formControlName="priority" class="form-select">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <!-- Due Date Field -->
            <div class="form-group">
              <label for="task-due-date" class="form-label">Due Date</label>
              <input
                id="task-due-date"
                type="date"
                formControlName="dueDate"
                class="form-input date-input"
              />
            </div>

            <!-- Modal Footer Actions -->
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                (click)="closeModal.emit()"
              >
                Cancel
              </button>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="taskForm.invalid || isSubmitting()"
              >
                @if (isSubmitting()) {
                  <span class="spinner"></span>
                  <span>Saving...</span>
                } @else {
                  <span>{{ taskToEdit() ? 'Update Task' : 'Create Task' }}</span>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      padding: 1rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: #ffffff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes scaleUp {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #0f172a;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: #f1f5f9;
      color: #334155;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .col {
      flex: 1;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #334155;
    }

    .required {
      color: #ef4444;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #ffffff;
      transition: all 0.2s ease;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    .form-input.has-error {
      border-color: #ef4444;
    }

    .field-error {
      font-size: 0.75rem;
      color: #ef4444;
      margin-top: 0.2rem;
    }

    .form-textarea {
      resize: vertical;
      min-height: 75px;
    }

    .date-input {
      color-scheme: light;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
      border: 1px solid transparent;
    }

    .btn-secondary {
      background: #f8fafc;
      color: #475569;
      border-color: #e2e8f0;
    }

    .btn-secondary:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .btn-primary {
      background: #4f46e5;
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      background: #4338ca;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class TaskFormComponent {
  isOpen = input<boolean>(false);
  taskToEdit = input<Task | null>(null);

  closeModal = output<void>();
  saveTask = output<{ id?: string; data: CreateTaskDto | UpdateTaskDto }>();

  isSubmitting = signal<boolean>(false);
  taskForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(150)]],
      description: ['', [Validators.maxLength(1000)]],
      status: ['pending'],
      priority: ['medium'],
      dueDate: ['']
    });

    // Populate form when taskToEdit changes
    effect(() => {
      const task = this.taskToEdit();
      if (task) {
        let formattedDate = '';
        if (task.dueDate) {
          try {
            formattedDate = new Date(task.dueDate).toISOString().split('T')[0];
          } catch (e) {
            formattedDate = '';
          }
        }

        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          status: task.status || (task.completed ? 'completed' : 'pending'),
          priority: task.priority || 'medium',
          dueDate: formattedDate
        });
      } else {
        this.taskForm.reset({
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          dueDate: ''
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formValue = this.taskForm.value;
    const taskData: CreateTaskDto | UpdateTaskDto = {
      title: formValue.title.trim(),
      description: formValue.description ? formValue.description.trim() : '',
      status: formValue.status as TaskStatus,
      priority: formValue.priority as TaskPriority,
      dueDate: formValue.dueDate ? formValue.dueDate : null,
      completed: formValue.status === 'completed'
    };

    const editItem = this.taskToEdit();
    if (editItem) {
      const id = editItem.id || editItem._id;
      this.saveTask.emit({ id, data: taskData });
    } else {
      this.saveTask.emit({ data: taskData });
    }
  }
}

