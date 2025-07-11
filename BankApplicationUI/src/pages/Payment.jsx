import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEdit, FiTrash2, FiEye, FiX, FiFilter, FiPlusCircle } from "react-icons/fi";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { apiClient, API_CONFIG } from "../config/api";
import { getEmailFromToken, getSubFromToken } from "../utils/jwtUtils";

function generateIdempotencyKey() {
  return 'idemp-' + Math.random().toString(36).substring(2, 15);
}

const statusOptions = ["PROCESSING", "COMPLETED", "FAILED", "PENDING"];

const currencyOptions = [
  { code: "USD", name: "Amerikan Doları (USD)" },
  { code: "EUR", name: "Euro (EUR)" },
  { code: "TRY", name: "Türk Lirası (TRY)" },
  { code: "GBP", name: "İngiliz Sterlini (GBP)" },
  { code: "JPY", name: "Japon Yeni (JPY)" },
  { code: "CHF", name: "İsviçre Frangı (CHF)" },
  { code: "CAD", name: "Kanada Doları (CAD)" },
  { code: "AUD", name: "Avustralya Doları (AUD)" },
  { code: "CNY", name: "Çin Yuanı (CNY)" },
  { code: "KRW", name: "Güney Kore Wonu (KRW)" },
  { code: "RUB", name: "Rus Rublesi (RUB)" },
  { code: "INR", name: "Hindistan Rupisi (INR)" },
  { code: "BRL", name: "Brezilya Reali (BRL)" },
  { code: "MXN", name: "Meksika Pesosu (MXN)" },
  { code: "SGD", name: "Singapur Doları (SGD)" },
  { code: "HKD", name: "Hong Kong Doları (HKD)" },
  { code: "NZD", name: "Yeni Zelanda Doları (NZD)" },
  { code: "SEK", name: "İsveç Kronu (SEK)" },
  { code: "NOK", name: "Norveç Kronu (NOK)" },
  { code: "DKK", name: "Danimarka Kronu (DKK)" },
  { code: "PLN", name: "Polonya Zlotisi (PLN)" },
  { code: "CZK", name: "Çek Korunası (CZK)" },
  { code: "HUF", name: "Macar Forinti (HUF)" },
  { code: "RON", name: "Romanya Leyi (RON)" },
  { code: "BGN", name: "Bulgaristan Levası (BGN)" },
  { code: "HRK", name: "Hırvatistan Kunası (HRK)" },
  { code: "RSD", name: "Sırbistan Dinarı (RSD)" },
  { code: "UAH", name: "Ukrayna Grivnası (UAH)" },
  { code: "GOLD", name: "Gram Altın (GOLD)" },
  { code: "SILVER", name: "Gram Gümüş (SILVER)" },
  { code: "BTC", name: "Bitcoin (BTC)" },
  { code: "ETH", name: "Ethereum (ETH)" }
];

const descriptionOptions = [
  { value: "", label: "Açıklama Seçin veya Yazın" },
  { value: "Maaş ödemesi", label: "💰 Maaş ödemesi" },
  { value: "Kira ödemesi", label: "🏠 Kira ödemesi" },
  { value: "Fatura ödemesi", label: "⚡ Fatura ödemesi" },
  { value: "Market alışverişi", label: "🛒 Market alışverişi" },
  { value: "Restoran ödemesi", label: "🍽️ Restoran ödemesi" },
  { value: "Benzin ödemesi", label: "⛽ Benzin ödemesi" },
  { value: "E-ticaret alışverişi", label: "🛍️ E-ticaret alışverişi" },
  { value: "Hediye ödemesi", label: "🎁 Hediye ödemesi" },
  { value: "Eğitim ödemesi", label: "📚 Eğitim ödemesi" },
  { value: "Sağlık ödemesi", label: "🏥 Sağlık ödemesi" },
  { value: "Spor salonu ücreti", label: "💪 Spor salonu ücreti" },
  { value: "Sigorta ödemesi", label: "🛡️ Sigorta ödemesi" },
  { value: "Kredi ödemesi", label: "🏦 Kredi ödemesi" },
  { value: "Yatırım", label: "📈 Yatırım" },
  { value: "Transfer", label: "💸 Transfer" },
  { value: "İş seyahati", label: "✈️ İş seyahati" },
  { value: "Tatil ödemesi", label: "🏖️ Tatil ödemesi" },
  { value: "Araç bakımı", label: "🔧 Araç bakımı" },
  { value: "Ev bakımı", label: "🏡 Ev bakımı" },
  { value: "Teknoloji alışverişi", label: "💻 Teknoloji alışverişi" },
  { value: "Giyim alışverişi", label: "👕 Giyim alışverişi" },
  { value: "Kitap alışverişi", label: "📖 Kitap alışverişi" },
  { value: "Müzik/Video aboneliği", label: "🎵 Müzik/Video aboneliği" },
  { value: "Oyun alışverişi", label: "🎮 Oyun alışverişi" },
  { value: "Diğer", label: "📝 Diğer" }
];

function Payment() {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    senderAccountId: "",
    senderEmail: "",
    receiverAccountId: "",
    receiverEmail: "",
    amount: "",
    currency: "USD",
    paymentType: "IMMEDIATE",
    scheduledAt: "",
    description: "",
    idempotencyKey: generateIdempotencyKey(),
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    status: "",
    minAmount: "",
    maxAmount: "",
    currency: "",
    description: "",
    senderAccountId: "",
    senderEmail: "",
    receiverAccountId: "",
    receiverEmail: "",
    referenceNumber: ""
  });
  const { user, getAuthHeader } = useAuth();
  const authHeader = getAuthHeader();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;
  const [accounts, setAccounts] = useState([]);
  const [accountNumberCache, setAccountNumberCache] = useState({});

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      if (filter.status) params.status = filter.status;
      if (filter.minAmount) params.minAmount = filter.minAmount;
      if (filter.maxAmount) params.maxAmount = filter.maxAmount;

      const res = await apiClient.get(`${API_CONFIG.PAYMENT_SERVICE}`, { params });

      if (Array.isArray(res.data)) {
        const sorted = res.data.slice().sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setPayments(sorted);
      } else {
        setPayments([]);
        toast.error("Invalid data format received from server.");
      }
    } catch (e) {
      toast.error("Failed to fetch payments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userId = getSubFromToken(token);
      apiClient.get(`/api/accounts/user/${userId}`, { headers: getAuthHeader() })
        .then(res => {
          setAccounts(res.data);
        })
        .catch(err => {
          setAccounts([]);
        });
      const email = getEmailFromToken(token);
      if (email) {
        setForm(prev => ({ ...prev, senderEmail: email }));
      }
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, []);



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when filtering
    fetchPayments();
  };

  const clearFilters = () => {
    setFilter({
      startDate: "",
      endDate: "",
      status: "",
      minAmount: "",
      maxAmount: ""
    });
    setCurrentPage(1);
    fetchPayments();
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filter).some(value => value !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Payment Microservice'e ödeme kaydı oluştur

      // 2. AccountMicroservice'den alıcı account number ile id'yi bul
      const res = await apiClient.get(`/api/accounts/number/${form.receiverAccountId}`);
      const receiverId = res.data.id;
      // 3. AccountMicroservice'de transfer işlemi yap
      await apiClient.post(
        `/api/accounts/from/${form.senderAccountId}/to/${receiverId}`,
        { amount: parseFloat(form.amount) },
        { headers: getAuthHeader() }
      );
      await apiClient.post(
        `${API_CONFIG.PAYMENT_SERVICE}`,
        {
          senderAccountId: form.senderAccountId,
          senderEmail: form.senderEmail,
          receiverAccountId: form.receiverAccountId,
          receiverEmail: form.receiverEmail,
          amount: parseFloat(form.amount),
          currency: form.currency,
          paymentType: form.paymentType,
          scheduledAt: form.paymentType === "SCHEDULED" ? form.scheduledAt : null,
          description: form.description,
        },
        {
          headers: {
            "X-Idempotency-Key": form.idempotencyKey,
          },
        }
      );
      setForm({
        ...form,
        idempotencyKey: generateIdempotencyKey(),
        scheduledAt: ""
      });
      fetchPayments();
      await Swal.fire({
        icon: 'success',
        title: 'Ödeme ve Transfer Başarılı!',
        text: 'Ödeme kaydı oluşturuldu ve transfer işlemi başarıyla gerçekleştirildi.',
        confirmButtonText: 'Tamam',
      });
    } catch (e) {
      if (e.response && e.response.status === 400) {
        toast.error("Hesap Türleri Aynı Olmalıdır.");
      } else {
        toast.error(e.response?.data?.message || "Yeterli Bakiye Yok.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await apiClient.delete(`${API_CONFIG.PAYMENT_SERVICE}/${id}`);
      toast.success("Ödeme silindi.");
      setDeleteModal(null);
      fetchPayments();
    } catch (e) {
      toast.error("Ödeme silinemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, editData) => {
    setLoading(true);
    try {
      await apiClient.put(`${API_CONFIG.PAYMENT_SERVICE}/${id}`, editData);
      toast.success("Ödeme güncellendi.");
      setEditModal(null);
      fetchPayments();
    } catch (e) {
      toast.error("Ödeme güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Sayfalama için ödemeleri böl
  const pagedPayments = Array.isArray(payments) ? payments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) : [];
  const totalPages = Math.ceil((Array.isArray(payments) ? payments.length : 0) / itemsPerPage);

  // Export CSV
  const exportCSV = () => {
    if (!payments.length) return;
    const header = [
      "ID", "Gönderen", "Gönderen Email", "Alıcı", "Alıcı Email", "Tutar", "Para Birimi", "Durum", "Açıklama", "Oluşturulma", "Referans No"
    ];
    const rows = payments.map(p => [
      p.id,
      p.senderAccountId,
      p.senderEmail,
      p.receiverAccountId,
      p.receiverEmail,
      p.amount,
      p.currency,
      p.status,
      p.description,
      p.createdAt,
      p.referenceNumber
    ]);
    const csvContent = [header, ...rows].map(e => e.map(x => `"${(x || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "odeme_listesi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Excel
  const exportExcel = () => {
    if (!payments.length) return;
    const ws = XLSX.utils.json_to_sheet(payments.map(p => ({
      "ID": p.id,
      "Gönderen": p.senderAccountId,
      "Gönderen Email": p.senderEmail,
      "Alıcı": p.receiverAccountId,
      "Alıcı Email": p.receiverEmail,
      "Tutar": p.amount,
      "Para Birimi": p.currency,
      "Durum": p.status,
      "Açıklama": p.description,
      "Oluşturulma": p.createdAt,
      "Referans No": p.referenceNumber
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ödemeler");
    XLSX.writeFile(wb, "odeme_listesi.xlsx");
  };

  // Export PDF
  const exportPDF = () => {
    if (!payments.length) return;
    const doc = new jsPDF();
    const tableColumn = [
      "ID", "Gönderen", "Gönderen Email", "Alıcı", "Alıcı Email", "Tutar", "Para Birimi", "Durum", "Açıklama", "Oluşturulma", "Referans No"
    ];
    const tableRows = payments.map(p => [
      p.id,
      p.senderAccountId,
      p.senderEmail,
      p.receiverAccountId,
      p.receiverEmail,
      p.amount,
      p.currency,
      p.status,
      p.description,
      p.createdAt,
      p.referenceNumber
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, styles: { fontSize: 7 }, headStyles: { fillColor: [41, 98, 255] } });
    doc.save("odeme_listesi.pdf");
  };

  // AccountMicroservice transfer fonksiyonu
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(
        `/api/accounts/from/${form.senderAccountId}/to/${form.receiverAccountId}`,
        { amount: parseFloat(form.amount) },
        { headers: getAuthHeader() }
      );
      setForm({ ...form, amount: "" });
      await Swal.fire({
        icon: 'success',
        title: 'Transfer Başarılı!',
        text: 'Transfer işlemi başarıyla gerçekleştirildi.',
        confirmButtonText: 'Tamam',
      });
      // Hesapları güncelle
      const token = localStorage.getItem('token');
      if (token) {
        const userId = getSubFromToken(token);
        apiClient.get(`/api/accounts/user/${userId}`, { headers: getAuthHeader() })
          .then(res => setAccounts(res.data))
          .catch(() => setAccounts([]));
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  // ID'den account number'a eşleme fonksiyonu (dinamik fetch ve cache)
  const getAccountNumberById = (id) => {
    const acc = accounts.find(a => a.id === id);
    if (acc) return acc.accountNumber;
    if (accountNumberCache[id]) return accountNumberCache[id];
    // Dinamik fetch
    if (id && typeof id === 'string' && id.length > 0) {
      apiClient.get(`/api/accounts/${id}`)
        .then(res => {
          setAccountNumberCache(prev => ({ ...prev, [id]: res.data.accountNumber }));
        })
        .catch(() => {
          setAccountNumberCache(prev => ({ ...prev, [id]: id }));
        });
    }
    return id;
  };

  const handleSenderAccountChange = (e) => {
    const selectedId = e.target.value;

    setForm(prev => {
      const selectedAcc = accounts.find(acc =>
        acc.id === selectedId ||
        acc.id === parseInt(selectedId) ||
        acc.id.toString() === selectedId
      );

      const currencyValue = selectedAcc?.currency || "";

      return {
        ...prev,
        senderAccountId: selectedId,
        currency: currencyValue
      };
    });
  };

  const getCurrencyLabel = (code) => {
    if (!code || code === "") {
      return "";
    }

    const opt = currencyOptions.find(c => c.code === code || c.value === code);

    if (opt) {
      return opt.symbol ? `${opt.symbol} ${opt.label || opt.name}` : (opt.label || opt.name || code);
    } else {
      return code;
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
        <div>
          <h2 className="text-3xl font-bold text-blue-700 mb-1 text-center">Ödemeler</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Yeni Ödeme</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gönderen Bilgileri */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Gönderen Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gönderen Hesap</label>
                  <select
                    name="senderAccountId"
                    value={form.senderAccountId}
                    onChange={handleSenderAccountChange}
                    required
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Gönderen Hesap Seçin</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountNumber} ({acc.accountType}) - {acc.balance} {acc.currency}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Gönderen Email</label>
                  <input
                    name="senderEmail"
                    value={form.senderEmail}
                    onChange={handleChange}
                    required
                    placeholder="Gönderen Email"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    title="Email adresinizi girin"
                  />
                </div>
              </div>
            </div>

            {/* Alıcı Bilgileri */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Alıcı Bilgileri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alıcı Hesap Numarası</label>
                  <input
                    name="receiverAccountId"
                    value={form.receiverAccountId}
                    onChange={handleChange}
                    required
                    placeholder="Alıcı Hesap Numarası (IBAN)"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Alıcı Email</label>
                  <input
                    name="receiverEmail"
                    value={form.receiverEmail}
                    onChange={handleChange}
                    required
                    placeholder="Alıcı Email"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ödeme Detayları */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ödeme Detayları</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tutar</label>
                  <input
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Para Birimi</label>
                  <input
                    name="currency"
                    value={form.currency ? getCurrencyLabel(form.currency) : ""}
                    readOnly
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Select Currency"
                    style={{ color: form.currency ? "#111" : "#999" }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                  <select
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    {descriptionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Manuel Açıklama</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Özel açıklama ekleyin..."
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Hidden fields */}
            <input type="hidden" name="paymentType" value={form.paymentType} />
            <input type="hidden" name="idempotencyKey" value={form.idempotencyKey} />

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 font-medium text-sm transition-colors duration-200"
                disabled={loading}
              >
                <FiPlusCircle size={16} />
                {loading ? "Gönderiliyor..." : "Ödeme Yap"}
              </button>
            </div>
          </form>
        </div>

        {/* Filtreleme Kısmı */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Filtreleme</h3>
          <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Başlangıç Tarihi</label>
              <input type="datetime-local" name="startDate" value={filter.startDate} onChange={handleFilterChange} className="border border-gray-300 rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Bitiş Tarihi</label>
              <input type="datetime-local" name="endDate" value={filter.endDate} onChange={handleFilterChange} className="border border-gray-300 rounded px-2 py-1 text-xs" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Durum</label>
              <select name="status" value={filter.status} onChange={handleFilterChange} className="border border-gray-300 rounded px-2 py-1 text-xs">
                <option value="">Tümü</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Min Tutar</label>
              <input type="number" name="minAmount" value={filter.minAmount} onChange={handleFilterChange} className="border border-gray-300 rounded px-2 py-1 text-xs" placeholder="0.00" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Max Tutar</label>
              <input type="number" name="maxAmount" value={filter.maxAmount} onChange={handleFilterChange} className="border border-gray-300 rounded px-2 py-1 text-xs" placeholder="0.00" />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1 text-xs hover:bg-blue-600"><FiFilter /> Filtrele</button>
          </form>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <FiEye className="text-blue-600" />
          <h2 className="text-xl font-bold text-blue-700">Ödeme Listesi</h2>
          <div className="flex gap-2 ml-auto">
            <button onClick={exportCSV} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200">CSV</button>
            <button onClick={exportExcel} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs hover:bg-gray-200">Excel</button>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center py-10">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            <span className="text-gray-500">Yükleniyor...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-2-7v-2a2 2 0 114 0v2a2 2 0 11-4 0zm2-8a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>Hiç ödeme bulunamadı.</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-xl shadow text-sm border border-gray-100">
                <thead>
                  <tr className="bg-blue-50 text-blue-700">
                    <th className="p-2 text-left">Tarih</th>
                    <th className="p-2 text-left">Gönderen → Alıcı</th>
                    <th className="p-2 text-left">Email'ler</th>
                    <th className="p-2 text-right">Tutar</th>
                    <th className="p-2 text-center">Durum</th>
                    <th className="p-2 text-center">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPayments.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-blue-50 transition">
                      <td className="p-2 text-xs text-gray-600">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="font-medium text-gray-800">
                            {getAccountNumberById(p.senderAccountId)}
                          </div>
                          <div className="text-gray-500">→ {getAccountNumberById(p.receiverAccountId)}</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="font-medium text-gray-800">
                            {p.senderEmail}
                          </div>
                          <div className="text-gray-500">→ {p.receiverEmail}</div>
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div className="font-semibold text-gray-800">
                          {p.amount} {p.currency}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : p.status === 'FAILED' ? 'bg-red-100 text-red-700' : p.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition"
                          onClick={() => setSelected(p)}
                          title="Detay"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Paging Controls */}
            <div className="flex justify-center items-center gap-4 mt-4">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50">&lt; Geri</button>
              <span className="text-sm text-gray-600">Sayfa {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold disabled:opacity-50">İleri &gt;</button>
            </div>
          </>
        )}
        {selected && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50 transition-colors duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 flex flex-col gap-4 animate-fade-in">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setSelected(null)}><FiX size={22} /></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700"><FiEye /> Ödeme Detayı</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-semibold text-gray-600">ID:</span> <span className="font-mono">{selected.id}</span></div>
                <div><span className="font-semibold text-gray-600">Gönderen Hesap:</span> {selected.senderAccountId}</div>
                <div><span className="font-semibold text-gray-600">Gönderen Email:</span> {selected.senderEmail}</div>
                <div><span className="font-semibold text-gray-600">Alıcı Hesap:</span> {selected.receiverAccountId}</div>
                <div><span className="font-semibold text-gray-600">Alıcı Email:</span> {selected.receiverEmail}</div>
                <div><span className="font-semibold text-gray-600">Tutar:</span> {selected.amount} {selected.currency}</div>
                <div><span className="font-semibold text-gray-600">Durum:</span> <span className={`px-2 py-1 rounded text-xs font-semibold ${selected.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : selected.status === 'FAILED' ? 'bg-red-100 text-red-700' : selected.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{selected.status}</span></div>
                {selected.description && <div><span className="font-semibold text-gray-600">Açıklama:</span> {selected.description}</div>}
                {selected.createdAt && <div><span className="font-semibold text-gray-600">Oluşturulma:</span> {selected.createdAt}</div>}
                {selected.updatedAt && <div><span className="font-semibold text-gray-600">Güncellenme:</span> {selected.updatedAt}</div>}
                {selected.paymentType && <div><span className="font-semibold text-gray-600">Ödeme Tipi:</span> {selected.paymentType}</div>}
                {selected.referenceNumber && <div><span className="font-semibold text-gray-600">Referans No:</span> {selected.referenceNumber}</div>}
              </div>
            </div>
          </div>
        )}
        {editModal && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50 transition-colors duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 flex flex-col gap-4 animate-fade-in">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setEditModal(null)}><FiX size={22} /></button>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-blue-700"><FiEdit /> Ödeme Düzenle</h3>
              <form onSubmit={e => { e.preventDefault(); handleEdit(editModal.id, editModal); }} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tutar</label>
                  <input name="amount" type="number" step="0.01" value={editModal.amount} onChange={e => setEditModal({ ...editModal, amount: e.target.value })} className="border p-2 rounded w-full" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Para Birimi</label>
                  <select name="currency" value={editModal.currency} onChange={e => setEditModal({ ...editModal, currency: e.target.value })} className="border p-2 rounded w-full">
                    <option value="">Para Birimi Seçin</option>
                    {currencyOptions.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ödeme Tipi</label>
                  <select name="paymentType" value={editModal.paymentType} onChange={e => setEditModal({ ...editModal, paymentType: e.target.value })} className="border p-2 rounded w-full">
                    <option value="IMMEDIATE">Hemen</option>
                    <option value="SCHEDULED">Planlı</option>
                  </select>
                </div>
                {editModal.paymentType === "SCHEDULED" && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Planlanan Tarih</label>
                    <input
                      name="scheduledAt"
                      type="datetime-local"
                      value={editModal.scheduledAt || ""}
                      onChange={e => setEditModal({ ...editModal, scheduledAt: e.target.value })}
                      className="border p-2 rounded w-full"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Açıklama</label>
                  <div className="flex gap-2">
                    <select
                      name="description"
                      value={editModal.description}
                      onChange={e => setEditModal({ ...editModal, description: e.target.value })}
                      className="border p-2 rounded flex-1"
                    >
                      {descriptionOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      name="description"
                      value={editModal.description}
                      onChange={e => setEditModal({ ...editModal, description: e.target.value })}
                      placeholder="Manuel açıklama"
                      className="border p-2 rounded flex-1"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2 font-semibold"><FiEdit /> Kaydet</button>
              </form>
            </div>
          </div>
        )}
        {deleteModal && (
          <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50 transition-colors duration-300">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full relative border border-gray-200 flex flex-col gap-4 animate-fade-in">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={() => setDeleteModal(null)}><FiX size={22} /></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700"><FiTrash2 /> Ödeme Sil</h3>
              <p className="text-gray-700 mb-4">Bu ödemeyi silmek istediğinize emin misiniz?</p>
              <div className="flex gap-4 mt-2">
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition" onClick={() => handleDelete(deleteModal.id)}><FiTrash2 /> Evet, Sil</button>
                <button className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold transition" onClick={() => setDeleteModal(null)}>Vazgeç</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Payment; 