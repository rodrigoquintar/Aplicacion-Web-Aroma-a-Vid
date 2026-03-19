import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Room, RoomStatus } from '../types';
import { Plus, Edit, Trash2, Users, Home, Info, X } from 'lucide-react';

const Rooms: React.FC = () => {
  const { rooms, addRoom, updateRoom, deleteRoom } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  
  const [formData, setFormData] = useState<Partial<Room>>({
    number: '',
    type: 'Suite Familiar',
    capacity: 4,
    description: '',
    status: RoomStatus.AVAILABLE
  });

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({ ...room });
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

  const handleSave = async () => {
    if (!formData.number) return alert('El nombre o número de departamento es obligatorio');

    const roomData = {
      ...formData,
      id: editingRoom ? editingRoom.id : `room-${Date.now()}`,
      capacity: Number(formData.capacity || 0)
    } as Room;

    try {
      if (editingRoom) {
        await updateRoom(roomData);
      } else {
        await addRoom(roomData);
      }
      setShowModal(false);
      setEditingRoom(null);
    } catch (error) {
      alert("Error al guardar los cambios en Supabase");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Departamentos</h2>
          <p className="text-slate-500 font-medium">Gestión de unidades de Aroma a Vid</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 font-black text-xs tracking-widest uppercase"
        >
          <Plus size={16} className="mr-2" /> NUEVA UNIDAD
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room: Room) => (
          <div key={room.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Home size={24} />
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(room)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Edit size={18} />
                </button>
                <button onClick={() => { if(window.confirm('¿Eliminar esta unidad?')) deleteRoom(room.id) }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-xl font-black text-slate-900 uppercase">{room.number}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{room.type}</p>
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-4">
              <div className="flex items-center text-slate-600">
                <Users size={16} className="mr-2" />
                <span className="font-black text-sm">{room.capacity} Pers.</span>
              </div>
              <div className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                room.status === RoomStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-600' : 
                room.status === RoomStatus.OCCUPIED ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {room.status}
              </div>
            </div>

            {room.description && (
              <p className="text-slate-500 text-sm line-clamp-2 italic mb-2">"{room.description}"</p>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Edición/Creación */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                {editingRoom ? 'Editar Unidad' : 'Nueva Unidad'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 bg-slate-50 p-2 rounded-full">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nombre / Número</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-slate-900 font-black focus:border-indigo-500 outline-none transition-all"
                  value={formData.number} 
                  onChange={e => setFormData({...formData, number: e.target.value})}
                  placeholder="Ej: Depto 1 o Suite Sol"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Tipo</label>
                  <select 
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-slate-900 font-black outline-none"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                  >
                    <option value="Suite Familiar">Familiar</option>
                    <option value="Doble">Doble</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Capacidad</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      className="w-full border-2 border-slate-100 rounded-2xl p-4 pl-12 bg-slate-50/50 text-slate-900 font-black outline-none"
                      value={formData.capacity} 
                      onChange={e => setFormData({...formData, capacity: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Descripción / Notas</label>
                <textarea 
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-slate-900 font-medium outline-none h-24 resize-none"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={handleSave} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all">
                {editingRoom ? 'Guardar Cambios' : 'Crear Unidad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
