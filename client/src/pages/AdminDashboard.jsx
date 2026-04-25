import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Stethoscope, Calendar, Plus, Trash2, Edit, LogOut } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'General',
    experience: 0,
    fees: 0,
    about: '',
    education: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, doctorsRes, usersRes, appointmentsRes, prescriptionsRes] = await Promise.all([
        api.get('/users/analytics'),
        api.get('/doctors'),
        api.get('/users/all'),
        api.get('/appointments/all'),
        api.get('/prescriptions/all'),
      ]);

      setAnalytics(analyticsRes.data);
      setDoctors(doctorsRes.data);
      setUsers(usersRes.data);
      setAppointments(appointmentsRes.data);
      setPrescriptions(prescriptionsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctors', newDoctor);
      toast.success('Doctor added successfully');
      setShowAddDoctorModal(false);
      setNewDoctor({
        name: '',
        email: '',
        password: '',
        specialization: 'General',
        experience: 0,
        fees: 0,
        about: '',
        education: '',
      });
      fetchAdminData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      await api.delete(`/doctors/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your healthcare platform</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === 'overview'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === 'doctors'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Doctors
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === 'users'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === 'appointments'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-4 px-1 border-b-2 font-medium transition ${
                  activeTab === 'prescriptions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Prescriptions
              </button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.totalUsers || 0}</p>
                </div>
                <Users className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Doctors</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.totalDoctors || 0}</p>
                </div>
                <Stethoscope className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics?.totalAppointments || 0}</p>
                </div>
                <Calendar className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Requests</p>
                  <p className="text-3xl font-bold text-yellow-600">{analytics?.pendingAppointments || 0}</p>
                </div>
                <Calendar className="h-12 w-12 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Doctors</h2>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span>Add Doctor</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Specialization</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Experience</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Fees</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{doctor.name}</td>
                      <td className="py-3 px-4">{doctor.specialization}</td>
                      <td className="py-3 px-4">{doctor.experience} years</td>
                      <td className="py-3 px-4">${doctor.fees}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{userItem.name}</td>
                      <td className="py-3 px-4">{userItem.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userItem.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          userItem.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">{userItem.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {userItem.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Appointments</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{appointment.user_name}</td>
                      <td className="py-3 px-4">{appointment.doctor_name}</td>
                      <td className="py-3 px-4">{new Date(appointment.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{appointment.time}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Prescriptions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Doctor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Medicines</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Notes</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((prescription) => (
                    <tr key={prescription.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{prescription.user_name}</td>
                      <td className="py-3 px-4">{prescription.doctor_name}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {prescription.medicines.map((med, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                              {med.name} ({med.dosage})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate" title={prescription.notes}>
                        {prescription.notes || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(prescription.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No prescriptions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showAddDoctorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">Add New Doctor</h2>
              <form onSubmit={handleAddDoctor}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newDoctor.name}
                      onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newDoctor.password}
                      onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="General">General</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Psychiatry">Psychiatry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                    <input
                      type="number"
                      required
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor({ ...newDoctor, experience: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                    <input
                      type="number"
                      required
                      value={newDoctor.fees}
                      onChange={(e) => setNewDoctor({ ...newDoctor, fees: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
                    <textarea
                      value={newDoctor.about}
                      onChange={(e) => setNewDoctor({ ...newDoctor, about: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <textarea
                      value={newDoctor.education}
                      onChange={(e) => setNewDoctor({ ...newDoctor, education: e.target.value })}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition"
                  >
                    Add Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDoctorModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
