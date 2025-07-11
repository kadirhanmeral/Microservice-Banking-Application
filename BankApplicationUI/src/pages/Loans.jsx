import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { FiEdit, FiTrash2, FiEye, FiX, FiFilter, FiPlusCircle, FiDollarSign, FiCalendar, FiPercent, FiCheckCircle, FiXCircle } from "react-icons/fi";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { apiClient, API_CONFIG } from "../config/api";
import { getSubFromToken, isAdminOrManager } from "../utils/jwtUtils";

const loanTypeOptions = [
  { value: "PERSONAL", label: "💰 Kişisel Kredi" },
  { value: "MORTGAGE", label: "🏠 Konut Kredisi" },
  { value: "AUTO", label: "🚗 Araç Kredisi" },
  { value: "BUSINESS", label: "🏢 İş Kredisi" },
  { value: "STUDENT", label: "🎓 Öğrenci Kredisi" },
  { value: "MEDICAL", label: "🏥 Sağlık Kredisi" },
  { value: "TRAVEL", label: "✈️ Seyahat Kredisi" },
  { value: "WEDDING", label: "💒 Düğün Kredisi" },
  { value: "RENOVATION", label: "🔨 Tadilat Kredisi" },
  { value: "DEBT_CONSOLIDATION", label: "🔄 Borç Birleştirme" }
];

const loanStatusOptions = [
  { value: "PENDING", label: "⏳ Beklemede" },
  { value: "APPROVED", label: "✅ Onaylandı" },
  { value: "ACTIVE", label: "🟢 Aktif" },
  { value: "COMPLETED", label: "🏁 Tamamlandı" },
  { value: "DEFAULTED", label: "❌ Temerrüt" },
  { value: "REJECTED", label: "🚫 Reddedildi" },
  { value: "CANCELLED", label: "🚪 İptal Edildi" }
];

const repaymentFrequencyOptions = [
  { value: "WEEKLY", label: "📅 Haftalık" },
  { value: "BIWEEKLY", label: "📅 İki Haftalık" },
  { value: "MONTHLY", label: "📅 Aylık" },
  { value: "QUARTERLY", label: "📅 Üç Aylık" },
  { value: "SEMIANNUAL", label: "📅 Altı Aylık" },
  { value: "ANNUAL", label: "📅 Yıllık" }
];

const currencyOptions = [
  { code: "USD", name: "💵 Amerikan Doları (USD)" },
  { code: "EUR", name: "💶 Euro (EUR)" },
  { code: "TRY", name: "₺ Türk Lirası (TRY)" },
  { code: "GBP", name: "💷 İngiliz Sterlini (GBP)" },
  { code: "JPY", name: "💴 Japon Yeni (JPY)" },
  { code: "CHF", name: "🇨🇭 İsviçre Frangı (CHF)" },
  { code: "CAD", name: "🇨🇦 Kanada Doları (CAD)" },
  { code: "AUD", name: "🇦🇺 Avustralya Doları (AUD)" }
];

const interestRateOptions = [
  { value: "5.0", label: "5.0% - Düşük Risk" },
  { value: "6.5", label: "6.5% - Standart" },
  { value: "8.0", label: "8.0% - Orta Risk" },
  { value: "10.0", label: "10.0% - Yüksek Risk" },
  { value: "12.0", label: "12.0% - Öğrenci Kredisi" },
  { value: "15.0", label: "15.0% - Kredi Kartı" },
  { value: "18.0", label: "18.0% - Yüksek Risk" },
  { value: "20.0", label: "20.0% - Acil Kredi" },
  { value: "25.0", label: "25.0% - Teminatlı Kredi" },
  { value: "30.0", label: "30.0% - Yüksek Teminat" }
];

const termInMonthsOptions = [
  { value: "3", label: "3 Ay - Kısa Vadeli" },
  { value: "6", label: "6 Ay - Kısa Vadeli" },
  { value: "12", label: "12 Ay - 1 Yıl" },
  { value: "18", label: "18 Ay - 1.5 Yıl" },
  { value: "24", label: "24 Ay - 2 Yıl" },
  { value: "36", label: "36 Ay - 3 Yıl" },
  { value: "48", label: "48 Ay - 4 Yıl" },
  { value: "60", label: "60 Ay - 5 Yıl" },
  { value: "84", label: "84 Ay - 7 Yıl" },
  { value: "120", label: "120 Ay - 10 Yıl" },
  { value: "180", label: "180 Ay - 15 Yıl" },
  { value: "240", label: "240 Ay - 20 Yıl" },
  { value: "300", label: "300 Ay - 25 Yıl" },
  { value: "360", label: "360 Ay - 30 Yıl" }
];

function Loans() {
  console.log("=== LOANS COMPONENT RENDER ===");

  const [loans, setLoans] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    loanType: "PERSONAL",
    loanAmount: "",
    currency: "TRY",
    termInMonths: "24",
    interestRate: "8.0",
    repaymentFrequency: "MONTHLY",
    startDate: "",
    endDate: "",
    coSignerId: "",
    collateral: ""
  });
  const [eligibilityForm, setEligibilityForm] = useState({
    customerId: "",
    monthlyIncome: "",
    incomeCurrency: "TRY",
    loanAmount: "",
    loanCurrency: "TRY",
    termInMonths: "24",
    interestRate: "8.0"
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [filter, setFilter] = useState({
    customerId: "",
    status: "",
    loanType: "",
    minAmount: "",
    maxAmount: "",
    currency: "",
    startDate: "",
    endDate: ""
  });
  const { user, getAuthHeader } = useAuth();
  const authHeader = getAuthHeader();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  console.log("Loans component state:", { user, authHeader, loading });

  const fetchLoans = async (customerId = null) => {
    setLoading(true);
    try {
      console.log("🔍 FETCH LOANS BAŞLADI");
      console.log("API URL:", `${API_CONFIG.GATEWAY_URL}${API_CONFIG.LOANS_SERVICE}`);
      console.log("🔍 Current filter state:", filter);
      console.log("🔍 Filters applied:", filtersApplied);
      console.log("🔍 Customer ID parameter:", customerId);

      const params = {};
      // Önce parametre olarak gelen customerId'yi kontrol et
      if (customerId) {
        params.customerId = customerId;
        console.log("🔍 Filtering by customer ID parameter:", customerId);
      } else if (filter.customerId) {
        // Parametre yoksa filter state'inden al
        params.customerId = filter.customerId;
        console.log("🔍 Filtering by customer ID from filter:", filter.customerId);
      }
      if (filter.status) params.status = filter.status;
      if (filter.loanType) params.loanType = filter.loanType;
      if (filter.minAmount) params.minAmount = filter.minAmount;
      if (filter.maxAmount) params.maxAmount = filter.maxAmount;
      if (filter.currency) params.currency = filter.currency;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;

      console.log("🔍 Request params:", params);
      console.log("🔍 Final API call URL:", `${API_CONFIG.LOANS_SERVICE + "/all"}`);

      const res = await apiClient.get(`${API_CONFIG.LOANS_SERVICE + "/all"}`, { params });
      console.log("✅ API Response:", res.data);
      console.log("✅ Loans count:", res.data.length);
      console.log("✅ Setting loans state with:", res.data.length, "items");
      if (filter.customerId) {
        console.log("✅ Filtered loans for customer ID:", filter.customerId);
      } else {
        console.log("✅ All loans fetched (no customer ID filter)");
      }
      setLoans(res.data);
    } catch (e) {
      console.error("❌ Fetch loans error:", e);
      console.error("❌ Error details:", e.response?.data);
      // toast.error("Krediler alınamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  // Get customer ID from JWT token and set it in the form, then fetch loans
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      console.log("🔍 Checking for token in localStorage:", !!token);

      if (token) {
        const customerId = getSubFromToken(token);
        console.log("🔍 Customer ID extracted:", customerId);

        if (customerId) {
          console.log("👤 Setting Customer ID from JWT token:", customerId);
          setForm(prev => ({ ...prev, customerId: customerId }));
          setEligibilityForm(prev => ({ ...prev, customerId: customerId }));
          setFilter(prev => ({ ...prev, customerId: customerId }));

          // Customer ID set edildikten sonra kredileri çek
          console.log("🔄 Customer ID set, fetching loans for customer:", customerId);
          setTimeout(() => {
            fetchLoans(customerId);
          }, 100); // Kısa bir gecikme ile state'in güncellenmesini bekle
        } else {
          console.log("⚠️ No customer ID found in token");
          // Customer ID yoksa tüm kredileri çek
          fetchLoans(null);
        }
      } else {
        console.log("⚠️ No token found in localStorage");
        // Token yoksa tüm kredileri çek
        fetchLoans(null);
      }
    } catch (error) {
      console.error("❌ Error in customer ID useEffect:", error);
      // Hata durumunda tüm kredileri çek
      fetchLoans(null);
    }
  }, []);

  // Add a state to track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEligibilityChange = (e) => {
    setEligibilityForm({ ...eligibilityForm, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (e) => {
    console.log("🔍 Filter change:", e.target.name, "=", e.target.value);
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    console.log("🔍 Filter submit - current filter state:", filter);
    setCurrentPage(1); // Reset to first page when filtering
    setFiltersApplied(true);
    fetchLoans();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("🔍 Creating loan with customerId:", form.customerId);
      console.log("🔍 Full form data:", form);
      await apiClient.post(
        `${API_CONFIG.LOANS_SERVICE}/create`,
        {
          customerId: form.customerId,
          loanType: form.loanType,
          loanAmount: parseFloat(form.loanAmount),
          currency: form.currency,
          termInMonths: parseInt(form.termInMonths),
          interestRate: parseFloat(form.interestRate),
          repaymentFrequency: form.repaymentFrequency,
          startDate: form.startDate,
          endDate: form.endDate,
          coSignerId: form.coSignerId || null,
          collateral: form.collateral
        }
      );

      // Başarılı bildirim göster
      await Swal.fire({
        title: "✅ Başarılı!",
        text: "Kredi başarıyla oluşturuldu.",
        icon: "success",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#28a745"
      });

      // Reset form but keep customerId
      const currentCustomerId = form.customerId;
      setForm({
        customerId: currentCustomerId,
        loanType: "PERSONAL",
        loanAmount: "",
        currency: "TRY",
        termInMonths: "24",
        interestRate: "8.0",
        repaymentFrequency: "MONTHLY",
        startDate: "",
        endDate: "",
        coSignerId: "",
        collateral: ""
      });
      fetchLoans(null);
    } catch (e) {
      console.error("❌ Create loan error:", e);
      // Hata bildirimi göster
      await Swal.fire({
        title: "❌ Hata!",
        text: "Kredi oluşturulamadı. Lütfen tekrar deneyin.",
        icon: "error",
        confirmButtonText: "Tamam",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEligibilityCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post(
        `${API_CONFIG.LOANS_SERVICE}/eligibility`,
        {
          customerId: eligibilityForm.customerId,
          monthlyIncome: parseFloat(eligibilityForm.monthlyIncome),
          incomeCurrency: eligibilityForm.incomeCurrency,
          loanAmount: parseFloat(eligibilityForm.loanAmount),
          loanCurrency: eligibilityForm.loanCurrency,
          termInMonths: parseInt(eligibilityForm.termInMonths),
          interestRate: parseFloat(eligibilityForm.interestRate)
        }
      );

      setEligibilityResult(res.data);
      // toast.success("Uygunluk kontrolü tamamlandı!");
    } catch (e) {
      console.error("❌ Eligibility check error:", e);
      // toast.error("Uygunluk kontrolü yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu krediyi silmek istediğinizden emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Evet, sil!",
        cancelButtonText: "İptal"
      }).then(async (result) => {
        if (result.isConfirmed) {
          await apiClient.delete(`${API_CONFIG.LOANS_SERVICE}/${id}`);
          // toast.success("Kredi başarıyla silindi!");
          fetchLoans(null);
        }
      });
    } catch (e) {
      console.error("❌ Delete loan error:", e);
      // toast.error("Kredi silinemedi. Lütfen tekrar deneyin.");
    }
  };

  const handleEdit = async (id, editData) => {
    try {
      console.log("🔍 Edit loan data:", editData);
      console.log("🔍 Edit loan ID:", id);

      // API'ye gönderilecek veriyi hazırla
      const updateData = {
        loanId: id,
        customerId: editModal.customerId,
        loanType: editModal.loanType,
        loanAmount: parseFloat(editData.loanAmount),
        currency: editModal.currency,
        termInMonths: parseInt(editData.termInMonths),
        interestRate: parseFloat(editData.interestRate),
        repaymentFrequency: editModal.repaymentFrequency,
        startDate: editModal.startDate,
        endDate: editData.endDate,
        coSignerId: editModal.coSignerId || null,
        collateral: editModal.collateral || ""
      };

      console.log("🔍 Full update data:", updateData);

      await apiClient.put(`${API_CONFIG.LOANS_SERVICE}/${id}`, updateData);
      // toast.success("Kredi başarıyla güncellendi!");
      setEditModal(null);

      // Güncelleme sonrası filtreleri temizle ve tüm verileri çek
      console.log("🔄 Güncelleme sonrası filtreleri temizleme ve verileri yenileme");
      setFilter({
        customerId: "",
        status: "",
        loanType: "",
        minAmount: "",
        maxAmount: "",
        currency: "",
        startDate: "",
        endDate: ""
      });
      setFiltersApplied(false);
      setCurrentPage(1);
      fetchLoans(null);
    } catch (e) {
      console.error("❌ Update loan error:", e);
      console.error("❌ Error response:", e.response?.data);
      // toast.error("Kredi güncellenemedi. Lütfen tekrar deneyin.");
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Müşteri ID", "Kredi Türü", "Tutar", "Para Birimi", "Vade (Ay)", "Faiz Oranı", "Durum", "Kalan Bakiye"],
      ...loans.map(loan => [
        loan.loanId,
        loan.customerId,
        loan.loanType,
        loan.loanAmount,
        loan.currency,
        loan.termInMonths,
        loan.interestRate,
        loan.status,
        loan.outstandingBalance
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `loans_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(loans.map(loan => ({
      ID: loan.loanId,
      "Müşteri ID": loan.customerId,
      "Kredi Türü": loan.loanType,
      "Tutar": loan.loanAmount,
      "Para Birimi": loan.currency,
      "Vade (Ay)": loan.termInMonths,
      "Faiz Oranı": loan.interestRate,
      "Ödeme Sıklığı": loan.repaymentFrequency,
      "Durum": loan.status,
      "Kalan Bakiye": loan.outstandingBalance,
      "Başlangıç Tarihi": loan.startDate,
      "Bitiş Tarihi": loan.endDate
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Krediler");
    XLSX.writeFile(wb, `loans_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "Müşteri ID", "Kredi Türü", "Tutar", "Para Birimi", "Durum"]],
      body: loans.map(loan => [
        loan.loanId,
        loan.customerId,
        loan.loanType,
        loan.loanAmount,
        loan.currency,
        loan.status
      ]),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`loans_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const clearFilters = () => {
    // Clear all filters including customer ID
    setFilter({
      customerId: "",
      status: "",
      loanType: "",
      minAmount: "",
      maxAmount: "",
      currency: "",
      startDate: "",
      endDate: ""
    });
    setCurrentPage(1); // Reset to first page when clearing filters
    setFiltersApplied(false);
    fetchLoans(null); // Fetch loans after clearing filters
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "text-green-600 bg-green-100";
      case "APPROVED": return "text-blue-600 bg-blue-100";
      case "PENDING": return "text-yellow-600 bg-yellow-100";
      case "COMPLETED": return "text-purple-600 bg-purple-100";
      case "DEFAULTED": return "text-red-600 bg-red-100";
      case "REJECTED": return "text-red-600 bg-red-100";
      case "CANCELLED": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const paginatedLoans = loans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(loans.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* <ToastContainer position="top-right" /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Krediler
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                CSV Export
              </button>
              <button
                onClick={exportExcel}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Excel Export
              </button>

            </div>
          </div>

          {/* Create Loan Form */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FiPlusCircle className="mr-2" />
              Yeni Kredi Ekle
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="hidden"
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
              />
              <select
                name="loanType"
                value={form.loanType}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {loanTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="number"
                name="loanAmount"
                placeholder="Kredi Tutarı *"
                value={form.loanAmount}
                onChange={handleChange}
                required
                step="0.01"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencyOptions.map(currency => (
                  <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
              </select>
              <select
                name="termInMonths"
                value={form.termInMonths}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {termInMonthsOptions.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
                ))}
              </select>
              <select
                name="interestRate"
                value={form.interestRate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {interestRateOptions.map(rate => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
              <select
                name="repaymentFrequency"
                value={form.repaymentFrequency}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {repaymentFrequencyOptions.map(frequency => (
                  <option key={frequency.value} value={frequency.value}>{frequency.label}</option>
                ))}
              </select>
              <input
                type="date"
                name="startDate"
                placeholder="Başlangıç Tarihi *"
                value={form.startDate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="endDate"
                placeholder="Bitiş Tarihi *"
                value={form.endDate}
                onChange={handleChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="coSignerId"
                placeholder="Kefil ID (Opsiyonel)"
                value={form.coSignerId}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                name="collateral"
                placeholder="Teminat/Teminat Açıklaması"
                value={form.collateral}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                rows="2"
              />
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Ekleniyor..." : "Kredi Ekle"}
                </button>
              </div>
            </form>
          </div>

          {/* Eligibility Check Form */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FiCheckCircle className="mr-2" />
              Kredi Uygunluk Kontrolü
            </h3>
            <form onSubmit={handleEligibilityCheck} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="hidden"
                name="customerId"
                value={eligibilityForm.customerId}
                onChange={handleEligibilityChange}
                required
              />
              <input
                type="number"
                name="monthlyIncome"
                placeholder="Aylık Gelir *"
                value={eligibilityForm.monthlyIncome}
                onChange={handleEligibilityChange}
                required
                step="0.01"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="incomeCurrency"
                value={eligibilityForm.incomeCurrency}
                onChange={handleEligibilityChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencyOptions.map(currency => (
                  <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
              </select>
              <input
                type="number"
                name="loanAmount"
                placeholder="Kredi Tutarı *"
                value={eligibilityForm.loanAmount}
                onChange={handleEligibilityChange}
                required
                step="0.01"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="loanCurrency"
                value={eligibilityForm.loanCurrency}
                onChange={handleEligibilityChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currencyOptions.map(currency => (
                  <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
              </select>
              <select
                name="termInMonths"
                value={eligibilityForm.termInMonths}
                onChange={handleEligibilityChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {termInMonthsOptions.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
                ))}
              </select>
              <select
                name="interestRate"
                value={eligibilityForm.interestRate}
                onChange={handleEligibilityChange}
                required
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {interestRateOptions.map(rate => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
              <div className="md:col-span-2 lg:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Kontrol Ediliyor..." : "Uygunluk Kontrolü"}
                </button>
              </div>
            </form>

            {/* Eligibility Result */}
            {eligibilityResult && (
              <div className={`mt-4 p-4 rounded-lg ${eligibilityResult.eligible ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                <div className="flex items-center">
                  {eligibilityResult.eligible ? (
                    <FiCheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  ) : (
                    <FiXCircle className="h-6 w-6 text-red-600 mr-2" />
                  )}
                  <h4 className={`font-semibold ${eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'}`}>
                    {eligibilityResult.eligible ? 'Uygun' : 'Uygun Değil'}
                  </h4>
                </div>
                <p className={`mt-2 ${eligibilityResult.eligible ? 'text-green-700' : 'text-red-700'}`}>
                  {eligibilityResult.reason}
                </p>
              </div>
            )}
          </div>

          {/* Filter Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FiFilter className="mr-2" />
                Filtreleme
                {filtersApplied && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Aktif
                  </span>
                )}
              </h3>
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Filtreleri Temizle
              </button>
            </div>
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="hidden"
                name="customerId"
                value={filter.customerId}
                onChange={handleFilterChange}
              />
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                {loanStatusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <select
                name="loanType"
                value={filter.loanType}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Kredi Türleri</option>
                {loanTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                name="currency"
                value={filter.currency}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Para Birimleri</option>
                {currencyOptions.map(currency => (
                  <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
              </select>
              <input
                type="number"
                name="minAmount"
                placeholder="Min Tutar"
                value={filter.minAmount}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="maxAmount"
                placeholder="Max Tutar"
                value={filter.maxAmount}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="startDate"
                placeholder="Başlangıç Tarihi"
                value={filter.startDate}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="endDate"
                placeholder="Bitiş Tarihi"
                value={filter.endDate}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Filtreleniyor..." : "Filtrele"}
                </button>
              </div>
            </form>

            {/* Active Filters Summary */}
            {filtersApplied && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Aktif Filtreler:</h4>
                <div className="flex flex-wrap gap-2">
                  {filter.status && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Durum: {loanStatusOptions.find(s => s.value === filter.status)?.label || filter.status}
                    </span>
                  )}
                  {filter.loanType && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Kredi Türü: {loanTypeOptions.find(t => t.value === filter.loanType)?.label || filter.loanType}
                    </span>
                  )}
                  {filter.currency && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Para Birimi: {currencyOptions.find(c => c.code === filter.currency)?.name || filter.currency}
                    </span>
                  )}
                  {filter.minAmount && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Min Tutar: {filter.minAmount}
                    </span>
                  )}
                  {filter.maxAmount && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Max Tutar: {filter.maxAmount}
                    </span>
                  )}
                  {filter.startDate && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Başlangıç: {filter.startDate}
                    </span>
                  )}
                  {filter.endDate && (
                    <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
                      Bitiş: {filter.endDate}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filtersApplied ? (
                <span>
                  <strong>{loans.length}</strong> kredi bulundu
                  {loading && " (yükleniyor...)"}
                </span>
              ) : (
                <span>
                  Toplam <strong>{loans.length}</strong> kredi
                  {loading && " (yükleniyor...)"}
                </span>
              )}
            </div>
          </div>

          {/* Loans Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kredi Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar & Vade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faiz & Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarihler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : paginatedLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Kredi bulunamadı
                    </td>
                  </tr>
                ) : (
                  paginatedLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <FiDollarSign className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {loan.loanType}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {loan.loanId}
                            </div>
                            <div className="text-sm text-gray-500">
                              Müşteri: {loan.customerId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            {loan.loanAmount} {loan.currency}
                          </div>
                          <div className="text-sm text-gray-500">
                            Kalan: {loan.outstandingBalance} {loan.currency}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Vade: {loan.termInMonths} ay
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          {loan.interestRate}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.repaymentFrequency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          {loan.startDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          {loan.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelected(loan)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditModal(loan)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loan.loanId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                {filtersApplied ? (
                  <span>Filtrelenmiş sonuçlar: {loans.length} kredi</span>
                ) : (
                  <span>Toplam {loans.length} kredi</span>
                )}
                {loading && " (yükleniyor...)"}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Loan Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kredi Detayları</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Temel Bilgiler</h4>
                <p><strong>ID:</strong> {selected.loanId}</p>
                <p><strong>Müşteri ID:</strong> {selected.customerId}</p>
                <p><strong>Kredi Türü:</strong> {selected.loanType}</p>
                <p><strong>Tutar:</strong> {selected.loanAmount} {selected.currency}</p>
                <p><strong>Kalan Bakiye:</strong> {selected.outstandingBalance} {selected.currency}</p>
                <p><strong>Durum:</strong> {selected.status}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Kredi Detayları</h4>
                <p><strong>Vade:</strong> {selected.termInMonths} ay</p>
                <p><strong>Faiz Oranı:</strong> {selected.interestRate}%</p>
                <p><strong>Ödeme Sıklığı:</strong> {selected.repaymentFrequency}</p>
                <p><strong>Başlangıç:</strong> {selected.startDate}</p>
                <p><strong>Bitiş:</strong> {selected.endDate}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kredi Düzenle</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editModal.loanId, {
                loanAmount: editModal.loanAmount,
                termInMonths: editModal.termInMonths,
                interestRate: editModal.interestRate,
                endDate: editModal.endDate
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kredi Tutarı</label>
                  <input
                    type="number"
                    placeholder="Kredi Tutarı"
                    value={editModal.loanAmount}
                    onChange={(e) => setEditModal({ ...editModal, loanAmount: e.target.value })}
                    step="0.01"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vade (Ay)</label>
                  <input
                    type="number"
                    placeholder="Vade (Ay)"
                    value={editModal.termInMonths}
                    onChange={(e) => setEditModal({ ...editModal, termInMonths: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Faiz Oranı (%)</label>
                  <input
                    type="number"
                    placeholder="Faiz Oranı (%)"
                    value={editModal.interestRate}
                    onChange={(e) => setEditModal({ ...editModal, interestRate: e.target.value })}
                    step="0.01"
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    placeholder="Bitiş Tarihi"
                    value={editModal.endDate}
                    onChange={(e) => setEditModal({ ...editModal, endDate: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kredi Türü</label>
                  <select
                    value={editModal.loanType}
                    onChange={(e) => setEditModal({ ...editModal, loanType: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  >
                    {loanTypeOptions.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                  <select
                    value={editModal.currency}
                    onChange={(e) => setEditModal({ ...editModal, currency: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  >
                    {currencyOptions.map(currency => (
                      <option key={currency.code} value={currency.code}>{currency.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Sıklığı</label>
                  <select
                    value={editModal.repaymentFrequency}
                    onChange={(e) => setEditModal({ ...editModal, repaymentFrequency: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  >
                    {repaymentFrequencyOptions.map(frequency => (
                      <option key={frequency.value} value={frequency.value}>{frequency.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                  <input
                    type="date"
                    placeholder="Başlangıç Tarihi"
                    value={editModal.startDate}
                    onChange={(e) => setEditModal({ ...editModal, startDate: e.target.value })}
                    required
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kefil ID (Opsiyonel)</label>
                    <input
                      type="text"
                      placeholder="Kefil ID"
                      value={editModal.coSignerId || ""}
                      onChange={(e) => setEditModal({ ...editModal, coSignerId: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teminat Açıklaması</label>
                    <textarea
                      placeholder="Teminat/Teminat Açıklaması"
                      value={editModal.collateral || ""}
                      onChange={(e) => setEditModal({ ...editModal, collateral: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                      rows="2"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Loans; 