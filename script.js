const rowsPerPage = 10;
let currentPage = 1;

function displayRows() {
    const formRows = document.getElementById('form-rows').children;
    const totalRows = formRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    for (let i = 0; i < totalRows; i++) {
        formRows[i].style.display = 'none';
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalRows);
    for (let i = start; i < end; i++) {
        formRows[i].style.display = 'flex';
    }

    updatePagination(totalPages);
}

function updatePagination(totalPages) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    paginationNumbers.innerHTML = '';

    if (totalPages <= 1) return;

    addPaginationButton(1);
    if (currentPage > 3) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        paginationNumbers.appendChild(ellipsis);
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        addPaginationButton(i);
    }

    if (currentPage < totalPages - 2) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        paginationNumbers.appendChild(ellipsis);
    }

    addPaginationButton(totalPages);
}

function addPaginationButton(pageNumber) {
    const paginationNumbers = document.getElementById('pagination-numbers');
    const button = document.createElement('span');
    button.classList.add('pagination-number');
    
    if (pageNumber === currentPage) {
        button.classList.add('active');
    }

    button.textContent = pageNumber;
    button.addEventListener('click', () => {
        currentPage = pageNumber;
        displayRows();
        updatePagination(Math.ceil(document.getElementById('form-rows').children.length / rowsPerPage)); 
    });

    paginationNumbers.appendChild(button);
}




document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayRows();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const formRows = document.getElementById('form-rows').children;
    const totalRows = formRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayRows();
    }
});




document.getElementById('browse-btn').addEventListener('click', function() {
    document.getElementById('csvFileInput').click();
});

document.getElementById('clear-btn').addEventListener('click', clearState);


document.getElementById('shuffle-btn').addEventListener('click', shuffleRows);

function shuffleRows() {
    const formRows = document.getElementById('form-rows');
    const rowsArray = Array.from(formRows.children);

    for (let i = rowsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rowsArray[i], rowsArray[j]] = [rowsArray[j], rowsArray[i]];
    }

    formRows.innerHTML = '';
    rowsArray.forEach(row => formRows.appendChild(row));

    saveState();
    sortRowsByPriority();
    displayRows();
}


function sortRowsByPriority() {
    const formRows = document.getElementById('form-rows');
    const rowsArray = Array.from(formRows.children);

    rowsArray.sort((a, b) => {
        const priorityA = parseInt(a.querySelector('.input-container').dataset.priority);
        const priorityB = parseInt(b.querySelector('.input-container').dataset.priority);

        if (priorityA === 2 && priorityB !== 2) return -1;
        if (priorityA !== 2 && priorityB === 2) return 1;
        if (priorityA === 1 && priorityB !== 1) return 1;
        if (priorityA !== 1 && priorityB === 1) return -1;
        return 0;
    });

    formRows.innerHTML = '';
    rowsArray.forEach(row => formRows.appendChild(row));
}

document.getElementById('csvFileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            parseCSV(text);
        };
        reader.readAsText(file);
    }
});

function parseCSV(text) {
    const rows = text.split('\n');
    const formRows = document.getElementById('form-rows');
    formRows.innerHTML = '';

    rows.forEach((row, index) => {
        if (row.trim() !== '') {
            const columns = row.split(',');

            if (columns.length >= 2) {
                const newRow = createNewRow(index + 1); // Use createNewRow to ensure consistent structure
                const inputs = newRow.getElementsByTagName('input');
                inputs[0].value = columns[0].trim();
                inputs[1].value = columns[1].trim();

                formRows.appendChild(newRow);
            }
        }
    });
    sortRowsByPriority();
    displayRows();
}

document.getElementById('add-row-btn').addEventListener('click', function () {
    const formRows = document.getElementById('form-rows');
    const newRow = createNewRow(formRows.children.length + 1);
    formRows.appendChild(newRow);
    saveState();
});



document.getElementById('remove-row-btn').addEventListener('click', function () {
    const formRows = document.getElementById('form-rows');
    if (formRows.children.length > 0) {
        formRows.removeChild(formRows.lastElementChild);
    }
    saveState();
});


document.getElementById('form-rows').addEventListener('input', function () {
    saveState(); 
});

function saveState() {
    const formRows = document.getElementById('form-rows');
    const data = [];

    for (let row of formRows.children) {
        const inputs = row.getElementsByTagName('input');
        const container = row.querySelector('.input-container');
        const priority = container ? parseInt(container.dataset.priority) || 0 : 0;
        if (inputs.length === 2) {
            data.push({
                column1: inputs[0].value,
                column2: inputs[1].value,
                priority: priority
            });
        }
    }

    localStorage.setItem('formData', JSON.stringify(data));
}
    
function loadState() {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
        const data = JSON.parse(savedData);
        const formRows = document.getElementById('form-rows');
        formRows.innerHTML = ''; 

        data.forEach((row, index) => {
            const newRow = createNewRow(index + 1, row.priority);
            const inputs = newRow.getElementsByTagName('input');
            inputs[0].value = row.column1;
            inputs[1].value = row.column2;

            formRows.appendChild(newRow);
        });

        sortRowsByPriority();
    }
}



function clearState() {
    localStorage.removeItem('formData');
    location.reload(); 
}

function showSaveNotification() {
    const notification = document.getElementById('save-notification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000); 
}



function addHoverEffect(inputContainer) {
    const button = inputContainer.querySelector('.circle-button');
    
    inputContainer.addEventListener('mouseenter', () => {
        button.style.opacity = '1';
    });

    inputContainer.addEventListener('mouseleave', () => {
        button.style.opacity = '0';
    });
}

let currentPriority = 0;


function addPriorityClickHandler(button, container) {
    button.addEventListener('click', () => {
        let priority = parseInt(container.dataset.priority);
        priority = (priority + 1) % 3;
        container.dataset.priority = priority;
        container.className = `input-container priority-${priority}`;
        button.innerHTML = getPrioritySymbol(priority);
        saveState();
    });
}

function getPrioritySymbol(priority) {
    switch(priority) {
        case 0: return '✔';
        case 1: return '✗';
        case 2: return '✔';
        default: return '✔';
    }
}


function initializeHoverEffects() {
    const inputContainers = document.querySelectorAll('.input-container');
    inputContainers.forEach(addHoverEffect);
}


document.addEventListener('DOMContentLoaded', function() {
    loadState();
    sortRowsByPriority();
    displayRows();
    initializeHoverEffects();
    const darkModeButton = document.querySelector('.button-row button:nth-child(5)');
    darkModeButton.addEventListener('click', toggleDarkMode);

    const savedDarkMode = loadDarkModePreference();
    applyDarkMode(savedDarkMode);
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function saveDarkModePreference(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkModePreference() {
    return localStorage.getItem('darkMode') === 'true';
}

function applyDarkMode(isDarkMode) {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    saveDarkModePreference(isDarkMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const darkBtn = document.getElementById('dark-btn');
    
    darkBtn.addEventListener('click', () => {
        if (darkBtn.textContent.trim() === 'Dark') {
            darkBtn.textContent = 'Light';
        } else {
            darkBtn.textContent = 'Dark';
        }
    });
});

document.getElementById('save-btn').addEventListener('click', function () {
    saveRowsToCSV();
    showSaveNotification(); 
});

function saveRowsToCSV() {
    const formRows = document.getElementById('form-rows');
    let csvContent = "data:text/csv;charset=utf-8,";

    for (let row of formRows.children) {
        const inputs = row.getElementsByTagName('input');
        if (inputs.length === 2) {
            const rowValues = [inputs[0].value, inputs[1].value].map(value => `"${value.replace(/"/g, '""')}"`); 
            csvContent += rowValues.join(",") + "\n";
        }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vocab_data.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}

function createNewRow(index, priority = 0) {
    const newRow = document.createElement('div');
    newRow.className = 'row';

    const input1Container = document.createElement('div');
    input1Container.className = `input-container priority-${priority}`;
    input1Container.dataset.priority = priority;

    const input1 = document.createElement('input');
    input1.type = 'text';
    input1.name = `input${index}-1`;
    input1.placeholder = `Input ${index}-1`;

    const dictionaryButton = document.createElement('button');
    dictionaryButton.className = 'circle-button dictionary-button';
    dictionaryButton.innerHTML = '📖'; 

    const priorityButton = document.createElement('button');
    priorityButton.className = 'circle-button priority-button';
    priorityButton.innerHTML = getPrioritySymbol(priority);

    input1Container.appendChild(input1);
    input1Container.appendChild(dictionaryButton);
    input1Container.appendChild(priorityButton);

    const input2 = document.createElement('input');
    input2.type = 'text';
    input2.name = `input${index}-2`;
    input2.placeholder = `Input ${index}-2`;

    newRow.appendChild(input1Container);
    newRow.appendChild(input2);

    addHoverEffect(input1Container);
    addPriorityClickHandler(priorityButton, input1Container);
    addDictionaryClickHandler(dictionaryButton, input1);

    return newRow;
}

function addDictionaryClickHandler(button, input) {
    button.addEventListener('click', () => {
        const word = input.value.trim();
        if (word) {
            fetchDefinition(word, input);
        } else {
            alert('Please enter a word to look up.');
        }
    });
}

function displayDefinition(word, meanings, phonetics) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const popup = document.createElement('div');
    popup.className = 'definition-popup';
    let content = `<h2>${word}</h2>`;

    // Display only the first available phonetic
    if (phonetics && phonetics.length > 0) {
        const firstPhonetic = phonetics.find(p => p.text || p.audio) || {};
        content += `<div class="phonetics">`;
        if (firstPhonetic.text) {
            content += `<span>${firstPhonetic.text}</span>`;
        }
        if (firstPhonetic.audio) {
            content += `
                <button class="audio-button" onclick="playAudio('${firstPhonetic.audio}')">
                    🔊
                </button>`;
        }
        content += `</div>`;
    }

    meanings.forEach((meaning, index) => {
        content += `<h3>${index + 1}. ${meaning.partOfSpeech}</h3>`;
        content += `<p><strong>Definition:</strong> ${meaning.definitions[0].definition}</p>`;
        if (meaning.definitions[0].example) {
            content += `<p><strong>Example:</strong> "${meaning.definitions[0].example}"</p>`;
        }
    });

    const exitButton = document.createElement('button');
    exitButton.textContent = 'X';
    exitButton.className = 'exit-button';
    exitButton.onclick = () => {
        document.body.removeChild(overlay);
    };

    popup.innerHTML = content;
    popup.appendChild(exitButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}

function playAudio(audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play();
}

function fetchDefinition(word, input) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Word not found');
            }
            return response.json();
        })
        .then(data => {
            const phonetics = data[0].phonetics;
            const meanings = data[0].meanings.slice(0, 3); // Get up to 3 meanings
            displayDefinition(word, meanings, phonetics);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Word not found or an error occurred.');
        });
}