
import React from 'react';
import { useApp } from '../context/AppContext';
import { ReservationStatus, RoomStatus } from '../types';
import { LogIn, LogOut, BedDouble, Calendar, User, ArrowRight, Clock, FastForward } from 'lucide-react';
import { Link } from 'react-router-dom';

const Today: React.FC = () => {
  const { rooms, reservations, clients, updateReservationStatus, updateReservation } = useApp();

  const getDateStr = (offset = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getDateStr(0);
  const tomorrowStr = getDateStr(1);

  // Data para Hoy
  const checkInsToday = reservations.filter(res => res.checkIn === todayStr && res.status === ReservationStatus.CONFIRMED);
  const checkOutsToday = reservations.filter(res => res.checkOut === todayStr && res.status === ReservationStatus.CHECKED_IN);
  const occupiedRooms = rooms.filter(room => room.status === RoomStatus.OCCUPIED);

  // Data para Mañana (Informativa)
  const checkInsTomorrow = reservations.filter(res => res.checkIn === tomorrowStr && res.status === ReservationStatus.CONFIRMED);
  const checkOutsTomorrow = reservations.filter(res => res.checkOut === tomorrowStr && (res.status === ReservationStatus.CHECKED_IN || res.status === ReservationStatus.CONFIRMED));

  const StatCard = ({ title, count, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-900">{count}</p>
      </div>
    </div>
  );

  const handleUpdateTime = (resId: string, type: 'in' | 'out', time: string) => {
      const res = reservations.find(r => r.id === resId);
      if (res) {
          updateReservation({
              ...res,
              [type === 'in' ? 'checkInTime' : 'checkOutTime']: time
          });
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Hoy</h2>
          <p className="text-slate-500 font-bold flex items-center mt-1">
            <Calendar size={18} className="mr-2" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Entradas" count={checkInsToday.length} icon={LogIn} colorClass="bg-emerald-100 text-emerald-600" />
        <StatCard title="Salidas" count={checkOutsToday.length} icon={LogOut} colorClass="bg-rose-100 text-rose-600" />
        <StatCard title="Ocupados" count={occupiedRooms.length} icon={BedDouble} colorClass="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ENTRADAS HOY */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-emerald-50/30 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <LogIn className="mr-2 text-emerald-600" size={24} /> Entradas Hoy
            </h3>
          </div>
          <div className="p-4 flex-1">
            {checkInsToday.length > 0 ? (
              <div className="space-y-4">
                {checkInsToday.map(res => {
                  const client = clients.find(c => c.id === res.clientId);
                  const room = rooms.find(r => r.id === res.roomId);
                  return (
                    <div key={res.id} className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                          {client?.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{client?.lastName}, {client?.firstName}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{room?.number} • {client?.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="time" className="px-2 py-1.5 border-2 border-slate-100 rounded-lg text-xs font-black" value={res.checkInTime || ''} onChange={(e) => handleUpdateTime(res.id, 'in', e.target.value)} />
                        <button onClick={() => updateReservationStatus(res.id, ReservationStatus.CHECKED_IN)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md">Check-In</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-slate-400">
                <p className="font-bold italic text-xs uppercase tracking-widest opacity-50">Sin ingresos hoy</p>
              </div>
            )}
          </div>
        </div>

        {/* SALIDAS HOY */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-rose-50/30 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <LogOut className="mr-2 text-rose-600" size={24} /> Salidas Hoy
            </h3>
          </div>
          <div className="p-4 flex-1">
            {checkOutsToday.length > 0 ? (
              <div className="space-y-4">
                {checkOutsToday.map(res => {
                  const client = clients.find(c => c.id === res.clientId);
                  const room = rooms.find(r => r.id === res.roomId);
                  return (
                    <div key={res.id} className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                          {client?.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{client?.lastName}, {client?.firstName}</p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{room?.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="time" className="px-2 py-1.5 border-2 border-slate-100 rounded-lg text-xs font-black" value={res.checkOutTime || ''} onChange={(e) => handleUpdateTime(res.id, 'out', e.target.value)} />
                        <button onClick={() => updateReservationStatus(res.id, ReservationStatus.CHECKED_OUT)} className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md">Check-Out</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-slate-400">
                <p className="font-bold italic text-xs uppercase tracking-widest opacity-50">Sin salidas hoy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN MAÑANA (INFORMATIVA) */}
      <div className="pt-12 border-t border-slate-200">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-800 text-white rounded-2xl shadow-xl">
                <FastForward size={24} />
            </div>
            <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none">Mañana</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{new Date(tomorrowStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} (Previsión)</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LLEGADAS MAÑANA */}
            <div className="bg-slate-100/50 rounded-3xl p-6 border border-slate-200">
                <h4 className="font-black text-emerald-700 text-sm mb-5 uppercase tracking-tighter flex items-center">
                    <LogIn size={16} className="mr-2" /> Llegadas Previstas ({checkInsTomorrow.length})
                </h4>
                <div className="space-y-3">
                    {checkInsTomorrow.length > 0 ? checkInsTomorrow.map(res => {
                        const client = clients.find(c => c.id === res.clientId);
                        const room = rooms.find(r => r.id === res.roomId);
                        return (
                            <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <span className="font-black text-slate-900 block text-sm">{client?.lastName}, {client?.firstName}</span>
                                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{room?.number}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-lg uppercase tracking-wider">{client?.platform}</span>
                                </div>
                            </div>
                        )
                    }) : <p className="text-[10px] text-slate-400 font-bold italic text-center py-4 uppercase">Sin ingresos programados</p>}
                </div>
            </div>

            {/* SALIDAS MAÑANA */}
            <div className="bg-slate-100/50 rounded-3xl p-6 border border-slate-200">
                <h4 className="font-black text-rose-700 text-sm mb-5 uppercase tracking-tighter flex items-center">
                    <LogOut size={16} className="mr-2" /> Salidas Previstas ({checkOutsTomorrow.length})
                </h4>
                <div className="space-y-3">
                    {checkOutsTomorrow.length > 0 ? checkOutsTomorrow.map(res => {
                        const client = clients.find(c => c.id === res.clientId);
                        const room = rooms.find(r => r.id === res.roomId);
                        return (
                            <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <span className="font-black text-slate-900 block text-sm">{client?.lastName}, {client?.firstName}</span>
                                    <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">{room?.number}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-2 py-1 rounded-lg uppercase tracking-wider">Checkout</span>
                                </div>
                            </div>
                        )
                    }) : <p className="text-[10px] text-slate-400 font-bold italic text-center py-4 uppercase">Sin salidas programadas</p>}
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
          <Link to="/bookings" className="bg-slate-900 text-white px-8 py-5 rounded-2xl text-sm font-black flex items-center justify-center hover:bg-black transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95">
              Ver historial de reservas <ArrowRight size={20} className="ml-3" />
          </Link>
      </div>
    </div>
  );
};

export default Today;
