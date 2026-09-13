import { useEffect, useState } from 'react';
import API from '../services/api.js';
import Layout from '../components/Layout.jsx';
import { Plus, Trash2, Tag, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE'
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      // Filter kategori unik berdasarkan ID dan nama
      const uniqueCategories = res.data.data.filter(
        (cat, index, self) => index === self.findIndex((t) => t.id === cat.id)
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await API.post('/categories', formData);
      setIsModalOpen(false);
      setFormData({ name: '', type: 'EXPENSE' });
      fetchCategories();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Gagal menambahkan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
    try {
      await API.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  const incomeCats = categories.filter((c) => c.type === 'INCOME');
  const expenseCats = categories.filter((c) => c.type === 'EXPENSE');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kelola Kategori</h1>
            <p className="text-sm text-slate-500">Atur pengelompokan transaksi sesuai kebutuhan Anda.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Kategori</span>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat kategori...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kategori Pengeluaran */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Kategori Pengeluaran</h2>
                  <p className="text-xs text-slate-400">{expenseCats.length} Kategori terdaftar</p>
                </div>
              </div>
              <div className="divide-y">
                {expenseCats.map((cat) => (
                  <div key={cat.id} className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg transition">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {expenseCats.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">Belum ada kategori pengeluaran.</p>
                )}
              </div>
            </div>

            {/* Kategori Pemasukan */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Kategori Pemasukan</h2>
                  <p className="text-xs text-slate-400">{incomeCats.length} Kategori terdaftar</p>
                </div>
              </div>
              <div className="divide-y">
                {incomeCats.map((cat) => (
                  <div key={cat.id} className="py-3 flex justify-between items-center hover:bg-slate-50 px-2 rounded-lg transition">
                    <div className="flex items-center space-x-3">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {incomeCats.length === 0 && (
                  <p className="py-4 text-center text-xs text-slate-400">Belum ada kategori pemasukan.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH KATEGORI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Tambah Kategori Baru</h3>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Kategori</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`py-2 rounded-lg text-sm font-medium transition ${formData.type === 'EXPENSE' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                  >
                    Pengeluaran
                  </button>
                  <button
                    type="button"
                    className={`py-2 rounded-lg text-sm font-medium transition ${formData.type === 'INCOME' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                  >
                    Pemasukan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Transportasi, Bonus, Belanja"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  {isSubmitting ? 'Simpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}