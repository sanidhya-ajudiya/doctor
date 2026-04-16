import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, X, User, Settings, LogOut, Star, FileText, CreditCard, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import api from '../utils/api';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [currentPrescription, setCurrentPrescription] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'upcoming' ? 'pending,accepted' : 'completed,cancelled,rejected';
      const [apptRes, prescRes] = await Promise.all([
        api.get(`/appointments/my-appointments?status=${status}`),
        api.get('/prescriptions/my')
      ]);
      setAppointments(apptRes.data);
      setPrescriptions(prescRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    }
  };

  const handlePayment = async (appointmentId) => {
    try {
      await api.post(`/appointments/${appointmentId}/pay`);
      toast.success('Payment successful (Mock)');
      fetchData();
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        ...reviewForm,
        appointment_id: selectedAppointment.id,
        doctor_id: selectedAppointment.doctor_id
      });
      toast.success('Review submitted successfully');
      setShowReviewModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
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
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2">Hello, {user?.name}</h1>
            <p className="text-slate-500 font-medium tracking-wide italic">"Your wellness is a journey, not a destination."</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'upcoming' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'past' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Consultation History
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
              <Calendar className="mr-3 text-primary-600" />
              {activeTab === 'upcoming' ? 'Upcoming Sessions' : 'Previous Visits'}
            </h2>

            {appointments.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <Calendar className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                <p className="text-slate-400 text-lg font-medium mb-6">No appointments found</p>
                <button onClick={() => navigate('/doctors')} className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition">Book Now</button>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((appointment) => {
                  const presc = prescriptions.find(p => p.appointment_id === appointment.id);
                  return (
                    <div key={appointment.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex items-start space-x-6">
                          <div className="bg-slate-50 w-20 h-20 rounded-2xl flex items-center justify-center border border-slate-100 shrink-0">
                            <span className="text-2xl font-bold text-primary-600">{appointment.doctor_name.charAt(0)}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-xl font-bold text-slate-900">Dr. {appointment.doctor_name}</h3>
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                              {appointment.payment_status === 'paid' && (
                                <span className="flex items-center text-emerald-600 text-xs font-bold">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Paid
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 font-bold text-xs uppercase mb-4 tracking-tighter">{appointment.specialization}</p>

                            <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
                              <span className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                                {new Date(appointment.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                <CreditCard className="h-4 w-4 mr-2 text-primary-500" />
                                ${appointment.fees}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px]">
                          {appointment.status === 'accepted' && appointment.payment_status === 'unpaid' && (
                            <button onClick={() => handlePayment(appointment.id)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100">Complete Payment</button>
                          )}
                          {presc && (
                            <button
                              onClick={() => { setCurrentPrescription(presc); setShowPrescriptionModal(true); }}
                              className="w-full bg-primary-50 text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-100 transition flex items-center justify-center"
                            >
                              <FileText className="h-4 w-4 mr-2" /> Prescription
                            </button>
                          )}
                          {appointment.status === 'completed' && (
                            <button
                              onClick={() => { setSelectedAppointment(appointment); setShowReviewModal(true); }}
                              className="w-full border-2 border-yellow-400 text-yellow-600 py-3 rounded-xl font-bold hover:bg-yellow-50 transition flex items-center justify-center"
                            >
                              <Star className="h-4 w-4 mr-2" /> Rate Doctor
                            </button>
                          )}
                          {(appointment.status === 'pending' || appointment.status === 'accepted') && (
                            <button onClick={() => handleCancelAppointment(appointment.id)} className="w-full text-slate-400 py-3 rounded-xl font-bold hover:text-red-500 hover:bg-red-50 transition border border-transparent hover:border-red-100">Cancel</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-primary-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 -mr-16 -mt-16 rounded-full"></div>
              <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <button onClick={() => navigate('/doctors')} className="w-full bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex items-center space-x-4 transition">
                  <div className="bg-white/10 p-2 rounded-xl"><Calendar className="h-5 w-5" /></div>
                  <span className="font-bold">Book Appointment</span>
                </button>
                <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                  <p className="text-primary-200 text-sm font-bold mb-1">Membership</p>
                  <p className="text-white font-bold text-lg">Pro Member</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                <Star className="mr-2 text-yellow-400" />
                Latest Insights
              </h3>
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl h-fit"><FileText className="text-blue-600 h-5 w-5" /></div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">New Prescription</h4>
                    <p className="text-slate-400 text-xs">Dr. Smith added a note</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Share Your Experience</h2>
            <form onSubmit={submitReview}>
              <div className="mb-8 text-center">
                <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Overall Rating</p>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition transform active:scale-90"
                    >
                      <Star className={`h-10 w-10 ${star <= reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-slate-400 font-bold mb-2 uppercase tracking-widest text-xs">Your Feedback</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows="4"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-700 font-medium"
                  placeholder="Tell us what you liked..."
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-100">Post Review</button>
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-8 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showPrescriptionModal && currentPrescription && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary-600"></div>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Digital Prescription</h2>
                <p className="text-primary-600 font-bold">Issued by Dr. {currentPrescription.doctor_name}</p>
              </div>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="bg-slate-50 p-2 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Prescribed Medicines</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 font-bold flex items-center">
                      <CheckCircle className="h-4 w-4 mr-3" />
                      {med}
                    </div>
                  ))}
                </div>
              </div>

              {currentPrescription.notes && (
                <div>
                  <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-xs">Medical Notes</p>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 italic font-medium leading-relaxed">
                    "{currentPrescription.notes}"
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
              <span>Date: {new Date(currentPrescription.created_at).toLocaleDateString()}</span>
              <span>ID: #PRSC_{currentPrescription.id}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default UserDashboard;