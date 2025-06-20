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

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v4'; // New version key

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
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <header className="mb-10 text-center">
                    <img
                        src="/logo.png"
                        alt="Company Logo"
                        className="h-12 mx-auto mb-6"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x50/ef4444/ffffff?text=Upload+logo.png'; }}
                    />
                    <h1 className="text-4xl font-bold text-gray-800">Offline Actuator Sizing & Pricing Tool</h1>
                    <p className="mt-2 text-lg text-gray-500">Size your actuator or manage your local offline database.</p>
                </header>

                <nav className="mb-8 border-b border-gray-200">
                    <div className="flex space-x-8">
                        <TabButton label="Sizing Tool" isActive={activeView === 'sizing'} onClick={() => setActiveView('sizing')} />
                        <TabButton label="Manage Database" isActive={activeView === 'database'} onClick={() => setActiveView('database')} />
                    </div>
                </nav>

                <main>
                    {activeView === 'sizing' && <SizingTool actuatorDatabase={actuatorList} />}
                    {activeView === 'database' && <DatabaseManager actuatorList={actuatorList} onAdd={handleAddActuator} onUpdate={handleUpdateActuator} onDelete={handleDeleteActuator} />}
                </main>
            </div>
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${isActive ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
);

// --- Reusable UI Components ---
const Card = ({ children, className }) => <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 sm:p-8 ${className}`}>{children}</div>;
const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => <button type={type} onClick={onClick} className={`bg-indigo-600 text-white font-semibold py-2 px-5 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}>{children}</button>;
const SecondaryButton = ({ children, onClick, className }) => <button type="button" onClick={onClick} className={`bg-white text-gray-700 border border-gray-300 font-semibold py-2 px-5 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}>{children}</button>;

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
        <div className="space-y-8">
            <Card>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">1. Enter Valve Torque</h2>
                <div className="mt-6 flex flex-col sm:flex-row items-end gap-4">
                    <div className="w-full">
                        <label htmlFor="bto_torque" className="block text-sm font-medium text-gray-700 mb-1">Break to Open (BTO) Torque (Nm)</label>
                        <input type="number" id="bto_torque" value={btoInput} onChange={(e) => setBtoInput(e.target.value)} placeholder="e.g., 200" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"/>
                    </div>
                    <PrimaryButton onClick={handleCalculation} className="w-full sm:w-auto">Calculate</PrimaryButton>
                </div>
            </Card>

            {results && (
              <div className="animate-fade-in space-y-8">
                <h2 className="text-2xl font-semibold text-gray-800">2. Sizing Results</h2>
                {results.success ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card><h3 className="text-gray-500">Selected Model</h3><p className="text-3xl font-bold text-gray-900 mt-1">{results.matched.model}</p></Card>
                        <Card><h3 className="text-gray-500">Estimated Price</h3><p className="text-3xl font-bold text-gray-900 mt-1">€{results.matched.price.toLocaleString()}</p></Card>
                    </div>
                    <Card><AnalysisTable analysis={results.analysis} /></Card>
                  </>
                ) : (
                  <Card><div className="text-center text-red-600 font-medium">{results.message}</div></Card>
                )}
              </div>
            )}
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}`}</style>
        </div>
    );
};

const AnalysisTable = ({ analysis }) => (
    <div className="overflow-x-auto -mx-6 sm:-mx-8"><table className="min-w-full divide-y divide-gray-200">
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
        <div className="space-y-6">
             <header className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Actuator Database</h2>
                <PrimaryButton onClick={() => handleOpenModal()}>Add Actuator</PrimaryButton>
            </header>
            <Card>
                <div className="overflow-x-auto -mx-6 sm:-mx-8"><table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Model</th><th className="px-6 py-3">Price (€)</th><th className="px-6 py-3">Torque Curve (Nm)</th><th className="px-6 py-3 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{actuatorList.map(actuator => (
                        <tr key={actuator.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actuator.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{actuator.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actuator.torqueCurve.join(' / ')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-4">
                                <button onClick={() => handleOpenModal(actuator)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
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
                        <PrimaryButton type="submit">Save</PrimaryButton>
                        <SecondaryButton onClick={onClose} className="sm:ml-3 mt-3 sm:mt-0">Cancel</SecondaryButton>
                    </div></form>
                </div>
            </div></div>
        </div>
    );
};

export default App;
