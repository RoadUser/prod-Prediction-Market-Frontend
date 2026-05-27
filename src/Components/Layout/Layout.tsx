import { Outlet, Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ContractService from '@/services/contract-service';
import { useDispatch, useSelector } from 'react-redux';
import { setIdentity, clearIdentity } from '@/features/auth/authSlice';
import type { RootState } from '@/app/store';
import { Check, Link2, Settings } from 'lucide-react';

export default function Layout() {
  const dispatch = useDispatch();
  const { connected, publicKeyHex } = useSelector((s: RootState) => s.auth);
  const [initError, setInitError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await ContractService.getInstance().init();
        const pk = ContractService.getInstance().getPublicKeyHex();
        if (pk) dispatch(setIdentity({ publicKeyHex: pk }));
        setInitialized(true);
      } catch (e: any) {
        setInitError(e?.message || 'Failed to initialize HotPocket client. Check VITE_CONTRACT_URLS or enable mock mode.');
      }
    };
    void init();
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="app-hero">
        <div className="container-page py-8 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight">Hello Greeter</Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-blue-100">{publicKeyHex ? `PubKey: ${publicKeyHex.slice(0, 10)}...` : 'Anonymous'}</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${connected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-blue-500/20 text-blue-100'}`}>
              <Check className="w-4 h-4" />
              {initialized ? 'Initialized' : 'Initializing'}
            </span>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="container-page py-3 flex items-center gap-4 text-sm">
          <NavLink to="/" end className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Dashboard</NavLink>
          <NavLink to="/invoke" className={({ isActive }) => `px-3 py-2 rounded-lg ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>Developer Console</NavLink>
          <a href="https://github.com/EvernodeXRPL" target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <Link2 className="w-4 h-4" /> Docs
          </a>
          <button className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {initError ? (
        <div className="container-page mt-6">
          <div className="card border border-rose-200">
            <p className="text-rose-700 font-medium">{initError}</p>
            <p className="text-gray-600 mt-2 text-sm">Tip: Enable mock mode by setting <code>VITE_MOCK_MODE=true</code> in your .env or configure <code>VITE_CONTRACT_URLS</code> with valid HotPocket wss endpoints.</p>
          </div>
        </div>
      ) : null}

      <main className="flex-1 container-page py-8">
        <Outlet />
      </main>

      <footer className="bg-gray-100 py-6 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} Hello Greeter. All rights reserved.
      </footer>
    </div>
  );
}
