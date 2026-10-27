import { AdviceSlipResponse } from '../types/api';
import { ApiError } from './dummyjson';

const ADVICE_SLIP_URL = 'https://api.adviceslip.com/advice';

export interface AdviceResult {
  id: number;
  advice: string;
}

/**
 * Fetches an advice slip from https://api.adviceslip.com/advice.
 * Validates non-empty slip.advice string and avoids caching on manual refresh.
 */
export async function fetchDailyAdvice(signal?: AbortSignal): Promise<AdviceResult> {
  try {
    // Add cache-busting timestamp so manual refreshes fetch a fresh slip
    const url = `${ADVICE_SLIP_URL}?t=${Date.now()}`;
    const response = await fetch(url, {
      signal,
      cache: 'no-cache',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `Advice Slip API responded with status ${response.status} (${response.statusText}).`,
        response.status
      );
    }

    const text = await response.text();
    let data: Partial<AdviceSlipResponse>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError('Advice Slip returned an unparseable response.');
    }

    if (
      !data.slip ||
      typeof data.slip.advice !== 'string' ||
      data.slip.advice.trim() === ''
    ) {
      throw new ApiError('Advice Slip response was missing valid advice text.');
    }

    return {
      id: typeof data.slip.id === 'number' ? data.slip.id : Date.now(),
      advice: data.slip.advice.trim(),
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network error';
    throw new ApiError(`Could not load advice: ${message}`);
  }
}
