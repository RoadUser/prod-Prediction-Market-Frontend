import { useEffect, useState } from 'react';
import ApiService from '@/services/api-service';
import { showSnackbar } from '@/features/snackbar/snackbarSlice';
import { useDispatch } from 'react-redux';
import { Loader2, Send, MessageSquare } from 'lucide-react';

export default function HelloDashboard() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rowId, setRowId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getInstance().getMessage();
      if ('error' in res) throw new Error(res.error.message);
      setMessage(res.success.message);
      setRowId(res.success.id);
    } catch (e: any) {
      dispatch(showSnackbar({ message: e?.message || 'Failed to load message', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const submit = async () => {
    if (!newMessage.trim()) {
      dispatch(showSnackbar({ message: 'Please enter a message', type: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      const r = await ApiService.getInstance().setMessage(newMessage.trim());
      if ('error' in r) throw new Error(r.error.message);
      dispatch(showSnackbar({ message: 'Message updated!', type: 'success' }));
      setNewMessage('');
      await load();
    } catch (e: any) {
      dispatch(showSnackbar({ message: e?.message || 'Failed to update message', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="text-2xl font-bold">Current Message</h2>
        <p className="text-gray-600 mt-1">Read the contract's persisted greeting.</p>
        <div className="mt-4 flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-primary-600" />
          {loading ? (
            <div className="inline-flex items-center gap-2 text-gray-600"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <p className="text-lg font-semibold">{message || '—'}</p>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-500">Row Id: {rowId ?? 'N/A'}</div>
        <button onClick={() => void load()} className="btn btn-secondary mt-4">Refresh</button>
      </section>

      <section className="card">
        <h2 className="text-2xl font-bold">Update Message</h2>
        <p className="text-gray-600 mt-1">Writes require consensus via HotPocket.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input className="input md:col-span-2" placeholder="Enter new message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
          <button className="btn btn-primary inline-flex items-center gap-2" onClick={() => void submit()} disabled={loading}>
            <Send className="w-4 h-4" />
            Set Message
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold">What this page does</h2>
        <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-1">
          <li>READ: Sends <code>{'{ Service: "Hello", Action: "GetMessage" }'}</code> via submitContractReadRequest</li>
          <li>WRITE: Sends <code>{'{ Service: "Hello", Action: "SetMessage", data: { message } }'}</code> via submitContractInput</li>
          <li>Displays either success or error responses from the contract</li>
        </ul>
      </section>
    </div>
  );
}
