/**
 * Main Application Module for SMP Demo
 * 
 * This module handles all UI interactions, drag-and-drop functionality,
 * and the Conflict Resolution Assistant for the Stable Marriage Problem demo.
 */

import {
    generateParticipants,
    generateRandomPreferences,
    runGaleShapley,
    findBlockingPairs,
    computeMetrics,
    applySuggestion,
    analyzeMatching,
    generateSuggestions
} from './smp.js';

// Global application state
let appState = {
    participants: { groupA: [], groupB: [] },
    preferences: { prefsA: {}, prefsB: {} },
    currentMatching: null,
    currentMetrics: null,
    currentBlockingPairs: [],
    currentAnalysis: null,
    currentSuggestions: [],
    participantCount: 5  // Match the HTML default
};

// DOM element references
let elements = {};

/**
 * Initialize the application
 */
function init() {
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Generate initial data
    generateInitialData();
    
    // Render initial UI
    renderUI();
    
    // Run initial solve
    solveAndUpdate();
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    elements = {
        participantCountInput: document.getElementById('participant-count'),
        regenerateBtn: document.getElementById('regenerate-btn'),
        solveBtn: document.getElementById('solve-btn'),
        whatIfBtn: document.getElementById('what-if-btn'),
        resetBtn: document.getElementById('reset-btn'),
        themeToggle: document.getElementById('theme-toggle'),
        themeIcon: document.querySelector('.theme-icon'),
        groupA: document.getElementById('group-a'),
        groupB: document.getElementById('group-b'),
        emptyState: document.getElementById('empty-state'),
        resultsContent: document.getElementById('results-content'),
        matchingTable: document.getElementById('matching-table').querySelector('tbody'),
        stabilityScore: document.getElementById('stability-score'),
        avgHappiness: document.getElementById('avg-happiness'),
        proposerSatisfaction: document.getElementById('proposer-satisfaction'),
        receiverSatisfaction: document.getElementById('receiver-satisfaction'),
        blockingPairsList: document.getElementById('blocking-pairs-list'),
        diagramContainer: document.getElementById('diagram-container'),
        explanationText: document.getElementById('explanation-text'),
        suggestionsList: document.getElementById('suggestions-list'),
        toast: document.getElementById('toast')
    };
}

/**
 * Set up event listeners for UI controls
 */
function setupEventListeners() {
    elements.participantCountInput.addEventListener('change', handleParticipantCountChange);
    elements.regenerateBtn.addEventListener('click', handleRegenerate);
    elements.solveBtn.addEventListener('click', handleSolve);
    elements.whatIfBtn.addEventListener('click', handleWhatIf);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.themeToggle.addEventListener('click', handleThemeToggle);
    
    // Initialize theme
    initializeTheme();
}

/**
 * Generate initial random data
 */
function generateInitialData() {
    const count = parseInt(elements.participantCountInput.value);
    appState.participantCount = count;
    appState.participants = generateParticipants(count);
    appState.preferences = generateRandomPreferences(
        appState.participants.groupA,
        appState.participants.groupB
    );
}

/**
 * Handle participant count change
 */
function handleParticipantCountChange() {
    const newCount = parseInt(elements.participantCountInput.value);
    if (newCount !== appState.participantCount && newCount >= 3 && newCount <= 10) {
        appState.participantCount = newCount;
        generateInitialData();
        renderUI();
        clearResults();
    }
}

/**
 * Handle regenerate button click
 */
function handleRegenerate() {
    generateInitialData();
    renderUI();
    clearResults();
    showToast('New random preferences generated!', 'success');
}

/**
 * Handle solve button click
 */
function handleSolve() {
    solveAndUpdate();
}

/**
 * Handle what-if button click
 */
function handleWhatIf() {
    if (appState.currentSuggestions.length === 0) {
        showToast('No suggestions available', 'warning');
        return;
    }
    
    const suggestion = appState.currentSuggestions[0];
    
    // Apply the suggestion
    const newPrefs = applySuggestion(
        suggestion,
        appState.preferences.prefsA,
        appState.preferences.prefsB
    );
    
    appState.preferences = newPrefs;
    
    // Re-render preferences UI
    renderPreferences();
    
    // Re-solve and update results
    solveAndUpdate();
    
    showToast(`Applied suggestion: ${suggestion.rationale}`, 'success');
}

/**
 * Handle reset button click
 */
function handleReset() {
    generateInitialData();
    renderUI();
    clearResults();
    showToast('Reset to new random preferences', 'success');
}

/**
 * Solve the SMP and update all UI components
 */
function solveAndUpdate() {
    try {
        // Validate preferences exist
        if (!appState.preferences.prefsA || !appState.preferences.prefsB) {
            throw new Error('Preferences not initialized');
        }
        
        // Check if preferences are empty
        const aKeys = Object.keys(appState.preferences.prefsA);
        const bKeys = Object.keys(appState.preferences.prefsB);
        
        if (aKeys.length === 0 || bKeys.length === 0) {
            throw new Error('Empty preferences detected');
        }
        
        console.log('Running Gale-Shapley with:', {
            aParticipants: aKeys,
            bParticipants: bKeys,
            prefsA: appState.preferences.prefsA,
            prefsB: appState.preferences.prefsB
        });
        
        // Run Gale-Shapley algorithm
        const { matching } = runGaleShapley(
            appState.preferences.prefsA,
            appState.preferences.prefsB
        );
        
        // Find blocking pairs
        const blockingPairs = findBlockingPairs(
            matching,
            appState.preferences.prefsA,
            appState.preferences.prefsB
        );
        
        // Compute metrics
        const metrics = computeMetrics(
            matching,
            appState.preferences.prefsA,
            appState.preferences.prefsB,
            blockingPairs,
            'A'
        );
        
        // Analyze matching
        const analysis = analyzeMatching(
            matching,
            appState.preferences.prefsA,
            appState.preferences.prefsB,
            blockingPairs,
            metrics
        );
        
        // Generate suggestions
        const suggestions = generateSuggestions(
            matching,
            appState.preferences.prefsA,
            appState.preferences.prefsB,
            blockingPairs,
            analysis
        );
        
        // Update app state
        appState.currentMatching = matching;
        appState.currentMetrics = metrics;
        appState.currentBlockingPairs = blockingPairs;
        appState.currentAnalysis = analysis;
        appState.currentSuggestions = suggestions;
        
        // Update UI
        showResults();
        renderResults();
        renderAssistant();
        
        // Enable what-if button if suggestions available
        elements.whatIfBtn.disabled = suggestions.length === 0;
        
    } catch (error) {
        console.error('Error solving SMP:', error);
        showToast('Error solving the problem. Please try again.', 'error');
    }
}

/**
 * Render the complete UI
 */
function renderUI() {
    renderPreferences();
}

/**
 * Render the preference lists with drag-and-drop functionality
 */
function renderPreferences() {
    // Clear existing content
    elements.groupA.innerHTML = '';
    elements.groupB.innerHTML = '';
    
    // Render Group A
    appState.participants.groupA.forEach(participantId => {
        const card = createParticipantCard(participantId, appState.preferences.prefsA[participantId], 'A');
        elements.groupA.appendChild(card);
    });
    
    // Render Group B
    appState.participants.groupB.forEach(participantId => {
        const card = createParticipantCard(participantId, appState.preferences.prefsB[participantId], 'B');
        elements.groupB.appendChild(card);
    });
}

/**
 * Create a participant card with draggable preference list
 */
function createParticipantCard(participantId, preferences, group) {
    const card = document.createElement('div');
    card.className = 'participant-card';
    
    const header = document.createElement('div');
    header.className = 'participant-header';
    
    const idBadge = document.createElement('span');
    idBadge.className = 'participant-id';
    idBadge.textContent = participantId;
    
    const label = document.createElement('span');
    label.textContent = 'Preferences (drag to reorder):';
    
    header.appendChild(idBadge);
    header.appendChild(label);
    
    const list = document.createElement('ol');
    list.className = 'preference-list';
    list.setAttribute('data-participant', participantId);
    list.setAttribute('data-group', group);
    
    // Add preference items
    preferences.forEach((pref, index) => {
        const item = createPreferenceItem(pref, index + 1);
        list.appendChild(item);
    });
    
    // Set up drag and drop for the list
    setupDragAndDrop(list);
    
    card.appendChild(header);
    card.appendChild(list);
    
    return card;
}

/**
 * Create a draggable preference item
 */
function createPreferenceItem(preference, rank) {
    const item = document.createElement('li');
    item.className = 'preference-item';
    item.draggable = true;
    item.setAttribute('data-preference', preference);
    item.setAttribute('tabindex', '0');
    
    const text = document.createElement('span');
    text.textContent = preference;
    
    const rankBadge = document.createElement('span');
    rankBadge.className = 'preference-rank';
    rankBadge.textContent = rank;
    
    item.appendChild(text);
    item.appendChild(rankBadge);
    
    return item;
}

/**
 * Set up drag and drop functionality for a preference list
 */
function setupDragAndDrop(list) {
    let draggedItem = null;
    let draggedFromIndex = -1;
    let dragGhost = null;
    let mouseOffset = { x: 0, y: 0 };
    
    // Add event listeners to all items in the list
    function addItemListeners(item) {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
        item.addEventListener('mousedown', handleMouseDown);
        
        // Keyboard support
        item.addEventListener('keydown', handleKeyDown);
    }
    
    // Apply listeners to existing items
    Array.from(list.children).forEach(addItemListeners);
    
    function handleMouseDown(e) {
        const rect = e.target.getBoundingClientRect();
        mouseOffset.x = e.clientX - rect.left;
        mouseOffset.y = e.clientY - rect.top;
    }

    function handleDragStart(e) {
        draggedItem = e.target;
        draggedFromIndex = Array.from(list.children).indexOf(draggedItem);
        
        // Create a custom drag image that's more visible
        const dragImage = draggedItem.cloneNode(true);
        dragImage.style.transform = 'rotate(3deg) scale(1.05)';
        dragImage.style.opacity = '0.9';
        dragImage.style.boxShadow = '0 15px 35px 0 rgba(96, 165, 250, 0.4)';
        dragImage.style.background = 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)';
        dragImage.style.color = 'white';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        dragImage.style.zIndex = '1000';
        document.body.appendChild(dragImage);
        
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(dragImage, mouseOffset.x, mouseOffset.y);
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        
        // Clean up the temporary drag image after a short delay
        setTimeout(() => {
            if (document.body.contains(dragImage)) {
                document.body.removeChild(dragImage);
            }
        }, 0);
        
        // Add dragging class with slight delay for better visual effect
        setTimeout(() => {
            if (draggedItem) {
                draggedItem.classList.add('dragging');
            }
        }, 10);
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    
    function handleDragEnter(e) {
        if (e.target !== draggedItem && e.target.classList.contains('preference-item')) {
            // Remove drag-over from all other items first
            Array.from(list.children).forEach(item => {
                if (item !== e.target) {
                    item.classList.remove('drag-over');
                }
            });
            e.target.classList.add('drag-over');
        }
    }
    
    function handleDragLeave(e) {
        // Only remove if we're actually leaving the item (not entering a child)
        if (!e.target.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.preference-item');
        
        if (dropTarget && dropTarget !== draggedItem) {
            const dropIndex = Array.from(list.children).indexOf(dropTarget);
            
            // Reorder the items in the DOM
            if (draggedFromIndex < dropIndex) {
                list.insertBefore(draggedItem, dropTarget.nextSibling);
            } else {
                list.insertBefore(draggedItem, dropTarget);
            }
            
            // Update the preference order in app state
            updatePreferenceOrder(list);
            
            // Update rank badges
            updateRankBadges(list);
        }
        
        // Clean up
        Array.from(list.children).forEach(item => {
            item.classList.remove('drag-over');
        });
    }
    
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedItem = null;
        draggedFromIndex = -1;
        
        // Clean up any remaining drag-over classes
        Array.from(list.children).forEach(item => {
            item.classList.remove('drag-over');
        });
    }
    
    function handleKeyDown(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const currentItem = e.target;
            const currentIndex = Array.from(list.children).indexOf(currentItem);
            const newIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
            
            if (newIndex >= 0 && newIndex < list.children.length) {
                const targetItem = list.children[newIndex];
                
                // Swap the items
                if (e.key === 'ArrowUp') {
                    list.insertBefore(currentItem, targetItem);
                } else {
                    list.insertBefore(currentItem, targetItem.nextSibling);
                }
                
                // Update preference order and focus
                updatePreferenceOrder(list);
                updateRankBadges(list);
                currentItem.focus();
            }
        }
    }
}

/**
 * Update the preference order in app state after drag and drop
 */
function updatePreferenceOrder(list) {
    const participantId = list.getAttribute('data-participant');
    const group = list.getAttribute('data-group');
    
    const newOrder = Array.from(list.children).map(item => 
        item.getAttribute('data-preference')
    );
    
    if (group === 'A') {
        appState.preferences.prefsA[participantId] = newOrder;
    } else {
        appState.preferences.prefsB[participantId] = newOrder;
    }
}

/**
 * Update rank badges after reordering
 */
function updateRankBadges(list) {
    Array.from(list.children).forEach((item, index) => {
        const rankBadge = item.querySelector('.preference-rank');
        rankBadge.textContent = index + 1;
    });
}

/**
 * Show the results section
 */
function showResults() {
    elements.emptyState.style.display = 'none';
    elements.resultsContent.style.display = 'block';
}

/**
 * Clear results and show empty state
 */
function clearResults() {
    elements.emptyState.style.display = 'block';
    elements.resultsContent.style.display = 'none';
    elements.whatIfBtn.disabled = true;
}

/**
 * Render the results section
 */
function renderResults() {
    renderMatchingTable();
    renderMetrics();
    renderBlockingPairs();
    renderBipartiteDiagram();
}

/**
 * Render the matching table
 */
function renderMatchingTable() {
    elements.matchingTable.innerHTML = '';
    
    if (!appState.currentMatching) return;
    
    appState.participants.groupA.forEach(a => {
        const b = appState.currentMatching[a];
        if (b) {
            const row = document.createElement('tr');
            
            const cellA = document.createElement('td');
            cellA.textContent = a;
            
            const cellB = document.createElement('td');
            cellB.textContent = b;
            
            row.appendChild(cellA);
            row.appendChild(cellB);
            elements.matchingTable.appendChild(row);
        }
    });
}

/**
 * Render the metrics
 */
function renderMetrics() {
    if (!appState.currentMetrics) return;
    
    const metrics = appState.currentMetrics;
    
    elements.stabilityScore.textContent = metrics.stabilityScore.toFixed(3);
    elements.avgHappiness.textContent = metrics.avgHappiness.toFixed(3);
    elements.proposerSatisfaction.textContent = metrics.proposerSatisfaction.toFixed(3);
    elements.receiverSatisfaction.textContent = metrics.receiverSatisfaction.toFixed(3);
}

/**
 * Render blocking pairs
 */
function renderBlockingPairs() {
    elements.blockingPairsList.innerHTML = '';
    
    if (appState.currentBlockingPairs.length === 0) {
        const noBlocking = document.createElement('div');
        noBlocking.className = 'no-blocking-pairs';
        noBlocking.textContent = '✓ No blocking pairs - the matching is stable!';
        elements.blockingPairsList.appendChild(noBlocking);
    } else {
        appState.currentBlockingPairs.forEach(({ a, b }) => {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'blocking-pair';
            pairDiv.textContent = `${a} and ${b} prefer each other over their current partners`;
            elements.blockingPairsList.appendChild(pairDiv);
        });
    }
}

/**
 * Render the bipartite diagram
 */
function renderBipartiteDiagram() {
    elements.diagramContainer.innerHTML = '';
    
    if (!appState.currentMatching) return;
    
    const container = elements.diagramContainer;
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || 300;
    const height = 200;
    
    // Create left side (Group A)
    const leftSide = document.createElement('div');
    leftSide.className = 'diagram-side left';
    
    appState.participants.groupA.forEach((a, index) => {
        const node = document.createElement('div');
        node.className = 'diagram-node';
        node.textContent = a;
        node.setAttribute('data-participant', a);
        leftSide.appendChild(node);
    });
    
    // Create right side (Group B)
    const rightSide = document.createElement('div');
    rightSide.className = 'diagram-side right';
    
    appState.participants.groupB.forEach((b, index) => {
        const node = document.createElement('div');
        node.className = 'diagram-node';
        node.textContent = b;
        node.setAttribute('data-participant', b);
        rightSide.appendChild(node);
    });
    
    container.appendChild(leftSide);
    container.appendChild(rightSide);
    
    // Add edges after nodes are in DOM
    setTimeout(() => {
        addDiagramEdges(container);
    }, 0);
}

/**
 * Add edges to the bipartite diagram
 */
function addDiagramEdges(container) {
    if (!appState.currentMatching) return;
    
    appState.participants.groupA.forEach(a => {
        const b = appState.currentMatching[a];
        if (!b) return;
        
        const nodeA = container.querySelector(`[data-participant="${a}"]`);
        const nodeB = container.querySelector(`[data-participant="${b}"]`);
        
        if (nodeA && nodeB) {
            const edge = createEdge(nodeA, nodeB, container);
            container.appendChild(edge);
        }
    });
}

/**
 * Create an edge between two nodes
 */
function createEdge(nodeA, nodeB, container) {
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const x1 = rectA.left + rectA.width / 2 - containerRect.left;
    const y1 = rectA.top + rectA.height / 2 - containerRect.top;
    const x2 = rectB.left + rectB.width / 2 - containerRect.left;
    const y2 = rectB.top + rectB.height / 2 - containerRect.top;
    
    const edge = document.createElement('div');
    edge.className = 'diagram-edge';
    
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    edge.style.width = `${length}px`;
    edge.style.left = `${x1}px`;
    edge.style.top = `${y1}px`;
    edge.style.transform = `rotate(${angle}deg)`;
    edge.style.transformOrigin = '0 50%';
    
    return edge;
}

/**
 * Render the conflict resolution assistant
 */
function renderAssistant() {
    renderExplanation();
    renderSuggestions();
}

/**
 * Render the explanation text
 */
function renderExplanation() {
    if (!appState.currentAnalysis || !appState.currentMetrics) {
        elements.explanationText.textContent = 'Run the algorithm to see analysis...';
        return;
    }
    
    const analysis = appState.currentAnalysis;
    const metrics = appState.currentMetrics;
    const blockingCount = appState.currentBlockingPairs.length;
    
    let explanation = '';
    
    if (analysis.isStable) {
        explanation += '🎉 Great! This matching is stable with no blocking pairs. ';
    } else {
        explanation += `⚠️ This matching has ${blockingCount} blocking pair${blockingCount > 1 ? 's' : ''}. `;
    }
    
    // Analyze proposer advantage
    if (analysis.proposerAdvantage > 0.15) {
        explanation += 'Group A (proposers) got significantly better outcomes than Group B (receivers) - this is typical in Gale-Shapley since proposers have the advantage. ';
    } else if (analysis.proposerAdvantage < -0.15) {
        explanation += 'Surprisingly, Group B (receivers) got better outcomes than Group A (proposers) in this case. ';
    } else {
        explanation += 'Both groups achieved fairly balanced satisfaction levels. ';
    }
    
    // Mention unhappy participants
    const totalUnhappy = analysis.unhappyA.length + analysis.unhappyB.length;
    if (totalUnhappy > 0) {
        explanation += `${totalUnhappy} participant${totalUnhappy > 1 ? 's are' : ' is'} quite unhappy with their assignment. `;
    }
    
    // Overall assessment
    if (metrics.stabilityScore > 0.9) {
        explanation += 'Overall, this is a high-quality matching!';
    } else if (metrics.stabilityScore > 0.7) {
        explanation += 'This matching could be improved with some preference adjustments.';
    } else {
        explanation += 'This matching has significant stability issues that should be addressed.';
    }
    
    elements.explanationText.textContent = explanation;
}

/**
 * Render suggestions
 */
function renderSuggestions() {
    elements.suggestionsList.innerHTML = '';
    
    if (appState.currentSuggestions.length === 0) {
        const noSuggestions = document.createElement('div');
        noSuggestions.className = 'no-suggestions';
        noSuggestions.textContent = appState.currentAnalysis && appState.currentAnalysis.isStable ? 
            'No suggestions - the matching is already stable!' :
            'No actionable suggestions available at this time.';
        elements.suggestionsList.appendChild(noSuggestions);
        return;
    }
    
    appState.currentSuggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const action = document.createElement('div');
        action.className = 'suggestion-action';
        action.textContent = `💡 Suggestion ${index + 1}: Swap items ${suggestion.indices[0] + 1} and ${suggestion.indices[1] + 1} in ${suggestion.target}'s list`;
        
        const rationale = document.createElement('div');
        rationale.className = 'suggestion-rationale';
        rationale.textContent = suggestion.rationale;
        
        const delta = document.createElement('div');
        delta.className = 'suggestion-delta';
        delta.textContent = `Expected: Stability ${suggestion.expectedDelta.stability >= 0 ? '+' : ''}${suggestion.expectedDelta.stability}, Happiness ${suggestion.expectedDelta.avgHappiness >= 0 ? '+' : ''}${suggestion.expectedDelta.avgHappiness}`;
        
        item.appendChild(action);
        item.appendChild(rationale);
        item.appendChild(delta);
        
        elements.suggestionsList.appendChild(item);
    });
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'success') {
    const toast = elements.toast;
    
    // Clear existing classes
    toast.className = 'toast';
    
    // Add type class
    if (type !== 'success') {
        toast.classList.add(type);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Handle window resize for responsive diagram
 */
function handleResize() {
    if (appState.currentMatching) {
        renderBipartiteDiagram();
    }
}

/**
 * Initialize theme from localStorage or default to dark
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('smp-theme') || 'dark';
    setTheme(savedTheme);
}

/**
 * Handle theme toggle button click
 */
function handleThemeToggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success');
}

/**
 * Set the theme and update UI
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('smp-theme', theme);
    
    // Update theme toggle icon
    if (elements.themeIcon) {
        elements.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        elements.themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle window resize
window.addEventListener('resize', handleResize);

// Export for debugging
window.appState = appState;