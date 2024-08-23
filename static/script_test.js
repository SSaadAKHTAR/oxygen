let timer;
let reg_value = new Array(32).fill(0);
let f_reg_value = [];
let memorydic = {};
let pc = 0;
let memoryAddress = 0; 
let memoryValues = {}; 
let isHex = 'true';
const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = document.querySelector(tab.dataset.tabTarget);
    tabContents.forEach(tabContent => {
      tabContent.classList.remove('active');
    })
    tabs.forEach(tab => {
      tab.classList.remove('active');
    })
    tab.classList.add('active');
    target.classList.add('active');
  })
})


document.addEventListener('input', e => {
  const el = e.target;
  
  if( el.matches('[data-color]') ) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      document.documentElement.style.setProperty(`--color-${el.dataset.color}`, el.value);
    }, 100)
  }
})

var c = document.getElementById('c');
var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    ctx = c.getContext('2d'),

    minDist = 10,
    maxDist = 30,
    initialWidth = 10,
    maxLines = 80,
    initialLines = 10,
    speed = 5,

    lines = [],
    frame = 0,
    timeSinceLast = 0,

    dirs = [
        [0, 1], [1, 0], [0, -1], [-1, 0],
        [0.7, 0.7], [0.7, -0.7], [-0.7, 0.7], [-0.7, -0.7]
    ],
    starter = {
        x: w / 2,
        y: h / 2,
        vx: 0,
        vy: 0,
        width: initialWidth
    };

function init() {
    lines.length = 0;

    for (var i = 0; i < initialLines; ++i)
        lines.push(new Line(starter));

    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, w, h);
}

function getColor(x) {
    return 'hsl(hue, 50%, 50%)'.replace('hue', x / w * 360 + frame);
}

function anim() {
    window.requestAnimationFrame(anim);

    ++frame;

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.02)';
    ctx.fillRect(0, 0, w, h);
    ctx.shadowBlur = .5;

    for (var i = 0; i < lines.length; ++i)
        if (lines[i].step()) {
            lines.splice(i, 1);
            --i;
        }

    ++timeSinceLast;

    if (lines.length < maxLines && timeSinceLast > 10 && Math.random() < .5) {
        timeSinceLast = 0;
        lines.push(new Line(starter));

        ctx.fillStyle = ctx.shadowColor = getColor(starter.x);
        ctx.beginPath();
        ctx.arc(starter.x, starter.y, initialWidth, 0, Math.PI * 2);
        ctx.fill();
    }
}

function Line(parent) {
    this.x = parent.x | 0;
    this.y = parent.y | 0;
    this.width = parent.width / 1.25;

    do {
        var dir = dirs[(Math.random() * dirs.length) | 0];
        this.vx = dir[0];
        this.vy = dir[1];
    } while (
        (this.vx === -parent.vx && this.vy === -parent.vy) || (this.vx === parent.vx && this.vy === parent.vy)
    );

    this.vx *= speed;
    this.vy *= speed;
    this.dist = (Math.random() * (maxDist - minDist) + minDist);
}

Line.prototype.step = function () {
    var dead = false;
    var prevX = this.x,
        prevY = this.y;

    this.x += this.vx;
    this.y += this.vy;

    --this.dist;

    if (this.x < 0 || this.x > w || this.y < 0 || this.y > h)
        dead = true;

    if (this.dist <= 0 && this.width > 1) {
        this.dist = Math.random() * (maxDist - minDist) + minDist;

        if (lines.length < maxLines) lines.push(new Line(this));
        if (lines.length < maxLines && Math.random() < .5) lines.push(new Line(this));

        if (Math.random() < .2) dead = true;
    }

    ctx.strokeStyle = ctx.shadowColor = getColor(this.x);
    ctx.beginPath();
    ctx.lineWidth = this.width;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(prevX, prevY);
    ctx.stroke();

    if (dead) return true;
}


init();
anim();


window.addEventListener('resize', function () {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    starter.x = w / 2;
    starter.y = h / 2;
    init();
});


function showRestText() {
    var restText = document.getElementById('rest-text');
    restText.classList.add('show');
}


setTimeout(showRestText, 1000); // Show the rest of the text after 1 second


function hideSplashScreen() {
    var splashScreen = document.getElementById('splash_screen');
    splashScreen.classList.add('fade-out');
    splashScreen.addEventListener('animationend', removeSplashScreen); // Remove splash screen after fade-out animation ends
}


function removeSplashScreen() {
    var splashScreen = document.getElementById('splash_screen');
    splashScreen.remove();
    showMainContent();
}


function showMainContent() {
    var mainContent = document.getElementById('main-content');
    mainContent.classList.add('show');
}

setTimeout(hideSplashScreen, 0);


function assemble_code() {
    // const code = document.getElementById('editor-container').value;
    code = document.getElementById('editor-text-box').value
    console.log(code)
    axios.post('gen-hex/assemble-code', { code: code })
            .then(response => {
                if(response.data.success){
                    const hex = response.data.hex;
                    const baseins = response.data.is_sudo
                    populate_Decoder_Table(code,hex,baseins);
                    document.getElementById('dump-box').value = hex;
                }else{
                    alert("Error: " + response.data.error);
                }
            })
            .catch(error => {
                console.error('There was an error!', error);
            })
}


function copy_hex() {
    const hexDump = document.getElementById('dump-box').value;
    navigator.clipboard.writeText(hexDump).then(() => {
        alert("Hex dump copied to clipboard!");
    });
}


function download_hex() {
    const hexDump = document.getElementById('dump-box').value;
    const blob = new Blob([hexDump], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hex_dump.txt';
    link.click();
}


function clear_hex() {
    document.getElementById('dump-box').value = '';
}


function reset_editor(){
    document.getElementById('editor-text-box').value = ''
}


function populate_Decoder_Table(code,hex,baseins){
    let instructions = code.split('\n').filter(line => line.trim() !== '');
    instructions = instructions.filter((ins) => !ins.includes(':'));
    console.log(instructions)
    const tableBody = document.getElementById('decoderTableBody');
    console.log("table" , tableBody);
    tableBody.innerHTML = '';
    let count = 0
    instructions.forEach((instruction, index) => {
        const pc = `0x${(index * 4).toString(16)}`;
        let hexdumparr = hex.split('\n').filter(line => line.trim() !== '')
        console.log((hexdumparr));
        const machineCode = hexdumparr[count];
        const basicCode = baseins[count]; 
        const originalCode = instruction;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pc}</td>
            <td>${machineCode}</td>
            <td>${basicCode}</td>
            <td>${originalCode}</td>
        `;
        tableBody.appendChild(row);
        count = count +1;
    });
}


function update_Register_Values(data, isHex='true') {
    console.log(data);
    data.forEach((value, index) => {
        const formattedValue = isHex ? `0x${(value >>> 0).toString(16).padStart(8, '0')}` : value.toString(10);
        document.getElementById(`reg-${index}`).innerText = formattedValue;
    });
}

function update_FRegister_Values(data, isHex='true') {
    data.forEach((value, index) => {
        const formattedValue = isHex ? `0x${(value >>> 0).toString(16).padStart(8, '0')}` : value.toString(10);
        document.getElementById(`freg-${index}`).innerText = formattedValue;
    });
}


function changeNotation(notation) {
    isHex = notation === 'hex';
    console.log("check reg",reg_value);
    populate_Memory_Table(memorydic, isHex);
    update_Register_Values(reg_value, isHex);
    update_FRegister_Values(f_reg_value, isHex);
}


function populate_Memory_Table(data,isHex='true') {
    const tableBody = document.getElementById('memoryTableBody');
    tableBody.innerHTML = ''; // Clear existing rows

    
            memoryValues = data; 
            for (let i = 0; i < 10; i++) { 
                const addr1 = memoryAddress + (i * 4);
                const addr2 = memoryAddress + (i);
                const value = memoryValues[addr2] || 0; 
                const row = document.createElement('tr');
                const formatValue = (value) => isHex ? `0x${value.toString(16)}` : value.toString(10);

                row.innerHTML = `
                    <td>${formatValue(addr1)}</td>
                    <td>${formatValue(memoryValues[addr1] || 0)}</td>
                    <td>${formatValue(memoryValues[addr1+1] || 0)}</td>
                    <td>${formatValue(memoryValues[addr1+2] || 0)}</td>
                    <td>${formatValue(memoryValues[addr1+3] || 0)}</td>
                `;
                tableBody.appendChild(row);
            }
        ;
}



function reset_Registers (){
    axios.post('reset', {
    })
    .then(response => {
        const currentInstructionRow = document.getElementById('decoderTableBody').rows[pc/4];
        if (currentInstructionRow) {
            currentInstructionRow.classList.remove('highlight'); // Add highlight class
        }
        const newPc = response.data.pc;
        memorydic = response.data.memory
        console.log(memorydic)
        reg_value = response.data.register
        f_reg_value = response.data.f_register
        console.log(reg_value)
        pc = newPc;
        console.log(pc)
        populate_Memory_Table(memorydic,isHex)
        update_Register_Values(reg_value,isHex)
        update_FRegister_Values(f_reg_value,isHex)
    })
}


function stepInstruction() {
    const currentInstruction = document.getElementById('decoderTableBody').rows[pc/4].cells[1].textContent;
    console.log(currentInstruction)
    const currentInstructionRow = document.getElementById('decoderTableBody').rows[pc/4];
    if (currentInstructionRow) {
        currentInstructionRow.classList.add('highlight'); // Add highlight class
    }
    axios.post('step', {
      instruction: currentInstruction,
      pc: pc,
      memory:memorydic,
      register : reg_value,
      f_register : f_reg_value
    })
    .then(response => {
        const newPc = response.data.pc;
        memorydic = response.data.memory
        reg_value = response.data.register
        f_reg_value = response.data.f_reg
        console.log("returned reg val",reg_value)
        pc = newPc;
        console.log(pc)
        if (currentInstructionRow) {
        currentInstructionRow.classList.remove('highlight');
        }
        const newInstructionRow = document.getElementById('decoderTableBody').rows[pc/4];
        if (newInstructionRow) {
            newInstructionRow.classList.add('highlight');
        }
        populate_Memory_Table(memorydic,isHex)
        update_Register_Values(reg_value,isHex)
    })
    .catch(error => {
      console.error(error);
    });
}




function run_Code() {
    // const code = document.getElementById('editor-container').value;
    code = document.getElementById('editor-text-box').value
    axios.post('run-code', { code: code })
            .then(response => {
                const hex = response.data.hex;
                const memory = response.data.memory
                memorydic = memory
                const baseins = response.data.is_sudo
                const reg = response.data.registers
                const freg = response.data.f_reg
                reg_value = reg
                f_reg_value = freg
                populate_Decoder_Table(code,hex,baseins);
                update_Register_Values(reg,isHex)
                update_FRegister_Values(freg,isHex)
                populate_Memory_Table(memory,isHex)
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    console.log(code)
    
}
document.getElementById('scrollUpBtn').addEventListener('click', () => {
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (memoryAddress <= 0) {
        scrollUpBtn.disabled = true; // Disable scroll up button
        scrollUpBtn.classList.add('disabled');
    } else {
        memoryAddress -= 16; // Decrement memory address by 16
        populate_Memory_Table(memorydic,isHex);
        scrollUpBtn.disabled = false; // Enable scroll up button
        scrollUpBtn.classList.remove('disabled');
    }
});


document.getElementById('scrollDownBtn').addEventListener('click', () => {
    memoryAddress += 16; // Increment memory address by 16
    populate_Memory_Table(memorydic,isHex);
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (memoryAddress > 0) {
        scrollUpBtn.disabled = false; // Enable scroll up button
        scrollUpBtn.classList.remove('disabled');
    }
});


 // Hide the splash screen after 3 seconds