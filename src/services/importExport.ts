import { UserTask, TaskExportPayload } from '../types/task';
import { getLocalTodayString } from '../utils/dates';
import { validateImportJson } from '../utils/validation';

/**
 * Generates a unique task ID that does not exist in allocatedIds.
 * Uses crypto.randomUUID() when available, with a collision-resistant fallback
 * and bounded retry strategy to prevent infinite loops with mocked generators.
 */
export function generateUniqueId(allocatedIds: Set<string>): string {
  const MAX_ATTEMPTS = 50;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    if (!allocatedIds.has(candidate)) {
      return candidate;
    }
  }

  // Deterministic final fallback: Monotonic timestamp + counter + random suffix
  let counter = 1;
  while (counter <= 1000) {
    const deterministicId = `task-import-${Date.now()}-${counter++}-${Math.random().toString(36).slice(2, 7)}`;
    if (!allocatedIds.has(deterministicId)) {
      return deterministicId;
    }
  }

  throw new Error('Unable to allocate unique task identifier.');
}

export function exportTasksAsJson(tasks: readonly UserTask[]): boolean {
  try {
    const todayStr = getLocalTodayString();
    const filename = `taskflow-tasks-${todayStr}.json`;

    const payload: TaskExportPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'TaskFlow',
      tasks: tasks.map((t) => ({
        ...t,
        subtasks: Array.isArray(t.subtasks) ? t.subtasks.map((s) => ({ ...s })) : [],
      })),
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error('Task export failed:', err);
    return false;
  }
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  collisionCount: number;
  mergedTasks: UserTask[];
  error?: string;
}

/**
 * Safely imports and merges tasks from a user-provided JSON file.
 * All-or-nothing validation: if invalid, existing tasks remain untouched.
 * Robust ID collision resolution guarantees uniqueness across existing
 * tasks and intra-file duplicate IDs.
 */
export async function importTasksFromJsonFile(
  file: File,
  existingTasks: readonly UserTask[]
): Promise<ImportResult> {
  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      importedCount: 0,
      collisionCount: 0,
      mergedTasks: [...existingTasks],
      error: 'File size exceeds 5MB limit. Please provide a standard TaskFlow backup file.',
    };
  }

  let fileContent: string;
  try {
    fileContent = await file.text();
  } catch {
    return {
      success: false,
      importedCount: 0,
      collisionCount: 0,
      mergedTasks: [...existingTasks],
      error: 'Failed to read file. Please ensure the file is accessible and try again.',
    };
  }

  const validation = validateImportJson(fileContent);
  if (!validation.isValid) {
    return {
      success: false,
      importedCount: 0,
      collisionCount: 0,
      mergedTasks: [...existingTasks],
      error: validation.errorMessage || 'Invalid JSON format or unsupported schema.',
    };
  }

  // Set containing all existing IDs and every accepted imported ID
  const allocatedIds = new Set(existingTasks.map((t) => t.id));
  let collisionCount = 0;
  const preparedImportedTasks: UserTask[] = [];

  for (const task of validation.tasks) {
    let finalId = task.id;
    if (allocatedIds.has(finalId)) {
      // Collision detected with an existing user task or previous record in this file
      try {
        finalId = generateUniqueId(allocatedIds);
        collisionCount++;
      } catch {
        return {
          success: false,
          importedCount: 0,
          collisionCount: 0,
          mergedTasks: [...existingTasks],
          error: 'Failed to allocate unique IDs for imported tasks. Import aborted to prevent data loss.',
        };
      }
    }
    allocatedIds.add(finalId);

    // Ensure subtask IDs within this parent task are unique
    const allocatedSubtaskIds = new Set<string>();
    const preparedSubtasks = (task.subtasks || []).map((sub) => {
      let subId = sub.id;
      if (allocatedSubtaskIds.has(subId)) {
        subId = `sub-import-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      }
      allocatedSubtaskIds.add(subId);
      return {
        ...sub,
        id: subId,
      };
    });

    preparedImportedTasks.push({
      ...task,
      id: finalId,
      subtasks: preparedSubtasks,
    });
  }

  // Merge valid imported tasks with existing user tasks (never replaces existing data)
  const mergedTasks = [...existingTasks, ...preparedImportedTasks];

  return {
    success: true,
    importedCount: preparedImportedTasks.length,
    collisionCount,
    mergedTasks,
  };
}
