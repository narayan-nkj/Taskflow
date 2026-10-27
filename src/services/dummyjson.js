const DUMMY_JSON_URL = 'https://dummyjson.com/todos';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Fetches sample todos from DummyJSON.
 * Never mutates user data or persists to user tasks.
 *
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{ id: number, todo: string, completed: boolean, userId: number }>>}
 */
export async function fetchDummyJsonTodos(signal) {
  try {
    const response = await fetch(DUMMY_JSON_URL, {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `DummyJSON API responded with status ${response.status} (${response.statusText}).`,
        response.status
      );
    }

    const data = await response.json();

    if (!data || !Array.isArray(data.todos)) {
      throw new ApiError('DummyJSON response shape was invalid: missing "todos" array.');
    }

    // Defensive parsing of each sample record
    const sanitized = [];
    for (const item of data.todos) {
      if (
        item &&
        typeof item.id === 'number' &&
        typeof item.todo === 'string' &&
        typeof item.completed === 'boolean'
      ) {
        sanitized.push({
          id: item.id,
          todo: item.todo.trim(),
          completed: item.completed,
          userId: typeof item.userId === 'number' ? item.userId : 0,
        });
      }
    }

    return sanitized;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network error';
    throw new ApiError(`Failed to connect to DummyJSON todos: ${message}`);
  }
}
