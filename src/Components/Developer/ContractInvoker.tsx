import { useState } from 'react';
import ApiService from '@/services/api-service';
import { showSnackbar } from '@/features/snackbar/snackbarSlice';
import { useDispatch } from 'react-redux';
import { Play, RotateCcw } from 'lucide-react';

export default function ContractInvoker() {
  const dispatch = useDispatch();
  const [service, setService] = useState('Hello');
  const [action, setAction] = useState('GetMessage');
  const [data, setData] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    let parsed: unknown = undefined;
    if (data.trim()) {
      try { parsed = JSON.parse(data); } catch (e) {
        dispatch(showSnackbar({ message: 'Invalid JSON in data', type: 'error' }));
        return;
      }
    }
    setBusy(true);
    try {
      const res = await ApiService.getInstance().invoke(service, action, parsed);
      setOutput(JSON.stringify(res, null, 2));
      if ('error' in res) dispatch(showSnackbar({ message: res.error.message, type: 'error' }));
      else dispatch(showSnackbar({ message: 'Call executed', type: 'success' }));
    } catch (e: any) {
      setOutput(JSON.stringify({ error: e?.message || 'Failed' }, null, 2));
      dispatch(showSnackbar({ message: e?.message || 'Failed to invoke', type: 'error' }));
    } finally {
      setBusy(false);
    }
  };

  const reset = () => { setService('Hello'); setAction('GetMessage'); setData(''); setOutput(''); };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-3">
        <h2 className="text-2xl font-bold">Invoke Contract Method</h2>
        <div className="grid gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Service</label>
            <input className="input" value={service} onChange={(e) => setService(e.target.value)} placeholder="Hello" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Action</label>
            <input className="input" value={action} onChange={(e) => setAction(e.target.value)} placeholder="GetMessage" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Data (JSON)</label>
            <textarea className="input min-h-[140px]" value={data} onChange={(e) => setData(e.target.value)} placeholder='{"message":"Hello Evernode!"}' />
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary inline-flex items-center gap-2" onClick={() => void run()} disabled={busy}>
              <Play className="w-4 h-4" /> Execute
            </button>
            <button className="btn btn-secondary inline-flex items-center gap-2" onClick={reset} disabled={busy}>
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold">Response</h2>
        <pre className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto text-sm text-gray-800 min-h-[260px] whitespace-pre-wrap">{output || 'No output yet.'}</pre>
      </section>
    </div>
  );
}
