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

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v3';

// --- SVG Icon Components ---
const SizingIcon = () => <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const DatabaseIcon = () => <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8-4v0c0 2.21-3.582 4-8 4s-8-1.79-8-4v0z"></path></svg>;

// --- Main App Layout Component ---
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
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
                <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
                     <img src="/logo.png" alt="Company Logo" className="h-8" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x40/ef4444/ffffff?text=Upload+logo.png'; }}/>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavItem icon={<SizingIcon />} label="Sizing Tool" isActive={activeView === 'sizing'} onClick={() => setActiveView('sizing')} />
                    <NavItem icon={<DatabaseIcon />} label="Database" isActive={activeView === 'database'} onClick={() => setActiveView('database')} />
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12">
                 {activeView === 'sizing' && <SizingTool actuatorDatabase={actuatorList} />}
                 {activeView === 'database' && <DatabaseManager actuatorList={actuatorList} onAdd={handleAddActuator} onUpdate={handleUpdateActuator} onDelete={handleDeleteActuator} />}
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full flex items-center px-4 py-3 text-left text-base font-medium rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

// Other components remain largely the same, but will be styled within the new layout
const Card = ({ children, className }) => <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>{children}</div>;

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
        <div className="max-w-4xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Actuator Sizing Calculator</h1>
                <p className="mt-2 text-gray-600">Enter the valve's Break-to-Open torque to find a suitable actuator.</p>
            </header>
            <Card>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full">
                        <label htmlFor="bto_torque" className="block text-sm font-medium text-gray-700 mb-1">BTO Torque (Nm)</label>
                        <input type="number" id="bto_torque" value={btoInput} onChange={(e) => setBtoInput(e.target.value)} placeholder="e.g., 200" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"/>
                    </div>
                    <button onClick={handleCalculation} className="w-full sm:w-auto mt-2 sm:mt-6 bg-blue-600 text-white font-semibold py-3 px-6 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">Calculate</button>
                </div>
            </Card>

            {results && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Results</h2>
                {results.success ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card><h3 className="text-gray-500">Selected Model</h3><p className="text-2xl font-bold text-gray-900 mt-1">{results.matched.model}</p></Card>
                        <Card><h3 className="text-gray-500">Estimated Price</h3><p className="text-2xl font-bold text-gray-900 mt-1">€{results.matched.price.toLocaleString()}</p></Card>
                    </div>
                    <Card><AnalysisTable analysis={results.analysis} /></Card>
                  </div>
                ) : (
                  <Card><div className="text-center text-red-600">{results.message}</div></Card>
                )}
              </div>
            )}
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}`}</style>
        </div>
    );
};

const AnalysisTable = ({ analysis }) => (
    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-6 py-3">Position</th><th className="px-6 py-3">Required (Nm)</th><th className="px-6 py-3">Actuator (Nm)</th><th className="px-6 py-3">Safety Factor</th>
        </tr></thead>
        <tbody className="bg-white divide-y divide-gray-200">{analysis.map(item => (
            <tr key={item.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.req.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.act.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold"><span className={`px-2.5 py-0.5 rounded-full text-xs ${item.sf >= 1.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.sf.toFixed(2)}x</span></td>
            </tr>
        ))}</tbody>
    </table></div>
);

const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActuator, setEditingActuator] = useState(null);

    const handleOpenModal = (actuator = null) => { setEditingActuator(actuator); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingActuator(null); };
    const handleSave = (actuator) => { (actuator.id ? onUpdate : onAdd)(actuator); handleCloseModal(); };

    return (
        <div className="max-w-6xl mx-auto">
             <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Actuator Database</h1>
                    <p className="mt-2 text-gray-600">Add, edit, or remove actuators from the local database.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Add Actuator</button>
            </header>
            <Card>
                <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Model</th><th className="px-6 py-3">Price (€)</th><th className="px-6 py-3">Torque Curve (Nm)</th><th className="px-6 py-3">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{actuatorList.map(actuator => (
                        <tr key={actuator.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actuator.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{actuator.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actuator.torqueCurve.join(' / ')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                                <button onClick={() => handleOpenModal(actuator)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                <button onClick={() => onDelete(actuator.id)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table></div>
            </Card>
            {isModalOpen && <ActuatorForm actuator={editingActuator} onSave={handleSave} onClose={handleCloseModal} />}
        </div>
    );
};

const ActuatorForm = ({ actuator, onSave, onClose }) => {
    const [formData, setFormData] = useState(actuator || { model: '', price: '', torqueCurve: Array(6).fill('') });
    
    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleTorqueChange = (i, val) => { const tc = [...formData.torqueCurve]; tc[i] = val; setFormData(p => ({ ...p, torqueCurve: tc })); };
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, price: parseFloat(formData.price), torqueCurve: formData.torqueCurve.map(t => parseFloat(t)) });
    };
    
    return (
        <div className="relative z-10"><div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 overflow-y-auto"><div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <form onSubmit={handleSubmit}><div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{actuator ? 'Edit' : 'Add'} Actuator</h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3"><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm"/></div>
                            <div className="sm:col-span-3"><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)</label><input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm"/></div>
                            {['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((label, i) => (
                                <div className="sm:col-span-2" key={label}><label className="block text-sm font-medium text-gray-700">{label} (Nm)</label><input type="number" value={formData.torqueCurve[i]} onChange={e => handleTorqueChange(i, e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm"/></div>
                            ))}
                        </div>
                    </div><div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                        <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                    </div></form>
                </div>
            </div></div>
        </div>
    );
};

export default App;
