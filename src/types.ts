export type ContractSuccess<T> = { success: T; promiseId?: string };
export type ContractError = { error: { message: string; code?: number }; promiseId?: string };
export type ContractResponse<T = unknown> = ContractSuccess<T> | ContractError;

export interface HelloRow {
  Id: number;
  Message: string;
  CreatedOn?: string;
  LastUpdatedOn?: string;
  ConcurrencyKey?: string;
}

export interface HelloGetMessageResult {
  id: number | null;
  message: string;
}

export interface HelloSetMessageResult {
  id: number;
  message: string;
}

export interface InvokePayload<Data = unknown> {
  Service: string;
  Action: string;
  data?: Data;
  promiseId?: string;
}
