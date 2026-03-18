import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Plus, X, Edit, Users, Phone } from 'lucide-react';
import { Reservation, ReservationStatus, Room, Client, PaymentStatus } from '../types';

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

const ReservationModal = ({ isOpen, onClose, editingResId }: { isOpen: boolean, onClose: () => void, editingResId: string | null }) => {
    const { reservations, rooms, clients, addReservation, updateReservation, addClient } = useApp();
    const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [totalPrice, setTotalPrice] = useState<number | string>(0);
    const [deposit, setDeposit] = useState<number | string>(0);
    const [numPeople, setNumPeople] = useState<number | string>(1);
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [newClientData, setNewClientData] = useState<Partial<Client>>({ firstName: '', lastName: '', platform: '', phone: '' });

    useEffect(() => {
        if (editingResId) {
            const res = reservations.find(r => r.id === editingResId);
            if (res) {
                setDates({ checkIn: res.checkIn, checkOut: res.checkOut });
                setSelectedRoomId(res.roomId);
                setSelectedClientId(res.clientId);
                setTotalPrice(res.totalAmount);
                setDeposit(res.deposit || 0);
                setNumPeople(res.numberOfPeople || 1);
            }
        } else {
            setDates({ checkIn: '', checkOut: '' });
            setSelectedRoomId('');
            setSelectedClientId('');
            setTotalPrice(0);
            setDeposit(0);
            setNumPeople(1);
        }
    }, [editingResId, reservations, isOpen]);

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

    const handleSave = () => {
        if(!selectedRoomId || !selectedClientId || !dates.checkIn || !dates.checkOut) return alert("Complete los datos.");
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
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h3 className="text-2xl font-black text-slate-900">{editingResId ? 'Modificar Reserva' : 'Nueva Reserva'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <MiniCalendar label="Fecha de Entrada" selectedDate={dates.checkIn} onChange={(d) => setDates(prev => ({ ...prev, checkIn: d }))} />
                        <MiniCalendar label="Fecha de Salida" selectedDate={dates.checkOut} onChange={(d) => setDates(prev => ({ ...prev, checkOut: d }))} minDate={dates.checkIn} />
                    </div>
                    {/* ... Resto del modal ... */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase ml-1">Seleccionar Departamento</label>
                                <select className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50" value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)}>
                                    <option value="">ELIJA UN DEPARTAMENTO...</option>
                                    {availableRooms.map(room => (<option key={room.id} value={room.id}>{room.number} - {room.type}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase ml-1">Cant. Personas</label>
                                <input type="number" className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50" value={numPeople} onChange={e => setNumPeople(Number(e.target.value))} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-8 border-t-2 border-slate-100 bg-slate-50 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-5 text-slate-400 font-black hover:bg-slate-200 rounded-2xl">CANCELAR</button>
                    <button onClick={handleSave} className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition">CONFIRMAR RESERVA</button>
                </div>
            </div>
        </div>
    );
};

const Calendar: React.FC = () => {
  const { rooms, reservations, clients } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingResId, setEditingResId] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentDate);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  const changeMonth = (delta: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));

  const getCellDetails = (roomId: string, day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    targetDate.setHours(0, 0, 0, 0);
    const dateStr = targetDate.toISOString().split('T')[0];
    const roomReservations = reservations.filter(r => r.roomId === roomId && r.status !== ReservationStatus.CANCELLED);
    const checkInRes = roomReservations.find(r => r.checkIn === dateStr);
    const checkOutRes = roomReservations.find(r => r.checkOut === dateStr);
    const stayRes = roomReservations.find(r => {
        const s = new Date(r.checkIn + 'T00:00:00');
        const e = new Date(r.checkOut + 'T00:00:00');
        return targetDate > s && targetDate < e;
    });
    return { checkInRes, checkOutRes, stayRes };
  };

  const renderCellContent = (roomId: string, day: number) => {
    const { checkInRes, checkOutRes, stayRes } = getCellDetails(roomId, day);
    const enteringClient = checkInRes ? clients.find(c => c.id === checkInRes.clientId) : null;
    
    if (checkInRes && checkOutRes) {
        return <div className="absolute inset-0 cursor-pointer" style={{ background: 'linear-gradient(135deg, #f43f5e 50%, #10b981 50%)' }} onClick={() => handleDayClick(roomId, day)} />;
    }
    if (checkInRes) {
        return <div className="absolute inset-0 bg-[#10b981] cursor-pointer flex items-center justify-center" onClick={() => handleDayClick(roomId, day)}>
            <span className="text-[7px] font-black text-white uppercase truncate px-0.5">{enteringClient?.lastName}</span>
        </div>;
    }
    if (checkOutRes) {
        return <div className="absolute inset-0 bg-[#f43f5e] cursor-pointer" onClick={() => handleDayClick(roomId, day)} />;
    }
    // AQUÍ ESTÁ EL CAMBIO DE COLOR: de emerald-50 a emerald-400
    if (stayRes) {
        return <div className="absolute inset-0 bg-emerald-400 cursor-pointer border-x border-emerald-500/20" onClick={() => handleDayClick(roomId, day)} />;
    }
    return null;
  };

  const handleDayClick = (roomId: string, day: number) => {
      const { checkInRes, checkOutRes, stayRes } = getCellDetails(roomId, day);
      const res = checkInRes || checkOutRes || stayRes;
      if (res) {
          setEditingResId(res.id);
          setShowModal(true);
      }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-black text-slate-900">Calendario</h2>
        <button onClick={() => { setEditingResId(null); setShowModal(true); }} className="w-full bg-indigo-600 text-white px-5 py-3 rounded-2xl flex items-center justify-center font-black">
            <Plus size={20} className="mr-2" /> NUEVA RESERVA
        </button>
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
            <button onClick={() => changeMonth(-1)} className="p-4"><ChevronLeft size={28} /></button>
            <span className="text-base font-black uppercase tracking-widest">{monthName}</span>
            <button onClick={() => changeMonth(1)} className="p-4"><ChevronRight size={28} /></button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-auto flex-1">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="p-3 border-b border-r w-32 text-left text-[10px] font-black uppercase text-slate-500 bg-slate-50 sticky left-0 z-20">Depto</th>
              {daysArray.map(day => (<th key={day} className="p-2 border-b w-8 text-center text-[10px] text-slate-400 font-black">{day}</th>))}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td className="p-3 border-b border-r font-black text-slate-700 sticky left-0 bg-white z-10 text-xs">{room.number}</td>
                {daysArray.map(day => (
                    <td key={day} className="border-b border-r border-slate-100 h-12 relative">
                       {renderCellContent(room.id, day)}
                    </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase text-slate-400 tracking-widest px-2 pb-6">
        <div className="flex items-center"><span className="w-3 h-3 bg-white border border-slate-300 rounded-sm mr-1.5"></span> Libre</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-[#10b981] rounded-sm mr-1.5"></span> Entrada</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-[#f43f5e] rounded-sm mr-1.5"></span> Salida</div>
        <div className="flex items-center"><span className="w-3 h-3 bg-emerald-400 rounded-sm mr-1.5"></span> Estancia</div>
      </div>

      <ReservationModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingResId(null); }} editingResId={editingResId} />
    </div>
  );
};

export default Calendar;
