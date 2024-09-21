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
                const textareas = newRow.getElementsByTagName('textarea'); // Get textarea elements
                textareas[0].value = columns[0].trim();
                textareas[1].value = columns[1].trim();

                formRows.appendChild(newRow);
            }
        }
    });
    saveState();
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
        const textareas = row.getElementsByTagName('textarea');
        const container = row.querySelector('.input-container');
        const priority = container ? parseInt(container.dataset.priority) || 0 : 0;
        if (textareas.length === 2) {
            data.push({
                column1: textareas[0].value,
                column2: textareas[1].value,
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
            const textareas = newRow.getElementsByTagName('textarea');
            textareas[0].value = row.column1;
            textareas[1].value = row.column2;

            formRows.appendChild(newRow);
        });

        sortRowsByPriority();
        displayRows();
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




document.addEventListener('DOMContentLoaded', function() {
    loadState();
    sortRowsByPriority();
    displayRows();
    updateExistingRows();
    const darkModeButton = document.querySelector('.button-row button:nth-child(5)');
    darkModeButton.addEventListener('click', toggleDarkMode);

    const savedDarkMode = loadDarkModePreference();
    applyDarkMode(savedDarkMode);
    addClickListenersToExistingRows();
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
        const textareas = row.getElementsByTagName('textarea');
        if (textareas.length === 2) {
            const rowValues = [textareas[0].value, textareas[1].value].map(value => `"${value.replace(/"/g, '""')}"`); 
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

function createNewRow(index, priority = 0) {
    const newRow = document.createElement('div');
    newRow.className = 'row';

    const input1Container = document.createElement('div');
    input1Container.className = `input-container priority-${priority}`;
    input1Container.dataset.priority = priority;

    const textarea1 = document.createElement('textarea');
    textarea1.name = `input${index}-1`;
    textarea1.placeholder = `Input ${index}-1`;

    const textarea2 = document.createElement('textarea');
    textarea2.name = `input${index}-2`;
    textarea2.className = "input-container";
    textarea2.placeholder = `Input ${index}-2`;

    // Hidden file input for image upload
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.className = 'image-upload';
    imageInput.style.display = 'none'; // Hide the default input
    imageInput.addEventListener('change', handleImageUpload);

    // Custom button to trigger file input
    const imageUploadButton = createButton('🖼️', 'image-upload-btn circle-button', () => imageInput.click());

    const removeButton = createButton('🗑️', 'remove-button circle-button', () => {
        newRow.remove();  // Remove the current row
        saveState();  // Save the new state after removal
    });

    const dictionaryButton = createButton('📖', 'dictionary-button circle-button');
    const llmElaborateButton = createButton('💠', 'llm-elaborate-button circle-button');
    const priorityButton = createButton(getPrioritySymbol(priority), 'priority-button circle-button');

    // LLM Elaborate logic
    llmElaborateButton.addEventListener('click', () => {
        const rightCellTextarea = newRow.querySelector(`textarea[name="input${index}-2"]`);
        const leftCellTextarea = newRow.querySelector(`textarea[name="input${index}-1"]`);
        if (rightCellTextarea && leftCellTextarea) {
            let left_right_text = "word" + leftCellTextarea.value + 'definition' + rightCellTextarea.value;
            const text = 'This text is explanation for a word' + left_right_text +
                ' provide 2 more example (used in a sentence) in the following format (do not say anything else besides the format below):\n' +
                'Ex1: [example]\n' + 'Ex2: [example]\n';
            callOpenAIAPI(text).then(response => {
                const res = response;
                let modifiedText = rightCellTextarea.value + '\n' + res;
                rightCellTextarea.value = modifiedText;
            });
        }
    });

    input1Container.appendChild(textarea1);
    input1Container.appendChild(removeButton);
    input1Container.appendChild(dictionaryButton);
    input1Container.appendChild(imageUploadButton);
    input1Container.appendChild(imageInput);  // Add the hidden image input
    input1Container.appendChild(llmElaborateButton);
    input1Container.appendChild(priorityButton);

    newRow.appendChild(input1Container);
    newRow.appendChild(textarea2);

    // Add event listeners for expanding rows
    textarea1.addEventListener('click', () => toggleRowExpansion(newRow, 'left'));
    textarea2.addEventListener('click', () => toggleRowExpansion(newRow, 'right'));

    addPriorityClickHandler(priorityButton, input1Container);
    addDictionaryClickHandler(dictionaryButton, textarea1);

    return newRow;
}

// Helper function to create buttons
function createButton(innerHTML, className, onClick) {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = innerHTML;
    if (onClick) {
        button.addEventListener('click', onClick);
    }
    return button;
}



function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'uploaded-image';
            event.target.parentElement.appendChild(img);
        };
        reader.readAsDataURL(file);
    }
}

function extractWordDefinitionExample(text) {
    // Regular expressions to match the content after each keyword
    const wordRegex = /word:\s*(.*?)(?=\s+definition:|\s*$)/i;
    const definitionRegex = /definition:\s*(.*?)(?=\s+example:|\s*$)/i;
    const exampleRegex = /example:\s*(.*)/i;

    // Extract the contents using the regular expressions
    const wordMatch = text.match(wordRegex);
    const definitionMatch = text.match(definitionRegex);
    const exampleMatch = text.match(exampleRegex);

    // Get the matched groups or set to empty string if not found
    const word = wordMatch ? wordMatch[1].trim() : '';
    const definition = definitionMatch ? definitionMatch[1].trim() : '';
    const example = exampleMatch ? exampleMatch[1].trim() : '';

    // Create the strings
    const wordString = `${word}`;
    const definitionExampleString = `Definition: ${definition} \nExample: ${example}`;



    // If you need to return them as an object or array
    return { wordString, definitionExampleString };
}




document.getElementById('star-btn').addEventListener('click', function() {
    const priority2Containers = document.querySelectorAll('.input-container.priority-2');
    let textValues = [];
    priority2Containers.forEach(container => {
        const textarea = container.querySelector('textarea');
        if (textarea) {
            textValues.push(textarea.value.trim()); 
        }
    });
    var resultString = 'Here are the list of words in my vocabulary practice list. ' + textValues.join(', ')  +
    '.\nFirst Identify the overall difficulty of words that whether they are in beginner level, intermidiate or advanced.' +
    'Then suggest a word in the same difficulty level.' +
    'Your response should be in this format and only for the suggested word:\n' +
    'word: [the word]\ndefinition: [definition]\nexample: [example]'
   
    callOpenAIAPI(resultString).then(response => {
        const text = response;
        const { wordString, definitionExampleString } = extractWordDefinitionExample(text);
        console.log(wordString); 
        console.log(definitionExampleString);
        addExtractedRow(wordString, definitionExampleString);
    });



});

function addExtractedRow(wordString, definitionExampleString) {
    const formRows = document.getElementById('form-rows');
    const newRow = createNewRow(formRows.children.length + 1);
    const textareas = newRow.getElementsByTagName('textarea');
    if (textareas.length === 2) {
        textareas[0].value = wordString; 
        textareas[1].value = definitionExampleString; 
    }

    formRows.appendChild(newRow);
    saveState();
}


async function callOpenAIAPI(prompt) {
    const apiKey = ""; // Replace with your OpenAI API key
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    
    const requestBody = {
        model: "gpt-4o-mini-2024-07-18",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return null;
    }
}



function toggleRowExpansion(row, side) {
    const leftCell = row.querySelector('.input-container');

    if (side === 'right' && !row.classList.contains('right-expanded')) {
        row.classList.add('right-expanded');
        leftCell.classList.add('disable-hover');
    } else if (side === 'left' && row.classList.contains('right-expanded')) {
        row.classList.remove('right-expanded');
        leftCell.classList.remove('disable-hover'); 
    }
}


function addClickListenersToExistingRows() {
    const rows = document.querySelectorAll('.row');
    rows.forEach(row => {
        const leftTextarea = row.querySelector('.input-container textarea');
        const rightTextarea = row.querySelector('textarea:last-child');
        
        leftTextarea.addEventListener('click', () => toggleRowExpansion(row, 'left'));
        rightTextarea.addEventListener('click', () => toggleRowExpansion(row, 'right'));
    });
}

function updateExistingRows() {
    const rows = document.querySelectorAll('.row');
    rows.forEach((row, index) => {
        const leftCell = row.querySelector('.input-container');
        const rightCell = row.querySelector('textarea:last-child');
        const existingButtons = row.querySelectorAll('.circle-button');

        // Move existing buttons to the left cell if they're not already there
        existingButtons.forEach(button => {
            if (button.parentElement !== leftCell) {
                leftCell.appendChild(button);
            }
        });

        // Add new buttons if they don't exist
        if (!leftCell.querySelector('.remove-button')) {
            leftCell.appendChild(createButton('🗑️', 'remove-button circle-button', () => {
                row.remove();
                saveState();
            }));
        }
        if (!leftCell.querySelector('.llm-elaborate-button')) {
            leftCell.appendChild(createButton('💠', 'llm-elaborate-button circle-button'));
        }

        // Update event listeners
        leftCell.querySelector('textarea').addEventListener('click', () => toggleRowExpansion(row, 'left'));
        rightCell.addEventListener('click', () => toggleRowExpansion(row, 'right'));
    });
}