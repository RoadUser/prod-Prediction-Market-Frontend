import { Routes, Route } from 'react-router-dom';
import Layout from '@/Components/Layout/Layout';
import HelloDashboard from '@/Components/Hello/HelloDashboard';
import ContractInvoker from '@/Components/Developer/ContractInvoker';
import NotFound from '@/Components/Shared/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HelloDashboard />} />
        <Route path="invoke" element={<ContractInvoker />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
