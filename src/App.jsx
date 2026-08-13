import React, { useContext } from 'react';

import { AppStateProvider, AppStateContext } from './contexts/AppStateContext';
import { FirebaseProvider, FirebaseContext } from './contexts/FirebaseContext';
import { ThemeProvider } from './contexts/ThemeContext';

import { Modal } from './components/common/Modal';
import { ToastContainer } from './components/common/Toast';
import { RestTimer } from './components/common/RestTimer';
import { AppHeader } from './components/layout/AppHeader';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { SyncIdPrompt } from './components/common/SyncIdPrompt';

import { LiftingSession } from './components/workout/LiftingSession';

import { MainView } from './views/MainView';
import { DashboardView } from './views/DashboardView';
import { SettingsView } from './views/SettingsView';
import { AnalyticsView } from './views/AnalyticsView';
import { RecordsView } from './views/RecordsView';
import { EditProgramView } from './views/EditProgramView';
import { ProgramManagerView } from './views/ProgramManagerView';
import { AchievementsView } from './views/AchievementsView';
import { ProgressView } from './views/ProgressView';
import { ProgramView } from './views/ProgramView';

import { useApplicationData } from './hooks/useApplicationData';

const PROGRESS_VIEWS = ['dashboard', 'analytics', 'records', 'achievements'];
const PROGRAM_VIEWS = ['programHub', 'editProgram'];

const LoadingScreen = () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-base px-6 text-bone">
        <div className="relative flex h-24 w-24 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-amber/35 animate-reticle" />
            <img src="/brand/eagle-eye-mark.png" alt="" className="h-14 w-14 object-contain" />
        </div>
        <p className="mt-8 font-display text-3xl font-medium">Eagle Eye</p>
        <p className="mt-2 text-sm text-mute">Opening your journal…</p>
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

    const isSession = pageState.view === 'lifting';
    const isProgress = PROGRESS_VIEWS.includes(pageState.view);
    const isProgram = PROGRAM_VIEWS.includes(pageState.view);

    const renderContent = () => {
        if (!customId) {
            return <SyncIdPrompt />;
        }

        if (isSession) {
            return (
                <LiftingSession
                    {...pageState.data}
                    onBack={onBack}
                    allLogs={allLogs}
                    setAllLogs={setAllLogs}
                    onSkipDay={handleSkipDay}
                    programData={programData}
                    weightUnit={weightUnit}
                    onStartTimer={handleStartTimer}
                />
            );
        }

        if (isProgress) {
            return (
                <ProgressView current={pageState.view} onNavigate={navigate}>
                    {pageState.view === 'dashboard' && (
                        <DashboardView
                            embedded
                            allLogs={allLogs}
                            programData={programData}
                            bodyWeightHistory={bodyWeightHistory}
                            onBack={onBack}
                            onNavigate={navigate}
                        />
                    )}
                    {pageState.view === 'analytics' && (
                        <AnalyticsView embedded allLogs={historicalLogs} programData={programData} onBack={onBack} />
                    )}
                    {pageState.view === 'records' && (
                        <RecordsView embedded allLogs={historicalLogs} programData={programData} onBack={onBack} weightUnit={weightUnit} />
                    )}
                    {pageState.view === 'achievements' && (
                        <AchievementsView
                            embedded
                            unlockedAchievements={unlockedAchievements}
                            historicalLogs={historicalLogs}
                            programData={programData}
                            bodyWeight={bodyWeight}
                            weightUnit={weightUnit}
                            onBack={onBack}
                            bodyWeightHistory={bodyWeightHistory}
                        />
                    )}
                </ProgressView>
            );
        }

        if (isProgram) {
            return (
                <ProgramView current={pageState.view} onNavigate={navigate}>
                    {pageState.view === 'programHub' && (
                        <ProgramManagerView
                            embedded
                            onProgramUpdate={handleProgramUpdate}
                            activeProgram={{ ...programData, id: activeInstanceId }}
                            programInstances={programInstances}
                            onInstanceSwitch={handleInstanceSwitch}
                            onBack={onBack}
                            onDeleteProgram={handleDeleteProgram}
                        />
                    )}
                    {pageState.view === 'editProgram' && (
                        <EditProgramView
                            embedded
                            programData={programData}
                            onProgramDataChange={handleProgramDataChange}
                            allLogs={allLogs}
                            setAllLogs={setAllLogs}
                            onBack={onBack}
                            onNavigate={navigate}
                        />
                    )}
                </ProgramView>
            );
        }

        if (pageState.view === 'settings') {
            return (
                <SettingsView
                    allLogs={allLogs}
                    historicalLogs={historicalLogs}
                    weightUnit={weightUnit}
                    onWeightUnitChange={handleWeightUnitChange}
                    onResetMeso={handleResetMeso}
                    programData={programData}
                    onProgramDataChange={handleProgramDataChange}
                    onShowTutorial={() => showTutorial(true)}
                    bodyWeight={bodyWeight}
                    onBodyWeightChange={handleBodyWeightChange}
                    onBack={onBack}
                    onFileImport={handleFileImport}
                    onDeleteUserData={handleDeleteUserData}
                />
            );
        }

        return (
            <MainView
                onSessionSelect={(week, day, type, seqIndex) => navigate(type, { week, dayKey: day, sequentialWorkoutIndex: seqIndex })}
                onEditProgram={() => navigate('editProgram')}
                completedDays={completedDays}
                onUnskipDay={handleUnskipDay}
                programData={programData}
                allLogs={allLogs}
                onNavigate={navigate}
            />
        );
    };

    return (
        <div className="min-h-screen font-sans text-bone">
            {!isSession && <Sidebar onNavChange={navigate} currentPage={pageState.view} />}
            <div className={isSession ? '' : 'md:pl-60'}>
                {!isSession && <AppHeader programName={programData.info.name} onNavChange={navigate} />}
                <main className={isSession ? '' : 'pb-28 md:pb-12'}>
                    <div className={isSession ? 'mx-auto max-w-3xl px-3 sm:px-5' : 'mx-auto max-w-5xl px-4 sm:px-6'}>
                        {renderContent()}
                    </div>
                </main>
            </div>
            {!isSession && <MobileNav onNavChange={navigate} currentPage={pageState.view} />}
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
