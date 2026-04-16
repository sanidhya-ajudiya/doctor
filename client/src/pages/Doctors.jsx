import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, DollarSign, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm, specializationFilter, sortBy]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (specializationFilter) params.append('specialization', specializationFilter);
      if (sortBy) params.append('sort', sortBy);

      const response = await api.get(`/doctors?${params.toString()}`);
      
      // Client-side sorting as well for secondary backup
      let data = response.data;
      if (sortBy === 'price_low') data.sort((a,b) => a.fees - b.fees);
      if (sortBy === 'price_high') data.sort((a,b) => b.fees - a.fees);
      if (sortBy === 'rating') data.sort((a,b) => b.average_rating - a.average_rating);

      setDoctors(data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'General',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">Find Your Specialist</h1>
          <p className="text-slate-500 text-lg">Book appointments with top-rated doctors in your area.</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 mb-12">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-transparent rounded-2xl focus:outline-none text-slate-700 font-medium"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center bg-slate-50 rounded-2xl px-4 border border-transparent focus-within:border-primary-200 transition-colors">
                <Filter className="text-slate-400 h-5 w-5 mr-3" />
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="bg-transparent py-4 focus:outline-none text-slate-600 font-semibold min-w-[160px]"
                >
                  <option value="">All Specialties</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center bg-slate-50 rounded-2xl px-4 border border-transparent focus-within:border-primary-200 transition-colors">
                <DollarSign className="text-slate-400 h-5 w-5 mr-3" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent py-4 focus:outline-none text-slate-600 font-semibold min-w-[160px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="rating">Top Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-96 bg-white animate-pulse rounded-[2.5rem]"></div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-slate-100">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-300" />
            </div>
            <p className="text-slate-400 text-xl font-medium">No doctors found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500 border border-slate-100 overflow-hidden"
              >
                <div className="relative h-40 bg-gradient-to-br from-primary-500 to-blue-700">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="bg-white p-1.5 rounded-full shadow-xl">
                      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white">
                        <img 
                          src={`https://i.pravatar.cc/150?u=${doctor.id}`} 
                          alt={doctor.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-8 pt-16 pb-10">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                      Dr. {doctor.name}
                    </h3>
                    <p className="text-primary-600 font-bold text-sm uppercase tracking-widest">
                      {doctor.specialization}
                    </p>
                  </div>

                  <div className="flex justify-center items-center space-x-1 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(doctor.average_rating || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-slate-400 text-sm font-bold ml-2">
                      ({doctor.review_count || 0})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Experience</p>
                      <p className="text-slate-800 font-bold">{doctor.experience}Y+</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-3xl text-center border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Fees</p>
                      <p className="text-slate-800 font-bold">${doctor.fees}</p>
                    </div>
                  </div>

                  <Link
                    to={`/book-appointment/${doctor.id}`}
                    className="block w-full bg-slate-900 text-white text-center py-4 rounded-2xl font-bold hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-100 transition-all duration-300 scale-100 active:scale-95"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
