
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Save, UserCircle, Building, CreditCard, Lock, Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, switchUser, rooms, clients, products, maintenanceItems, reservations, sales, restoreBackup } = useApp();
  
  const [hotelName, setHotelName] = useState('Aroma a Vid');
  const [address, setAddress] = useState('Av. Del Sol 123, Montaña Alta');
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('10:00');
  const [ivaRate, setIvaRate] = useState(21);
  const [currency, setCurrency] = useState('USD');

  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
  };

  const handleAdminClick = () => {
    if (currentUser.role === 'admin') return;
    setShowPinModal(true);
    setPin('');
    setError('');
  };

  const verifyPin = () => {
    if (pin === '0209') {
        switchUser('admin');
        setShowPinModal(false);
    } else {
        setError('Contraseña incorrecta');
        setPin('');
    }
  };

  // --- LOGICA DE BACKUP MEJORADA ---
  const handleExportData = () => {
      // Exportamos los objetos reales del estado, no los strings de localStorage
      const dataToExport = {
          rooms,
          clients,
          products,
          maintenanceItems,
          reservations,
          sales,
          exportDate: new Date().toISOString(),
          version: "2.0"
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `copia_aroma_avid_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result as string;
              const json = JSON.parse(content);
              
              // Verificamos compatibilidad (al menos habitaciones o clientes)
              if (!json.rooms && !json.clients && !json.reservations) {
                  alert("Error: El archivo no parece ser una copia de seguridad válida de Aroma a Vid.");
                  return;
              }

              if (window.confirm("ATENCIÓN: Esto reemplazará TODOS los datos actuales con los del archivo. ¿Desea continuar?")) {
                  // Si los datos en el JSON son strings (formato viejo), intentamos parsearlos
                  const normalizedData: any = {};
                  Object.keys(json).forEach(key => {
                      if (typeof json[key] === 'string' && (json[key].startsWith('[') || json[key].startsWith('{'))) {
                          try { normalizedData[key] = JSON.parse(json[key]); } catch { normalizedData[key] = json[key]; }
                      } else {
                          normalizedData[key] = json[key];
                      }
                  });

                  restoreBackup(normalizedData);
                  alert("Datos restaurados con éxito. La aplicación se reiniciará para aplicar los cambios.");
                  window.location.reload();
              }
          } catch (err) {
              console.error(err);
              alert("Error al leer el archivo. Asegúrese de que sea un archivo .json válido.");
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h2>
        {successMessage && (
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg flex items-center font-bold animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={18} className="mr-2" /> Cambios guardados
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <UserCircle className="text-indigo-600" size={24} />
                <h3 className="text-xl font-bold text-slate-800">Simulación de Usuario</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4 font-medium">
                Alterne entre roles para verificar los permisos de acceso y funciones administrativas.
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={handleAdminClick}
                    className={`flex-1 py-4 px-4 rounded-2xl border-2 text-sm font-black flex items-center justify-center transition-all ${currentUser.role === 'admin' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                >
                    <Lock size={18} className="mr-2" />
                    Modo Administrador
                    {currentUser.role === 'admin' && <span className="ml-2 bg-indigo-400 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Activo</span>}
                </button>
                <button 
                    onClick={() => switchUser('receptionist')}
                    className={`flex-1 py-4 px-4 rounded-2xl border-2 text-sm font-black flex items-center justify-center transition-all ${currentUser.role === 'receptionist' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                >
                    Modo Recepcionista
                    {currentUser.role === 'receptionist' && <span className="ml-2 bg-emerald-400 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Activo</span>}
                </button>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-3">
                <Database className="text-emerald-600" size={24} />
                <h3 className="text-xl font-bold text-slate-800">Respaldo y Restauración de Datos</h3>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-6 flex items-start">
                 <AlertCircle className="text-amber-500 mt-1 mr-4 flex-shrink-0" size={24} />
                 <div>
                    <p className="text-sm text-amber-900 font-bold mb-1">Copia de Seguridad Crítica</p>
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Los datos se almacenan localmente en su navegador. Si limpia el historial o cambia de dispositivo sin una copia, perderá sus reservas.
                        <strong> Descargue una copia semanalmente.</strong>
                    </p>
                 </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={handleExportData}
                    className="flex-1 bg-slate-900 text-white py-4 px-4 rounded-2xl hover:bg-black transition flex items-center justify-center font-black shadow-lg"
                >
                    <Download size={20} className="mr-2" />
                    Descargar Copia (.json)
                </button>
                <button 
                    onClick={handleImportClick}
                    className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-4 px-4 rounded-2xl hover:bg-slate-50 transition flex items-center justify-center font-black"
                >
                    <Upload size={20} className="mr-2" />
                    Restaurar Datos
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <Building className="text-indigo-600" size={24} />
                <h3 className="text-lg font-bold text-slate-800">Establecimiento</h3>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Nombre</label>
                    <input type="text" className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold bg-slate-50/50" value={hotelName} onChange={e => setHotelName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Dirección</label>
                    <input type="text" className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold bg-slate-50/50" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
                <CreditCard className="text-indigo-600" size={24} />
                <h3 className="text-lg font-bold text-slate-800">Operaciones</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Check-In</label>
                    <input type="time" className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold bg-slate-50/50" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} />
                </div>
                <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1">Check-Out</label>
                    <input type="time" className="w-full border-2 border-slate-100 rounded-xl p-3 text-sm font-bold bg-slate-50/50" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} />
                </div>
            </div>
        </div>

        <div className="md:col-span-2 flex justify-end pt-4">
            <button 
                onClick={handleSave}
                className="bg-indigo-600 text-white px-10 py-4 rounded-2xl hover:bg-indigo-700 flex items-center font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
                <Save size={20} className="mr-2" />
                Guardar Configuración
            </button>
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[200]">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm text-center animate-in zoom-in duration-200">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Clave Maestra</h3>
                <p className="text-sm text-slate-500 mb-8 font-medium">Ingrese la contraseña de administrador</p>
                
                <input 
                    type="password" 
                    maxLength={4}
                    className="w-full text-center text-4xl tracking-[0.5em] font-black border-b-4 border-slate-200 focus:border-indigo-600 focus:outline-none py-4 mb-6 bg-transparent"
                    autoFocus
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                />
                
                {error && <p className="text-rose-500 text-xs font-black mb-6 uppercase tracking-widest">{error}</p>}

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowPinModal(false)}
                        className="flex-1 py-4 text-slate-400 font-black hover:bg-slate-100 rounded-2xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={verifyPin}
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black shadow-lg shadow-indigo-100"
                    >
                        Entrar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
