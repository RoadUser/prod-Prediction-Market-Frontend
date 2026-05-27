import ContractService from '@/services/contract-service';
import type { ContractResponse, HelloGetMessageResult, HelloSetMessageResult, InvokePayload } from '@/types';

export default class ApiService {
  private static instance: ApiService;
  private contract = ContractService.getInstance();

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) ApiService.instance = new ApiService();
    return ApiService.instance;
  }

  // Generic invoker
  public async invoke<Data = unknown, T = unknown>(Service: string, Action: string, data?: Data): Promise<ContractResponse<T>> {
    const payload: InvokePayload<Data> = { Service, Action, data };
    // Default: READ for Get*; WRITE otherwise (heuristic) - provide explicit methods per real endpoints below
    if (/^Get/i.test(Action)) return this.contract.submitContractReadRequest<T>(payload);
    return this.contract.submitInputToContract<T>(payload);
  }

  // Hello service methods
  public async getMessage(): Promise<ContractResponse<HelloGetMessageResult>> {
    return this.contract.submitContractReadRequest<HelloGetMessageResult>({ Service: 'Hello', Action: 'GetMessage' });
  }

  public async setMessage(message: string): Promise<ContractResponse<HelloSetMessageResult>> {
    return this.contract.submitInputToContract<HelloSetMessageResult>({ Service: 'Hello', Action: 'SetMessage', data: { message } });
  }
}
