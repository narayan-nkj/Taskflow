/**
 * @typedef {'Pending' | 'In Progress' | 'Completed'} TaskStatus
 * @typedef {'High' | 'Medium' | 'Low'} TaskPriority
 * @typedef {'GDG' | 'Academics' | 'Personal'} TaskCategory
 *
 * @typedef {Object} Subtask
 * @property {string} id
 * @property {string} title
 * @property {boolean} completed
 * @property {string} createdAt // ISO 8601 string
 * @property {string} updatedAt // ISO 8601 string
 *
 * @typedef {Object} UserTask
 * @property {string} id
 * @property {string} title
 * @property {TaskPriority} priority
 * @property {TaskCategory} category
 * @property {string | null} dueDate // local calendar date in YYYY-MM-DD, or null if absent
 * @property {TaskStatus} status
 * @property {string} createdAt // ISO 8601 string
 * @property {string} updatedAt // ISO 8601 string
 * @property {Subtask[]} [subtasks] // optional checklist items, defaults to []
 * @property {boolean} [favorite] // optional favorite flag, defaults to false
 *
 * @typedef {'dueDate-asc' | 'dueDate-desc' | 'priority-high-low' | 'priority-low-high' | 'newest' | 'oldest' | 'title-asc'} SortOption
 *
 * @typedef {Object} TaskFiltersState
 * @property {string} search
 * @property {TaskCategory | 'All'} category
 * @property {TaskPriority | 'All'} priority
 * @property {TaskStatus | 'All'} status
 * @property {SortOption} sortBy
 * @property {boolean} favoritesOnly
 *
 * @typedef {Object} TaskExportPayload
 * @property {1} schemaVersion
 * @property {string} exportedAt
 * @property {'TaskFlow'} appName
 * @property {UserTask[]} tasks
 */
