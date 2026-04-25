import React, { useState, useContext } from 'react';
import { X, ChevronDown, ChevronUp, Dumbbell, BarChart2, Settings, Trophy, Award, BookOpen, Edit, Lightbulb, LayoutDashboard, Flame, Target, History, Shield } from 'lucide-react';
import { FirebaseContext } from '../../contexts/FirebaseContext';
import { presets } from '../../data/presets';
import { SharedProgramPreview } from '../../views/ProgramManagerView';

export const TutorialModal = ({ onProgramSelect, onClose, onBodyWeightSet, onSetSyncId, isReview }) => {
    const [step, setStep] = useState(1);
    const [localBodyWeight, setLocalBodyWeight] = useState('');
    const [tempId, setTempId] = useState('');
    const [previewingProgram, setPreviewingProgram] = useState(null);
    const totalSteps = isReview ? 3 : 6;

    const handleSelectProgram = (presetKey) => {
        const presetData = presets[presetKey];
        onProgramSelect(presetData);
        if(!isReview) nextStep();
    };

    const handleSetId = () => {
        if(tempId.trim()){
            onSetSyncId(tempId);
            nextStep();
        } else {
            alert("Please enter a Sync ID.");
        }
    }

    const handleFinish = () => {
        if(localBodyWeight) {
        onBodyWeightSet(localBodyWeight, true);
        }
        onClose();
    }

    const nextStep = () => setStep(s => Math.min(totalSteps, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    if (previewingProgram && !isReview) {
        return (
            <SharedProgramPreview
                program={previewingProgram}
                onBack={() => setPreviewingProgram(null)}
                onSelect={() => handleSelectProgram(previewingProgram.key)}
            />
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb size={24} className="text-[#f3b548]" /> {isReview ? 'App Refresher' : 'Welcome to Eagle Eye Training!'}
            </h2>
            
            <div className="space-y-4 min-h-[300px] text-gray-600 dark:text-gray-300">
                {step === 1 && (
                     <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 1: Your Home Base</h3>
                        <p>The <span className="font-semibold">Program</span> screen is your command center. It lays out your entire mesocycle, week by week. Just click a day to jump in and start lifting.</p>
                    </div>
                )}
                {step === 2 && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 2: Logging a Workout</h3>
                        <p>Inside a workout, enter your <span className="font-semibold">Load</span>, <span className="font-semibold">Reps</span>, and <span className="font-semibold">RIR</span> (Reps In Reserve). The app gives you an AI-powered <span className="font-semibold text-blue-500">Suggestion</span> based on your last performance. You can also tap the <History size={14} className="inline-block" /> icon on any exercise to see your recent performance history.</p>
                    </div>
                )}
                 {step === 3 && (
                    <div className="p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Step 3: Customization</h3>
                        <p>Use the <span className="font-semibold">Program Hub</span> to discover new presets or import programs. The <span className="font-semibold">Edit Program</span> view gives you full control. Here you can click a workout's name to rename it, or use the <Shield size={14} className="inline-block" /> icon to toggle it to a Rest Day.</p>
                    </div>
                )}
                {!isReview && step === 4 && (
                     <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 4: Create a Sync ID</h3>
                        <p className="text-sm mb-4">Create a unique ID to sync your data across devices and browsers. Make it memorable!</p>
                        <input 
                            type="text"
                            value={tempId}
                            onChange={(e) => setTempId(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                            placeholder="e.g., john-doe-lifts"
                        />
                    </div>
                )}
                {!isReview && step === 5 && (
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 5: Select Your Starting Program</h3>
                        <p className="text-sm mb-4">Choose a preset to begin. You can always change or customize it later in the Program Hub.</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                             {Object.entries(presets).map(([key, preset]) => (
                                <div key={key} className="w-full text-left p-3 rounded-md bg-gray-100 dark:bg-gray-700/50 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{preset.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{preset.info.split}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setPreviewingProgram({...preset, key})} className="px-3 py-1 text-sm rounded-md bg-white dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500">Preview</button>
                                        <button onClick={() => handleSelectProgram(key)} className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Select</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {!isReview && step === 6 && (
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Step 6: Enter Your Bodyweight</h3>
                        <p className="text-sm mb-4">Please enter your current bodyweight. This helps with tracking certain achievements and progress metrics. You can change this later in settings.</p>
                        <input 
                            type="number"
                            value={localBodyWeight}
                            onChange={(e) => setLocalBodyWeight(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600"
                            placeholder="Your current bodyweight"
                        />
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-gray-500">{step} / {totalSteps}</span>
                <div className="flex gap-2">
                    {step > 1 && (
                        <button onClick={prevStep} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Back</button>
                    )}

                    {isReview ? (
                        step < totalSteps ? (
                            <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
                        ) : (
                            <button onClick={onClose} className="px-4 py-2 bg-green-600 text-white rounded-lg">Finish</button>
                        )
                    ) : (
                         step < 4 ? (
                            <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Next</button>
                         ) : step === 4 ? (
                            <button onClick={handleSetId} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Set ID & Continue</button>
                         ): step === 6 ? (
                             <button onClick={handleFinish} className="px-4 py-2 bg-green-600 text-white rounded-lg">Finish Setup</button>
                         ) : step === 5 ? (
                            null
                         ) : (
                             <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg">Close</button>
                         )
                    )}
                </div>
            </div>
        </div>
    );
};
