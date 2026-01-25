
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ReservationStatus, Room, Client, PaymentStatus, Reservation } from '../types';
import { Search, Plus, X, ChevronLeft, ChevronRight, Edit, Trash2, Users, Phone } from 'lucide-react';

const MiniCalendar = ({ selectedDate, onChange, label, minDate }: { selectedDate: string, onChange: (date: string) => void, label: string, minDate?: string }) => {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limitDate = minDate ? new Date(minDate + 'T00:00:00') : today;

    useEffect(() => {
        if (selectedDate) {
            const [y, m, d] = selectedDate.split('-').map(Number);
            setViewDate(new Date(y, m - 1, d));
        }
    }, [selectedDate]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const handlePrevMonth = (e: React.MouseEvent) => { e.preventDefault(); setViewDate(new Date(year, month - 1, 1)); };
    const handleNextMonth = (e: React.MouseEvent) => { e.preventDefault(); setViewDate(new Date(year, month + 1, 1)); };

    const handleDayClick = (day: number, isInvalid: boolean) => {
        if (isInvalid) return;
        const m = (month + 1).toString().padStart(2, '0');
        const d = day.toString().padStart(2, '0');
        onChange(`${year}-${m}-${d}`);
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="border border-slate-300 rounded-lg p-3 bg-white w-full shadow-sm">
            <label className="block text-sm font-bold text-slate-800 mb-2">{label}</label>
            <div className="flex justify-between items-center mb-2 bg-slate-100 p-1.5 rounded">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white rounded text-slate-700 transition-colors"><ChevronLeft size={16} /></button>
                <span className="font-bold text-sm text-slate-900">{monthNames[month]} {year}</span>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white rounded text-slate-700 transition-colors"><ChevronRight size={16} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {['D','L','M','M','J','V','S'].map((d, i) => (<div key={i} className="text-[10px] text-slate-500 font-black">{d}</div>))}
                {Array.from({ length: startDay }).map((_, i) => (<div key={`empty-${i}`} />))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateToCheck = new Date(year, month, day);
                    dateToCheck.setHours(0,0,0,0);
                    const isInvalid = dateToCheck < limitDate;
                    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                    const isSelected = selectedDate === dateStr;
                    return (
                        <button key={day} type="button" onClick={() => handleDayClick(day, isInvalid)} disabled={isInvalid}
                            className={`h-7 w-7 text-xs rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white font-bold' : isInvalid ? 'text-slate-200 cursor-not-allowed bg-slate-50' : 'text-slate-800 font-medium hover:bg-indigo-100'}`}
                        >{day}</button>
                    )
                })}
            </div>
        </div>
    );
};

const Bookings: React.FC = () => {
  const { reservations, rooms, clients, updateReservationStatus, addReservation, updateReservation, deleteReservation, addClient } = useApp();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);

  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [totalPrice, setTotalPrice] = useState<number | string>(0); 
  const [deposit, setDeposit] = useState<number | string>(0);
  const [numPeople, setNumPeople] = useState<number | string>(1);

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState<Partial<Client>>({
      firstName: '', lastName: '', platform: '', phone: ''
  });

  useEffect(() => {
    if (dates.checkIn && dates.checkOut) {
        const start = new Date(dates.checkIn + 'T00:00:00');
        const end = new Date(dates.checkOut + 'T00:00:00');
        const available = rooms.filter(room => {
            return !reservations.some(res => {
                if (editingResId && res.id === editingResId) return false;
                if (res.roomId !== room.id || res.status === ReservationStatus.CANCELLED) return false;
                const resStart = new Date(res.checkIn + 'T00:00:00');
                const resEnd = new Date(res.checkOut + 'T00:00:00');
                return start < resEnd && end > resStart;
            });
        });
        setAvailableRooms(available);
    }
  }, [dates, reservations, rooms, editingResId]);

  const resetForm = () => {
    setDates({ checkIn: '', checkOut: '' });
    setSelectedRoomId('');
    setSelectedClientId('');
    setTotalPrice(0);
    setDeposit(0);
    setNumPeople(1);
    setEditingResId(null);
    setIsAddingClient(false);
  };

  const handleOpenEdit = (res: Reservation) => {
    setEditingResId(res.id);
    setDates({ checkIn: res.checkIn, checkOut: res.checkOut });
    setSelectedRoomId(res.roomId);
    setSelectedClientId(res.clientId);
    setTotalPrice(res.totalAmount);
    setDeposit(res.deposit || 0);
    setNumPeople(res.numberOfPeople || 1);
    setShowModal(true);
  };

  const handleSaveReservation = () => {
     if(!selectedRoomId || !selectedClientId || !dates.checkIn || !dates.checkOut) return alert("Complete todos los campos.");
     
     // El ID ahora tiene el mes al principio como solicitó el usuario
     const monthPrefix = dates.checkIn.split('-')[1];
     const reservationData: Reservation = {
         id: editingResId || `${monthPrefix}-${Date.now().toString().slice(-4)}`,
         clientId: selectedClientId,
         roomId: selectedRoomId,
         checkIn: dates.checkIn,
         checkOut: dates.checkOut,
         status: editingResId ? (reservations.find(r => r.id === editingResId)?.status || ReservationStatus.CONFIRMED) : ReservationStatus.CONFIRMED,
         totalAmount: Number(totalPrice),
         deposit: Number(deposit),
         numberOfPeople: Number(numPeople),
         paymentStatus: PaymentStatus.PENDING,
         storeCharges: editingResId ? (reservations.find(r => r.id === editingResId)?.storeCharges || 0) : 0
     };

     if (editingResId) updateReservation(reservationData);
     else addReservation(reservationData);

     setShowModal(false);
     resetForm();
  };

  const filteredReservations = reservations
    .filter(res => {
      const client = clients.find(c => c.id === res.clientId);
      const fullName = `${client?.lastName}, ${client?.firstName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || res.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filter === 'all' || res.status === filter;
      return matchesSearch && matchesStatus;
    })
    // Orden descendente por fecha de Check-in (más recientes primero)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()); 

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Reservas</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-black uppercase text-sm tracking-widest">
          <Plus size={18} className="mr-2" /> NUEVA RESERVA
        </button>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-row gap-2">
        <div className="relative flex-[4]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por cliente..." 
            className="w-full pl-9 pr-2 py-2.5 border-2 border-slate-50 rounded-xl focus:border-indigo-500 outline-none text-slate-900 font-bold transition-all bg-slate-50/50 placeholder:text-slate-300 text-xs" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select className="flex-1 border-2 border-slate-50 rounded-xl py-2 px-1 outline-none focus:border-indigo-500 text-slate-900 font-black bg-slate-50/50 cursor-pointer text-[10px] uppercase" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">TODOS</option>
            <option value={ReservationStatus.CONFIRMED}>CONF.</option>
            <option value={ReservationStatus.CHECKED_IN}>IN</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-100">
                <th className="p-4 font-black">Entrada</th>
                <th className="p-4 font-black">Cliente</th>
                <th className="p-4 font-black text-center">Depto</th>
                <th className="p-4 font-black text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReservations.map((res) => {
                  const client = clients.find(c => c.id === res.clientId);
                  const room = rooms.find(r => r.id === res.roomId);
                  const checkInDate = new Date(res.checkIn + 'T00:00:00');
                  return (
                    <tr key={res.id} className="hover:bg-indigo-50/20 transition-colors text-xs">
                        <td className="p-4">
                            <div className="font-black text-indigo-600">{checkInDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}</div>
                            <div className="text-[9px] text-slate-400 font-bold">ID: {res.id}</div>
                        </td>
                        <td className="p-4">
                            <div className="font-black text-slate-900 uppercase">{client?.lastName}, {client?.firstName}</div>
                        </td>
                        <td className="p-4 text-center font-black text-slate-600">{room?.number.replace('Depto ', '')}</td>
                        <td className="p-4 text-right">
                            <div className="flex justify-end items-center gap-1">
                                <button onClick={() => handleOpenEdit(res)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"><Edit size={14} /></button>
                                <button onClick={() => deleteReservation(res.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                        </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-2 overflow-y-auto">
              <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editingResId ? 'Editar' : 'Nueva'} Reserva</h3>
                      <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <MiniCalendar label="Entrada" selectedDate={dates.checkIn} onChange={(d) => setDates(prev => ({ ...prev, checkIn: d }))} />
                           <MiniCalendar label="Salida" selectedDate={dates.checkOut} onChange={(d) => setDates(prev => ({ ...prev, checkOut: d }))} minDate={dates.checkIn} />
                       </div>
                       
                       <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Depto</label>
                                    <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-slate-900 font-black" value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                                        <option value="">ELIJA UN DEPARTAMENTO...</option>
                                        {availableRooms.map(room => (<option key={room.id} value={room.id}>{room.number}</option>))}
                                        {editingResId && <option value={selectedRoomId}>{rooms.find(r => r.id === selectedRoomId)?.number} (Actual)</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Cant. Personas</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="number" className="w-full border-2 border-slate-100 rounded-2xl p-4 pl-12 bg-slate-50/50 text-slate-900 font-black outline-none" value={numPeople === 0 ? '' : numPeople} onChange={e => setNumPeople(e.target.value === '' ? 0 : Number(e.target.value))} />
                                    </div>
                                </div>
                            </div>

                            {!isAddingClient ? (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Cliente</label>
                                    <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-slate-900 font-black" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                                        <option value="">SELECCIONAR CLIENTE...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.lastName}, {c.firstName} ({c.platform})</option>)}
                                    </select>
                                    <button onClick={() => setIsAddingClient(true)} className="text-[10px] font-black text-indigo-600 mt-2 uppercase underline">Crear nuevo cliente</button>
                                </div>
                            ) : (
                                <div className="bg-indigo-50/50 p-4 rounded-3xl border-2 border-indigo-100/50 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="NOMBRE" className="w-full p-3 rounded-xl border-2 border-white font-black text-xs uppercase" value={newClientData.firstName} onChange={e => setNewClientData({...newClientData, firstName: e.target.value})} />
                                        <input type="text" placeholder="APELLIDO" className="w-full p-3 rounded-xl border-2 border-white font-black text-xs uppercase" value={newClientData.lastName} onChange={e => setNewClientData({...newClientData, lastName: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="PLATAFORMA" className="w-full p-3 rounded-xl border-2 border-white font-black text-xs uppercase" value={newClientData.platform} onChange={e => setNewClientData({...newClientData, platform: e.target.value})} />
                                        <input type="text" placeholder="TELÉFONO" className="w-full p-3 rounded-xl border-2 border-white font-black text-xs uppercase" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} />
                                    </div>
                                    <button onClick={() => {
                                        const newId = `c-${Date.now()}`;
                                        addClient({...newClientData, id: newId} as Client);
                                        setSelectedClientId(newId);
                                        setIsAddingClient(false);
                                    }} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[10px] font-black uppercase">Registrar y Usar</button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border-2 border-indigo-100/30">
                                    <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Importe Total ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-indigo-600 font-black text-lg">$</span>
                                        <input type="number" className="w-full bg-transparent text-slate-900 font-black text-3xl outline-none pl-6" value={totalPrice === 0 ? '' : totalPrice} onChange={e => setTotalPrice(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" />
                                    </div>
                                </div>
                                <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-amber-100/30">
                                    <label className="block text-[10px] font-black text-amber-900 mb-2 uppercase tracking-widest">Monto Seña ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-amber-600 font-black text-lg">$</span>
                                        <input type="number" className="w-full bg-transparent text-slate-900 font-black text-3xl outline-none pl-6" value={deposit === 0 ? '' : deposit} onChange={e => setDeposit(e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                       </div>
                  </div>
                  <div className="p-4 border-t-2 border-slate-50 bg-slate-50 sticky bottom-0 flex gap-3">
                      <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cerrar</button>
                      <button onClick={handleSaveReservation} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase shadow-lg shadow-indigo-100 tracking-widest active:scale-95 transition-all">Guardar Reserva</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Bookings;
