import React, { useState, useEffect, useCallback } from 'react';

// --- INITIAL DEFAULT ACTUATOR DATABASE ---
// This is the fallback data if nothing is found in local storage.
const defaultActuatorDatabase = [
  { id: '1', model: 'AT-50', price: 150, torqueCurve: [80, 60, 40, 100, 120, 140] },
  { id: '2', model: 'AT-101', price: 250, torqueCurve: [160, 120, 90, 180, 220, 250] },
  { id: '3', model: 'AT-202', price: 400, torqueCurve: [350, 280, 220, 400, 450, 500] },
  { id: '4', model: 'AT-305', price: 650, torqueCurve: [700, 550, 450, 800, 900, 1000] },
  { id: '5', model: 'AT-510', price: 980, torqueCurve: [1200, 900, 700, 1300, 1500, 1800] },
  { id: '6', model: 'AT-750', price: 1500, torqueCurve: [2500, 2000, 1600, 2800, 3200, 3500] },
  { id: '7', model: 'AT-990', price: 2800, torqueCurve: [5000, 4000, 3200, 5500, 6000, 6500] },
];

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v11';

// --- Reusable UI Components ---
const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`py-2 px-6 font-semibold text-sm transition-all duration-200 -mb-0.5 ${
        isActive
            ? 'bg-[rgb(139,0,0)] text-white rounded-t-md'
            : 'text-gray-500 hover:text-[rgb(139,0,0)] hover:bg-red-50'
    }`}>
        {label}
    </button>
);

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>{children}</div>;
const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => <button type={type} onClick={onClick} className={`bg-[rgb(139,0,0)] text-white font-semibold py-2 px-5 rounded-md shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${className}`}>{children}</button>;
const SecondaryButton = ({ children, onClick, className = '' }) => <button type="button" onClick={onClick} className={`bg-white text-gray-700 border border-gray-300 font-semibold py-2 px-5 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors ${className}`}>{children}</button>;


// --- Sizing Tool Component ---
// Handles the logic for calculating required torques and finding a matching actuator.
const SizingTool = ({ actuatorDatabase }) => {
    const [btoInput, setBtoInput] = useState('');
    const [results, setResults] = useState(null);

    // Calculates the required torques for the valve based on the BTO value.
    const calculateRequiredTorques = (bto) => !isNaN(bto) && bto > 0 ? { bto, rto: bto * 0.5, eto: bto * 0.8, etc: bto * 0.9, rtc: bto * 0.6, btc: bto * 1.1 } : null;
    
    // Finds the cheapest suitable actuator from the database that meets the safety factor requirements.
    const findMatchingActuator = useCallback((req) => {
        if (!req) return null;
        const suitable = actuatorDatabase
            .filter(act => {
                const t = act.torqueCurve;
                if (!t || t.length < 6) return false; // Safety check
                const safetyFactor = 1.5;
                return (t[0]/req.bto >= safetyFactor && t[1]/req.rto >= safetyFactor && t[2]/req.eto >= safetyFactor && t[3]/req.etc >= safetyFactor && t[4]/req.rtc >= safetyFactor && t[5]/req.btc >= safetyFactor);
            })
            .sort((a, b) => a.price - b.price); // Sort by price to find the most economical option
        return suitable.length > 0 ? suitable[0] : null;
    }, [actuatorDatabase]);
    
    // Handles the main calculation logic when the user clicks the button.
    const handleCalculation = useCallback(() => {
        const bto = parseFloat(btoInput);
        const required = calculateRequiredTorques(bto);
        if (!required) { 
            setResults({ success: false, message: "Please enter a valid BTO Torque value." }); 
            return; 
        }

        const matched = findMatchingActuator(required);
        if (matched) {
            const analysis = ['bto', 'rto', 'eto', 'etc', 'rtc', 'btc'].map((key, i) => ({
                name: key.toUpperCase(), 
                req: required[key], 
                act: matched.torqueCurve[i], 
                sf: matched.torqueCurve[i] / required[key]
            }));
            setResults({ success: true, matched, analysis });
        } else {
            setResults({ success: false, message: "No suitable actuator found. Add more models to your database or adjust BTO." });
        }
    }, [btoInput, findMatchingActuator]);

    return (
        <div className="space-y-8">
            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Enter Valve Torque</h2>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="w-full">
                        <label htmlFor="bto_torque" className="block text-sm font-medium text-gray-700 mb-1">Break to Open (BTO) Torque (Nm)</label>
                        <input type="number" id="bto_torque" value={btoInput} onChange={(e) => setBtoInput(e.target.value)} placeholder="e.g., 200" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2"/>
                    </div>
                    <PrimaryButton onClick={handleCalculation} className="w-full sm:w-auto flex-shrink-0">Calculate</PrimaryButton>
                </div>
            </Card>

            {results && (
              <div className="animate-fade-in space-y-8">
                  <h2 className="text-xl font-bold text-gray-900">2. Sizing Results</h2>
                  {results.success ? (
                      <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Card><h3 className="text-sm text-gray-500">Selected Model</h3><p className="text-2xl font-bold text-gray-900 mt-1">{results.matched.model}</p></Card>
                              <Card><h3 className="text-sm text-gray-500">Estimated Price</h3><p className="text-2xl font-bold text-gray-900 mt-1">€{results.matched.price.toLocaleString()}</p></Card>
                          </div>
                          <Card><AnalysisTable analysis={results.analysis} /></Card>
                      </>
                  ) : (
                      <Card><div className="text-center text-red-600 font-medium py-4">{results.message}</div></Card>
                  )}
              </div>
            )}
            {/* Styles for animations, can be moved to a separate CSS file in a real project */}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
        
// --- Analysis Table Component ---
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

// --- Actuator Form Modal ---
const ActuatorForm = ({ actuator, onSave, onClose }) => {
    const [formData, setFormData] = useState(actuator || { model: '', price: '', torqueCurve: Array(6).fill('') });
    
    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleTorqueChange = (i, val) => { 
        const newTorqueCurve = [...formData.torqueCurve]; 
        newTorqueCurve[i] = val; 
        setFormData(p => ({ ...p, torqueCurve: newTorqueCurve })); 
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.model || !formData.price || formData.torqueCurve.some(t => t === '' || isNaN(parseFloat(t)))) {
            // Using a simple alert. A more robust app would use a modal or toast notification.
            alert('Please fill all fields with valid numbers.');
            return;
        }
        onSave({ ...formData, price: parseFloat(formData.price), torqueCurve: formData.torqueCurve.map(t => parseFloat(t)) });
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold leading-6 text-gray-900">{actuator ? 'Edit' : 'Add'} Actuator</h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3"><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                            <div className="sm:col-span-3"><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)</label><input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                            {['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((label, i) => (
                                <div className="sm:col-span-2" key={label}><label className="block text-sm font-medium text-gray-700">{label} (Nm)</label><input type="number" step="0.01" value={formData.torqueCurve[i]} onChange={e => handleTorqueChange(i, e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Save Actuator</PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Database Manager Component ---
// Displays the list of actuators and allows adding, editing, and deleting them.
const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActuator, setEditingActuator] = useState(null);
    
    // Custom modal state for delete confirmation
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const handleOpenModal = (actuator = null) => { setEditingActuator(actuator); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingActuator(null); };
    const handleSave = (actuator) => { 
        (actuator.id ? onUpdate : onAdd)(actuator); 
        handleCloseModal(); 
    };

    const handleDeleteClick = (actuator) => {
        setShowDeleteConfirm(actuator);
    };

    const confirmDelete = () => {
        if (showDeleteConfirm) {
            onDelete(showDeleteConfirm.id);
            setShowDeleteConfirm(null);
        }
    };

    return (
        <div className="space-y-6">
             <header className="flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-gray-900">Actuator Database</h2>
                 <PrimaryButton onClick={() => handleOpenModal()}>Add New Actuator</PrimaryButton>
             </header>
            <Card>
                <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Model</th><th className="px-6 py-3">Price (€)</th><th className="px-6 py-3">Torque Curve (Nm)</th><th className="px-6 py-3 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">{actuatorList.map(actuator => (
                        <tr key={actuator.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actuator.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{actuator.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{actuator.torqueCurve.join(' / ')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-4">
                                <button onClick={() => handleOpenModal(actuator)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</button>
                                <button onClick={() => handleDeleteClick(actuator)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table></div>
            </Card>
            {isModalOpen && <ActuatorForm actuator={editingActuator} onSave={handleSave} onClose={handleCloseModal} />}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in">
                        <div className="p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete the model <span className="font-bold">{showDeleteConfirm.model}</span>? This action cannot be undone.</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
                            <SecondaryButton onClick={() => setShowDeleteConfirm(null)}>Cancel</SecondaryButton>
                            <PrimaryButton onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Delete</PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main App Layout Component ---
// This component manages the overall layout, state, and active view.
function App() {
    const [activeView, setActiveView] = useState('sizing');
    const [actuatorList, setActuatorList] = useState([]);

    // Effect to load the actuator database from local storage on initial render.
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            // If there's saved data, parse it. Otherwise, use the default database.
            setActuatorList(savedData ? JSON.parse(savedData) : defaultActuatorDatabase);
        } catch (error) {
            console.error("Failed to load data from local storage", error);
            // Fallback to default database in case of parsing errors.
            setActuatorList(defaultActuatorDatabase);
        }
    }, []);

    // Effect to save the actuator list to local storage whenever it changes.
    useEffect(() => {
        // Prevent overwriting local storage with an empty list during initial load.
        if (actuatorList.length > 0) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actuatorList));
            } catch (error) {
                console.error("Failed to save data to local storage", error);
            }
        }
    }, [actuatorList]);
    
    // Handlers for CRUD operations on the actuator list
    const handleAddActuator = (newActuator) => setActuatorList(prev => [...prev, { ...newActuator, id: Date.now().toString() }]);
    const handleUpdateActuator = (updated) => setActuatorList(prev => prev.map(act => (act.id === updated.id ? updated : act)));
    const handleDeleteActuator = (id) => setActuatorList(prev => prev.filter(actuator => actuator.id !== id));

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-12 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="https://placehold.co/180x60/8B0000/FFFFFF?text=Quifer&font=raleway"
                            alt="Company Logo"
                            className="h-14 rounded"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Actuator Sizing Tool</h1>
                            <p className="mt-1 text-sm text-gray-500">by Quifer Actuators, SL</p>
                        </div>
                    </div>
                </header>
                
                <nav className="mb-8 border-b-2 border-[rgb(139,0,0)]">
                    <div className="flex space-x-2">
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

export default App;
