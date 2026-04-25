import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Shield, Users, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <span className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-primary-100 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                <span>Trusted by 500+ happy patients</span>
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                Your Health, <br />
                <span className="text-gradient">Our Absolute Priority</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                Experience healthcare redefined. Book top-tier specialists, track your medical journey, and get the care you deserve with our seamless platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <Link
                  to="/doctors"
                  className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all duration-300 shadow-xl shadow-primary-200 hover:shadow-primary-300 flex items-center justify-center space-x-2 group scale-100 hover:scale-[1.02]"
                >
                  <span>Find Your Doctor</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-slate-700 border-2 border-slate-100 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all duration-300 flex items-center justify-center shadow-sm"
                >
                  Join Our Community
                </Link>
              </div>
              
              <div className="mt-12 flex items-center space-x-8 text-slate-400">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white">
                    +500
                  </div>
                </div>
                <div className="text-sm font-medium">Joined this month</div>
              </div>
            </div>

            <div className="mt-16 sm:mt-24 lg:mt-0 lg:col-span-5">
              <div className="relative">
                <div className="absolute -inset-4 bg-linear-to-tr from-primary-400 to-blue-600 rounded-5xl blur-2xl opacity-20 -z-10 animate-pulse"></div>
                <div className="bg-white p-2 rounded-5xl shadow-2xl overflow-hidden border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800" 
                    alt="Doctor" 
                    className="rounded-4xl w-full object-cover aspect-4/5"
                  />
                  <div className="absolute bottom-8 left-8 right-8 glass-morphism p-6 rounded-2xl border border-white/40">
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">Next Availability</p>
                        <p className="text-slate-800 font-bold text-left">Today, 2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
              Why Choose <span className="text-gradient">DoctorApp?</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              We provide a modern solution for patients and doctors, making healthcare management effortless and efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Stethoscope className="h-8 w-8" />,
                title: "Expert Doctors",
                desc: "Connect with verified specialists from top medical institutions globally.",
                color: "bg-blue-50 text-blue-600"
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Easy Booking",
                desc: "Simplified appointment scheduling with real-time availability updates.",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Private",
                desc: "Your medical data is encrypted and protected with enterprise-grade security.",
                color: "bg-emerald-50 text-emerald-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-10 rounded-4xl border border-slate-100 hover:border-primary-100 hover:bg-white hover:shadow-2xl hover:shadow-primary-100 transition-all duration-500">
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-lg">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-primary-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-[150px] opacity-20 -mr-20 -mt-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { val: "500+", label: "Happy Patients", icon: <Users className="h-8 w-8" /> },
              { val: "50+", label: "Expert Doctors", icon: <Stethoscope className="h-8 w-8" /> },
              { val: "1000+", label: "Appointments", icon: <Calendar className="h-8 w-8" /> }
            ].map((stat, idx) => (
              <div key={idx} className="p-8">
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto backdrop-blur-sm border border-white/10">
                  {stat.icon}
                </div>
                <h3 className="text-5xl font-extrabold mb-2">{stat.val}</h3>
                <p className="text-primary-200 text-lg font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-[#fcfcfd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-br from-primary-600 to-blue-700 rounded-6xl p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-primary-200">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 relative z-10">
              Transform Your Health Journey Today
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of satisfied patients who trust DoctorApp for their daily healthcare needs. Experience the difference.
            </p>
            <Link
              to="/register"
              className="bg-white text-primary-600 px-12 py-5 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all duration-300 shadow-xl relative z-10 inline-block scale-100 hover:scale-[1.05]"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-slate-800 gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <Stethoscope className="h-6 w-6 text-primary-500" />
              <span className="text-2xl font-bold text-white">DoctorApp</span>
            </Link>
            <div className="flex space-x-8 text-sm font-medium">
              <Link to="/doctors" className="hover:text-white transition">Find Doctors</Link>
              <Link to="/login" className="hover:text-white transition">Login</Link>
              <Link to="/register" className="hover:text-white transition">Register</Link>
              <Link to="/" className="hover:text-white transition">Privacy Policy</Link>
            </div>
          </div>
          <p className="text-center pt-8 text-slate-500 text-sm">
            &copy; 2024 DoctorApp. All rights reserved. Designed with ❤️ for better health.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
