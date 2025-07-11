import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiCheckCircle, FiXCircle, FiEye, FiDollarSign, FiCalendar, FiPercent, FiClock, FiUser, FiFileText } from "react-icons/fi";
import Swal from 'sweetalert2';
import { apiClient, API_CONFIG } from "../config/api";
import { getSubFromToken } from "../utils/jwtUtils";

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

const repaymentFrequencyOptions = [
  { value: "WEEKLY", label: "📅 Haftalık" },
  { value: "BIWEEKLY", label: "📅 İki Haftalık" },
  { value: "MONTHLY", label: "📅 Aylık" },
  { value: "QUARTERLY", label: "📅 Üç Aylık" },
  { value: "SEMIANNUAL", label: "📅 Altı Aylık" },
  { value: "ANNUAL", label: "📅 Yıllık" }
];

function LoanApproval() {
  console.log("=== LOAN APPROVAL COMPONENT RENDER ===");

  const [pendingLoans, setPendingLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user, getAuthHeader } = useAuth();

  console.log("Loan Approval component state:", { user, loading });

  const fetchPendingLoans = async () => {
    setLoading(true);
    try {
      console.log("🔍 FETCH PENDING LOANS BAŞLADI");

      const params = { status: "PENDING" };
      console.log("Request params:", params);

      const res = await apiClient.get(`${API_CONFIG.LOANS_SERVICE}/all`, { params });
      console.log("✅ API Response:", res.data);
      console.log("✅ Pending loans count:", res.data.length);
      setPendingLoans(res.data);
    } catch (e) {
      console.error("❌ Fetch pending loans error:", e);
      console.error("❌ Error details:", e.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const handleApprove = async (loanId) => {
    try {
      const result = await Swal.fire({
        title: "Krediyi Onayla",
        text: "Bu krediyi onaylamak istediğinizden emin misiniz?",
        input: "text",
        inputLabel: "Onay Gerekçesi (Opsiyonel)",
        inputPlaceholder: "Onay gerekçesini yazın...",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Onayla",
        cancelButtonText: "İptal",
        inputValidator: (value) => {
          // Onay gerekçesi opsiyonel
          return null;
        }
      });

      if (result.isConfirmed) {
        setLoading(true);

        const updateData = {
          loanStatus: "ACTIVE"
        };

        console.log("🔍 Approving loan:", loanId, updateData);
        console.log("🔍 API URL:", `${API_CONFIG.LOANS_SERVICE}/${loanId}/status`);
        console.log("🔍 Request body:", JSON.stringify(updateData));

        const response = await apiClient.put(`${API_CONFIG.LOANS_SERVICE}/${loanId}/status`, updateData);
        console.log("🔍 API Response:", response.data);

        Swal.fire({
          title: "Başarılı!",
          text: "Kredi başarıyla aktif hale getirildi.",
          icon: "success",
          confirmButtonColor: "#28a745"
        });

        fetchPendingLoans();
      }
    } catch (e) {
      console.error("❌ Approve loan error:", e);
      console.error("❌ Error response:", e.response?.data);
      console.error("❌ Error status:", e.response?.status);
      console.error("❌ Error headers:", e.response?.headers);

      Swal.fire({
        title: "Hata!",
        text: `Kredi onaylanırken bir hata oluştu. Hata: ${e.response?.data?.message || e.message}`,
        icon: "error",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (loanId) => {
    try {
      const result = await Swal.fire({
        title: "Krediyi Reddet",
        text: "Bu krediyi reddetmek istediğinizden emin misiniz?",
        input: "text",
        inputLabel: "Red Gerekçesi *",
        inputPlaceholder: "Red gerekçesini yazın...",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Reddet",
        cancelButtonText: "İptal",
        inputValidator: (value) => {
          if (!value) {
            return "Red gerekçesi yazmalısınız!";
          }
          return null;
        }
      });

      if (result.isConfirmed) {
        setLoading(true);

        const updateData = {
          loanStatus: "CANCELLED"
        };

        console.log("🔍 Rejecting loan:", loanId, updateData);
        console.log("🔍 API URL:", `${API_CONFIG.LOANS_SERVICE}/${loanId}/status`);
        console.log("🔍 Request body:", JSON.stringify(updateData));

        const response = await apiClient.put(`${API_CONFIG.LOANS_SERVICE}/${loanId}/status`, updateData);
        console.log("🔍 API Response:", response.data);

        Swal.fire({
          title: "İptal Edildi!",
          text: "Kredi başarıyla iptal edildi.",
          icon: "info",
          confirmButtonColor: "#17a2b8"
        });

        fetchPendingLoans();
      }
    } catch (e) {
      console.error("❌ Reject loan error:", e);
      console.error("❌ Error response:", e.response?.data);
      console.error("❌ Error status:", e.response?.status);
      console.error("❌ Error headers:", e.response?.headers);

      Swal.fire({
        title: "Hata!",
        text: `Kredi reddedilirken bir hata oluştu. Hata: ${e.response?.data?.message || e.message}`,
        icon: "error",
        confirmButtonColor: "#dc3545"
      });
    } finally {
      setLoading(false);
    }
  };

  const getLoanTypeLabel = (loanType) => {
    const option = loanTypeOptions.find(opt => opt.value === loanType);
    return option ? option.label : loanType;
  };

  const getRepaymentFrequencyLabel = (frequency) => {
    const option = repaymentFrequencyOptions.find(opt => opt.value === frequency);
    return option ? option.label : frequency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const paginatedLoans = pendingLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(pendingLoans.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiClock className="mr-3 text-yellow-600" />
              Kredi Onay Yönetimi
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bekleyen Kredi: <span className="font-semibold text-yellow-600">{pendingLoans.length}</span>
              </div>
              <button
                onClick={fetchPendingLoans}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Yükleniyor..." : "Yenile"}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiClock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingLoans.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiCheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Onaylanacak</p>
                  <p className="text-2xl font-bold text-green-900">{pendingLoans.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiXCircle className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Reddedilecek</p>
                  <p className="text-2xl font-bold text-red-900">0</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiFileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Toplam İşlem</p>
                  <p className="text-2xl font-bold text-blue-900">{pendingLoans.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Loans Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                    Kredi Bilgileri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                    Tutar & Vade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                    Faiz & Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                    Tarihler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                    Detaylar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : paginatedLoans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Bekleyen kredi bulunamadı
                    </td>
                  </tr>
                ) : (
                  paginatedLoans.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                              <FiClock className="h-6 w-6 text-yellow-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getLoanTypeLabel(loan.loanType)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {loan.loanId}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <FiUser className="mr-1" />
                              {loan.customerId}
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
                          {getRepaymentFrequencyLabel(loan.repaymentFrequency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiCalendar className="mr-1" />
                          {formatDate(loan.startDate)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(loan.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          title="Detayları Görüntüle ve İşlem Yap"
                        >
                          <FiEye className="h-4 w-4" />
                          <span className="text-xs">Detaylar</span>
                        </button>
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
                Toplam {pendingLoans.length} bekleyen kredi
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

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kredi Detayları</h3>
              <button
                onClick={() => setSelectedLoan(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Temel Bilgiler</h4>
                <div className="space-y-2">
                  <p><strong>Kredi ID:</strong> {selectedLoan.loanId}</p>
                  <p><strong>Müşteri ID:</strong> {selectedLoan.customerId}</p>
                  <p><strong>Kredi Türü:</strong> {getLoanTypeLabel(selectedLoan.loanType)}</p>
                  <p><strong>Tutar:</strong> {selectedLoan.loanAmount} {selectedLoan.currency}</p>
                  <p><strong>Kalan Bakiye:</strong> {selectedLoan.outstandingBalance} {selectedLoan.currency}</p>
                  <p><strong>Durum:</strong>
                    <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {selectedLoan.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Kredi Detayları</h4>
                <div className="space-y-2">
                  <p><strong>Vade:</strong> {selectedLoan.termInMonths} ay</p>
                  <p><strong>Faiz Oranı:</strong> {selectedLoan.interestRate}%</p>
                  <p><strong>Ödeme Sıklığı:</strong> {getRepaymentFrequencyLabel(selectedLoan.repaymentFrequency)}</p>
                  <p><strong>Başlangıç:</strong> {formatDate(selectedLoan.startDate)}</p>
                  <p><strong>Bitiş:</strong> {formatDate(selectedLoan.endDate)}</p>
                  <p><strong>Kefil ID:</strong> {selectedLoan.coSignerId || "Yok"}</p>
                </div>
              </div>
            </div>
            {selectedLoan.collateral && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Teminat Bilgileri</h4>
                <p className="text-gray-600">{selectedLoan.collateral}</p>
              </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleApprove(selectedLoan.loanId)}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center font-medium"
              >
                <FiCheckCircle className="mr-2" />
                Krediyi Aktif Et
              </button>
              <button
                onClick={() => handleReject(selectedLoan.loanId)}
                disabled={loading}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center font-medium"
              >
                <FiXCircle className="mr-2" />
                Krediyi İptal Et
              </button>
              <button
                onClick={() => setSelectedLoan(null)}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanApproval; 