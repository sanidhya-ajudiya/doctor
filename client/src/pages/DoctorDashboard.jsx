import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Check, X, User, Settings, LogOut, Clock, FileText, Plus, Trash2, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../utils/api';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescForm, setPrescForm] = useState({ medicines: [''], notes: '' });

  useEffect(() => {
    if (!user || user.role !== 'doctor') {
      navigate('/login');
      return;
    }
    fetchDoctorData();
  }, [user, activeTab]);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        api.get('/appointments/doctor-appointments', { params: { status: activeTab } }),
        api.get('/doctors'),
      ]);

      const myProfile = doctorsRes.data.find(d => d.user_id === user.id);
      setDoctorProfile(myProfile);
      setAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchDoctorData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update appointment');
    }
  };

  const handlePrescribe = async (e) => {
    e.preventDefault();
    try {
      const filteredMeds = prescForm.medicines.filter(m => m.trim() !== '');
      if (filteredMeds.length === 0) return toast.error('Add at least one medicine');

      await api.post('/prescriptions', {
        appointment_id: selectedAppt.id,
        user_id: selectedAppt.user_id,
        medicines: filteredMeds,
        notes: prescForm.notes
      });
      
      toast.success('Prescription sent and session completed');
      setShowPrescriptionModal(false);
      setPrescForm({ medicines: [''], notes: '' });
      fetchDoctorData();
    } catch (error) {
      toast.error('Failed to send prescription');
    }
  };

  const addMedField = () => setPrescForm({ ...prescForm, medicines: [...prescForm.medicines, ''] });
  const updateMed = (idx, val) => {
    const newMeds = [...prescForm.medicines];
    newMeds[idx] = val;
    setPrescForm({ ...prescForm, medicines: newMeds });
  };
  const removeMed = (idx) => setPrescForm({ ...prescForm, medicines: prescForm.medicines.filter((_, i) => i !== idx) });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Doctor Dashboard</h1>
            <p className="text-slate-500 font-medium">Manage your clinical sessions and patient records</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
            {['pending', 'accepted', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 capitalize ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12 text-center lg:text-left">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Queue Size</p>
            <p className="text-4xl font-black text-slate-900">{appointments.length}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Success Rate</p>
            <p className="text-4xl font-black text-emerald-600">98%</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Revenue</p>
            <p className="text-4xl font-black text-slate-900">${doctorProfile?.fees * 12}.2k</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-xl text-white">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Consultation</p>
            <p className="text-4xl font-black">${doctorProfile?.fees}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="p-10">
            {appointments.length === 0 ? (
              <div className="text-center py-24">
                <Calendar className="h-20 w-20 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 text-xl font-bold tracking-tight">No active requests found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="relative bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary-600 font-black text-2xl shadow-sm">
                          {appointment.user_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{appointment.user_name}</h3>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center text-slate-500 font-bold text-sm bg-white p-3 rounded-2xl border border-slate-100">
                        <Clock className="h-4 w-4 mr-3 text-primary-500" />
                        {new Date(appointment.date).toLocaleDateString()} @ {appointment.time}
                      </div>
                      <div className="text-slate-600 font-medium text-sm px-2">
                        <p className="mb-2"><strong className="text-slate-400 mr-2 uppercase text-[10px] tracking-widest">Reason:</strong> {appointment.reason || 'Routine Checkup'}</p>
                        <p><strong className="text-slate-400 mr-2 uppercase text-[10px] tracking-widest">Connect:</strong> {appointment.user_email}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {appointment.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(appointment.id, 'accepted')} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-50">Approve</button>
                          <button onClick={() => handleUpdateStatus(appointment.id, 'rejected')} className="px-6 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition">Decline</button>
                        </>
                      )}
                      {appointment.status === 'accepted' && (
                        <button 
                          onClick={() => { setSelectedAppt(appointment); setShowPrescriptionModal(true); }}
                          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-primary-600 transition flex items-center justify-center"
                        >
                          <FileText className="h-4 w-4 mr-2" /> Start Prescription
                        </button>
                      )}
                      {appointment.status === 'completed' && (
                        <div className="w-full bg-slate-200 text-slate-500 py-4 rounded-2xl font-bold text-center cursor-default"> Session Closed </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-1">Prescription Form</h2>
                <p className="text-slate-400 font-bold text-sm tracking-wide">Patient: {selectedAppt.user_name}</p>
              </div>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="h-8 w-8" /></button>
            </div>

            <form onSubmit={handlePrescribe}>
              <div className="mb-10">
                <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Recommended Medicines</p>
                <div className="space-y-3">
                  {prescForm.medicines.map((med, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={med}
                        onChange={(e) => updateMed(idx, e.target.value)}
                        placeholder="Ex: Paracetamol 500mg (2x daily)"
                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 text-slate-700 font-semibold"
                        required
                      />
                      <button type="button" onClick={() => removeMed(idx)} className="p-4 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addMedField} className="flex items-center text-primary-600 font-bold text-sm hover:text-primary-700 mt-2">
                    <Plus className="h-4 w-4 mr-2" /> Add another medicine
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Physician's Notes</p>
                <textarea
                  value={prescForm.notes}
                  onChange={(e) => setPrescForm({ ...prescForm, notes: e.target.value })}
                  rows="4"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 text-slate-700 font-semibold"
                  placeholder="Specific instructions, lifestyle advice, or next steps..."
                />
              </div>

              <button type="submit" className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 transition shadow-xl shadow-primary-100 transform active:scale-95">
                Send to Patient & Close Session
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
