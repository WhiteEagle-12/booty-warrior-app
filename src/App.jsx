import React, { useContext } from 'react';

// Context providers
import { AppStateProvider, AppStateContext } from './contexts/AppStateContext';
import { FirebaseProvider, FirebaseContext } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Layout components
import { Modal } from './components/common/Modal';
import { ToastContainer } from './components/common/Toast';
import { RestTimer } from './components/common/RestTimer';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SyncIdPrompt } from './components/common/SyncIdPrompt';

// Workout components
import { LiftingSession } from './components/workout/LiftingSession';

// View components
import { MainView } from './views/MainView';
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { AnalyticsView } from './views/AnalyticsView';
import { RecordsView } from './views/RecordsView';
import { EditProgramView } from './views/EditProgramView';
import { ProgramManagerView } from './views/ProgramManagerView';
import { AchievementsView } from './views/AchievementsView';

// Custom Hooks
import { useApplicationData } from './hooks/useApplicationData';

const LoadingScreen = () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base text-bone">
        <div className="relative flex h-28 w-28 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-amber/40 animate-reticle" />
            <span className="absolute inset-3 rounded-full border border-line" />
            <img src="/brand/eagle-eye-mark.png" alt="" className="h-16 w-16 object-contain" />
        </div>
        <p className="mt-8 font-display text-xs font-semibold uppercase tracking-[0.3em] text-amber">Eagle Eye Training</p>
        <div className="mt-4 h-0.5 w-44 overflow-hidden rounded-full bg-line/50">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-amber" />
        </div>
        <p className="mt-4 text-sm text-mute">Calibrating your training data...</p>
    </div>
);

const AppCore = () => {
    const { customId, isLoading } = useContext(FirebaseContext);
    const {
        pageState, navigate, onBack, programInstances, activeInstanceId,
        allLogs, setAllLogs, historicalLogs, skippedDays, weightUnit, handleWeightUnitChange,
        bodyWeight, handleBodyWeightChange, bodyWeightHistory, isDataLoading,
        activeTimer, setActiveTimer, handleStartTimer, handleTimerEnd,
        unlockedAchievements, programData, handleProgramDataChange, handleProgramUpdate,
        handleInstanceSwitch, handleDeleteProgram, showTutorial, handleSkipDay,
        handleUnskipDay, handleResetMeso, handleFileImport, completedDays, handleDeleteUserData
    } = useApplicationData();

    if (isLoading || isDataLoading) {
        return <LoadingScreen />;
    }

    const renderContent = () => {
        if (!customId) {
            return <SyncIdPrompt />;
        }
        switch(pageState.view) {
            case 'dashboard': return <DashboardView allLogs={allLogs} programData={programData} bodyWeightHistory={bodyWeightHistory} onBack={onBack} onNavigate={navigate} />;
            case 'lifting': return <LiftingSession {...pageState.data} onBack={onBack} allLogs={allLogs} setAllLogs={setAllLogs} onSkipDay={handleSkipDay} programData={programData} weightUnit={weightUnit} onStartTimer={handleStartTimer} />;
            case 'analytics': return <AnalyticsView allLogs={historicalLogs} programData={programData} onBack={onBack} />;
            case 'records': return <RecordsView allLogs={historicalLogs} programData={programData} onBack={onBack} weightUnit={weightUnit} />;
            case 'achievements': return <AchievementsView unlockedAchievements={unlockedAchievements} historicalLogs={historicalLogs} programData={programData} bodyWeight={bodyWeight} weightUnit={weightUnit} onBack={onBack} bodyWeightHistory={bodyWeightHistory} />;
            case 'programHub': return <ProgramManagerView onProgramUpdate={handleProgramUpdate} activeProgram={{...programData, id: activeInstanceId}} programInstances={programInstances} onInstanceSwitch={handleInstanceSwitch} onBack={onBack} onDeleteProgram={handleDeleteProgram} />;
            case 'editProgram': return <EditProgramView programData={programData} onProgramDataChange={handleProgramDataChange} allLogs={allLogs} setAllLogs={setAllLogs} onBack={onBack} onNavigate={navigate} />;
            case 'settings': return <SettingsView allLogs={allLogs} historicalLogs={historicalLogs} weightUnit={weightUnit} onWeightUnitChange={handleWeightUnitChange} onResetMeso={handleResetMeso} programData={programData} onProgramDataChange={handleProgramDataChange} onShowTutorial={() => showTutorial(true)} bodyWeight={bodyWeight} onBodyWeightChange={handleBodyWeightChange} onBack={onBack} onFileImport={handleFileImport} onDeleteUserData={handleDeleteUserData} />;
            default: return <MainView onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })} onEditProgram={() => navigate('editProgram')} completedDays={completedDays} onUnskipDay={handleUnskipDay} programData={programData} allLogs={allLogs} onNavigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen font-sans text-bone">
            <Sidebar onNavChange={navigate} currentPage={pageState.view} />
            <div className="md:pl-64">
                <AppHeader programName={programData.info.name} onNavChange={navigate} />
                <main className="flex-grow pb-24 md:pb-10">
                    <div className="mx-auto max-w-6xl px-3 sm:px-5 lg:px-8">{renderContent()}</div>
                </main>
            </div>
            <MobileNav onNavChange={navigate} currentPage={pageState.view} />
            {activeTimer && <RestTimer initialTime={activeTimer} onClose={() => setActiveTimer(null)} onTimerEnd={handleTimerEnd} />}
        </div>
    );
};

function App() {
  return (
    <FirebaseProvider>
        <AppStateProvider>
            <ThemeProvider>
                <AppCore />
                <Modal />
                <ToastContainer />
            </ThemeProvider>
        </AppStateProvider>
    </FirebaseProvider>
  );
}

export default App;
