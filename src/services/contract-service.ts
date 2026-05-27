import type { ContractResponse, InvokePayload } from '@/types';

// HotPocket browser client is exposed via window.HotPocket
const getHotPocket = (): any => (window as any)?.HotPocket;

function isTruthy(val: unknown): boolean {
  return !(val === undefined || val === null || val === '' || val === false);
}

export default class ContractService {
  private static instance: ContractService;
  private client: any | null = null;
  private userKeyPair: any | null = null;
  private servers: string[] = [];
  private mockMode = false;
  private protocol: 'json' | 'bson' = 'json';

  private promiseMap = new Map<string, { resolve: (v: any) => void; reject: (e: any) => void }>();

  private constructor() {}

  public static getInstance(): ContractService {
    if (!ContractService.instance) ContractService.instance = new ContractService();
    return ContractService.instance;
  }

  public async init(): Promise<void> {
    const envServers = (import.meta.env.VITE_CONTRACT_URLS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const protoEnv = (import.meta.env.VITE_HP_PROTOCOL as 'json' | 'bson' | undefined) || 'json';
    this.protocol = protoEnv === 'bson' ? 'bson' : 'json';

    this.mockMode = (import.meta.env.VITE_MOCK_MODE || 'true') === 'true';
    if (this.mockMode) {
      console.warn('\uD83D\uDD27 Running in MOCK MODE - using simulated data.');
      return; // Skip hotpocket initialization
    }

    // Validate URLs
    if (!envServers.length) {
      throw new Error("Please configure VITE_CONTRACT_URLS in .env or enable mock mode with VITE_MOCK_MODE=true.");
    }
    if (envServers.some((u) => /example|your-server|placeholder/i.test(u))) {
      throw new Error('Please configure valid HotPocket server URLs in .env file (VITE_CONTRACT_URLS).');
    }

    this.servers = envServers;

    const HotPocket = getHotPocket();
    if (!HotPocket) {
      throw new Error('HotPocket browser client not found. Ensure CDN script is loaded in index.html.');
    }

    try {
      this.userKeyPair = await HotPocket.generateKeys();
      // Use JSON protocol for compatibility with this backend
      this.client = await HotPocket.createClient(this.servers, this.userKeyPair, { protocol: this.protocol });
    } catch (err) {
      throw new Error('Failed to create HotPocket client. Check VITE_CONTRACT_URLS or enable mock mode.');
    }

    if (!this.client || !this.client.on || !this.client.connect) {
      throw new Error('HotPocket client created but missing required methods. Is the server reachable?');
    }

    // Bind events
    this.client.on(HotPocket.events.disconnect, () => {
      console.warn('HotPocket disconnected.');
    });
    this.client.on(HotPocket.events.connectionChange, (server: string, action: string) => {
      console.log(server + ' ' + action);
    });
    if (HotPocket.events.healthEvent) {
      try {
        this.client.on(HotPocket.events.healthEvent, (h: unknown) => console.log('healthEvent', h));
      } catch {}
    }
    this.client.on(HotPocket.events.contractOutput, (result: any) => {
      try {
        const outputs = Array.isArray(result?.outputs) ? result.outputs : [];
        outputs.forEach((o: any) => {
          let parsed: any = o?.toString?.() ?? o;
          try { parsed = JSON.parse(parsed); } catch {}
          const pid = parsed?.promiseId;
          if (isTruthy(pid) && this.promiseMap.has(pid)) {
            const { resolve, reject } = this.promiseMap.get(pid)!;
            if (parsed?.error) reject(parsed.error); else resolve(parsed?.success ?? parsed);
            this.promiseMap.delete(pid);
          } else {
            // No promise id: just log
            console.log('Contract output:', parsed);
          }
        });
      } catch (e) {
        console.error('Output handler error:', e);
      }
    });

    const ok = await this.client.connect();
    if (!ok) throw new Error('HotPocket connection failed. Check servers or enable mock mode.');
  }

  public getPublicKeyHex(): string | null {
    try {
      if (!this.userKeyPair?.publicKey) return null;
      return Buffer.from(this.userKeyPair.publicKey).toString('hex');
    } catch {
      return null;
    }
  }

  private getUniqueId(): string {
    const a = new Uint8Array(16);
    crypto.getRandomValues(a);
    return Array.from(a).map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  public async submitContractReadRequest<T = unknown>(message: InvokePayload): Promise<ContractResponse<T>> {
    if (this.mockMode) return this.mockRead<T>(message);
    if (!this.client) throw new Error('HotPocket client is not connected. Call init() first.');
    const payload = JSON.stringify(message);
    const out = await this.client.submitContractReadRequest(payload);
    try { return JSON.parse(out) as ContractResponse<T>; } catch { return { success: out as T }; }
  }

  public async submitInputToContract<T = unknown>(message: InvokePayload): Promise<ContractResponse<T>> {
    if (this.mockMode) return this.mockWrite<T>(message);
    if (!this.client) throw new Error('HotPocket client is not connected. Call init() first.');
    const promiseId = this.getUniqueId();
    const fullMsg = { ...message, promiseId };
    const payload = JSON.stringify(fullMsg);
    const res = await this.client.submitContractInput(payload);
    const status = await res.submissionStatus;
    if (status?.status !== 'accepted') {
      throw new Error(`Ledger rejection: ${status?.reason || 'Unknown reason'}`);
    }
    // Backend does not echo promiseId; return an optimistic success envelope
    return { success: { submission: 'accepted' } as unknown as T };
  }

  // Mock responders matching backend structures
  private async mockRead<T>(message: InvokePayload): Promise<ContractResponse<T>> {
    await new Promise((r) => setTimeout(r, 150));
    console.log('[MOCK] submitContractReadRequest:', message);
    const { Service, Action } = message;
    if (Service === 'Hello' && Action === 'GetMessage') {
      return { success: { id: 1, message: 'Hello World!' } as T };
    }
    return { error: { message: 'Unknown read action in mock mode' } } as ContractResponse<T>;
  }

  private async mockWrite<T>(message: InvokePayload): Promise<ContractResponse<T>> {
    await new Promise((r) => setTimeout(r, 150));
    console.log('[MOCK] submitInputToContract:', message);
    const { Service, Action, data } = message as InvokePayload<{ message?: string }>;
    if (Service === 'Hello' && Action === 'SetMessage') {
      const msg = data?.message || '';
      if (!msg) return { error: { message: 'Message is required' } } as ContractResponse<T>;
      return { success: { id: 1, message: msg } as T };
    }
    return { error: { message: 'Unknown write action in mock mode' } } as ContractResponse<T>;
  }
}
