
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Minus, Edit, X } from 'lucide-react';
import { Product, MaintenanceItem } from '../types';

const Stock: React.FC = () => {
  const { products, maintenanceItems, updateProductStock, updateMaintenanceStock, addProduct, updateProduct, addMaintenanceItem, updateMaintenanceItem, currentUser } = useApp();
  
  const isAdmin = currentUser?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'sales' | 'maintenance'>(isAdmin ? 'sales' : 'maintenance');
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | MaintenanceItem | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: '', category: '', price: 0, stock: 0 });
  const [newItem, setNewItem] = useState<Partial<MaintenanceItem>>({ name: '', category: '', unit: '', stock: 0, minStock: 0 });

  const handleOpenEdit = (item: Product | MaintenanceItem) => {
      if (!isAdmin) return;
      setEditingItem(item);
      if (activeTab === 'sales') {
          setNewProduct(item as Product);
      } else {
          setNewItem(item as MaintenanceItem);
      }
      setShowModal(true);
  };

  const handleSave = () => {
      if (!isAdmin) return;
      if (activeTab === 'sales') {
          if(!newProduct.name) return;
          if (editingItem) {
              updateProduct({ ...editingItem, ...newProduct } as Product);
          } else {
              addProduct({ ...newProduct, id: `p-${Date.now()}` } as Product);
          }
      } else {
          if(!newItem.name) return;
          if (editingItem) {
              updateMaintenanceItem({ ...editingItem, ...newItem } as MaintenanceItem);
          } else {
              addMaintenanceItem({ ...newItem, id: `m-${Date.now()}` } as MaintenanceItem);
          }
      }
      setShowModal(false);
      setEditingItem(null);
      setNewProduct({ name: '', category: '', price: 0, stock: 0 });
      setNewItem({ name: '', category: '', unit: '', stock: 0, minStock: 0 });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {isAdmin ? 'Stock General' : 'Limpieza'}
        </h2>
        {isAdmin && (
            <button 
                onClick={() => { setEditingItem(null); setShowModal(true); }}
                className="bg-indigo-600 text-white px-3 py-2 rounded-xl flex items-center hover:bg-indigo-700 transition shadow-lg font-black text-[10px]"
            >
                <Plus size={14} className="mr-1" /> NUEVO
            </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {isAdmin && (
            <button onClick={() => setActiveTab('sales')} className={`pb-2 px-1 flex items-center font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
                TIENDA
            </button>
        )}
        <button onClick={() => setActiveTab('maintenance')} className={`pb-2 px-1 flex items-center font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'maintenance' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
          INSUMOS
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[8px] uppercase font-black tracking-widest border-b border-slate-100">
              <th className="p-3">Item</th>
              <th className="p-3 text-center">Stock</th>
              <th className="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activeTab === 'sales' && isAdmin ? (
              products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50/50 text-xs">
                  <td className="p-3">
                    <div className="font-black text-slate-900 truncate max-w-[90px]">{product.name}</div>
                    <div className="text-[9px] text-indigo-600 font-black">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${product.stock <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {product.stock}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-1">
                        <button onClick={() => updateProductStock(product.id, -1)} className="p-1 border border-slate-200 rounded text-slate-400"><Minus size={14}/></button>
                        <button onClick={() => updateProductStock(product.id, 1)} className="p-1 bg-indigo-50 border border-indigo-100 rounded text-indigo-600"><Plus size={14}/></button>
                        <button onClick={() => handleOpenEdit(product)} className="p-1 bg-slate-100 text-slate-400 rounded transition-colors ml-1"><Edit size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              maintenanceItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 text-xs">
                  <td className="p-3">
                    <div className="font-black text-slate-900 truncate max-w-[90px]">{item.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{item.category}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.stock <= item.minStock ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.stock}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end items-center gap-1">
                        <button 
                            onClick={() => updateMaintenanceStock(item.id, -1)} 
                            className="bg-rose-600 text-white px-3 py-1.5 rounded-lg flex items-center font-black text-[9px] gap-1 transition-all active:scale-95 shadow-lg"
                        >
                            USO
                        </button>
                        {isAdmin && (
                            <button onClick={() => handleOpenEdit(item)} className="p-1.5 bg-slate-100 text-slate-400 rounded transition-colors ml-1"><Edit size={14}/></button>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4">
            <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                        {editingItem ? 'Editar' : 'Nuevo'} Insumo
                    </h3>
                    <button onClick={() => setShowModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-400"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Nombre del Item</label>
                        {/* INPUT CON VISIBILIDAD CORREGIDA */}
                        <input 
                            type="text" 
                            className="w-full border-2 border-slate-100 bg-white rounded-xl p-4 font-black text-slate-900 text-base outline-none focus:border-indigo-500 transition-all shadow-sm" 
                            value={activeTab === 'sales' ? newProduct.name : newItem.name} 
                            onChange={e => activeTab === 'sales' ? setNewProduct({...newProduct, name: e.target.value}) : setNewItem({...newItem, name: e.target.value})} 
                            placeholder="Ej: Jabón de tocador" 
                        />
                    </div>
                    {activeTab === 'sales' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Precio ($)</label>
                                <input type="number" className="w-full border-2 border-slate-100 bg-white rounded-xl p-4 font-black text-slate-900 text-base outline-none focus:border-indigo-500 shadow-sm" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Stock</label>
                                <input type="number" className="w-full border-2 border-slate-100 bg-white rounded-xl p-4 font-black text-slate-900 text-base outline-none focus:border-indigo-500 shadow-sm" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">En Stock</label>
                                <input type="number" className="w-full border-2 border-slate-100 bg-white rounded-xl p-4 font-black text-slate-900 text-base outline-none focus:border-indigo-500 shadow-sm" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Min. Alerta</label>
                                <input type="number" className="w-full border-2 border-slate-100 bg-white rounded-xl p-4 font-black text-slate-900 text-base outline-none focus:border-indigo-500 shadow-sm" value={newItem.minStock} onChange={e => setNewItem({...newItem, minStock: parseInt(e.target.value)})} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cerrar</button>
                    <button onClick={handleSave} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-indigo-100 tracking-widest active:scale-95 transition-all">Guardar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
