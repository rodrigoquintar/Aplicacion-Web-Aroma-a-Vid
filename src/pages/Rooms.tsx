
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RoomStatus, Room } from '../types';
import { Bed, User, Brush, Wrench, CheckCircle, Plus, Trash2, Edit, AlertTriangle, X } from 'lucide-react';

const Rooms: React.FC = () => {
  const { rooms, updateRoomStatus, addRoom, deleteRoom, updateRoom } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Room>>({
    number: '',
    type: 'Suite Familiar',
    capacity: 4,
    description: '',
    status: RoomStatus.AVAILABLE
  });

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case RoomStatus.OCCUPIED: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case RoomStatus.MAINTENANCE: return 'bg-rose-100 text-rose-800 border-rose-200';
      case RoomStatus.CLEANING: return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openModal = (room?: Room) => {
      if (room) {
          setEditingRoom(room);
          setFormData(room);
      } else {
          setEditingRoom(null);
          setFormData({
            number: '',
            type: 'Suite Familiar',
            capacity: 4,
            description: '',
            status: RoomStatus.AVAILABLE
          });
      }
      setShowModal(true);
  };

  const handleSave = () => {
      if (!formData.number) return alert('El número/nombre es obligatorio');
      if (editingRoom) {
          updateRoom({ ...formData, id: editingRoom.id } as Room);
      } else {
          addRoom({ ...formData, id: `room-${Date.now()}`, status: RoomStatus.AVAILABLE } as Room);
      }
      setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900">Gestión de Departamentos</h2>
        <button onClick={() => openModal()} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-bold">
            <Plus size={18} className="mr-2" /> Agregar Departamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all flex flex-col overflow-hidden">
            <div className="flex justify-between items-start p-6 pb-4">
                <div className="pr-2">
                   <h3 className="text-2xl font-black text-slate-900 truncate">{room.number}</h3>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{room.type}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openModal(room)} className="h-10 w-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100"><Edit size={18} /></button>
                    <button onClick={() => { setRoomToDelete(room.id); setShowDeleteModal(true); }} className="h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl border border-rose-100"><Trash2 size={18} /></button>
                </div>
            </div>

            <div className="px-6 pb-6 flex-1 flex flex-col">
              <div className="mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
              </div>
              <div className="space-y-3 mb-6 flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center text-slate-700 text-sm">
                  <User size={16} className="mr-2 text-indigo-500" />
                  <span className="font-bold">Capacidad: {room.capacity} personas</span>
                </div>
                {room.description && <p className="text-[11px] text-slate-500 mt-2 italic border-t border-slate-200 pt-3">{room.description}</p>}
              </div>

              <div className="flex gap-3">
                {room.status !== RoomStatus.OCCUPIED ? (
                    <button onClick={() => updateRoomStatus(room.id, room.status === RoomStatus.AVAILABLE ? RoomStatus.MAINTENANCE : RoomStatus.AVAILABLE)} 
                            className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-black transition-all">
                        {room.status === RoomStatus.AVAILABLE ? 'Mantenimiento' : 'Habilitar'}
                    </button>
                ) : (
                    <div className="w-full text-center text-sm font-black text-indigo-700 py-3 bg-indigo-50 rounded-xl border-2 border-indigo-100 flex justify-center items-center">
                        <User size={18} className="mr-2" /> Ocupado
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

       {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 px-4 p-4 overflow-y-auto">
              <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
                      <h3 className="text-2xl font-black text-slate-900">{editingRoom ? 'Editar Departamento' : 'Nuevo Departamento'}</h3>
                      <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-100 p-2 rounded-full"><X size={24}/></button>
                  </div>
                  <div className="space-y-5">
                      <input type="text" className="w-full border-2 border-slate-200 rounded-2xl p-4 text-slate-900 font-bold bg-white" placeholder="Nombre/Número" value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} />
                      <input type="text" className="w-full border-2 border-slate-200 rounded-2xl p-4 text-slate-900 font-bold bg-white" placeholder="Tipo (Suite, Eco...)" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                      <input type="number" className="w-full border-2 border-slate-200 rounded-2xl p-4 text-slate-900 font-bold bg-white" placeholder="Capacidad" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                      <textarea className="w-full border-2 border-slate-200 rounded-2xl p-4 text-slate-900 font-medium bg-white" rows={3} placeholder="Descripción..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="mt-10 flex gap-4">
                      <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-600 font-black">Cancelar</button>
                      <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">Guardar</button>
                  </div>
              </div>
          </div>
       )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[60] px-4">
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl text-center border border-slate-200">
                <AlertTriangle size={40} className="mx-auto text-rose-600 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2 text-center w-full">¿Eliminar?</h3>
                <div className="flex gap-4 mt-8">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-black">No</button>
                    <button onClick={() => { deleteRoom(roomToDelete!); setShowDeleteModal(false); }} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-black">Sí, borrar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
