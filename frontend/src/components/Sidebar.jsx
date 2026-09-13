import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Tag, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Transaksi', href: '/transactions', icon: Receipt },
    { name: 'Anggaran', href: '/budgets', icon: Target },
    { name: 'Kategori', href: '/categories', icon: Tag }, // <--- Menu Kategori
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2">
          <div className="bg-emerald-500 p-2 rounded-xl">
            <Receipt className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-bold tracking-wide">SaaS Finance</span>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-600 hover:text-white transition w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Keluar</span>
      </button>
    </aside>
  );
}