<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Actuator Sizing Tool</title>
    <!-- Tailwind CSS for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- React and ReactDOM for the application logic -->
    <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
    <!-- Babel to transpile JSX in the browser -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <!-- Google Fonts for a clean look -->
     <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* Use the Inter font family defined above */
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="bg-slate-50">

    <!-- The root element where the React application will be mounted -->
    <div id="root"></div>

    <!-- The React application code, transpiled by Babel -->
    <script type="text/babel">
        // --- React and Hooks Imports ---
        const { useState, useEffect, useCallback } = React;

        // --- INITIAL DEFAULT ACTUATOR DATABASE ---
        // This data serves as the fallback if nothing is in local storage.
        const defaultActuatorDatabase = [
          { id: '1', model: 'KPM-50', price: 150, torqueCurve: [80, 60, 40, 100, 120, 140] },
          { id: '2', model: 'KPM-101', price: 250, torqueCurve: [160, 120, 90, 180, 220, 250] },
          { id: '3', model: 'KPM-202', price: 400, torqueCurve: [350, 280, 220, 400, 450, 500] },
          { id: '4', model: 'KPM-305', price: 650, torqueCurve: [700, 550, 450, 800, 900, 1000] },
          { id: '5', model: 'KPM-510', price: 980, torqueCurve: [1200, 900, 700, 1300, 1500, 1800] },
          { id: '6', model: 'KPM-750', price: 1500, torqueCurve: [2500, 2000, 1600, 2800, 3200, 3500] },
          { id: '7', model: 'KPM-990', price: 2800, torqueCurve: [5000, 4000, 3200, 5500, 6000, 6500] },
        ];

        // Key for storing and retrieving data from the browser's local storage.
        const LOCAL_STORAGE_KEY = 'actuator_database_offline_v11';

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
                if (actuatorList.length > 0) {
                    try {
                        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actuatorList));
                    } catch (error) {
                        console.error("Failed to save data to local storage", error);
                    }
                }
            }, [actuatorList]);

            const handleAddActuator = (newActuator) => setActuatorList(prev => [...prev, { ...newActuator, id: Date.now().toString() }]);
            const handleUpdateActuator = (updated) => setActuatorList(prev => prev.map(act => (act.id === updated.id ? updated : act)));
            const handleDeleteActuator = (id) => {
              if (window.confirm('Are you sure you want to delete this actuator?')) {
                setActuatorList(prev => prev.filter(actuator => actuator.id !== id))
              }
            };

            return (
                <div className="min-h-screen font-sans">
                    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                         <header className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center space-x-4">
                                <img
                                    src="/logo.png"
                                    alt="Company Logo"
                                    className="h-14"
                                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/180x60/B91C1C/ffffff?text=Quifer'; }}
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800">Actuator Sizing Tool</h1>
                                    <p className="mt-1 text-sm text-gray-500">by Quifer Actuators, SL</p>
                                </div>
                            </div>
                        </header>
                        
                        <nav className="mb-8 border-b-2 border-[#8B0000]">
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

        const TabButton = ({ label, isActive, onClick }) => (
            <button onClick={onClick} className={`py-2 px-6 font-semibold text-sm transition-all duration-200 -mb-px rounded-t-lg ${
                isActive
                    ? 'bg-[#8B0000] text-white'
                    : 'text-gray-500 hover:text-[#8B0000] hover:bg-red-50'
            }`}>
                {label}
            </button>
        );

        const Card = ({ children, className }) => <div className={`bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 ${className}`}>{children}</div>;
        const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => <button type={type} onClick={onClick} className={`bg-[#8B0000] text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${className}`}>{children}</button>;
        const SecondaryButton = ({ children, onClick, className }) => <button type="button" onClick={onClick} className={`bg-white text-gray-700 border border-gray-300 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200 ${className}`}>{children}</button>;

        // --- Sizing Tool Component ---
        const SizingTool = ({ actuatorDatabase }) => {
            const [inputs, setInputs] = useState([{ id: 1, value: '' }]);
            const [results, setResults] = useState([]);
            const [viewingDetails, setViewingDetails] = useState(null); // To control the details modal

            const handleInputChange = (id, value) => {
                setInputs(prevInputs =>
                    prevInputs.map(input =>
                        input.id === id ? { ...input, value } : input
                    )
                );
            };

            const addInput = () => {
                if (inputs.length < 5) {
                    setInputs(prev => [...prev, { id: Date.now(), value: '' }]);
                }
            };
            
            const removeInput = (id) => {
                if (inputs.length > 1) {
                    setInputs(prev => prev.filter(input => input.id !== id));
                }
            };

            const calculateRequiredTorques = (bto) => !isNaN(bto) && bto > 0 ? { bto, rto: bto * 0.5, eto: bto * 0.8, etc: bto * 0.9, rtc: bto * 0.6, btc: bto * 1.1 } : null;
            
            const findMatchingActuator = useCallback((req) => {
                if (!req || !actuatorDatabase) return null;
                const suitable = actuatorDatabase.filter(act => {
                    const t = act.torqueCurve;
                    return (t[0]/req.bto >= 1.5 && t[1]/req.rto >= 1.5 && t[2]/req.eto >= 1.5 && t[3]/req.etc >= 1.5 && t[4]/req.rtc >= 1.5 && t[5]/req.btc >= 1.5);
                }).sort((a, b) => a.price - b.price);
                return suitable.length > 0 ? suitable[0] : null;
            }, [actuatorDatabase]);
            
            const handleCalculation = useCallback((e) => {
                if(e) e.preventDefault();
                
                const newResults = inputs
                    .filter(input => input.value && !isNaN(parseFloat(input.value)))
                    .map(input => {
                        const bto = parseFloat(input.value);
                        const required = calculateRequiredTorques(bto);
                        if (!required) {
                            return { inputBto: bto, success: false, message: "Invalid BTO value." };
                        }

                        const matched = findMatchingActuator(required);
                        if (matched) {
                            const analysis = ['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((name, i) => ({
                                name, req: required[name.toLowerCase()], act: matched.torqueCurve[i], sf: matched.torqueCurve[i] / required[name.toLowerCase()]
                            }));
                            return { inputBto: bto, success: true, matched, analysis };
                        } else {
                            return { inputBto: bto, success: false, message: "No suitable actuator found." };
                        }
                    });
                
                setResults(newResults);
            }, [inputs, findMatchingActuator]);

            return (
                <div className="space-y-8">
                    <form onSubmit={handleCalculation}>
                        <Card>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Enter Valve Torques</h2>
                            <div className="space-y-4 mb-6">
                                {inputs.map((input, index) => (
                                    <div key={input.id} className="flex items-end gap-2">
                                        <div className="flex-grow">
                                            <label htmlFor={`bto_torque_${input.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                {`Torque ${index + 1} (Nm)`}
                                            </label>
                                            <input 
                                                type="number" 
                                                id={`bto_torque_${input.id}`} 
                                                value={input.value} 
                                                onChange={(e) => handleInputChange(input.id, e.target.value)} 
                                                placeholder="e.g., 200" 
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2.5"/>
                                        </div>
                                        {inputs.length > 1 && (
                                            <button type="button" onClick={() => removeInput(input.id)} className="flex-shrink-0 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg p-2.5 h-[46px] transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {inputs.length < 5 && (
                                    <SecondaryButton onClick={addInput} className="w-full sm:w-auto">+ Add Input</SecondaryButton>
                                )}
                                <PrimaryButton type="submit" className="w-full sm:w-auto">Calculate All</PrimaryButton>
                            </div>
                        </Card>
                    </form>

                    {results.length > 0 && (
                      <div className="animate-fade-in space-y-8">
                          <h2 className="text-xl font-bold text-gray-900">2. Sizing Results Summary</h2>
                           <Card className="!p-0 overflow-hidden">
                              <ResultsSummaryTable results={results} onViewDetails={setViewingDetails} />
                           </Card>
                      </div>
                    )}

                    {viewingDetails && (
                        <DetailsModal result={viewingDetails} onClose={() => setViewingDetails(null)} />
                    )}
                    <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}`}</style>
                </div>
            );
        };
        
        // --- NEW Summary Table Component ---
        const ResultsSummaryTable = ({ results, onViewDetails }) => (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Input Torque (Nm)</th>
                            <th className="px-6 py-3">Selected Model</th>
                            <th className="px-6 py-3">Price (€)</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {results.map((result, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{result.inputBto.toFixed(2)}</td>
                                {result.success ? (
                                    <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#8B0000]">{result.matched.model}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">€{result.matched.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                                Success
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <button onClick={() => onViewDetails(result)} className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium">Details</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan="2">{result.message}</td>
                                       <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                                Failed
                                            </span>
                                        </td>
                                        <td></td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );

        // --- Details Modal and Analysis Table Components ---
        const DetailsModal = ({ result, onClose }) => {
            return (
                 <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <h3 className="text-lg font-bold leading-6 text-gray-900">Torque Analysis for {result.inputBto} Nm</h3>
                            <p className="mt-1 text-sm text-gray-600">Selected Model: <span className="font-bold text-[#8B0000]">{result.matched.model}</span></p>
                            <div className="mt-6">
                               <AnalysisTable analysis={result.analysis} />
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end">
                            <PrimaryButton onClick={onClose}>Close</PrimaryButton>
                        </div>
                    </div>
                     <style>{`.animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; }`}</style>
                </div>
            )
        }

        const AnalysisTable = ({ analysis }) => (
            <div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Position</th><th className="px-6 py-3">Required (Nm)</th><th className="px-6 py-3">Actuator (Nm)</th><th className="px-6 py-3">Safety Factor</th>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">{analysis.map(item => (
                    <tr key={item.name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.req.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.act.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold"><span className={`px-2.5 py-0.5 rounded-full text-xs ${item.sf >= 1.5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.sf.toFixed(2)}x</span></td>
                    </tr>
                ))}</tbody>
            </table></div>
        );

        // --- Database Management Component ---
        const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
            const [isModalOpen, setIsModalOpen] = useState(false);
            const [editingActuator, setEditingActuator] = useState(null);

            const handleOpenModal = (actuator = null) => { setEditingActuator(actuator); setIsModalOpen(true); };
            const handleCloseModal = () => { setIsModalOpen(false); setEditingActuator(null); };
            const handleSave = (actuator) => { (actuator.id ? onUpdate : onAdd)(actuator); handleCloseModal(); };

            return (
                <div className="space-y-6">
                     <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                           <h2 className="text-xl font-bold text-gray-900">Actuator Database</h2>
                           <p className="text-sm text-gray-500 mt-1">Add, edit, or delete actuator models. Changes are saved locally.</p>
                        </div>
                        <PrimaryButton onClick={() => handleOpenModal()}>+ Add Actuator</PrimaryButton>
                    </header>
                    <Card>
                        <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-3">Model</th><th className="px-6 py-3">Price (€)</th><th className="px-6 py-3">Torque Curve (Nm)</th><th className="px-6 py-3 text-right">Actions</th>
                            </tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(actuatorList || []).map(actuator => (
                                <tr key={actuator.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actuator.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{actuator.price.toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{actuator.torqueCurve.join(' / ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-4">
                                        <button onClick={() => handleOpenModal(actuator)} className="text-indigo-600 hover:text-indigo-800 hover:underline">Edit</button>
                                        <button onClick={() => onDelete(actuator.id)} className="text-red-600 hover:text-red-800 hover:underline">Delete</button>
                                    </td>
                                </tr>
                              ))}
                            </tbody>
                        </table></div>
                    </Card>
                    {isModalOpen && <ActuatorForm actuator={editingActuator} onSave={handleSave} onClose={handleCloseModal} />}
                </div>
            );
        };

        // --- Form Modal Component for Adding/Editing Actuators ---
        const ActuatorForm = ({ actuator, onSave, onClose }) => {
            const [formData, setFormData] = useState(actuator || { model: '', price: '', torqueCurve: Array(6).fill('') });
            
            const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
            const handleTorqueChange = (i, val) => { const tc = [...formData.torqueCurve]; tc[i] = val; setFormData(p => ({ ...p, torqueCurve: tc })); };
            const handleSubmit = (e) => {
                e.preventDefault();
                if (formData.torqueCurve.some(t => isNaN(parseFloat(t)))) {
                  alert("Please ensure all torque values are valid numbers.");
                  return;
                }
                onSave({ ...formData, price: parseFloat(formData.price), torqueCurve: formData.torqueCurve.map(t => parseFloat(t)) });
            };
            
            return (
                <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center p-4 animate-fade-in-fast">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6">
                                <h3 className="text-lg font-bold leading-6 text-gray-900">{actuator ? 'Edit' : 'Add'} Actuator</h3>
                                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                    <div className="sm:col-span-3"><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                                    <div className="sm:col-span-3"><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)</label><input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                                    <div className="sm:col-span-6"><p className="text-sm font-medium text-gray-700 mb-1">Torque Curve (6 points)</p></div>
                                    {['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((label, i) => (
                                        <div className="sm:col-span-2" key={label}><label className="block text-xs font-medium text-gray-600">{label} (Nm)</label><input type="number" step="any" value={formData.torqueCurve[i]} onChange={e => handleTorqueChange(i, e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                                <PrimaryButton type="submit">Save Changes</PrimaryButton>
                            </div>
                        </form>
                    </div>
                     <style>{`.animate-fade-in-fast { animation: fadeIn 0.2s ease-out forwards; }`}</style>
                </div>
            );
        };

        // Render the main App component into the 'root' div
        ReactDOM.render(<App />, document.getElementById('root'));

    </script>

</body>
</html>
