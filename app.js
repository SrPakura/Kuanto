let timers = JSON.parse(localStorage.getItem('kuanto_timers')) || [];
const timersList = document.getElementById('timersList');
const modal = document.getElementById('timerModal');
const form = document.getElementById('timerForm');
const titleInput = document.getElementById('titleInput');

// Renderizado
function render() {
    timersList.innerHTML = '';
    
    if (timers.length === 0) {
        timersList.innerHTML = `<div class="empty-state">// SIN DATOS.</div>`;
        return;
    }

    timers.forEach(timer => {
        const card = document.createElement('div');
        card.className = `card ${timer.paused ? 'paused' : ''}`;
        
        const timeString = calculateTime(timer);
        
        // Estilo del título: // N...
        // Cogemos la primera letra para ponerla en rosa y añadimos punto rosa al final
        const titleText = timer.title;
        const firstChar = titleText.charAt(0);
        const restOfText = titleText.slice(1);

        const htmlTitle = `
            <span class="comment">//</span> 
            <span class="accent">${firstChar}</span>${restOfText}<span class="accent">.</span>
        `;

        card.innerHTML = `
            <div class="card-header">
                ${htmlTitle}
            </div>
            
            <!-- Click en la caja para Pausar/Reanudar -->
            <div class="timer-box" onclick="togglePause(${timer.id})">
                ${timeString}
            </div>
            
            <div class="card-actions">
                <button class="outline-btn" onclick="restartTimer(${timer.id})">Reiniciar</button>
                <button class="outline-btn danger" onclick="deleteTimer(${timer.id})">Borrar</button>
            </div>
        `;
        timersList.appendChild(card);
    });
}

function calculateTime(timer) {
    let diff;
    if (timer.paused) {
        diff = timer.accumulated;
    } else {
        const now = Date.now();
        diff = (now - timer.startTime) + (timer.accumulated || 0);
    }

    // Minutos totales
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Formato 00:00 (si pasa de 99h crece el ancho, pero mantiene estilo)
    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    
    return `${hStr}:${mStr}`;
}

// ---- Lógica de Datos (Igual que antes) ----

function addTimer(title) {
    const newTimer = {
        id: Date.now(),
        title: title,
        startTime: Date.now(),
        accumulated: 0,
        paused: false
    };
    timers.push(newTimer);
    save();
    render();
}

function deleteTimer(id) {
    if(!confirm('// ¿CONFIRMAR BORRADO?')) return;
    timers = timers.filter(t => t.id !== id);
    save();
    render();
}

function togglePause(id) {
    const timer = timers.find(t => t.id === id);
    if (timer.paused) {
        timer.startTime = Date.now();
        timer.paused = false;
    } else {
        const now = Date.now();
        timer.accumulated += (now - timer.startTime);
        timer.paused = true;
    }
    save();
    render();
}

function restartTimer(id) {
    if(!confirm('// ¿REINICIAR CONTADOR?')) return;
    const timer = timers.find(t => t.id === id);
    timer.startTime = Date.now();
    timer.accumulated = 0;
    timer.paused = false;
    save();
    render();
}

function save() {
    localStorage.setItem('kuanto_timers', JSON.stringify(timers));
}

// Sincronización exacta al minuto
function syncClock() {
    render();
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
        render();
        setInterval(render, 60000);
    }, msToNextMinute);
}

// Event Listeners
document.getElementById('addBtn').addEventListener('click', () => {
    form.reset();
    modal.showModal();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.close();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (titleInput.value.trim()) {
        addTimer(titleInput.value.trim());
        modal.close();
    }
});

syncClock();
