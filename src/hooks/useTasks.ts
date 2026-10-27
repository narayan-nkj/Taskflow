import { useState, useEffect, useCallback } from 'react';
import { UserTask, TaskPriority, TaskCategory, TaskStatus } from '../types/task';
import {
  loadUserTasksFromStorage,
  saveUserTasksToStorage,
} from '../utils/storage';

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
  };
}
