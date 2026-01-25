
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Trash2, User, Phone, Globe, AlertTriangle } from 'lucide-react';

const Clients: React.FC = () => {
  const { clients, deleteClient } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const filteredClients = clients.filter(client => {
    const s = searchTerm.toLowerCase();
    return (
        client.firstName.toLowerCase().includes(s) || 
        client.lastName.toLowerCase().includes(s) ||
        client.phone.toLowerCase().includes(s) ||
        client.platform.toLowerCase().includes(s)
    );
  });

  const confirmDelete = () => {
      if (clientToDelete) {
          deleteClient(clientToDelete);
          setShowDeleteModal(false);
          setClientToDelete(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Clientes</h2>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, plataforma o teléfono..." 
            className="w-full pl-12 pr-4 py-4 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 outline-none text-slate-900 font-bold transition-all bg-slate-50/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[9px] uppercase tracking-widest font-black border-b border-slate-100">
              <th className="p-4 w-[35%]">Nombre</th>
              <th className="p-4 w-[35%] text-center">Teléfono</th>
              <th className="p-4 w-[15%] text-right">Plat.</th>
              <th className="p-4 w-[15%] text-right">Acc.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors text-xs">
                <td className="p-4 truncate">
                  <div className="font-black text-slate-900 uppercase">{client.lastName}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{client.firstName}</div>
                </td>
                <td className="p-4 text-center">
                    <div className="flex items-center justify-center text-xs font-black text-slate-700 bg-slate-50 rounded-lg py-2 px-1 border border-slate-100">
                        <Phone size={10} className="mr-1 text-emerald-500 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                    </div>
                </td>
                <td className="p-4 text-right">
                    <div className="text-[9px] font-black text-indigo-500 uppercase truncate">
                        {client.platform.slice(0, 4)}
                    </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => { setClientToDelete(client.id); setShowDeleteModal(true); }}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-black uppercase tracking-widest text-xs">Sin resultados encontrados</div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
            <div className="bg-white p-10 rounded-3xl w-full max-w-sm shadow-2xl text-center border border-slate-200">
                <AlertTriangle size={40} className="mx-auto text-rose-600 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 mb-2">¿Eliminar Cliente?</h3>
                <div className="flex gap-4 mt-10">
                    <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition">CANCELAR</button>
                    <button onClick={confirmDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg">ELIMINAR</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
