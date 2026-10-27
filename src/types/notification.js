/**
 * @typedef {'overdue' | 'due-today' | 'due-soon'} DeadlineUrgency
 *
 * @typedef {Object} DeadlineAlert
 * @property {string} id // `${task.id}:${task.dueDate}:${urgency}`
 * @property {string} taskId
 * @property {string} taskTitle
 * @property {string} dueDate
 * @property {DeadlineUrgency} urgency
 * @property {string} urgencyLabel
 * @property {string} category
 * @property {string} priority
 * @property {boolean} isDismissed
 */
