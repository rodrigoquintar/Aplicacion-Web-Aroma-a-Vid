import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CartItem, Product, ReservationStatus } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, Save } from 'lucide-react';

const POS: React.FC = () => {
  const { products, reservations, clients, addSale } = useApp();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [linkedReservationId, setLinkedReservationId] = useState<string>('');

  // Get active reservations for "Room Charge"
  const activeReservations = reservations.filter(r => r.status === ReservationStatus.CHECKED_IN);
  
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
      setCart(prev => {
          const existing = prev.find(p => p.id === product.id);
          if (existing) {
              return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
          }
          return [...prev, { ...product, quantity: 1 }];
      });
  };

  const removeFromCart = (productId: string) => {
      setCart(prev => prev.filter(p => p.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
      setCart(prev => prev.map(p => {
          if (p.id === productId) {
              return { ...p, quantity: Math.max(1, p.quantity + delta) };
          }
          return p;
      }));
  };

  const cartTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const handleCheckout = () => {
      if (cart.length === 0) return;
      
      addSale({
          id: `sale-${Date.now()}`,
          date: new Date().toISOString(),
          items: cart,
          total: cartTotal,
          reservationId: linkedReservationId || undefined
      });
      
      setCart([]);
      setLinkedReservationId('');
      alert('Venta registrada correctamente');
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-6">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col space-y-4">
        <h2 className="text-3xl font-bold text-slate-800">Tienda / POS</h2>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
                <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20">
            {filteredProducts.map(product => (
                <button 
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition text-left flex flex-col justify-between h-full group"
                >
                    <div>
                        <div className="h-24 w-full bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                           <ShoppingCart size={32} />
                        </div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600">{product.name}</h3>
                        <p className="text-xs text-slate-500">{product.category}</p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <span className="font-bold text-slate-800">${product.price.toFixed(2)}</span>
                        <span className={`text-xs px-2 py-1 rounded ${product.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            Stock: {product.stock}
                        </span>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 flex items-center">
                <ShoppingCart className="mr-2" size={20} />
                Carrito Actual
            </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
                <div className="text-center text-slate-400 mt-10">
                    Carrito vacío.
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-slate-800">{item.name}</p>
                            <p className="text-xs text-slate-500">${item.price.toFixed(2)} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded">
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded">
                                <Plus size={14} />
                            </button>
                            <button onClick={() => removeFromCart(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded ml-1">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase">Cargar a Habitación (Opcional)</label>
                <select 
                    className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                    value={linkedReservationId}
                    onChange={(e) => setLinkedReservationId(e.target.value)}
                >
                    <option value="">-- Pago Directo / Efectivo --</option>
                    {activeReservations.map(res => {
                        const client = clients.find(c => c.id === res.clientId);
                        const room = useApp().getRoomById(res.roomId); // Access context directly for room would be cleaner but this works
                        return (
                            <option key={res.id} value={res.id}>
                                Hab {room?.number} - {client?.lastName}
                            </option>
                        )
                    })}
                </select>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
            </div>

            <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
                <Save size={18} className="mr-2" />
                Confirmar Venta
            </button>
        </div>
      </div>
    </div>
  );
};

export default POS;