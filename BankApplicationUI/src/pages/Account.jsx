import React, { useEffect, useState } from "react";
import { FiDollarSign, FiPlusCircle, FiEdit, FiTrash2, FiRefreshCw, FiEye, FiCreditCard, FiTrendingUp, FiActivity, FiZap, FiDatabase } from "react-icons/fi";
import Swal from 'sweetalert2';
import { apiClient } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { getSubFromToken } from "../utils/jwtUtils";

const accountTypeOptions = [
  { value: "CHECKING", label: "Vadesiz Hesap", icon: "💳", color: "from-blue-500 to-cyan-500" },
  { value: "SAVINGS", label: "Vadeli Hesap", icon: "🏦", color: "from-emerald-500 to-teal-500" },
];

const currencyOptions = [
  { code: "TRY", name: "₺ TRY", symbol: "₺" },
  { code: "USD", name: "$ USD", symbol: "$" },
  { code: "EUR", name: "€ EUR", symbol: "€" },
  { code: "GBP", name: "£ GBP", symbol: "£" },
];

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    accountType: "CHECKING",
    currency: "TRY",
    balance: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editBalance, setEditBalance] = useState("");
  const { getAuthHeader } = useAuth();

  // JWT'den authId (sub) al
  const token = localStorage.getItem('token');
  const authId = getSubFromToken(token);

  // Kullanıcıya ait hesapları getir
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/accounts/user/${authId}`, {
        headers: getAuthHeader(),
      });
      setAccounts(res.data);
    } catch (e) {
      console.error("Hesaplar alınamadı:", e);
      await Swal.fire({
        title: "❌ Hata!",
        text: "Hesaplar alınamadı. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authId) fetchAccounts();
    // eslint-disable-next-line
  }, [authId]);

  // Hesap oluşturma
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...form,
        userId: authId,
        balance: parseFloat(form.balance),
      };
      await apiClient.post("/api/accounts/create", payload, {
        headers: getAuthHeader(),
      });

      // Başarılı bildirim göster
      await Swal.fire({
        title: "✅ Başarılı!",
        text: "Hesap başarıyla oluşturuldu.",
        icon: "success",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#28a745"
      });

      setForm({ accountType: "CHECKING", currency: "TRY", balance: "" });
      setShowForm(false);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "❌ Hata!",
        text: "Hesap oluşturulamadı. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (acc) => {
    setEditingId(acc.id);
    setEditBalance(acc.balance);
  };

  const handleEditBalanceChange = (e) => {
    setEditBalance(e.target.value);
  };

  const handleUpdateBalance = async (acc) => {
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance)) return;
    const diff = newBalance - acc.balance;
    if (diff === 0) {
      setEditingId(null);
      return;
    }
    try {
      await apiClient.patch(`/api/accounts/${acc.id}/balance`, { amount: diff }, {
        headers: getAuthHeader(),
      });

      await Swal.fire({
        title: "✅ Başarılı!",
        text: "Bakiye başarıyla güncellendi.",
        icon: "success",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#28a745"
      });

      setEditingId(null);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      await Swal.fire({
        title: "❌ Hata!",
        text: "Bakiye güncellenemedi. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc3545"
      });
    }
  };

  const handleDelete = async (acc) => {
    const result = await Swal.fire({
      title: "Emin misiniz?",
      text: "Bu hesabı silmek istediğinizden emin misiniz?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Evet, sil!",
      cancelButtonText: "İptal"
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/api/accounts/delete/${acc.id}`, {
          headers: getAuthHeader(),
        });

        await Swal.fire({
          title: "✅ Başarılı!",
          text: "Hesap başarıyla silindi.",
          icon: "success",
          confirmButtonText: "Tamam",
          confirmButtonColor: "#28a745"
        });

        fetchAccounts();
      } catch (err) {
        console.error(err);
        await Swal.fire({
          title: "❌ Hata!",
          text: "Hesap silinemedi. Lütfen tekrar deneyin.",
          icon: "error",
          confirmButtonText: "Tamam",
          confirmButtonColor: "#dc3545"
        });
      }
    }
  };

  const formatCurrency = (amount, currency) => {
    if (amount === null || amount === undefined) {
      return "0.00";
    }

    try {
      const currencySymbol = getCurrencySymbol(currency);

      if (currency === "TRY") {
        return `${amount.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} ${currencySymbol}`;
      }

      return `${currencySymbol}${amount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } catch (error) {
      console.error("Currency formatting error:", error);
      return `${amount} ${currency}`;
    }
  };

  const getAccountTypeIcon = (type) => {
    return accountTypeOptions.find(opt => opt.value === type)?.icon || "💳";
  };

  const getCurrencySymbol = (currency) => {
    const option = currencyOptions.find(opt => opt.code === currency);
    return option ? option.symbol : currency;
  };

  const getAccountTypeLabel = (type) => {
    return accountTypeOptions.find(opt => opt.value === type)?.label || "Hesap";
  };

  const getAccountTypeColor = (type) => {
    return accountTypeOptions.find(opt => opt.value === type)?.color || "from-gray-500 to-gray-600";
  };

  const totalBalance = accounts.reduce((sum, acc) => {
    const balance = acc.balance || 0;
    return sum + balance;
  }, 0);

  const activeAccounts = accounts.filter(acc => acc.balance > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <FiZap className="mr-3 text-blue-600" />
                Hesaplarım
              </h1>
              <p className="text-gray-600">Hesaplarınızı yönetin ve finansal durumunuzu takip edin</p>
            </div>
            <button
              onClick={fetchAccounts}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 flex items-center shadow-lg"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
          </div>
        </div>

        

                {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Stats Cards */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Toplam Hesaplar</p>
                    <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FiCreditCard className="text-2xl text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Aktif Hesaplar</p>
                    <p className="text-3xl font-bold text-gray-900">{activeAccounts}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <FiActivity className="text-2xl text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Account Creation and List */}
          <div className="lg:col-span-3">
            {/* Account Creation */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiPlusCircle className="mr-2 text-green-600" />
                  Yeni Hesap
                </h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  {showForm ? 'Gizle' : 'Ekle'}
                </button>
              </div>
              
              {showForm && (
                <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hesap Türü</label>
                    <select
                      name="accountType"
                      value={form.accountType}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {accountTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Para Birimi</label>
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {currencyOptions.map(opt => (
                        <option key={opt.code} value={opt.code}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Bakiyesi</label>
                    <input
                      type="number"
                      name="balance"
                      value={form.balance}
                      onChange={handleFormChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      disabled={creating}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 font-medium"
                    >
                      {creating ? "Oluşturuluyor..." : "Hesap Oluştur"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Accounts List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Hesaplarım</h3>
                <span className="text-gray-600 text-sm">
                  {accounts.length} hesap • {loading && "yükleniyor..."}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Hesaplar yükleniyor...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center py-12">
                  <FiCreditCard className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hesabınız yok</h3>
                  <p className="text-gray-600">İlk hesabınızı oluşturmak için sol taraftaki formu kullanın</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className={`bg-gradient-to-r ${getAccountTypeColor(acc.accountType)} p-3 rounded-xl`}>
                            <span className="text-2xl">{getAccountTypeIcon(acc.accountType)}</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{getAccountTypeLabel(acc.accountType)}</h4>
                            <p className="text-gray-600 text-sm font-mono">{acc.accountNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(acc.balance || 0, acc.currency)}
                          </p>
                          <p className="text-gray-600 text-sm">{acc.currency}</p>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        {editingId === acc.id ? (
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="number"
                              value={editBalance}
                              onChange={handleEditBalanceChange}
                              min="0"
                              step="0.01"
                              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              onClick={() => handleUpdateBalance(acc)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Kaydet
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(acc)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                            >
                              <FiEdit className="mr-2" />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDelete(acc)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;