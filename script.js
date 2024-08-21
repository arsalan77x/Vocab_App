document.getElementById('browse-btn').addEventListener('click', function() {
    document.getElementById('csvFileInput').click();
});


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
    formRows.innerHTML = ''; // Clear any existing rows

    rows.forEach((row, index) => {
        if (row.trim() !== '') {
            const columns = row.split(',');

            if (columns.length >= 2) { // Ensure there are at least 2 columns
                const newRow = document.createElement('div');
                newRow.className = 'row';

                const input1 = document.createElement('input');
                input1.type = 'text';
                input1.name = `input${index + 1}-1`;
                input1.value = columns[0].trim(); // First column value

                const input2 = document.createElement('input');
                input2.type = 'text';
                input2.name = `input${index + 1}-2`;
                input2.value = columns[1].trim(); // Second column value

                newRow.appendChild(input1);
                newRow.appendChild(input2);

                formRows.appendChild(newRow);
            }
        }
    });
}

document.getElementById('add-row-btn').addEventListener('click', function () {
    const formRows = document.getElementById('form-rows');
    const newRow = document.createElement('div');
    newRow.className = 'row';

    const input1 = document.createElement('input');
    input1.type = 'text';
    input1.name = `input${formRows.children.length + 1}-1`;
    input1.placeholder = `Input ${formRows.children.length + 1}-1`;

    const input2 = document.createElement('input');
    input2.type = 'text';
    input2.name = `input${formRows.children.length + 1}-2`;
    input2.placeholder = `Input ${formRows.children.length + 1}-2`;

    newRow.appendChild(input1);
    newRow.appendChild(input2);

    formRows.appendChild(newRow);
});

document.getElementById('remove-row-btn').addEventListener('click', function () {
    const formRows = document.getElementById('form-rows');
    if (formRows.children.length > 0) {
        formRows.removeChild(formRows.lastElementChild);
    }
});