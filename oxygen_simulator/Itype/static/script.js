
let variantEnabled = false;

function updateConfig(type, isChecked) {
    switch (type) {
        case 'variant':
            variantEnabled = isChecked;
            break;
    }
}
function updateRegisterValues(data) {
    data.forEach((value, index) => {
        document.getElementById(`reg-${index}`).innerText = `0x${value.toString(16).padStart(8, '0')}`;
    });
}
let memorydic = {}
function assembleCode() {
    // const code = document.getElementById('editor-container').value;
    code = document.getElementsByClassName('codeEditor')[0].value
    let hehe
    let base
    let registers
    axios.post('assemble-code', { code: code })
            .then(response => {
                const hex = response.data.hex;
                console.log("hello" ,hex)
                const memory = response.data.memory
                memorydic = memory

                console.log(hex)
                const baseins = response.data.is_sudo
                const reg = response.data.registers
                console.log(baseins)
                hehe = hex
                base = baseins
                console.log(reg)
                registers = reg
                document.getElementById('hexDump').value = hex;
                populateDecoderTable(code,hehe,base);
                updateRegisterValues(registers)
                populateMemoryTable(memory)
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    console.log(code)
    
    const hexDump = "Generated Hex Dump";
    document.getElementById('hexDump').value = hexDump;
    
    
}

function dumpHex() {
}

function copyHex() {
    const hexDump = document.getElementById('hexDump').value;
    navigator.clipboard.writeText(hexDump).then(() => {
        alert("Hex dump copied to clipboard!");
    });
}

function downloadHex() {
    const hexDump = document.getElementById('hexDump').value;
    const blob = new Blob([hexDump], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hex_dump.txt';
    link.click();
}

function clearHex() {
    document.getElementById('hexDump').value = '';
}

function populateDecoderTable(code,hex_dump,baseins) {
    const instructions = code.split('\n').filter(line => line.trim() !== '');
    console.log(instructions)
    const tableBody = document.getElementById('decoderTableBody');
    const tableBody2 = document.getElementById('adecoderTableBody');
    console.log("table" , tableBody);
    console.log("table 2 " , tableBody2);
    tableBody.innerHTML = '';
    tableBody2.innerHTML = '';
    let count = 0

    instructions.forEach((instruction, index) => {
        const pc = `0x${(index * 4).toString(16)}`;
        let hexdumparr = hex_dump.split('\n').filter(line => line.trim() !== '')
        
        console.log((hexdumparr));
        const machineCode = hexdumparr[count];
        const basicCode = baseins[count]; 
        const originalCode = instruction;

        const row = document.createElement('tr');
        const row2 = document.createElement('tr');
        row.innerHTML = `
            <td>${pc}</td>
            <td>${machineCode}</td>
            <td>${basicCode}</td>
            <td>${originalCode}</td>
        `;
        row2.innerHTML = `
            <td>${pc}</td>
            <td>${machineCode}</td>
            <td>${basicCode}</td>
            <td>${originalCode}</td>
        `;
        tableBody.appendChild(row);
        tableBody2.appendChild(row2);
        
        count = count +1
    });
}

function stepInstruction() {
    // Logic to step through instructions
}

// function advanceCycle() {
//     axios.post('/5-stage/')
//     .then(response => {

//     // Call your Python method to advance the pipeline cycle and update the UI
//     // This is a placeholder for the interaction between frontend and backend
//     // Typically, you would use an AJAX request to communicate with the backend

//     // Example: Update UI based on new pipeline state
//     document.getElementById('fetch-step').textContent = "Updated Fetch Step";
//     document.getElementById('decode-step').textContent = "Updated Decode Step";
//     document.getElementById('execute-step').textContent = "Updated Execute Step";
//     document.getElementById('memory-step').textContent = "Updated Memory Step";
//     document.getElementById('writeback-step').textContent = "Updated Write Back Step";
// }

// Function to populate memory table
let memoryAddress = 0; // Initial memory address
let memoryValues = {}; // Dictionary of memory values

// Function to populate memory table
function populateMemoryTable(data) {
    const tableBody = document.getElementById('memoryTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Make AJAX call to Django backend to retrieve memory values
    
            memoryValues = data; // Update memory values dictionary
            for (let i = 0; i < 10; i++) { // Display 10 rows
                const addr1 = memoryAddress + (i * 4);
                const addr2 = memoryAddress + (i);
                console.log(memoryValues)
                console.log()
                const value = memoryValues[addr2] || 0; // Get value from dictionary or default to 0
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>0x${addr1.toString(16)}</td>
                    <td>0x${(memoryValues[addr1] || 0).toString(16)}</td>
                    <td>0x${(memoryValues[addr1+1] || 0)}</td>
                    <td>0x${(memoryValues[addr1+2] || 0)}</td>
                    <td>0x${(memoryValues[addr1+3] || 0)}</td>
                `;
                tableBody.appendChild(row);
                
            }
        ;
}

// Scroll up button click handler
document.getElementById('scrollUpBtn').addEventListener('click', () => {
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (memoryAddress <= 0) {
        scrollUpBtn.disabled = true; // Disable scroll up button
        scrollUpBtn.classList.add('disabled');
    } else {
        memoryAddress -= 16; // Decrement memory address by 16
        populateMemoryTable(memorydic);
        scrollUpBtn.disabled = false; // Enable scroll up button
        scrollUpBtn.classList.remove('disabled');
    }
});

// Scroll down button click handler
document.getElementById('scrollDownBtn').addEventListener('click', () => {
    memoryAddress += 16; // Increment memory address by 16
    populateMemoryTable(memorydic);
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (memoryAddress > 0) {
        scrollUpBtn.disabled = false; // Enable scroll up button
        scrollUpBtn.classList.remove('disabled');
    }
});

// Initialize memory table
