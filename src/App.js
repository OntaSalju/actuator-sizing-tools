import React, 'react';
import { useState, useEffect, useCallback, useContext, createContext } from 'react';

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

const LOCAL_STORAGE_KEY = 'actuator_database_offline_v11';

// --- 1. CONTEXT CREATION ---
// Create a context to hold the actuator database and its management functions.
const ActuatorContext = createContext();

// Create a custom hook for easy access to the context.
export const useActuators = () => useContext(ActuatorContext);

// --- 2. CONTEXT PROVIDER ---
// This component will manage the state and provide it to all children.
const ActuatorProvider = ({ children }) => {
    const [actuatorList, setActuatorList] = useState([]);

    // Effect to load data from local storage on initial render.
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            setActuatorList(savedData ? JSON.parse(savedData) : defaultActuatorDatabase);
        } catch (error) {
            console.error("Failed to load data from local storage", error);
            setActuatorList(defaultActuatorDatabase);
        }
    }, []);

    // Effect to save data to local storage whenever it changes.
    useEffect(() => {
        if (actuatorList.length > 0) {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(actuatorList));
            } catch (error) {
                console.error("Failed to save data to local storage", error);
            }
        }
    }, [actuatorList]);

    // Handlers for CRUD operations
    const handleAddActuator = (newActuator) => {
        setActuatorList(prev => [...prev, { ...newActuator, id: Date.now().toString() }]);
    };
    const handleUpdateActuator = (updated) => {
        setActuatorList(prev => prev.map(act => (act.id === updated.id ? updated : act)));
    };
    const handleDeleteActuator = (id) => {
        setActuatorList(prev => prev.filter(actuator => actuator.id !== id));
    };

    const value = {
        actuatorList,
        onAdd: handleAddActuator,
        onUpdate: handleUpdateActuator,
        onDelete: handleDeleteActuator,
    };

    return (
        <ActuatorContext.Provider value={value}>
            {children}
        </ActuatorContext.Provider>
    );
};


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
const PrimaryButton = ({ children, onClick, type = 'button', className = '' }) => <button type={type} onClick={onClick} className={`bg-[rgb(139,0,0)] text-white font-
