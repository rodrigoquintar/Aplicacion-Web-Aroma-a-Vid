
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CalendarDays, BedDouble, ShoppingCart, 
  FileBarChart, Settings, Banknote, CalendarRange, 
  Users, Home, LogOut, Brush, X 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Recreación vectorial del icono de la imagen proporcionada por el usuario
const GrapeLeafIcon = ({ size = 24, className = "" }) => (
  <div 
    className={`relative flex items-center justify-center rounded-full border-[3px] border-[#5d4037] bg-[#d7ccc8] shadow-inner ${className}`} 
    style={{ width: size, height: size }}
  >
    <svg 
      viewBox="0 0 24 24" 
      fill="#3e2723" 
      className="w-[75%] h-[75%] drop-shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12,2C12,2 10.5,4.5 9,6C7.5,7.5 5,8.5 5,11C5,13.5 7,15.5 9,15.5L9,17C9,19 11,22 12,22C13,22 15,19 15,17L15,15.5C17,15.5 19,13.5 19,11C19,8.5 16.5,7.5 15,6C13.5,4.5 12,2 12,2M12,4.5C12,4.5 13,6.5 14,8C15,9.5 16.5,10 16.5,11.5C16.5,13 15.5,14 14,14L14,15C14,16 13,17 12,17C11,17 10,16 10,15L10,14C8.5,14 7.5,13 7.5,11.5C7.5,10 9,9.5 10,8C11,6.5 12,4.5 12,4.5Z" />
      <path d="M12,14L12,17" stroke="#3e2723" strokeWidth="0.5" />
      <path d="M12,11L14.5,12.5" stroke="#3e2723" strokeWidth="0.5" />
      <path d="M12,11L9.5,12.5" stroke="#3e2723" strokeWidth="0.5" />
    </svg>
  </div>
);

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center space-x-3 p-3 rounded-xl transition-all ${
      isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const isAdmin = currentUser.role === 'admin';

  return (
    <>
      <div className="md:hidden fixed top-3 left-3 z-[60] flex items-center gap-3">
        <button 
          onClick={toggleMenu}
          className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 ${isOpen ? 'bg-white' : ''}`}
        >
          {isOpen ? (
            <X size={28} className="text-slate-500" />
          ) : (
            <GrapeLeafIcon size={56} />
          )}
        </button>
        {!isOpen && (
           <div className="bg-[#5d4037]/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Aroma a Vid</span>
           </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[55] transition-opacity"
          onClick={closeMenu}
        />
      )}

      <div className={`
        fixed top-0 left-0 h-screen bg-slate-900 text-slate-300 w-72 flex flex-col z-[56] 
        transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center tracking-tighter">
              <GrapeLeafIcon size={36} className="mr-3 border-2" />
              Aroma a Vid
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase font-black tracking-widest opacity-60">Manager v3.6</p>
          </div>
          <button onClick={closeMenu} className="md:hidden p-2 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-5 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          <NavLink to="/today" className={navClass} onClick={closeMenu}>
            <Home size={18} />
            <span className="text-sm font-bold">Hoy</span>
          </NavLink>

          <NavLink to="/" className={navClass} onClick={closeMenu}>
            <LayoutDashboard size={18} />
            <span className="text-sm font-bold">Dashboard</span>
          </NavLink>
          
          <NavLink to="/bookings" className={navClass} onClick={closeMenu}>
            <CalendarDays size={18} />
            <span className="text-sm font-bold">Reservas</span>
          </NavLink>

          <NavLink to="/calendar" className={navClass} onClick={closeMenu}>
            <CalendarRange size={18} />
            <span className="text-sm font-bold">Calendario</span>
          </NavLink>

          <NavLink to="/rooms" className={navClass} onClick={closeMenu}>
            <BedDouble size={18} />
            <span className="text-sm font-bold">Departamento</span>
          </NavLink>

          <NavLink to="/clients" className={navClass} onClick={closeMenu}>
            <Users size={18} />
            <span className="text-sm font-bold">Cliente</span>
          </NavLink>

          <NavLink to="/pos" className={navClass} onClick={closeMenu}>
            <ShoppingCart size={18} />
            <span className="text-sm font-bold">Tienda / POS</span>
          </NavLink>
          
          <NavLink to="/stock" className={navClass} onClick={closeMenu}>
            <Brush size={18} />
            <span className="text-sm font-bold">Stock Limpieza</span>
          </NavLink>

          {isAdmin && (
            <>
              <div className="pt-8 pb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 opacity-40">Administración</p>
              </div>
              <NavLink to="/finances" className={navClass} onClick={closeMenu}>
                <Banknote size={18} />
                <span className="text-sm font-bold">Finanzas</span>
              </NavLink>
              <NavLink to="/reports" className={navClass} onClick={closeMenu}>
                <FileBarChart size={18} />
                <span className="text-sm font-bold">Reportes</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="p-5 border-t border-slate-800 bg-slate-900/50">
          <div className="mt-4 p-3 bg-slate-800/50 rounded-2xl flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
               {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-white font-black truncate uppercase">{currentUser.name}</p>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
