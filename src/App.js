import React, { useState, useEffect, useCallback } from 'react';

const defaultActuatorDatabase = [
  { id: '1', model: 'AT-50', price: 150, torqueCurve: [80, 60, 40, 100, 120, 140] },
  { id: '2', model: 'AT-101', price: 250, torqueCurve: [160, 120, 90, 180, 220, 250] },
  { id: '3', model: 'AT-202', price: 400, torqueCurve: [350, 280, 220, 400, 450, 500] },
  { id: '4', model: 'AT-305', price: 650, torqueCurve: [700, 550, 450, 800, 900, 1000] },
  { id: '5', model: 'AT-510', price: 980, torqueCurve: [1200, 900, 700, 1300, 1500, 1800] },
  { id: '6', model: 'AT-750', price: 1500, torqueCurve: [2500, 2000, 1600, 2800, 3200, 3500] },
  { id: '7', model: 'AT-990', price: 2800, torqueCurve: [5000, 4000, 3200, 5500, 6000, 6500] },
];

const LOCAL_STORAGE_KEY = 'actuator_database_offline';

const App = () => {
    const [activeView, setActiveView] = useState('sizing');
    const [actuatorList, setActuatorList] = useState([]);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                setActuatorList(JSON.parse(savedData));
            } else {
                setActuatorList(defaultActuatorDatabase);
            }
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

    const handleAddActuator = (newActuator) => {
        setActuatorList(prevList => [...prevList, { ...newActuator, id: Date.now().toString() }]);
    };

    const handleUpdateActuator = (updatedActuator) => {
        setActuatorList(prevList =>
            prevList.map(actuator =>
                actuator.id === updatedActuator.id ? updatedActuator : actuator
            )
        );
    };

    const handleDeleteActuator = (id) => {
        setActuatorList(prevList => prevList.filter(actuator => actuator.id !== id));
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Offline Actuator Sizing & Pricing Tool</h1>
                    <p className="mt-2 text-gray-600">Size your actuator or manage your local offline database.</p>
                </header>

                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button onClick={() => setActiveView('sizing')} className={`${activeView === 'sizing' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Sizing Tool
                            </button>
                            <button onClick={() => setActiveView('database')} className={`${activeView === 'database' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                Manage Database
                            </button>
                        </nav>
                    </div>
                </div>

                {activeView === 'sizing' && <SizingTool actuatorDatabase={actuatorList} />}
                {activeView === 'database' && <DatabaseManager actuatorList={actuatorList} onAdd={handleAddActuator} onUpdate={handleUpdateActuator} onDelete={handleDeleteActuator} />}
            </div>
        </div>
    );
};

const SizingTool = ({ actuatorDatabase }) => {
    const [btoInput, setBtoInput] = useState('');
    const [results, setResults] = useState(null);

    const calculateRequiredTorques = (bto) => {
        if (isNaN(bto) || bto <= 0) return null;
        return { bto, rto: bto * 0.5, eto: bto * 0.8, etc: bto * 0.9, rtc: bto * 0.6, btc: bto * 1.1 };
    };

    const findMatchingActuator = useCallback((requiredTorques) => {
        if (!requiredTorques) return null;
        const SAFETY_FACTOR_MIN = 1.5;
        const suitableActuators = actuatorDatabase
            .filter(actuator => {
                const torques = actuator.torqueCurve;
                return (
                    (torques[0] / requiredTorques.bto >= SAFETY_FACTOR_MIN) &&
                    (torques[1] / requiredTorques.rto >= SAFETY_FACTOR_MIN) &&
                    (torques[2] / requiredTorques.eto >= SAFETY_FACTOR_MIN) &&
                    (torques[3] / requiredTorques.etc >= SAFETY_FACTOR_MIN) &&
                    (torques[4] / requiredTorques.rtc >= SAFETY_FACTOR_MIN) &&
                    (torques[5] / requiredTorques.btc >= SAFETY_FACTOR_MIN)
                );
            })
            .sort((a, b) => a.price - b.price);
        return suitableActuators.length > 0 ? suitableActuators[0] : null;
    }, [actuatorDatabase]);

    const handleCalculation = useCallback(() => {
        const bto = parseFloat(btoInput);
        const requiredTorques = calculateRequiredTorques(bto);
        if(!requiredTorques){
             setResults(null);
             return;
        }
        const matchedActuator = findMatchingActuator(requiredTorques);

        if (matchedActuator) {
            const analysis = [
                { name: 'BTO', req: requiredTorques.bto, act: matchedActuator.torqueCurve[0] },
                { name: 'RTO', req: requiredTorques.rto, act: matchedActuator.torqueCurve[1] },
                { name: 'ETO', req: requiredTorques.eto, act: matchedActuator.torqueCurve[2] },
                { name: 'ETC', req: requiredTorques.etc, act: matchedActuator.torqueCurve[3] },
                { name: 'RTC', req: requiredTorques.rtc, act: matchedActuator.torqueCurve[4] },
                { name: 'BTC', req: requiredTorques.btc, act: matchedActuator.torqueCurve[5] },
            ].map(item => ({ ...item, sf: item.act / item.req }));
            setResults({ success: true, matchedActuator, analysis });
        } else {
            setResults({ success: false, message: "No suitable actuator found in the database. Try adjusting the BTO or adding more models to your database." });
        }
    }, [btoInput, findMatchingActuator]);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Enter Valve Torque</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="flex-grow w-full">
                    <label htmlFor="bto_torque" className="block text-sm font-medium text-gray-700">Break to Open (BTO) Torque (Nm)</label>
                    <input type="number" id="bto_torque" value={btoInput} onChange={(e) => setBtoInput(e.target.value)} placeholder="e.g., 200" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"/>
                </div>
                <button onClick={handleCalculation} className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-3 px-6 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">Calculate</button>
            </div>
        </div>
        {results && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Sizing Results</h2>
            {results.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200"><h3 className="text-sm font-medium text-green-800">Matched Actuator Model</h3><p className="text-2xl font-bold text-green-900 mt-1">{results.matchedActuator.model}</p></div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200"><h3 className="text-sm font-medium text-green-800">Actuator Price</h3><p className="text-2xl font-bold text-green-900 mt-1">${results.matchedActuator.price.toLocaleString()}</p></div>
                </div>
                <AnalysisTable analysis={results.analysis} />
              </>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center"><h3 className="text-lg font-semibold text-red-800">Sizing Failed</h3><p className="mt-2 text-red-700">{results.message}</p></div>
            )}
          </div>
        )}
      </div>
    );
};

const AnalysisTable = ({ analysis }) => (
    <div className="flow-root"><div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"><div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"><div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
    <table className="min-w-full divide-y divide-gray-300"><thead className="bg-gray-50"><tr>
        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Position</th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Required (Nm)</th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actuator (Nm)</th>
        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Safety Factor</th>
    </tr></thead><tbody className="divide-y divide-gray-200 bg-white">
        {analysis.map((item) => (<tr key={item.name}>
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.name}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.req.toFixed(2)}</td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.act.toFixed(2)}</td>
            <td className={`whitespace-nowrap px-3 py-4 text-sm font-semibold ${item.sf >= 1.5 ? 'text-green-600' : 'text-red-600'}`}>{item.sf.toFixed(2)}x</td>
        </tr>))}
    </tbody></table>
    </div></div></div></div>
);

const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActuator, setEditingActuator] = useState(null);

    const handleOpenModal = (actuator = null) => {
        setEditingActuator(actuator);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingActuator(null);
    };

    const handleSave = (actuator) => {
        if (actuator.id) {
            onUpdate(actuator);
        } else {
            onAdd(actuator);
        }
        handleCloseModal();
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h2 className="text-xl font-semibold text-gray-900">Actuator Database</h2>
                    <p className="mt-2 text-sm text-gray-700">Manage the list of actuators available for the sizing tool. Data is saved locally.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button onClick={() => handleOpenModal()} type="button" className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">
                        Add Actuator
                    </button>
                </div>
            </div>

            <div className="mt-8 flow-root"><div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8"><div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"><table className="min-w-full divide-y divide-gray-300">
                <thead><tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Model</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price ($)</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Torque Curve (Nm)</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                    {actuatorList.map((actuator) => (
                        <tr key={actuator.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{actuator.model}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${actuator.price.toLocaleString()}</td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{actuator.torqueCurve.join(', ')}</td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                <button onClick={() => handleOpenModal(actuator)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                <button onClick={() => onDelete(actuator.id)} className="text-red-600 hover:text-red-900 ml-4">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table></div></div></div>

            {isModalOpen && <ActuatorForm actuator={editingActuator} onSave={handleSave} onClose={handleCloseModal} />}
        </div>
    );
};

const ActuatorForm = ({ actuator, onSave, onClose }) => {
    const [formData, setFormData] = useState(
        actuator || { model: '', price: '', torqueCurve: Array(6).fill('') }
    );
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTorqueChange = (index, value) => {
        const newTorqueCurve = [...formData.torqueCurve];
        newTorqueCurve[index] = value;
        setFormData(prev => ({ ...prev, torqueCurve: newTorqueCurve }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.model || !formData.price || formData.torqueCurve.some(t => t === '' || isNaN(parseFloat(t)))) {
            setError('Please fill all fields with valid numbers.');
            return;
        }
        const finalData = {
            ...formData,
            price: parseFloat(formData.price),
            torqueCurve: formData.torqueCurve.map(t => parseFloat(t)),
        };
        onSave(finalData);
    };

    const torqueLabels = ['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'];

    return (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">{actuator ? 'Edit' : 'Add'} Actuator</h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model Name</label>
                                        <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"/>
                                    </div>
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
                                        <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Torque Curve (Nm)</label>
                                        <div className="mt-2 grid grid-cols-3 gap-4">
                                            {torqueLabels.map((label, index) => (
                                                <div key={index}>
                                                    <label htmlFor={`torque-${index}`} className="block text-xs font-medium text-gray-500">{label}</label>
                                                    <input type="number" id={`torque-${index}`} value={formData.torqueCurve[index]} onChange={(e) => handleTorqueChange(index, e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {error && <p className="text-sm text-red-600">{error}</p>}
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                                <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;

