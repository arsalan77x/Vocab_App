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

document.getElementById('save-btn').addEventListener('click', function () {
    saveState(); 
    showSaveNotification(); 
});

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
    displayRows();
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
                const newRow = document.createElement('div');
                newRow.className = 'row';

                const input1 = document.createElement('input');
                input1.type = 'text';
                input1.name = `input${index + 1}-1`;
                input1.value = columns[0].trim(); 
                const input2 = document.createElement('input');
                input2.type = 'text';
                input2.name = `input${index + 1}-2`;
                input2.value = columns[1].trim(); 

                newRow.appendChild(input1);
                newRow.appendChild(input2);

                formRows.appendChild(newRow);
            }
        }
    });
    displayRows(); 
}

// Update the add row button event listener
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
        const priority = parseInt(container.dataset.priority);
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
        formRows.innerHTML = ''; // Clear any existing rows

        data.forEach((row, index) => {
            const newRow = createNewRow(index + 1, row.priority);
            const inputs = newRow.getElementsByTagName('input');
            inputs[0].value = row.column1;
            inputs[1].value = row.column2;

            formRows.appendChild(newRow);
        });
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

    const button1 = document.createElement('button');
    button1.className = 'circle-button';
    button1.innerHTML = getPrioritySymbol(priority);

    input1Container.appendChild(input1);
    input1Container.appendChild(button1);

    const input2 = document.createElement('input');
    input2.type = 'text';
    input2.name = `input${index}-2`;
    input2.placeholder = `Input ${index}-2`;

    newRow.appendChild(input1Container);
    newRow.appendChild(input2);

    addHoverEffect(input1Container);
    addPriorityClickHandler(button1, input1Container);

    return newRow;
}

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
        case 0: return '○';
        case 1: return '◔';
        case 2: return '●';
        default: return '○';
    }
}





function initializeHoverEffects() {
    const inputContainers = document.querySelectorAll('.input-container');
    inputContainers.forEach(addHoverEffect);
}


document.addEventListener('DOMContentLoaded', function() {
    loadState();
    displayRows();
    initializeHoverEffects();
});