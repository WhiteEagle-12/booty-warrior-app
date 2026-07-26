import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, History, Shield, Check } from 'lucide-react';
import { presets } from '../../data/presets';
import { SharedProgramPreview } from '../../views/ProgramManagerView';

const StepCard = ({ stepLabel, title, children }) => (
    <div className="rounded-2xl border border-line bg-panel2/60 p-4 sm:p-5">
        <p className="ee-eyebrow text-amber">{stepLabel}</p>
        <h3 className="mt-2 font-display text-base font-bold text-bone">{title}</h3>
        <div className="mt-2 text-sm leading-6 text-mute">{children}</div>
    </div>
);

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
    };

    const handleFinish = () => {
        if(localBodyWeight) {
            onBodyWeightSet(localBodyWeight, true);
        }
        onClose();
    };

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
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
                    <Lightbulb size={22} />
                </span>
                <div>
                    <p className="ee-eyebrow text-amber">{isReview ? 'App refresher' : 'First flight'}</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-bone">
                        {isReview ? 'How Eagle Eye works' : 'Welcome to Eagle Eye Training'}
                    </h2>
                </div>
            </div>

            <div className="mt-6 min-h-[260px]">
                {step === 1 && (
                    <StepCard stepLabel="Home base" title="Your program, week by week">
                        The <span className="font-bold text-bone">Program</span> screen lays out your mesocycle.
                        Tap any day to open the session and start logging — the next workout is always highlighted so you never have to think about what comes today.
                    </StepCard>
                )}
                {step === 2 && (
                    <StepCard stepLabel="Logging" title="Load, reps, and RIR">
                        Inside a session, enter your <span className="font-bold text-bone">Load</span>, <span className="font-bold text-bone">Reps</span>, and <span className="font-bold text-bone">RIR</span> (reps in reserve).
                        Eagle Eye suggests your next target from your last performance, and the <History size={13} className="inline-block text-teal" /> icon on any exercise shows its full history.
                        Finish a set and the rest timer starts itself.
                    </StepCard>
                )}
                {step === 3 && (
                    <StepCard stepLabel="Customization" title="Make the block yours">
                        The <span className="font-bold text-bone">Program Hub</span> holds presets and imports. <span className="font-bold text-bone">Edit Program</span> gives full control:
                        drag days to reorder, click a name to rename it, or use the <Shield size={13} className="inline-block text-sky" /> icon to flip a day between work and rest.
                    </StepCard>
                )}
                {!isReview && step === 4 && (
                    <StepCard stepLabel="Cloud sync" title="Create a sync ID">
                        <p className="mb-4">A unique ID backs up every set and mirrors it across devices. Make it memorable.</p>
                        <input
                            type="text"
                            value={tempId}
                            onChange={(e) => setTempId(e.target.value)}
                            className="ee-input"
                            placeholder="e.g., john-doe-lifts"
                            aria-label="Sync ID"
                        />
                    </StepCard>
                )}
                {!isReview && step === 5 && (
                    <div>
                        <p className="ee-eyebrow text-amber">Starting program</p>
                        <h3 className="mt-2 font-display text-base font-bold text-bone">Choose your block</h3>
                        <p className="mb-4 mt-1 text-sm text-mute">You can change or customize it later in the Program Hub.</p>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {Object.entries(presets).map(([key, preset]) => (
                                <div key={key} className="ee-panel-soft flex items-center justify-between gap-3 p-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-bone">{preset.name}</p>
                                        <p className="text-xs text-mute">{preset.info.split}</p>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center gap-2">
                                        <button onClick={() => setPreviewingProgram({...preset, key})} className="ee-secondary px-3 py-1.5 text-xs">Preview</button>
                                        <button onClick={() => handleSelectProgram(key)} className="ee-primary px-3 py-1.5 text-xs">Select</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {!isReview && step === 6 && (
                    <StepCard stepLabel="Final step" title="Enter your bodyweight">
                        <p className="mb-4">This powers bodyweight-ratio achievements and trend tracking. You can update it any time in Settings.</p>
                        <input
                            type="number"
                            value={localBodyWeight}
                            onChange={(e) => setLocalBodyWeight(e.target.value)}
                            className="ee-input font-mono tabular-nums"
                            placeholder="Your current bodyweight"
                            aria-label="Bodyweight"
                        />
                    </StepCard>
                )}
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${totalSteps}`}>
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 bg-amber' : i + 1 < step ? 'w-1.5 bg-teal' : 'w-1.5 bg-line'}`} />
                    ))}
                </div>
                <div className="flex gap-2">
                    {step > 1 && (
                        <button onClick={prevStep} className="ee-secondary px-3.5"><ChevronLeft size={15} /> Back</button>
                    )}

                    {isReview ? (
                        step < totalSteps ? (
                            <button onClick={nextStep} className="ee-primary">Next <ChevronRight size={15} /></button>
                        ) : (
                            <button onClick={onClose} className="ee-primary"><Check size={15} /> Done</button>
                        )
                    ) : (
                        step < 4 ? (
                            <button onClick={nextStep} className="ee-primary">Next <ChevronRight size={15} /></button>
                        ) : step === 4 ? (
                            <button onClick={handleSetId} className="ee-primary">Set ID &amp; continue</button>
                        ) : step === 6 ? (
                            <button onClick={handleFinish} className="ee-primary"><Check size={15} /> Finish setup</button>
                        ) : step === 5 ? (
                            null
                        ) : (
                            <button onClick={onClose} className="ee-secondary">Close</button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
