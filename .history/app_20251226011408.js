let currentParts = [];
let currentPartIndex = 0;
let userAnswers = {};
let questionsByPart = {};
let currentFilter = 'all'; // Default filter

// DOM Elements
const partSelection = document.querySelector('.part-selection');
const quizContainer = document.getElementById('quiz-container');
const resultsContainer = document.getElementById('results-container');
const partTitle = document.getElementById('part-title');
const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const scoreElement = document.getElementById('score');
const totalElement = document.getElementById('total');
const resultsDetails = document.getElementById('results-details');
const partBreakdownElement = document.getElementById('part-breakdown');
const startQuizBtn = document.getElementById('start-quiz-btn');
const submitTimeElement = document.getElementById('submit-time');
const filterButtons = document.querySelectorAll('.result-filter-btn');

// Part information
const partInfo = {
    1: { name: "Part 1: Sentence Comprehension" },
    2: { name: "Part 2: Picture Description" },
    3: { name: "Part 3: Word Fill-in" },
    4: { name: "Part 4: Paragraph Completion" },
    5: { name: "Part 5: Reading Comprehension" }
};

// Event Listeners
startQuizBtn.addEventListener('click', startQuiz);
prevBtn.addEventListener('click', showPreviousPart);
nextBtn.addEventListener('click', showNextPart);
submitBtn.addEventListener('click', submitQuiz);
restartBtn.addEventListener('click', restartQuiz);

// Filter Button Logic
filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all
        filterButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked
        e.target.classList.add('active');
        // Set filter and re-render
        currentFilter = e.target.dataset.filter;
        renderFilteredResults();
    });
});

// Update start button state based on selection
document.querySelectorAll('.part-checkbox input').forEach(checkbox => {
    checkbox.addEventListener('change', updateStartButton);
});

function updateStartButton() {
    const selectedParts = Array.from(document.querySelectorAll('.part-checkbox input:checked'));
    startQuizBtn.disabled = selectedParts.length === 0;
}

function startQuiz() {
    const selectedCheckboxes = Array.from(document.querySelectorAll('.part-checkbox input:checked'));
    currentParts = selectedCheckboxes.map(cb => parseInt(cb.dataset.part)).sort();
    
    if (currentParts.length === 0) {
        alert('Please select at least one part to start the quiz!');
        return;
    }
    
    currentPartIndex = 0;
    userAnswers = {};
    
    // Organize questions by part
    questionsByPart = {};
    currentParts.forEach(part => {
        questionsByPart[part] = quizData.filter(q => q.part === part).sort((a, b) => a.id - b.id);
    });
    
    partSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    
    showCurrentPart();
}

function showCurrentPart() {
    const currentPart = currentParts[currentPartIndex];
    const currentPartQuestions = questionsByPart[currentPart];
    
    partTitle.textContent = `${partInfo[currentPart].name}`;
    
    // Show all questions for current part
    showAllQuestions(currentPartQuestions);
    updateNavigationButtons();
    
    // Scroll to top
    window.scrollTo(0,0);
}

function showAllQuestions(questions) {
    let questionsHTML = '';
    
    const text41_45 = "昨天晚上我覺得很不舒服， ___（41）___ ，所以很早就睡覺了。今天早上起來， ___（42）___ 。我去看病，醫生說我感冒了，給了我一些藥， ___（43）___ 要多休息，多喝水，才會快點好。這幾天的天氣一會兒熱，一會兒冷， ___（44）___ 。我要___（45） ___，不要再感冒了。";

    questions.forEach(question => {
        // Part 3: 31-35 (Shared Image)
        if (question.id === 31) {
            questionsHTML += `
                <div class="context-container">
                    <img src="images/31-35.png" alt="Reference for questions 31-35">
                </div>`;
        }
        
        // Part 4: 36-40 (Shared Image)
        if (question.id === 36) {
            questionsHTML += `
                <div class="context-container">
                    <img src="images/36-40.png" alt="Reference for questions 36-40">
                </div>`;
        }

        // Part 4: 41-45 (Reading Passage)
        if (question.id === 41) {
            questionsHTML += `
                <div class="context-container">
                    <div class="reading-passage">${text41_45}</div>
                </div>`;
        }

        questionsHTML += createStandardQuestion(question);
    });
    
    questionContainer.innerHTML = questionsHTML;
    
    // Add click listeners
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', (e) => {
            const questionId = parseInt(e.currentTarget.dataset.questionId);
            const selectedOption = e.currentTarget.dataset.option;
            
            // Remove previous selection visual
            document.querySelectorAll(`.option[data-question-id="${questionId}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selection visual
            e.currentTarget.classList.add('selected');
            
            // Save answer
            userAnswers[questionId] = selectedOption;
        });
    });
    
    // Restore previous answers
    questions.forEach(question => {
        if (userAnswers[question.id]) {
            const selectedOption = document.querySelector(`.option[data-question-id="${question.id}"][data-option="${userAnswers[question.id]}"]`);
            if (selectedOption) {
                selectedOption.classList.add('selected');
            }
        }
    });
}

function createStandardQuestion(question) {
    const isSharedImageRange = (question.id >= 31 && question.id <= 40);
    const showImageInCard = question.image && !isSharedImageRange;
    const showOptionLetter = question.part !== 1;

    return `
        <div class="question-item">
            <div class="question-text">${question.id}. ${question.question}</div>
            ${showImageInCard ? `
                <div class="question-image">
                    <img src="${question.image}" alt="Question ${question.id} Image">
                </div>
            ` : ''}
            <div class="options">
                ${question.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    return `
                        <div class="option" data-question-id="${question.id}" data-option="${optionLetter}">
                            ${showOptionLetter ? `<span class="option-letter">${optionLetter}</span>` : ''}
                            <span class="option-text">${option}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function updateNavigationButtons() {
    const isFirstPart = currentPartIndex === 0;
    const isLastPart = currentPartIndex === currentParts.length - 1;
    
    prevBtn.style.display = isFirstPart ? 'none' : 'block';
    
    if (isLastPart) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
    
    if (currentParts.length > 1) {
        prevBtn.textContent = 'Previous Part';
        nextBtn.textContent = 'Next Part';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    }
}

function showPreviousPart() {
    if (currentPartIndex > 0) {
        currentPartIndex--;
        showCurrentPart();
    }
}

function showNextPart() {
    if (currentPartIndex < currentParts.length - 1) {
        currentPartIndex++;
        showCurrentPart();
    }
}

function submitQuiz() {
    let totalScore = 0;
    let totalQuestions = 0;
    const partScores = {};

    // Calculate Scores
    currentParts.forEach(part => {
        const partQuestions = questionsByPart[part];
        const partTotal = partQuestions.length;
        let partScore = 0;
        
        partQuestions.forEach(question => {
            totalQuestions++;
            if (userAnswers[question.id] === question.answer) {
                partScore++;
                totalScore++;
            }
        });
        
        partScores[part] = {
            score: partScore,
            total: partTotal,
            percentage: Math.round((partScore / partTotal) * 100)
        };
    });
    
    // Display Scores
    scoreElement.textContent = totalScore;
    totalElement.textContent = totalQuestions;
    submitTimeElement.textContent = new Date().toLocaleString();
    
    // Show Part Breakdown (Bottom)
    showPartBreakdown(partScores);
    
    // Reset Filter and Render
    currentFilter = 'all';
    // Reset buttons visual
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if(btn.dataset.filter === 'all') btn.classList.add('active');
    });

    renderFilteredResults();
    
    // UI Switch
    quizContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function showPartBreakdown(partScores) {
    partBreakdownElement.innerHTML = '<h4>Performance by Part</h4>';
    
    currentParts.forEach(part => {
        const scoreInfo = partScores[part];
        const breakdownItem = document.createElement('div');
        breakdownItem.className = 'breakdown-item';
        
        breakdownItem.innerHTML = `
            <strong>${partInfo[part].name}</strong>
            <div>Score: ${scoreInfo.score} / ${scoreInfo.total} (${scoreInfo.percentage}%)</div>
        `;
        
        partBreakdownElement.appendChild(breakdownItem);
    });
}

function renderFilteredResults() {
    resultsDetails.innerHTML = '';
    
    // Gather all relevant questions into a flat list for rendering
    let allRelevantQuestions = [];
    currentParts.forEach(part => {
        questionsByPart[part].forEach(q => {
             // Attach part info for display
             q._partName = partInfo[part].name;
             allRelevantQuestions.push(q);
        });
    });

    const filtered = allRelevantQuestions.filter(q => {
        const uAns = userAnswers[q.id];
        const isCorrect = uAns === q.answer;
        const isUnanswered = uAns === undefined;

        if (currentFilter === 'all') return true;
        if (currentFilter === 'correct') return isCorrect;
        if (currentFilter === 'wrong') return !isCorrect && !isUnanswered;
        if (currentFilter === 'unanswered') return isUnanswered;
        return true;
    });

    if (filtered.length === 0) {
        resultsDetails.innerHTML = '<p style="text-align:center; color:#7f8c8d; padding:20px;">No questions found for this filter.</p>';
        return;
    }

    filtered.forEach(question => {
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer === question.answer;
        const isAnswered = userAnswer !== undefined;
        
        const resultItem = document.createElement('div');
        let statusClass = '';
        if (isCorrect) statusClass = 'correct';
        else if (!isAnswered) statusClass = 'unanswered';
        else statusClass = 'incorrect';

        resultItem.className = `result-item ${statusClass}`;
        
        let statusText = '';
        if (isCorrect) statusText = '✅ Correct';
        else if (isAnswered) statusText = '❌ Incorrect';
        else statusText = '⚠️ Unanswered';
        
        const userAnswerText = userAnswer ? `Your Answer: ${userAnswer}` : 'Not Answered';
        
        resultItem.innerHTML = `
            <div class="result-question">
                 ${question.id}. ${question.question}
            </div>
             <div class="result-answer" style="margin-top:5px;">
                <strong>${statusText}</strong> <br>
                ${!isCorrect ? `<span>${userAnswerText}</span> | ` : ''}
                <span>Correct Answer: ${question.answer}</span>
            </div>
        `;
        
        resultsDetails.appendChild(resultItem);
    });
}

function restartQuiz() {
    resultsContainer.classList.add('hidden');
    partSelection.classList.remove('hidden');
    
    document.querySelectorAll('.part-checkbox input').forEach(checkbox => {
        checkbox.checked = false;
    });
    updateStartButton();
    
    currentParts = [];
    currentPartIndex = 0;
    userAnswers = {};
    questionsByPart = {};
}

// Initialize
updateStartButton();