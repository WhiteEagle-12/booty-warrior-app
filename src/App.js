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
        return (
            <div className="min-h-screen flex justify-center items-center bg-[#090d12] text-[#efe7d5]">
                <div className="flex flex-col items-center">
                    <img src="/brand/eagle-eye-mark.png" alt="" className="w-16 h-16 object-contain animate-pulse" />
                    <div className="w-44 h-1 mt-6 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-1/2 h-full bg-[#f3b548] animate-pulse"></div>
                    </div>
                    <p className="text-[#9ca89d] mt-4">Calibrating Eagle Eye Training...</p>
                </div>
            </div>
        );
    }
    


    const renderContent = () => {
        if (!customId) {
            return <SyncIdPrompt />;
        }
        switch(pageState.view) {
            case 'dashboard': return <DashboardView allLogs={allLogs} programData={programData} bodyWeightHistory={bodyWeightHistory} onBack={onBack} />;
            case 'lifting': return <LiftingSession {...pageState.data} onBack={onBack} allLogs={allLogs} setAllLogs={setAllLogs} onSkipDay={handleSkipDay} programData={programData} weightUnit={weightUnit} onStartTimer={handleStartTimer} />;
            case 'analytics': return <AnalyticsView allLogs={historicalLogs} programData={programData} onBack={onBack} />;
            case 'records': return <RecordsView allLogs={historicalLogs} programData={programData} onBack={onBack} />;
            case 'achievements': return <AchievementsView unlockedAchievements={unlockedAchievements} historicalLogs={historicalLogs} programData={programData} bodyWeight={bodyWeight} weightUnit={weightUnit} onBack={onBack} bodyWeightHistory={bodyWeightHistory} />;
            case 'programHub': return <ProgramManagerView onProgramUpdate={handleProgramUpdate} activeProgram={{...programData, id: activeInstanceId}} programInstances={programInstances} onInstanceSwitch={handleInstanceSwitch} onBack={onBack} onDeleteProgram={handleDeleteProgram} />;
            case 'editProgram': return <EditProgramView programData={programData} onProgramDataChange={handleProgramDataChange} allLogs={allLogs} setAllLogs={setAllLogs} onBack={onBack} onNavigate={navigate} />;
            case 'settings': return <SettingsView allLogs={allLogs} historicalLogs={historicalLogs} weightUnit={weightUnit} onWeightUnitChange={handleWeightUnitChange} onResetMeso={handleResetMeso} programData={programData} onProgramDataChange={handleProgramDataChange} onShowTutorial={() => showTutorial(true)} bodyWeight={bodyWeight} onBodyWeightChange={handleBodyWeightChange} onBack={onBack} onFileImport={handleFileImport} onDeleteUserData={handleDeleteUserData} />;
            default: return <MainView onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })} onEditProgram={() => navigate('editProgram')} completedDays={completedDays} onUnskipDay={handleUnskipDay} programData={programData} allLogs={allLogs} onNavigate={navigate} />;
        }
    };

    return (
        <div className="min-h-screen font-sans text-[#efe7d5]">
            <div className="md:pl-72">
                <AppHeader programName={programData.info.name} onNavChange={navigate} />
                 <main className="flex-grow">
                    <div className="mx-auto max-w-7xl px-3 sm:px-5 lg:px-8">{renderContent()}</div>
                </main>
            </div>
            <Sidebar onNavChange={navigate} currentPage={pageState.view} />
             {activeTimer && <RestTimer initialTime={activeTimer} onClose={() => setActiveTimer(null)} onTimerEnd={handleTimerEnd} />}
        </div>
    );
}

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
