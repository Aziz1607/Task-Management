import { Routes } from '@angular/router';
import { TaskListPageComponent } from './pages/task-list-page/task-list-page.component';

export const routes: Routes = [
  { path: '', component: TaskListPageComponent },
  { path: 'tasks', component: TaskListPageComponent },
  { path: '**', redirectTo: '' }
];
