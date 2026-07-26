import React, { createContext, useState, useEffect, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

export const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
    const [firebaseServices, setFirebaseServices] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [configError, setConfigError] = useState(null);
    const [customId, setCustomId] = useState(() => {
        try {
            return localStorage.getItem('projectOverloadSyncId') || '';
        } catch (e) {
            console.error("localStorage is not available, proceeding without it.");
            return '';
        }
    });

    useEffect(() => {
        const requiredEnvVars = [
            'REACT_APP_FIREBASE_API_KEY',
            'REACT_APP_FIREBASE_AUTH_DOMAIN',
            'REACT_APP_FIREBASE_PROJECT_ID',
            'REACT_APP_FIREBASE_STORAGE_BUCKET',
            'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
            'REACT_APP_FIREBASE_APP_ID',
            'REACT_APP_FIREBASE_MEASUREMENT_ID'
        ];
        const env = import.meta.env;
        const missingVars = requiredEnvVars.filter(key => !env[key] && !env[key.replace('REACT_APP_', 'VITE_')]);
        if (missingVars.length > 0) {
            const message = `Missing Firebase configuration variables: ${missingVars.join(', ')}`;
            console.error(message);
            setConfigError(message);
            setIsLoading(false);
            return;
        }

        const read = (key) => env[key] || env[key.replace('REACT_APP_', 'VITE_')];
        const firebaseConfig = {
            apiKey: read('REACT_APP_FIREBASE_API_KEY'),
            authDomain: read('REACT_APP_FIREBASE_AUTH_DOMAIN'),
            projectId: read('REACT_APP_FIREBASE_PROJECT_ID'),
            storageBucket: read('REACT_APP_FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: read('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
            appId: read('REACT_APP_FIREBASE_APP_ID'),
            measurementId: read('REACT_APP_FIREBASE_MEASUREMENT_ID')
        };
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);

        // Modern persistent cache: works across multiple open tabs and keeps
        // writes durable offline. Falls back to in-memory cache if unsupported.
        let db;
        try {
            db = initializeFirestore(app, {
                localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
            });
        } catch (err) {
            console.warn("Persistent Firestore cache unavailable, using default cache.", err);
            db = getFirestore(app);
        }

        setFirebaseServices({ auth, db });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed", error));
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSetCustomId = useCallback((id) => {
        const sanitizedId = id.trim().replace(/[^a-zA-Z0-9-_]/g, '');
        if (sanitizedId && sanitizedId.length > 0) {
            try {
                localStorage.setItem('projectOverloadSyncId', sanitizedId);
            } catch (e) {
                console.error("localStorage is not available, proceeding without it.");
            }
            setCustomId(sanitizedId);
            return sanitizedId;
        }
        return null;
    }, []);

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    const value = {
        ...firebaseServices,
        user,
        isLoading,
        customId,
        handleSetCustomId,
        isOnline
    };

    if (configError) {
        return (
            <div className="p-4 text-center">
                <h1 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h1>
                <p>{configError}</p>
            </div>
        );
    }

    return (
        <FirebaseContext.Provider value={value}>
            {children}
        </FirebaseContext.Provider>
    );
};
