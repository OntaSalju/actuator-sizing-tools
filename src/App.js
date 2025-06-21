import React, { useState, useEffect, useCallback } from 'react';

// --- INITIAL DEFAULT ACTUATOR DATABASE ---
const defaultActuatorDatabase = [
  { id: '1', model: 'KPM-50', price: 150, torqueCurves: { '2.7': [80, 60, 40, 100, 120, 140], '3.5': [100, 75, 50, 125, 150, 175], '4.1': [120, 90, 60, 150, 180, 210], '5': [150, 110, 75, 180, 220, 260], '5.5': [165, 120, 80, 200, 240, 280], '6': [180, 130, 85, 220, 260, 300], '6.9': [200, 150, 100, 250, 300, 340] } },
  { id: '2', model: 'KPM-101', price: 250, torqueCurves: { '2.7': [160, 120, 90, 180, 220, 250], '3.5': [200, 150, 110, 225, 275, 310], '4.1': [240, 180, 135, 270, 330, 375], '5': [300, 220, 160, 320, 400, 450], '5.5': [330, 240, 175, 350, 440, 500], '6': [360, 260, 190, 380, 480, 540], '6.9': [400, 300, 220, 420, 530, 600] } },
  { id: '3', model: 'KPM-202', price: 400, torqueCurves: { '2.7': [350, 280, 220, 400, 450, 500], '3.5': [430, 350, 270, 500, 560, 620], '4.1': [525, 420, 330, 600, 675, 750], '5': [650, 500, 400, 750, 850, 950], '5.5': [715, 550, 440, 825, 935, 1045], '6': [780, 600, 480, 900, 1020, 1140], '6.9': [870, 670, 530, 1000, 1130, 1270] } },
  { id: '4', model: 'KPM-305', price: 650, torqueCurves: { '2.7': [700, 550, 450, 800, 900, 1000], '3.5': [875, 680, 560, 1000, 1125, 1250], '4.1': [1050, 825, 675, 1200, 1350, 1500], '5': [1300, 1000, 800, 1500, 1700, 1900], '5.5': [1430, 1100, 880, 1650, 1870, 2090], '6': [1560, 1200, 960, 1800, 2040, 2280], '6.9': [1750, 1350, 1080, 2000, 2270, 2550] } },
  { id: '5', model: 'KPM-510', price: 980, torqueCurves: { '2.7': [1200, 900, 700, 1300, 1500, 1800], '3.5': [1500, 1125, 875, 1625, 1875, 2250], '4.1': [1800, 1350, 1050, 1950, 2250, 2700], '5': [2200, 1650, 1300, 2400, 2800, 3200], '5.5': [2420, 1815, 1430, 2640, 3080, 3520], '6': [2640, 1980, 1560, 2880, 3360, 3840], '6.9': [2950, 2200, 1750, 3200, 3750, 4300] } },
  { id: '6', model: 'KPM-750', price: 1500, torqueCurves: { '2.7': [2500, 2000, 1600, 2800, 3200, 3500], '3.5': [3125, 2500, 2000, 3500, 4000, 4375], '4.1': [3750, 3000, 2400, 4200, 4800, 5250], '5': [4600, 3700, 3000, 5200, 6000, 6500], '5.5': [5060, 4070, 3300, 5720, 6600, 7150], '6': [5520, 4440, 3600, 6240, 7200, 7800], '6.9': [6200, 5000, 4000, 7000, 8100, 8800] } },
  { id: '7', model: 'KPM-990', price: 2800, torqueCurves: { '2.7': [5000, 4000, 3200, 5500, 6000, 6500], '3.5': [6250, 5000, 4000, 6875, 7500, 8125], '4.1': [7500, 6000, 4800, 8250, 9000, 9750], '5': [9200, 7400, 6000, 10000, 11500, 12500], '5.5': [10120, 8140, 6600, 11000, 12650, 13750], '6': [11040, 8880, 7200, 12000, 13800, 15000], '6.9': [12400, 10000, 8100, 13500, 15500, 16800] } },
];

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v16';
const AIR_PRESSURES = ['2.7', '3.5', '4.1', '5', '5.5', '6', '6.9'];
const ACCESSORIES_LIST = [
    { id: 'limitSwitch', name: 'Limit Switch', price: 50 },
    { id: 'solenoidValve', name: 'Solenoid Valve', price: 120 },
    { id: 'airFilterRegulator', name: 'Air Filter Regulator', price: 85 },
    { id: 'quickExhaustValve', name: 'Quick Exhaust Valve', price: 40 },
];

// --- Reusable UI Components ---
const TabButton = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`pb-3 px-1 font-semibold text-sm transition-colors duration-200 border-b-2 ${
        isActive
            ? 'border-[rgb(139,0,0)] text-[rgb(139,0,0)]'
            : 'border-transparent text-gray-500 hover:text-gray-800'
    }`}>
        {label}
    </button>
);

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 sm:p-8 ${className}`}>{children}</div>;
const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => <button type={type} onClick={onClick} className={`bg-[rgb(139,0,0)] text-white font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${className}`}>{children}</button>;
const SecondaryButton = ({ children, onClick, className = '' }) => <button type="button" onClick={onClick} className={`bg-gray-100 text-gray-800 border border-transparent font-semibold py-2.5 px-6 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors ${className}`}>{children}</button>;


// --- Sizing Tool Component ---
const SizingTool = ({ actuatorDatabase }) => {
    const [torqueInputs, setTorqueInputs] = useState([{ id: 1, value: '' }]);
    const [airPressure, setAirPressure] = useState('4.1');
    const [accessories, setAccessories] = useState({});
    const [results, setResults] = useState([]);

    const handleTorqueChange = (id, value) => {
        setTorqueInputs(torqueInputs.map(input =>
            input.id === id ? { ...input, value } : input
        ));
    };

    const addTorqueInput = () => setTorqueInputs([...torqueInputs, { id: Date.now(), value: '' }]);
    const removeTorqueInput = (id) => setTorqueInputs(torqueInputs.filter(input => input.id !== id));
    const toggleAccessory = (accessoryId) => setAccessories(prev => ({...prev, [accessoryId]: !prev[accessoryId]}));

    const calculateRequiredTorques = (bto) => !isNaN(bto) && bto > 0 ? { bto, rto: bto * 0.5, eto: bto * 0.8, etc: bto * 0.9, rtc: bto * 0.6, btc: bto * 1.1 } : null;
    
    const findMatchingActuator = useCallback((req, pressure) => {
        if (!req || !actuatorDatabase) return null;

        const findSuitable = (minSf, maxSf) => {
            return actuatorDatabase
                .filter(act => {
                    const t = act.torqueCurves[pressure];
                    if (!t || t.length < 6) return false;
                    return t.every((torque, i) => {
                        const sf = torque / Object.values(req)[i];
                        return sf >= minSf && sf <= maxSf;
                    });
                })
                .sort((a, b) => a.price - b.price);
        };

        // First pass: Ideal safety factor (1.5x to 4x)
        let suitableActuators = findSuitable(1.5, 4);
        if (suitableActuators.length > 0) {
            return suitableActuators[0];
        }

        // Second pass: Acceptable safety factor (1.5x to 6x)
        suitableActuators = findSuitable(1.5, 6);
        return suitableActuators.length > 0 ? suitableActuators[0] : null;

    }, [actuatorDatabase]);
    
    useEffect(() => {
        const newResults = torqueInputs.map(input => {
            const bto = parseFloat(input.value);
            if (!bto || bto <= 0) return { inputId: input.id, success: false, message: 'Invalid Torque' };

            const required = calculateRequiredTorques(bto);
            if (!required) return { inputId: input.id, success: false, message: 'Calculation Error' };

            const matched = findMatchingActuator(required, airPressure);
            if (matched) {
                const analysis = Object.keys(required).map((key, i) => ({
                    name: key.toUpperCase(), 
                    req: required[key], 
                    act: matched.torqueCurves[airPressure][i], 
                    sf: matched.torqueCurves[airPressure][i] / required[key]
                }));
                return { inputId: input.id, torque: input.value, success: true, matched, analysis };
            } else {
                return { inputId: input.id, torque: input.value, success: false, message: "No suitable actuator found" };
            }
        });
        setResults(newResults);
    }, [torqueInputs, airPressure, findMatchingActuator]);

    const resultsSummary = results.reduce((acc, res) => {
        if (res.success) {
            const model = res.matched.model;
            if (!acc[model]) acc[model] = { ...res.matched, count: 0 };
            acc[model].count++;
        }
        return acc;
    }, {});
    
    const totalActuatorPrice = Object.values(resultsSummary).reduce((sum, model) => sum + (model.price * model.count), 0);
    const pricePerAccessorySet = ACCESSORIES_LIST.reduce((sum, acc) => accessories[acc.id] ? sum + acc.price : sum, 0);
    const totalAccessoryPrice = pricePerAccessorySet * torqueInputs.filter(t => t.value > 0).length;
    const grandTotalPrice = totalActuatorPrice + totalAccessoryPrice;
    const hasValidInputs = torqueInputs.some(input => parseFloat(input.value) > 0);

    return (
        <div className="space-y-10">
            <Card>
                 <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-500 mb-3">1. Air Pressure (barg)</label>
                    <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
                        {AIR_PRESSURES.map(pressure => (
                            <button key={pressure} onClick={() => setAirPressure(pressure)} className={`flex-1 py-1.5 px-2 text-sm font-semibold rounded-md transition-colors duration-300 ${airPressure === pressure ? 'bg-white shadow-sm text-[rgb(139,0,0)]' : 'bg-transparent text-gray-600 hover:bg-gray-200/50'}`}>
                                {pressure}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-3">2. Valve Torques (BTO Nm)</label>
                    <div className="space-y-3">
                    {torqueInputs.map((input, index) => (
                        <div key={input.id} className="flex items-center space-x-3">
                            <input type="number" value={input.value} onChange={(e) => handleTorqueChange(input.id, e.target.value)} placeholder={`Torque for valve ${index + 1}`} className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-3"/>
                            {torqueInputs.length > 1 && (
                                <button onClick={() => removeTorqueInput(input.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors print-hide">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                    </div>
                    <button onClick={addTorqueInput} className="mt-4 text-sm font-semibold text-[rgb(139,0,0)] hover:text-red-800 flex items-center space-x-1 print-hide">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        <span>Add Another Valve Torque</span>
                    </button>
                </div>
            </Card>

            <Card className="print-hide">
                <label className="block text-sm font-medium text-gray-500 mb-3">3. Accessories</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {ACCESSORIES_LIST.map(acc => (
                        <button key={acc.id} onClick={() => toggleAccessory(acc.id)} className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${accessories[acc.id] ? 'bg-red-50 border-[rgb(139,0,0)]' : 'bg-gray-100 hover:bg-gray-200 border-transparent'}`}>
                             <span className={`block font-semibold text-sm ${accessories[acc.id] ? 'text-[rgb(139,0,0)]' : 'text-gray-800'}`}>{acc.name}</span>
                             <span className={`block text-xs mt-1 ${accessories[acc.id] ? 'text-red-800' : 'text-gray-500'}`}>€{acc.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>
            </Card>

            {hasValidInputs && (
              <div className="animate-fade-in space-y-8">
                  <h2 className="text-xl font-bold text-gray-800">4. Sizing Results</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Actuator Summary</h3>
                            {Object.keys(resultsSummary).length > 0 ? (
                                <ul className="space-y-2">
                                {Object.values(resultsSummary).map(model => (
                                    <li key={model.id} className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{model.count} x {model.model}</span>
                                        <span className="text-gray-600">€{(model.price * model.count).toLocaleString()}</span>
                                    </li>
                                ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500">No suitable actuators found for the given torques.</p> }
                        </Card>
                         <Card>
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Total Cost</h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between"><span className="text-gray-600">Actuators Total</span> <span className="font-semibold text-gray-800">€{totalActuatorPrice.toLocaleString()}</span></li>
                                <li className="flex justify-between"><span className="text-gray-600">Accessories Total</span><span className="font-semibold text-gray-800">€{totalAccessoryPrice.toLocaleString()}</span></li>
                                <li className="flex justify-between border-t pt-2 mt-2"><span className="text-lg font-bold text-gray-900">Grand Total</span><span className="text-lg font-bold text-gray-900">€{grandTotalPrice.toLocaleString()}</span></li>
                            </ul>
                        </Card>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Detailed Breakdown</h3>
                        <div className="space-y-6">
                            {results.map((res, index) => res.torque > 0 && (
                                <Card key={res.inputId}>
                                    <h4 className="font-semibold text-gray-800 mb-3">For Valve {index + 1} (Torque: {res.torque} Nm)</h4>
                                    {res.success ? (
                                        <>
                                        <p className="text-sm text-gray-600 mb-4">Selected Model: <span className="font-bold text-gray-900">{res.matched.model}</span></p>
                                        <AnalysisTable analysis={res.analysis} />
                                        </>
                                    ) : (
                                        <p className="text-sm text-red-600 font-medium">{res.message}</p>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
              </div>
            )}
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); }
                }
                input[type="number"]::-webkit-inner-spin-button, 
                input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                input[type="number"] { -moz-appearance: textfield; }

                @media print {
                  body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .print-hide {
                    display: none !important;
                  }
                  .bg-white { /* Card */
                    border: 1px solid #e5e7eb !important;
                    box-shadow: none !important;
                    page-break-inside: avoid !important;
                  }
                   main > div {
                     padding: 0 !important;
                     margin: 0 !important;
                   }
                }
            `}</style>
        </div>
    );
};
        
const AnalysisTable = ({ analysis }) => {
    const getSFColor = (sf) => {
        if (sf >= 1.5 && sf <= 4) return 'bg-green-100 text-green-800'; // Ideal
        if (sf > 4 && sf <= 6) return 'bg-orange-100 text-orange-800'; // Acceptable
        return 'bg-red-100 text-red-800'; // Unsuitable
    };
    
    return (
        <div className="overflow-x-auto"><table className="min-w-full">
            <thead><tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Position</th><th className="px-5 py-3">Required (Nm)</th><th className="px-5 py-3">Actuator (Nm)</th><th className="px-5 py-3">Safety Factor</th>
            </tr></thead>
            <tbody>{analysis.map(item => (
                <tr key={item.name} className="border-b border-gray-200/80 last:border-none">
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{item.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{item.req.toFixed(2)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{item.act.toFixed(2)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold"><span className={`px-2.5 py-1 rounded-full text-xs ${getSFColor(item.sf)}`}>{item.sf.toFixed(2)}x</span></td>
                </tr>
            ))}</tbody>
        </table></div>
    );
};

const ActuatorForm = ({ actuator, onSave, onClose }) => {
    const [formData, setFormData] = useState(actuator || { model: '', price: '', torqueCurves: { '2.7': Array(6).fill(''), '3.5': Array(6).fill(''), '4.1': Array(6).fill(''), '5': Array(6).fill(''), '5.5': Array(6).fill(''), '6': Array(6).fill(''), '6.9': Array(6).fill('') } });
    
    const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleTorqueChange = (pressure, i, val) => { 
        const newTorqueCurves = { ...formData.torqueCurves };
        newTorqueCurves[pressure][i] = val;
        setFormData(p => ({ ...p, torqueCurves: newTorqueCurves })); 
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.model || !formData.price) {
            alert('Please fill out the Model and Price fields.');
            return;
        }
        const parsedTorqueCurves = {};
        for (const pressure in formData.torqueCurves) {
            parsedTorqueCurves[pressure] = formData.torqueCurves[pressure].map(t => parseFloat(t));
            if (parsedTorqueCurves[pressure].some(t => isNaN(t))) {
                alert(`Please enter valid numbers for all torque values for ${pressure} barg.`);
                return;
            }
        }
        onSave({ ...formData, price: parseFloat(formData.price), torqueCurves: parsedTorqueCurves });
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl animate-fade-in">
                <form onSubmit={handleSubmit}>
                    <div className="p-8">
                        <h3 className="text-xl font-bold leading-6 text-gray-900 mb-8">{actuator ? 'Edit' : 'Add'} Actuator</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mb-8">
                           <div><label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label><input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                           <div><label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (€)</label><input type="number" step="0.01" name="price" id="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                        </div>
                        <div className="space-y-6">
                        {Object.keys(formData.torqueCurves).map(pressure => (
                            <div key={pressure}>
                                <h4 className="font-semibold text-md text-gray-800 mb-2 border-b pb-2">Torque Curve for {pressure} barg</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-3">
                                {['BTO', 'RTO', 'ETO', 'ETC', 'RTC', 'BTC'].map((label, i) => (
                                    <div key={label}><label className="block text-xs font-medium text-gray-500">{label}</label><input type="number" step="0.01" value={formData.torqueCurves[pressure][i]} onChange={e => handleTorqueChange(pressure, i, e.target.value)} required className="mt-1 block w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:border-red-500 focus:ring-red-500"/></div>
                                ))}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 rounded-b-xl">
                        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                        <PrimaryButton type="submit">Save Actuator</PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DatabaseManager = ({ actuatorList, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingActuator, setEditingActuator] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const handleOpenModal = (actuator = null) => { setEditingActuator(actuator); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setEditingActuator(null); };
    const handleSave = (actuator) => { (actuator.id ? onUpdate : onAdd)(actuator); handleCloseModal(); };
    const handleDeleteClick = (actuator) => { setShowDeleteConfirm(actuator); };
    const confirmDelete = () => { if (showDeleteConfirm) { onDelete(showDeleteConfirm.id); setShowDeleteConfirm(null); } };

    return (
        <div className="space-y-6">
             <header className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-gray-800">Actuator Database</h2>
                 <PrimaryButton onClick={() => handleOpenModal()}>Add New Actuator</PrimaryButton>
             </header>
            <Card className="!p-0">
                <div className="overflow-x-auto"><table className="min-w-full">
                    <thead className="bg-gray-50"><tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Model</th><th className="px-6 py-3">Price (€)</th>
                        <th className="px-6 py-3">Torque Curves (Nm)</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-200/80">{actuatorList.map(actuator => (
                        <tr key={actuator.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{actuator.model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{actuator.price.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="grid grid-cols-2 gap-x-4">
                                {Object.entries(actuator.torqueCurves).map(([pressure, curve]) => (
                                    <div key={pressure} className="text-xs py-0.5"><span className="font-semibold">{pressure} barg:</span> {curve.join(' / ')}</div>
                                ))}
                                </div>
                            </td>
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
                <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in">
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="mt-2 text-sm text-gray-600">Are you sure you want to delete <span className="font-bold">{showDeleteConfirm.model}</span>? This action cannot be undone.</p>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                            <SecondaryButton onClick={() => setShowDeleteConfirm(null)}>Cancel</SecondaryButton>
                            <PrimaryButton onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 focus:ring-red-500">Delete</PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


function App() {
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
    const handleDeleteActuator = (id) => setActuatorList(prev => prev.filter(actuator => actuator.id !== id));

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print-hide">
                <header className="mb-12 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img
                            src="https://placehold.co/180x60/8B0000/FFFFFF?text=Gravalty&font=raleway"
                            alt="Company Logo"
                            className="h-14 rounded-lg"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Actuator Sizing Tool</h1>
                            <p className="mt-1 text-sm text-gray-500">by Gravalty Actuators, SL</p>
                        </div>
                    </div>
                     <div className="hidden md:flex items-center space-x-3 print-hide">
                        <img src="https://placehold.co/80x40/0033A0/FFFFFF?text=TÜV" alt="TUV Certified" className="h-10 rounded"/>
                        <img src="https://placehold.co/80x40/F1F1F1/333333?text=ISO+9001" alt="ISO 9001 Certified" className="h-10 rounded"/>
                        <img src="https://placehold.co/80x40/F1F1F1/333333?text=ISO+14001" alt="ISO 14001 Certified" className="h-10 rounded"/>
                        <img src="https://placehold.co/80x40/F1F1F1/333333?text=ISO+45001" alt="ISO 45001 Certified" className="h-10 rounded"/>
                    </div>
                </header>
                
                <div className="flex justify-between items-center mb-8">
                    <div className="flex space-x-8">
                        <TabButton label="Sizing Tool" isActive={activeView === 'sizing'} onClick={() => setActiveView('sizing')} />
                        <TabButton label="Manage Database" isActive={activeView === 'database'} onClick={() => setActiveView('database')} />
                    </div>
                    <button onClick={() => window.print()} className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-[rgb(139,0,0)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                         <span>Print to PDF</span>
                    </button>
                </div>
            </div>

                <main>
                    {activeView === 'sizing' && <SizingTool actuatorDatabase={actuatorList} />}
                    {activeView === 'database' && <div className="print-hide"><DatabaseManager actuatorList={actuatorList} onAdd={handleAddActuator} onUpdate={handleUpdateActuator} onDelete={handleDeleteActuator} /></div>}
                </main>
        </div>
    );
};

export default App;

