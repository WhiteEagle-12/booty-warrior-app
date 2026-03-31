$filePath = 'c:\Users\gavin\Downloads\booty-warrior-app\src\App.js'
$lines = Get-Content $filePath

# The new hook path
$hooksDir = 'c:\Users\gavin\Downloads\booty-warrior-app\src\hooks'
if (!(Test-Path $hooksDir)) { New-Item -ItemType Directory -Path $hooksDir | Out-Null }
$hookPath = Join-Path $hooksDir 'useApplicationData.js'

$hookImports = @"
import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { doc, updateDoc, onSnapshot, setDoc, arrayUnion } from 'firebase/firestore';

import { generateUUID, getExerciseDetails, isSetLogComplete } from '../utils/helpers';
import { getWorkoutForWeek, getWorkoutNameForDay } from '../utils/workout';
import { migrateProgramData } from '../utils/migration';
import { presets } from '../data/presets';
import { achievementsList } from '../data/achievements';

import { AppStateContext } from '../contexts/AppStateContext';
import { FirebaseContext } from '../contexts/FirebaseContext';
import { ThemeContext } from '../contexts/ThemeContext';

import { TutorialModal } from '../components/modals/TutorialModal';
import { RestoreProgramModal } from '../views/ProgramManagerView';

export const useApplicationData = () => {
"@

$hookExports = @"
    return {
        pageState,
        navigate,
        onBack,
        programInstances,
        activeInstanceId,
        allLogs,
        setAllLogs,
        historicalLogs,
        skippedDays,
        weightUnit,
        handleWeightUnitChange,
        bodyWeight,
        handleBodyWeightChange,
        bodyWeightHistory,
        isDataLoading,
        activeTimer,
        setActiveTimer,
        handleStartTimer,
        handleTimerEnd,
        unlockedAchievements,
        programData,
        handleProgramDataChange,
        handleProgramUpdate,
        handleInstanceSwitch,
        handleDeleteProgram,
        showTutorial,
        handleSkipDay,
        handleUnskipDay,
        handleResetMeso,
        handleRestoreLogs,
        handleFileImport,
        completedDays
    };
};
"@

# Find AppCore boundaries
$appCoreStart = -1
$appCoreEnd = -1
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^const AppCore = ') {
        $appCoreStart = $i + 1 # Skip the const AppCore = () => { line
    }
    if ($lines[$i] -match 'if \(isLoading \|\| isDataLoading\)') {
        $appCoreEnd = $i - 1
        break
    }
}

# The hook body is everything between AppCore start and the React rendering logic (which starts with the loading spinner)
$hookBody = $lines[$appCoreStart..$appCoreEnd] -join "`r`n"

$hookContent = $hookImports + "`r`n" + $hookBody + "`r`n" + $hookExports
Set-Content $hookPath $hookContent -NoNewline
Write-Host "Created $hookPath"

# Now build the new slim App.js
$newAppImports = @"
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

"@

# Remaining AppCore rendering logic
$appCoreRenderBody = $lines[($appCoreEnd + 1)..($lines.Count - 1)] -join "`r`n"

$newAppContent = $newAppImports + "`r`n" + $appCoreRenderBody
Set-Content $filePath $newAppContent -NoNewline
Write-Host "Updated App.js"
