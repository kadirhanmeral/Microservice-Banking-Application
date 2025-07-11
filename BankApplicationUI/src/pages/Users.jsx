import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEdit, FiEye, FiX, FiFilter, FiPlusCircle, FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Swal from 'sweetalert2';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { apiClient, API_CONFIG } from "../config/api";

const statusOptions = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

const genderOptions = [
  { value: "MALE", label: "👨 Erkek" },
  { value: "FEMALE", label: "👩 Kadın" },
  { value: "OTHER", label: "⚧ Diğer" }
];

const occupationOptions = [
  { value: "", label: "Meslek Seçin" },
  { value: "EMPLOYEE", label: "💼 Çalışan" },
  { value: "FREELANCER", label: "🖥️ Serbest Çalışan" },
  { value: "BUSINESS_OWNER", label: "🏢 İş Sahibi" },
  { value: "STUDENT", label: "🎓 Öğrenci" },
  { value: "RETIRED", label: "👴 Emekli" },
  { value: "UNEMPLOYED", label: "📋 İşsiz" },
  { value: "OTHER", label: "📝 Diğer" }
];

const martialStatusOptions = [
  { value: "", label: "Medeni Durum Seçin" },
  { value: "SINGLE", label: "💚 Bekar" },
  { value: "MARRIED", label: "💍 Evli" },
  { value: "DIVORCED", label: "💔 Boşanmış" },
  { value: "WIDOWED", label: "⚰️ Dul" },
  { value: "OTHER", label: "📝 Diğer" }
];

const nationalityOptions = [
  { value: "TR", label: "🇹🇷 Türk" },
  { value: "US", label: "🇺🇸 Amerikan" },
  { value: "DE", label: "🇩🇪 Alman" },
  { value: "FR", label: "🇫🇷 Fransız" },
  { value: "GB", label: "🇬🇧 İngiliz" },
  { value: "IT", label: "🇮🇹 İtalyan" },
  { value: "ES", label: "🇪🇸 İspanyol" },
  { value: "NL", label: "🇳🇱 Hollandalı" },
  { value: "BE", label: "🇧🇪 Belçikalı" },
  { value: "AT", label: "🇦🇹 Avusturyalı" },
  { value: "CH", label: "🇨🇭 İsviçreli" },
  { value: "SE", label: "🇸🇪 İsveçli" },
  { value: "NO", label: "🇳🇴 Norveçli" },
  { value: "DK", label: "🇩🇰 Danimarkalı" },
  { value: "FI", label: "🇫🇮 Finli" },
  { value: "PL", label: "🇵🇱 Polonyalı" },
  { value: "CZ", label: "🇨🇿 Çek" },
  { value: "HU", label: "🇭🇺 Macar" },
  { value: "RO", label: "🇷🇴 Romen" },
  { value: "BG", label: "🇧🇬 Bulgar" },
  { value: "HR", label: "🇭🇷 Hırvat" },
  { value: "RS", label: "🇷🇸 Sırp" },
  { value: "UA", label: "🇺🇦 Ukraynalı" },
  { value: "OTHER", label: "🌍 Diğer" }
];

function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    identity: "",
    password: "",
    emailId: "",
    firstName: "",
    lastName: "",
    contactNumber: ""
  });
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [filter, setFilter] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    contactNumber: "",
    status: "",
    identity: "",
    gender: "",
    occupation: "",
    nationality: ""
  });
  const { user, getAuthHeader } = useAuth();
  const authHeader = getAuthHeader();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const hasFilters = Object.values(filter).some(value => value && value.trim() !== '');

      if (hasFilters) {
        const params = {};
        if (filter.firstName) params.firstName = filter.firstName;
        if (filter.lastName) params.lastName = filter.lastName;
        if (filter.emailId) params.emailId = filter.emailId;
        if (filter.contactNumber) params.contactNumber = filter.contactNumber;
        if (filter.status) params.status = filter.status;
        if (filter.identity) params.identity = filter.identity;
        if (filter.gender) params.gender = filter.gender;
        if (filter.occupation) params.occupation = filter.occupation;
        if (filter.nationality) params.nationality = filter.nationality;

        const res = await apiClient.get(`${API_CONFIG.USER_SERVICE}/filter`, { params });
        setUsers(res.data);
      } else {
        const res = await apiClient.get(`${API_CONFIG.USER_SERVICE}`);
        setUsers(res.data);
      }
    } catch (e) {
      toast.error("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post(
        `${API_CONFIG.USER_SERVICE}/register`,
        {
          identity: form.identity,
          password: form.password,
          emailId: form.emailId,
          firstName: form.firstName,
          lastName: form.lastName,
          contactNumber: form.contactNumber
        }
      );

      toast.success("User created successfully!");
      setForm({
        identity: "",
        password: "",
        emailId: "",
        firstName: "",
        lastName: "",
        contactNumber: ""
      });
      fetchUsers();
    } catch (e) {
      toast.error("Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, editData) => {
    try {
      await apiClient.put(`${API_CONFIG.USER_SERVICE}/${id}`, editData);
      toast.success("User updated successfully!");
      setEditModal(null);
      fetchUsers();
    } catch (e) {
      toast.error("Failed to update user. Please try again.");
    }
  };

  const exportCSV = () => {
    const csvContent = [
      ["ID", "Ad", "Soyad", "E-posta", "Telefon", "TC Kimlik", "Durum", "Cinsiyet", "Meslek", "Uyruk"],
      ...users.map(user => [
        user.userId,
        user.userProfileDto?.firstName || "",
        user.userProfileDto?.lastName || "",
        user.emailId,
        user.contactNo,
        user.identificationNumber,
        user.status,
        user.userProfileDto?.gender || "",
        user.userProfileDto?.occupation || "",
        user.userProfileDto?.nationality || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(users.map(user => ({
      ID: user.userId,
      Ad: user.userProfileDto?.firstName || "",
      Soyad: user.userProfileDto?.lastName || "",
      "E-posta": user.emailId,
      Telefon: user.contactNo,
      "TC Kimlik": user.identificationNumber,
      Durum: user.status,
      Cinsiyet: user.userProfileDto?.gender || "",
      Meslek: user.userProfileDto?.occupation || "",
      Uyruk: user.userProfileDto?.nationality || "",
      Adres: user.userProfileDto?.address || ""
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kullanıcılar");
    XLSX.writeFile(wb, `users_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "Ad", "Soyad", "E-posta", "Telefon", "Durum"]],
      body: users.map(user => [
        user.userId,
        user.userProfileDto?.firstName || "",
        user.userProfileDto?.lastName || "",
        user.emailId,
        user.contactNo,
        user.status
      ]),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`users_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const clearFilters = () => {
    setFilter({
      firstName: "",
      lastName: "",
      emailId: "",
      contactNumber: "",
      status: "",
      identity: "",
      gender: "",
      occupation: "",
      nationality: ""
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "text-green-600 bg-green-100";
      case "PENDING": return "text-yellow-600 bg-yellow-100";
      case "REJECTED": return "text-red-600 bg-red-100";
      case "SUSPENDED": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FiUser className="mr-3 text-blue-600" />
              Kullanıcı Yönetimi
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

          {/* Filter Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                <FiFilter className="mr-2" />
                Filtreleme
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
                type="text"
                name="firstName"
                placeholder="Ad"
                value={filter.firstName}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Soyad"
                value={filter.lastName}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="emailId"
                placeholder="E-posta"
                value={filter.emailId}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Telefon"
                value={filter.contactNumber}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="text"
                name="identity"
                placeholder="TC Kimlik"
                value={filter.identity}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                name="gender"
                value={filter.gender}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Cinsiyetler</option>
                {genderOptions.map(gender => (
                  <option key={gender.value} value={gender.value}>{gender.label}</option>
                ))}
              </select>
              <select
                name="occupation"
                value={filter.occupation}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Meslekler</option>
                {occupationOptions.map(occupation => (
                  <option key={occupation.value} value={occupation.value}>{occupation.label}</option>
                ))}
              </select>
              <select
                name="nationality"
                value={filter.nationality}
                onChange={handleFilterChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Uyruklar</option>
                {nationalityOptions.map(nationality => (
                  <option key={nationality.value} value={nationality.value}>{nationality.label}</option>
                ))}
              </select>
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
          </div>

          {/* Add User Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FiPlusCircle className="mr-2" />
              Yeni Kullanıcı Ekle
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4" autoComplete="off">
              <input
                type="text"
                name="identity"
                placeholder="TC Kimlik *"
                value={form.identity}
                onChange={handleChange}
                required
                autoComplete="off"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Şifre *"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="emailId"
                placeholder="E-posta *"
                value={form.emailId}
                onChange={handleChange}
                required
                autoComplete="new-email"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="firstName"
                placeholder="Ad *"
                value={form.firstName}
                onChange={handleChange}
                required
                autoComplete="off"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Soyad *"
                value={form.lastName}
                onChange={handleChange}
                required
                autoComplete="off"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Telefon Numarası *"
                value={form.contactNumber}
                onChange={handleChange}
                required
                autoComplete="off"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Ekleniyor..." : "Kullanıcı Ekle"}
                </button>
              </div>
            </form>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İletişim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TC Kimlik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profil
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
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.userProfileDto?.firstName} {user.userProfileDto?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.userId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FiMail className="mr-1" />
                          {user.emailId}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiPhone className="mr-1" />
                          {user.contactNo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.identificationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="flex items-center">
                            <span className="mr-2">👤</span>
                            {user.userProfileDto?.gender || "Belirtilmemiş"}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">💼</span>
                            {user.userProfileDto?.occupation || "Belirtilmemiş"}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">🌍</span>
                            {user.userProfileDto?.nationality || "Belirtilmemiş"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelected(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditModal(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <FiEdit className="h-4 w-4" />
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
                Toplam {users.length} kullanıcı
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm">
                  Sayfa {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View User Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kullanıcı Detayları</h3>
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
                <p><strong>ID:</strong> {selected.userId}</p>
                <p><strong>Ad:</strong> {selected.userProfileDto?.firstName}</p>
                <p><strong>Soyad:</strong> {selected.userProfileDto?.lastName}</p>
                <p><strong>E-posta:</strong> {selected.emailId}</p>
                <p><strong>Telefon:</strong> {selected.contactNo}</p>
                <p><strong>TC Kimlik:</strong> {selected.identificationNumber}</p>
                <p><strong>Durum:</strong> {selected.status}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Profil Bilgileri</h4>
                <p><strong>Cinsiyet:</strong> {selected.userProfileDto?.gender || "Belirtilmemiş"}</p>
                <p><strong>Meslek:</strong> {selected.userProfileDto?.occupation || "Belirtilmemiş"}</p>
                <p><strong>Medeni Durum:</strong> {selected.userProfileDto?.martialStatus || "Belirtilmemiş"}</p>
                <p><strong>Uyruk:</strong> {selected.userProfileDto?.nationality || "Belirtilmemiş"}</p>
                <p><strong>Adres:</strong> {selected.userProfileDto?.address || "Belirtilmemiş"}</p>
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

      {/* Edit User Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Kullanıcı Düzenle</h3>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEdit(editModal.userId, {
                firstName: editModal.userProfileDto?.firstName,
                lastName: editModal.userProfileDto?.lastName,
                contactNo: editModal.contactNo,
                address: editModal.userProfileDto?.address,
                gender: editModal.userProfileDto?.gender,
                occupation: editModal.userProfileDto?.occupation,
                martialStatus: editModal.userProfileDto?.martialStatus,
                nationality: editModal.userProfileDto?.nationality
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ad"
                  value={editModal.userProfileDto?.firstName || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, firstName: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Soyad"
                  value={editModal.userProfileDto?.lastName || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, lastName: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Telefon"
                  value={editModal.contactNo || ""}
                  onChange={(e) => setEditModal({ ...editModal, contactNo: e.target.value })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <textarea
                  placeholder="Adres"
                  value={editModal.userProfileDto?.address || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, address: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  rows="2"
                />
                <select
                  value={editModal.userProfileDto?.gender || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, gender: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Cinsiyet Seçin</option>
                  {genderOptions.map(gender => (
                    <option key={gender.value} value={gender.value}>{gender.label}</option>
                  ))}
                </select>
                <select
                  value={editModal.userProfileDto?.occupation || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, occupation: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Meslek Seçin</option>
                  {occupationOptions.map(occupation => (
                    <option key={occupation.value} value={occupation.value}>{occupation.label}</option>
                  ))}
                </select>
                <select
                  value={editModal.userProfileDto?.martialStatus || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, martialStatus: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Medeni Durum Seçin</option>
                  {martialStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={editModal.userProfileDto?.nationality || ""}
                  onChange={(e) => setEditModal({
                    ...editModal,
                    userProfileDto: { ...editModal.userProfileDto, nationality: e.target.value }
                  })}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Uyruk Seçin</option>
                  {nationalityOptions.map(nationality => (
                    <option key={nationality.value} value={nationality.value}>{nationality.label}</option>
                  ))}
                </select>
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

export default Users; 