export type DeadlineUrgency = 'overdue' | 'due-today' | 'due-soon';

export interface DeadlineAlert {
  id: string; // `${task.id}:${task.dueDate}:${urgency}`
  taskId: string;
  taskTitle: string;
  dueDate: string;
  urgency: DeadlineUrgency;
  urgencyLabel: string;
  category: string;
  priority: string;
  isDismissed: boolean;
}
