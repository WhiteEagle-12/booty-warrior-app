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
        handleUnskipDay, handleResetMeso, handleFileImport, completedDays
    } = useApplicationData();

    if (isLoading || isDataLoading) {
        return (
            <div className="bg-gray-100 dark:bg-gray-900 min-h-screen flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">Loading Your Program...</p>
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
            case 'settings': return <SettingsView allLogs={allLogs} historicalLogs={historicalLogs} weightUnit={weightUnit} onWeightUnitChange={handleWeightUnitChange} onResetMeso={handleResetMeso} programData={programData} onProgramDataChange={handleProgramDataChange} onShowTutorial={() => showTutorial(true)} bodyWeight={bodyWeight} onBodyWeightChange={handleBodyWeightChange} onBack={onBack} onFileImport={handleFileImport} />;
            default: return <MainView onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })} onEditProgram={() => navigate('editProgram')} completedDays={completedDays} onUnskipDay={handleUnskipDay} programData={programData} allLogs={allLogs} onNavigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-900 dark:text-gray-100">
            <div className="md:pl-64">
                <AppHeader programName={programData.info.name} onNavChange={navigate} />
                 <main className="flex-grow">
                    <div className="container mx-auto max-w-4xl">{renderContent()}</div>
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