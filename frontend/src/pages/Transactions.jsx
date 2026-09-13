import { useEffect, useState } from 'react';
import API from '../services/api.js';
import Layout from '../components/Layout.jsx';
import { 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  X
} from 'lucide-react';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    type: 'EXPENSE',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Transactions & Categories
  const fetchData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        API.get(`/transactions${filterType ? `?type=${filterType}` : ''}`),
        API.get('/categories')
      ]);
      setTransactions(transRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to fetch transaction data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType]);

  // Handle Form Submit (Create Transaction)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await API.post('/transactions', formData);
      setIsModalOpen(false);
      setFormData({
        category_id: '',
        type: 'EXPENSE',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0]
      });
      fetchData(); // Reload data
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gagal menambahkan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Transaction
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      await API.delete(`/transactions/${id}`);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus transaksi');
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Filter Kategori sesuai tipe transaksi yang dipilih di form
  // Filter Kategori sesuai tipe & hapus duplikat nama
  const filteredCategories = categories
    .filter(c => c.type === formData.type)
    .filter((cat, index, self) => index === self.findIndex((t) => t.name === cat.name));

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header & Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Transaksi</h1>
            <p className="text-sm text-slate-500">Catat dan kelola seluruh arus riwayat transaksi Anda.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Transaksi</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center space-x-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filter Tipe:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="">Semua Transaksi</option>
            <option value="INCOME">Pemasukan (Income)</option>
            <option value="EXPENSE">Pengeluaran (Expense)</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Memuat data transaksi...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-4 px-6">Kategori / Deskripsi</th>
                    <th className="py-4 px-6">Tanggal</th>
                    <th className="py-4 px-6 text-right">Nominal</th>
                    <th className="py-4 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {t.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{t.category_name}</p>
                            <p className="text-xs text-slate-400">{t.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </td>
                      <td className={`py-4 px-6 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRupiah(t.amount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        Belum ada data transaksi yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM TAMBAH TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Tambah Transaksi Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 rounded-lg text-sm font-medium transition ${formData.type === 'EXPENSE' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE', category_id: '' })}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-lg text-sm font-medium transition ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    onClick={() => setFormData({ ...formData, type: 'INCOME', category_id: '' })}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="25000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan / Deskripsi</label>
                <input
                  type="text"
                  placeholder="Contoh: Makan siang kantin"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  {isSubmitting ? 'Simpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}