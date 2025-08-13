// --- SELEÇÃO DOS ELEMENTOS DO HTML ---
const startButton = document.getElementById('start-button'), restartButton = document.getElementById('restart-button');
const instructionsButton = document.getElementById('instructions-button'), backToMenuButton = document.getElementById('back-to-menu-button');
const menuButton = document.getElementById('menu-button');
const screens = document.querySelectorAll('.screen'), startScreen = document.getElementById('start-screen'), gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen'), instructionsScreen = document.getElementById('instructions-screen');
const levelUpBanner = document.getElementById('level-up-banner');
const scoreDisplay = document.getElementById('score'), finalScoreDisplay = document.getElementById('final-score');
const feedbackMessage = document.getElementById('feedback-message'), noteHead = document.getElementById('note-head');
const answerButtonsContainer = document.getElementById('answer-buttons'), ledgerLinesContainer = document.getElementById('ledger-lines-container');
const timerBar = document.getElementById('timer-bar'), levelDisplay = document.getElementById('level-display');

// --- ÁUDIOS ---
const correctSound = new Audio('audio/correct.mp3'), incorrectSound = new Audio('audio/incorrect.mp3');
const endSound = new Audio('audio/fim-jogo-sucesso.mp3');

// --- DADOS DAS PERGUNTAS ---
const questions = [
    { note: 'Dó4', positionY: 125, correctAnswer: 'Dó', ledgerLines: [125] }, { note: 'Ré4', positionY: 117.5, correctAnswer: 'Ré' },
    { note: 'Mi4', positionY: 110, correctAnswer: 'Mi' }, { note: 'Fá4', positionY: 102.5, correctAnswer: 'Fá' },
    { note: 'Sol4', positionY: 95, correctAnswer: 'Sol' }, { note: 'Lá4', positionY: 87.5, correctAnswer: 'Lá' },
    { note: 'Si4', positionY: 80, correctAnswer: 'Si' }, { note: 'Dó5', positionY: 72.5, correctAnswer: 'Dó' },
    { note: 'Ré5', positionY: 65, correctAnswer: 'Ré' }, { note: 'Mi5', positionY: 57.5, correctAnswer: 'Mi' },
    { note: 'Fá5', positionY: 50, correctAnswer: 'Fá' }, { note: 'Sol5', positionY: 42.5, correctAnswer: 'Sol' },
    { note: 'Lá5', positionY: 35, correctAnswer: 'Lá', ledgerLines: [35] }
];

// --- CONFIGURAÇÃO DOS NÍVEIS (com Nível 4) ---
const levels = {
    1: { time: 10, questions: 10 },
    2: { time: 7, questions: 10 },
    3: { time: 5, questions: 10 },
    4: { time: 3.5, questions: 10 } // NOVO NÍVEL
};
let currentLevel = 1, score = 0, questionCounter = 0, shuffledQuestions = [], currentQuestion = {}, timerId = null;

// --- FUNÇÕES DE NAVEGAÇÃO E JOGO ---
function showScreen(screenToShow) { screens.forEach(s => s.classList.add('hidden')); screenToShow.classList.remove('hidden'); }
function startGame() { score = 0; currentLevel = 1; showScreen(gameScreen); startLevel(); }
function startLevel() {
    levelDisplay.innerText = `Nível: ${currentLevel}`;
    shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    questionCounter = 0;
    updateScoreDisplay();
    showNextQuestion();
}
function showNextQuestion() {
    resetState();
    if (questionCounter >= levels[currentLevel].questions) {
        if (currentLevel < Object.keys(levels).length) { handleLevelUp(); } else { endGame(); }
        return;
    }
    currentQuestion = shuffledQuestions[questionCounter];
    noteHead.setAttribute('cy', currentQuestion.positionY);
    noteHead.classList.remove('hidden');
    drawLedgerLines(currentQuestion);
    
    let allNoteNames = [...new Set(questions.map(q => q.correctAnswer))];
    let options = allNoteNames.filter(opt => opt !== currentQuestion.correctAnswer);
    options = options.sort(() => Math.random() - 0.5).slice(0, 3);
    options.push(currentQuestion.correctAnswer);
    options.sort(() => Math.random() - 0.5);
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('btn');
        button.addEventListener('click', selectAnswer);
        answerButtonsContainer.appendChild(button);
    });
    
    questionCounter++;
    startTimer();
}
function handleLevelUp() {
    currentLevel++;
    levelUpBanner.innerText = `Nível ${currentLevel} Alcançado!`;
    levelUpBanner.className = 'level-up-banner show';
    setTimeout(() => {
        levelUpBanner.className = 'level-up-banner hide';
        setTimeout(startLevel, 500); 
    }, 2000);
}
function selectAnswer(e) {
    clearTimeout(timerId);
    const selectedButton = e.target;
    const isCorrect = selectedButton.innerText === currentQuestion.correctAnswer;
    
    Array.from(answerButtonsContainer.children).forEach(button => {
        button.disabled = true;
        if(button.innerText === currentQuestion.correctAnswer) button.classList.add('correct');
    });

    if (isCorrect) {
        correctSound.play().catch(e => console.error("Erro ao tocar som de acerto:", e));
        score++;
        updateScoreDisplay();
    } else {
        incorrectSound.play().catch(e => console.error("Erro ao tocar som de erro:", e));
        selectedButton.classList.add('incorrect');
    }
    setTimeout(showNextQuestion, 1200);
}
function startTimer() {
    const timeLimit = levels[currentLevel].time;
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    setTimeout(() => {
        timerBar.style.transition = `width ${timeLimit}s linear`;
        timerBar.style.width = '0%';
    }, 20);
    timerId = setTimeout(handleTimeout, timeLimit * 1000);
}
function handleTimeout() {
    incorrectSound.play().catch(e => console.error("Erro ao tocar som de erro:", e));
    Array.from(answerButtonsContainer.children).forEach(button => {
        button.disabled = true;
        if (button.innerText === currentQuestion.correctAnswer) button.classList.add('correct');
    });
    setTimeout(showNextQuestion, 1200);
}
function resetState() {
    clearTimeout(timerId);
    ledgerLinesContainer.innerHTML = '';
    noteHead.classList.add('hidden');
    while(answerButtonsContainer.firstChild) answerButtonsContainer.removeChild(answerButtonsContainer.firstChild);
}
function updateScoreDisplay() { scoreDisplay.innerText = `Pontuação: ${score}`; }
function getFeedbackMessage(finalScore, totalQuestions) {
    const percentage = (finalScore / totalQuestions) * 100;
    if (percentage >= 90) return "Excelente! Você tem um ótimo olho para as notas!";
    if (percentage >= 70) return "Muito bom! Continue praticando para chegar à perfeição.";
    if (percentage >= 50) return "Bom trabalho! A prática leva à maestria.";
    return "Não desanime! Cada tentativa é um passo importante no aprendizado.";
}
function endGame() {
    const totalQuestions = Object.values(levels).reduce((sum, level) => sum + level.questions, 0);
    finalScoreDisplay.innerText = `Sua pontuação final foi: ${score} de ${totalQuestions}`;
    feedbackMessage.innerText = getFeedbackMessage(score, totalQuestions);
    endSound.play().catch(e => console.error("Erro ao tocar som final:", e));
    showScreen(endScreen);
}
function drawLedgerLines(question) {
    if (question.ledgerLines) {
        question.ledgerLines.forEach(yPos => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '210'); line.setAttribute('y1', yPos);
            line.setAttribute('x2', '250'); line.setAttribute('y2', yPos);
            line.setAttribute('stroke', 'black'); line.setAttribute('stroke-width', '2');
            ledgerLinesContainer.appendChild(line);
        });
    }
}
// --- EVENT LISTENERS ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
instructionsButton.addEventListener('click', () => showScreen(instructionsScreen));
backToMenuButton.addEventListener('click', () => showScreen(startScreen));
menuButton.addEventListener('click', () => { clearTimeout(timerId); showScreen(startScreen); });