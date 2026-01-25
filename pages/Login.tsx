
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(pin);
    if (success) {
      navigate('/today');
    } else {
      setError('PIN incorrecto. Intente de nuevo.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 shadow-lg">
          <Lock size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">Aroma a Vid</h1>
        <p className="text-slate-500 font-bold mb-10 uppercase tracking-widest text-xs">Gestión de Complejo</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="password" 
              maxLength={4}
              placeholder="••••"
              className="w-full text-center text-5xl tracking-[0.5em] font-black border-b-4 border-slate-100 focus:border-indigo-600 focus:outline-none py-4 bg-transparent text-slate-900 placeholder:text-slate-200 transition-all"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-wider animate-bounce">
              <AlertCircle size={14} className="mr-2" /> {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95 flex items-center justify-center"
          >
            <ShieldCheck size={20} className="mr-2" /> ENTRAR AL SISTEMA
          </button>
        </form>
        
        <div className="mt-10 pt-8 border-t border-slate-50">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Acceso restringido para personal autorizado.<br/>
            Consulte con el administrador si olvidó su PIN.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
