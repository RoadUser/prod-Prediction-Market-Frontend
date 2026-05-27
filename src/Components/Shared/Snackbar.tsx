import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideSnackbar } from '@/features/snackbar/snackbarSlice';
import type { RootState } from '@/app/store';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

export default function Snackbar() {
  const dispatch = useDispatch();
  const { open, message, type } = useSelector((s: RootState) => s.snackbar);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => dispatch(hideSnackbar()), 3000);
    return () => clearTimeout(t);
  }, [open, dispatch]);

  if (!open) return null;

  const Icon = type === 'success' ? CircleCheck : type === 'error' ? CircleAlert : type === 'warning' ? TriangleAlert : Info;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 bg-white shadow-xl rounded-xl px-4 py-3 border border-gray-200">
        <Icon className={type === 'success' ? 'text-emerald-600' : type === 'error' ? 'text-rose-600' : type === 'warning' ? 'text-amber-600' : 'text-primary-600'} />
        <p className="text-gray-800">{message}</p>
        <button className="ml-2 text-gray-500 hover:text-gray-700" onClick={() => dispatch(hideSnackbar())} aria-label="Close snackbar">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
