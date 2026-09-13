import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  LogOut, 
  Wallet,
  User
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Transaksi', path: '/transactions', icon: Receipt },
    { label: 'Anggaran (Budget)', path: '/budgets', icon: PieChart },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between hidden md:flex">
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
            <div className="p-2 bg-emerald-500 rounded-lg text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="font-bold text-lg tracking-wide">FinanceApp</span>
          </div>

          {/* Nav Items */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="p-2 bg-slate-800 rounded-full text-slate-300">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center md:justify-end">
          <div className="md:hidden flex items-center space-x-2 font-bold text-slate-800">
            <Wallet className="w-6 h-6 text-emerald-600" />
            <span>FinanceApp</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 font-medium">
              Halo, <strong className="text-slate-900">{user?.name}</strong>
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}