import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Save, AlertTriangle, Trash2, Store, CheckCircle2, Download, Upload, Settings2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Settings() {
  const { settings, updateSettings, resetStore, importData } = useStore();
  const [businessName, setBusinessName] = useState(settings?.businessName || 'JuraganApp');
  const [currency, setCurrency] = useState(settings?.currency || 'IDR');
  const [lowStockThreshold, setLowStockThreshold] = useState(settings?.lowStockThreshold?.toString() || '5');
  const [taxRate, setTaxRate] = useState(settings?.taxRate?.toString() || '11');
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ 
      businessName,
      currency,
      lowStockThreshold: Number(lowStockThreshold),
      taxRate: Number(taxRate)
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    resetStore();
    setIsResetModalOpen(false);
  };

  const handleExport = () => {
    const state = useStore.getState();
    const dataToExport = {
      transactions: state.transactions,
      inventory: state.inventory,
      customers: state.customers,
      employees: state.employees,
      warehouses: state.warehouses,
      projects: state.projects,
      settings: state.settings,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "juraganapp_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object') {
          importData(importedData);
          alert('Data berhasil diimpor!');
          window.location.reload(); // Reload to apply all changes smoothly
        }
      } catch (error) {
        alert('Gagal mengimpor data. Pastikan file JSON valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengaturan</h2>
        <p className="text-slate-500">Kelola profil bisnis dan preferensi aplikasi Anda.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Profil Bisnis & Preferensi</h3>
          </div>
          <p className="text-sm text-slate-500 ml-13">Informasi ini akan ditampilkan di seluruh aplikasi.</p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Bisnis / Toko</label>
              <input 
                type="text" 
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Contoh: Kopi Kenangan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mata Uang</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="SGD">Singapore Dollar (SGD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Batas Stok Menipis</label>
              <input 
                type="number" 
                required
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Contoh: 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pajak Default (%)</label>
              <input 
                type="number" 
                required
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Contoh: 11"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button 
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
            
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 size={16} />
                Berhasil disimpan!
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings2 size={20} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Manajemen Data</h3>
          </div>
          <p className="text-sm text-slate-500 ml-13">Ekspor atau impor data aplikasi Anda untuk keperluan backup.</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h4 className="text-slate-900 font-medium mb-1">Ekspor Data (Backup)</h4>
              <p className="text-sm text-slate-500 max-w-xl">
                Unduh seluruh data aplikasi Anda dalam format JSON.
              </p>
            </div>
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shrink-0"
            >
              <Download size={18} />
              Ekspor Data
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-slate-900 font-medium mb-1">Impor Data (Restore)</h4>
              <p className="text-sm text-slate-500 max-w-xl">
                Pulihkan data aplikasi dari file JSON yang pernah Anda ekspor sebelumnya.
              </p>
            </div>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImport}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors shrink-0"
            >
              <Upload size={18} />
              Impor Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-lg font-semibold text-rose-900">Zona Berbahaya</h3>
          </div>
          <p className="text-sm text-rose-600/80 ml-13">Tindakan di area ini tidak dapat dibatalkan.</p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-slate-900 font-medium mb-1">Hapus Semua Data</h4>
              <p className="text-sm text-slate-500 max-w-xl">
                Ini akan menghapus seluruh data transaksi, inventaris, pelanggan, karyawan, gudang, dan proyek secara permanen dari perangkat ini.
              </p>
            </div>
            <button 
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 hover:border-rose-300 font-medium transition-colors shrink-0"
            >
              <Trash2 size={18} />
              Reset Data
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Konfirmasi Hapus Data">
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 text-rose-800 rounded-xl border border-rose-100 flex gap-3">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold mb-1">Peringatan Keras!</p>
              <p>Anda akan menghapus <strong>seluruh data</strong> di aplikasi ini. Data yang dihapus tidak dapat dikembalikan lagi. Apakah Anda benar-benar yakin?</p>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Batal
            </button>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              Ya, Hapus Semua Data
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
