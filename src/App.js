import React, { useState, useEffect, useCallback } from 'react';

// --- INITIAL DEFAULT ACTUATOR DATABASE ---
const defaultActuatorDatabase = [
  { id: '1', model: 'AT-50', price: 150, torqueCurve: [80, 60, 40, 100, 120, 140] },
  { id: '2', model: 'AT-101', price: 250, torqueCurve: [160, 120, 90, 180, 220, 250] },
  { id: '3', model: 'AT-202', price: 400, torqueCurve: [350, 280, 220, 400, 450, 500] },
  { id: '4', model: 'AT-305', price: 650, torqueCurve: [700, 550, 450, 800, 900, 1000] },
  { id: '5', model: 'AT-510', price: 980, torqueCurve: [1200, 900, 700, 1300, 1500, 1800] },
  { id: '6', model: 'AT-750', price: 1500, torqueCurve: [2500, 2000, 1600, 2800, 3200, 3500] },
  { id: '7', model: 'AT-990', price: 2800, torqueCurve: [5000, 4000, 3200, 5500, 6000, 6500] },
];

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v2';

// --- Helper Icon Components ---
const SizingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L7.86 5.89a2 2 0 01-1.28.85l-2.8.4a2 2 0 00-1.1 3.43l2.03 2.1a2 2 0 01-.58 2.75l-1.5 2.5a2 2 0 002.83 2.83l2.5-1.5a2 2 0 012.75-.58l2.1 2.03a2 2 0 003.43-1.1l.4-2.8a2 2 0 01.85-1.28l2.72-.65c1.56-.38 1.56-2.6 0-2.98l-2.72-.65a2 2 0 01-.85-1.28l-.4-2.8a2 2 0 00-3.43-1.1l-2.1 2.03a2 2 0 01-2.75-.58l-1.5-2.5zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
const DatabaseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" /><path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" /><path d="M10 2a7 7 0 00-7 7c0 1.657 3.134 3 7 3s7-1.343 7-3a7 7 0 00-7-7z" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;

// --- MAIN APP COMPONENT ---
const App = () => {
    const [activeView, setActiveView] = useState('sizing');
    const [actuatorList, setActuatorList] = useState([]);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            setActuatorList(savedData ? JSON.parse(savedData) : defaultActuatorDatabase);
        } catch (error) {
            console.error("Failed to load data from local storage", error);
            setActuatorList(defaultActuatorDatabase);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actuatorList));
        } catch (error) {
            console.error("Failed to save data to local storage", error);
        }
    }, [actuatorList]);

    const handleAddActuator = (newActuator) => setActuatorList(prev => [...prev, { ...newActuator, id: Date.now().toString() }]);
    const handleUpdateActuator = (updated) => setActuatorList(prev => prev.map(act => (act.id === updated.id ? updated : act)));
    const handleDeleteActuator = (id) => setActuatorList(prev => prev.filter(actuator => actuator.id !== id));

    return (
        <div className="bg-slate-100 min-h-screen font-sans">
            <div className="relative container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Logo Component */}
                <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
                    {/* The placeholder has been replaced with your logo from Google Drive. */}
                    <img
                        src="https://drive.google.com/uc?export=view&id=1y0OHHtX3JvPyn8kyzTfG4fN1kPzbjNd-"
                        alt="Company Logo"
                        className="h-8 sm:h-10"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x40/ef4444/ffffff?text=Logo+Error'; }}
                    />
                </div>
                <header className="text-center mb-10 pt-16 sm:pt-0">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Actuator Sizing & Pricing Tool</h1>
                    <p className="mt-3 text-lg text-slate-600">An intelligent offline tool to streamline your engineering workflow.</p>
                </header>
                
                <div className="flex justify-center mb-8">
                    <div className="relative flex p-1 bg-slate-200 rounded-full shadow-inner">
                        <button onClick={() => setActiveView('sizing')} className={`relative w-40 flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'sizing' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                            <SizingIcon /> Sizing Tool
                        </button>
                        <button onClick={() => setActiveView('database')} className={`relative w-40 flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeView === 'database' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
                            <DatabaseIcon /> Database
                        </button>
                    </div>
                </div>

                <main className="transition-opacity duration-300">
                    {activeView === 'sizing' && <SizingTool actuatorDatabase={actuatorList} />}
                    {activeView === 'database' && <DatabaseManager actuatorList={actuatorList} onAdd={handleAddActuator} onUpdate={handleUpdateActuator} onDelete={handleDeleteActuator} />}
                </main>
            </div>
        </div>
    );
};

// --- Reusable Card Component ---
const Card = ({ children, className }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 ${className}`}>
        {children}
    </div>
);

// --- Sizing Tool Component ---
const SizingTool = ({ actuatorDatabase }) => {
    const [btoInput, setBtoInput] = useState('');
    const [results, setResults] = useState(null);

    const calculateRequiredTorques = (bto) => !isNaN(bto) && bto > 0 ? { bto, rto: bto * 0.5, eto: bto * 0.8, etc: bto * 0.9, rtc: bto * 0.6, btc: bto * 1.1 } : null;
    
    const findMatchingActuator = useCallback((req) => {
        if (!req) return null;
        const suitable = actuatorDatabase.filter(act => {
            const t = act.torqueCurve;
            return (t[0]/req.bto >= 1.5 && t[1]/req.rto >= 1.5 && t[2]/req.eto >= 1.5 && t[3]/req.etc >= 1.5 && t[4]/req.rtc >= 1.5 && t[5]/req.btc >= 1.5);
        }).sort((a, b) => a.price - b.price);
        return suitable.length > 0 ? suitable[0] : null;
    }, [actuatorDatabase]);
    
    const handleCalculation = useCallback(() => {
        const bto = parseFloat(btoInput);
        const required = calculateRequiredTorques(bto);
        if (!required) { setResults(null); return; }
        const matched = findMatchingActuator(required);
        if (matched) {
            const analysis = ['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((name, i) => ({
                name, req: required[name.toLowerCase()], act: matched.torqueCurve[i], sf: matched.torqueCurve[i] / required[name.toLowerCase()]
            }));
            setResults({ success: true, matched, analysis });
        } else {
            setResults({ success: false, message: "No suitable actuator found. Add more models to your database or adjust BTO." });
        }
    }, [btoInput, findMatchingActuator]);

    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <Card>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">Valve Torque Input</h2>
            <p className="text-slate-500 mb-6">Enter the primary torque requirement to begin sizing.</p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-grow w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">BTO</span>
                    </div>
                    <input type="number" value={btoInput} onChange={(e) => setBtoInput(e.target.value)} placeholder="e.g., 200" className="block w-full rounded-full border-slate-300 py-3 pl-12 pr-4 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                         <span className="text-slate-500 sm:text-sm">Nm</span>
                    </div>
                </div>
                <button onClick={handleCalculation} className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105">Calculate</button>
            </div>
        </Card>
        {results && (
          <Card className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Sizing Results</h2>
            {results.success ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-base font-semibold text-slate-500">Selected Actuator</h3><p className="text-3xl font-bold text-indigo-600 mt-1">{results.matched.model}</p></div>
                    <div className="bg-slate-50 p-6 rounded-xl"><h3 className="text-base font-semibold text-slate-500">Estimated Price</h3><p className="text-3xl font-bold text-indigo-600 mt-1">${results.matched.price.toLocaleString()}</p></div>
                </div>
                <AnalysisTable analysis={results.analysis} />
              </div>
            ) : (
              <div className="bg-red-50 p-6 rounded-xl text-center"><h3 className="text-lg font-semibold text-red-800">Sizing Failed</h3><p className="mt-2 text-red-700">{results.message}</p></div>
            )}
          </Card>
        )}
        <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}`}</style>
      </div>
    );
};

// --- Analysis Table ---
const AnalysisTable = ({ analysis }) => (
    <div className="overflow-x-auto"><table className="min-w-full">
        <thead className="border-b border-slate-200"><tr className="text-left text-sm font-semibold text-slate-500">
            <th className="p-4">Position</th><th className="p-4">Required (Nm)</th><th className="p-4">Actuator (Nm)</th><th className="p-4">Safety Factor</th>
        </tr></thead>
        <tbody>{analysis.map((item, i) => (<tr key={item.name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td className="p-4 font-medium text-slate-800">{item.name}</td>
            <td className="p-4 text-slate-600">{item.req.toFixed(2)}</td>
            <td className="p-4 text-slate-600">{item.act.toFixed(2)}</td>
            <td className="p-4 font-bold"><span className={`px-3 py-1 rounded-full text-xs ${item.sf >= 1.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.sf.toFixed(2)}x</span></td>
        </tr>))}</tbody>
    </table></div>
);

// --- Database Manager Component ---
const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActuator, setEditingActuator] = useState(null);

    const handleOpenModal = (actuator = null) => { setEditingActuator(actuator); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingActuator(null); };
    const handleSave = (actuator) => { (actuator.id ? onUpdate : onAdd)(actuator); handleCloseModal(); };

    return (
        <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Actuator Database</h2>
                    <p className="mt-1 text-slate-500">Manage the list of actuators. Data is saved locally in your browser.</p>
                </div>
                <button onClick={() => handleOpenModal()} type="button" className="mt-4 sm:mt-0 flex items-center justify-center rounded-full border border-transparent bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-transform hover:scale-105">
                    <PlusIcon /> Add Actuator
                </button>
            </div>
            <div className="overflow-x-auto"><table className="min-w-full">
                <thead className="border-b border-slate-200"><tr className="text-left text-sm font-semibold text-slate-500">
                    <th className="p-4">Model</th><th className="p-4">Price ($)</th><th className="p-4">Torque Curve (Nm)</th><th className="p-4">Actions</th>
                </tr></thead>
                <tbody>{actuatorList.map((actuator) => (<tr key={actuator.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{actuator.model}</td>
                    <td className="p-4 text-slate-600">${actuator.price.toLocaleString()}</td>
                    <td className="p-4 text-slate-600 text-xs">{actuator.torqueCurve.join(' / ')}</td>
                    <td className="p-4 text-sm font-medium space-x-4">
                        <button onClick={() => handleOpenModal(actuator)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button onClick={() => onDelete(actuator.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                </tr>))}</tbody>
            </table></div>
            {isModalOpen && <ActuatorForm actuator={editingActuator} onSave={handleSave} onClose={handleCloseModal} />}
        </Card>
    );
};

// --- Actuator Form Modal ---
const ActuatorForm = ({ actuator, onSave, onClose }) => {
    const [formData, setFormData] = useState(actuator || { model: '', price: '', torqueCurve: Array(6).fill('') });
    const [error, setError] = useState('');

    const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleTorqueChange = (i, val) => { const tc = [...formData.torqueCurve]; tc[i] = val; setFormData(p => ({ ...p, torqueCurve: tc }));};
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.model || !formData.price || formData.torqueCurve.some(t => t === '' || isNaN(parseFloat(t)))) {
            setError('Please fill all fields with valid numbers.'); return;
        }
        onSave({ ...formData, price: parseFloat(formData.price), torqueCurve: formData.torqueCurve.map(t => parseFloat(t)) });
    };
    
    const torqueLabels = ['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'];
    
    return (
        <div className="relative z-10" aria-modal="true">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <Card className="w-full max-w-lg animate-fade-in">
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-bold text-slate-800 mb-6">{actuator ? 'Edit' : 'Add New'} Actuator</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="model" className="block text-sm font-medium text-slate-600">Model Name</label>
                                    <input type="text" name="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm p-2.5"/>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-slate-600">Price ($)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm p-2.5"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Torque Curve (Nm)</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {torqueLabels.map((label, i) => (<div key={i}>
                                            <label className="block text-xs font-medium text-slate-500">{label}</label>
                                            <input type="number" value={formData.torqueCurve[i]} onChange={(e) => handleTorqueChange(i, e.target.value)} required className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm p-2"/>
                                        </div>))}
                                    </div>
                                </div>
                                {error && <p className="text-sm text-red-600">{error}</p>}
                            </div>
                            <div className="mt-8 flex justify-end space-x-3">
                                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-full hover:bg-slate-300 transition-colors">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">Save Actuator</button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default App;

