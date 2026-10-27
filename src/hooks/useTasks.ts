import { useState, useEffect, useCallback } from 'react';
import { UserTask, Subtask, TaskPriority, TaskCategory, TaskStatus } from '../types/task';
import {
  loadUserTasksFromStorage,
  saveUserTasksToStorage,
} from '../utils/storage';
import { validateSubtaskTitle, generateSubtaskId } from '../utils/subtasks';

export function useTasks() {
  const [tasks, setTasks] = useState<UserTask[]>(() => {
    const { data } = loadUserTasksFromStorage();
    return data;
  });

  const [storageNotice, setStorageNotice] = useState<string | null>(() => {
    const { hadCorruption, errorMessage } = loadUserTasksFromStorage();
    return hadCorruption && errorMessage ? errorMessage : null;
  });

  // Persist whenever tasks change
  useEffect(() => {
    const result = saveUserTasksToStorage(tasks);
    if (!result.success && result.error) {
      setStorageNotice(result.error);
    }
  }, [tasks]);

  const addTask = useCallback(
    (input: {
      title: string;
      priority: TaskPriority;
      category: TaskCategory;
      dueDate: string | null;
      status?: TaskStatus;
    }): UserTask => {
      const nowIso = new Date().toISOString();
      const newTask: UserTask = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: input.title.trim(),
        priority: input.priority,
        category: input.category,
        dueDate: input.dueDate || null,
        status: input.status || 'Pending',
        createdAt: nowIso,
        updatedAt: nowIso,
        subtasks: [],
      };

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    []
  );

  const updateTask = useCallback(
    (
      id: string,
      updates: {
        title?: string;
        priority?: TaskPriority;
        category?: TaskCategory;
        dueDate?: string | null;
        status?: TaskStatus;
      }
    ): boolean => {
      const exists = tasks.some((t) => t.id === id);
      if (!exists) return false;

      const nowIso = new Date().toISOString();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            return {
              ...task,
              title: updates.title !== undefined ? updates.title.trim() : task.title,
              priority: updates.priority !== undefined ? updates.priority : task.priority,
              category: updates.category !== undefined ? updates.category : task.category,
              dueDate: updates.dueDate !== undefined ? updates.dueDate : task.dueDate,
              status: updates.status !== undefined ? updates.status : task.status,
              updatedAt: nowIso,
            };
          }
          return task;
        })
      );

      return true;
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (id: string): UserTask | null => {
      const target = tasks.find((t) => t.id === id) || null;
      if (target) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
      return target;
    },
    [tasks]
  );

  const restoreTask = useCallback((task: UserTask) => {
    setTasks((prev) => {
      // Prevent duplicate IDs if task is already in state
      if (prev.some((t) => t.id === task.id)) {
        return prev;
      }
      return [task, ...prev];
    });
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) => {
      const nowIso = new Date().toISOString();
      return prev.map((task) => {
        if (task.id === id) {
          const nextStatus: TaskStatus =
            task.status === 'Completed' ? 'Pending' : 'Completed';
          return {
            ...task,
            status: nextStatus,
            updatedAt: nowIso,
          };
        }
        return task;
      });
    });
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) => {
      const nowIso = new Date().toISOString();
      return prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status,
            updatedAt: nowIso,
          };
        }
        return task;
      });
    });
  }, []);

  const clearCompletedTasks = useCallback((): number => {
    const completedCount = tasks.filter((t) => t.status === 'Completed').length;
    if (completedCount > 0) {
      setTasks((prev) => prev.filter((t) => t.status !== 'Completed'));
    }
    return completedCount;
  }, [tasks]);

  const setAllTasks = useCallback((newTasks: UserTask[]) => {
    setTasks(newTasks);
  }, []);

  const addSubtask = useCallback(
    (taskId: string, title: string): Subtask | null => {
      const validation = validateSubtaskTitle(title);
      if (!validation.isValid) {
        return null;
      }

      const nowIso = new Date().toISOString();
      const newSubtask: Subtask = {
        id: generateSubtaskId(),
        title: validation.trimmed,
        completed: false,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const existingSubtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
            return {
              ...task,
              subtasks: [...existingSubtasks, newSubtask],
              updatedAt: nowIso,
            };
          }
          return task;
        })
      );

      return newSubtask;
    },
    []
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string): boolean => {
      const nowIso = new Date().toISOString();
      let didToggle = false;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId && Array.isArray(task.subtasks)) {
            const updated = task.subtasks.map((sub) => {
              if (sub.id === subtaskId) {
                didToggle = true;
                return {
                  ...sub,
                  completed: !sub.completed,
                  updatedAt: nowIso,
                };
              }
              return sub;
            });

            if (didToggle) {
              return {
                ...task,
                subtasks: updated,
                updatedAt: nowIso,
              };
            }
          }
          return task;
        })
      );

      return didToggle;
    },
    []
  );

  const updateSubtask = useCallback(
    (taskId: string, subtaskId: string, title: string): boolean => {
      const validation = validateSubtaskTitle(title);
      if (!validation.isValid) {
        return false;
      }

      const nowIso = new Date().toISOString();
      let didUpdate = false;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId && Array.isArray(task.subtasks)) {
            const updated = task.subtasks.map((sub) => {
              if (sub.id === subtaskId) {
                didUpdate = true;
                return {
                  ...sub,
                  title: validation.trimmed,
                  updatedAt: nowIso,
                };
              }
              return sub;
            });

            if (didUpdate) {
              return {
                ...task,
                subtasks: updated,
                updatedAt: nowIso,
              };
            }
          }
          return task;
        })
      );

      return didUpdate;
    },
    []
  );

  const deleteSubtask = useCallback(
    (taskId: string, subtaskId: string): boolean => {
      const nowIso = new Date().toISOString();
      let didDelete = false;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId && Array.isArray(task.subtasks)) {
            const filtered = task.subtasks.filter((sub) => {
              if (sub.id === subtaskId) {
                didDelete = true;
                return false;
              }
              return true;
            });

            if (didDelete) {
              return {
                ...task,
                subtasks: filtered,
                updatedAt: nowIso,
              };
            }
          }
          return task;
        })
      );

      return didDelete;
    },
    []
  );

  const dismissStorageNotice = useCallback(() => {
    setStorageNotice(null);
  }, []);

  return {
    tasks,
    storageNotice,
    dismissStorageNotice,
    addTask,
    updateTask,
    deleteTask,
    restoreTask,
    toggleTaskStatus,
    setTaskStatus,
    clearCompletedTasks,
    setAllTasks,
    addSubtask,
    toggleSubtask,
    updateSubtask,
    deleteSubtask,
  };
}
