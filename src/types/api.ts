export interface SampleTodo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
}

export interface DummyJsonResponse {
  todos: SampleTodo[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdviceSlip {
  id: number;
  advice: string;
}

export interface AdviceSlipResponse {
  slip: AdviceSlip;
}
