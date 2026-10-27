import { UserTask, TaskExportPayload } from '../types/task';
import { getLocalTodayString } from '../utils/dates';
import { validateImportJson } from '../utils/validation';

export function exportTasksAsJson(tasks: readonly UserTask[]): boolean {
  try {
    const todayStr = getLocalTodayString();
    const filename = `taskflow-tasks-${todayStr}.json`;

    const payload: TaskExportPayload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      appName: 'TaskFlow',
      tasks: tasks.map((t) => ({ ...t })),
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
 * Resolves ID collisions safely by generating new UUIDs.
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

  const existingIds = new Set(existingTasks.map((t) => t.id));
  let collisionCount = 0;

  const preparedImportedTasks: UserTask[] = validation.tasks.map((task) => {
    let finalId = task.id;
    if (existingIds.has(finalId)) {
      // Collision detected! Generate new UUID to preserve both records safely
      finalId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      collisionCount++;
    }
    existingIds.add(finalId);

    return {
      ...task,
      id: finalId,
    };
  });

  // Merge valid imported tasks with existing user tasks (never replaces existing data)
  const mergedTasks = [...existingTasks, ...preparedImportedTasks];

  return {
    success: true,
    importedCount: preparedImportedTasks.length,
    collisionCount,
    mergedTasks,
  };
}
