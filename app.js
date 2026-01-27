// Estado
let timers = JSON.parse(localStorage.getItem('cuanto_timers')) || [];
const timersList = document.getElementById('timersList');
const modal = document.getElementById('timerModal');
const form = document.getElementById('timerForm');
const titleInput = document.getElementById('titleInput');
let editingId = null;

// Lógica de Renderizado
function render() {
    timersList.innerHTML = '';
    
    if (timers.length === 0) {
        timersList.innerHTML = `
            <div class="empty-state">
                <p>NADA POR AQUÍ.</p>
                <p>DALE AL +</p>
            </div>`;
        return;
    }

    timers.forEach(timer => {
        const card = document.createElement('div');
        card.className = `timer-card ${timer.paused ? 'paused' : ''}`;
        
        const timeString = calculateTime(timer);

        card.innerHTML = `
            <div class="timer-header">
                <h3 class="timer-title">${timer.title}</h3>
                <button class="brutal-btn small" onclick="deleteTimer(${timer.id})">X</button>
            </div>
            <div class="timer-display">${timeString}</div>
            <div class="timer-controls">
                <button class="brutal-btn small" onclick="togglePause(${timer.id})">
                    ${timer.paused ? 'REANUDAR' : 'PAUSAR'}
                </button>
                <button class="brutal-btn small secondary" onclick="restartTimer(${timer.id})">REINICIAR</button>
            </div>
        `;
        timersList.appendChild(card);
    });
}

// Matemática del tiempo
function calculateTime(timer) {
    let diff;
    if (timer.paused) {
        diff = timer.accumulated;
    } else {
        const now = Date.now();
        // Tiempo total = (Ahora - Inicio) + Lo que ya llevaba acumulado antes
        diff = (now - timer.startTime) + (timer.accumulated || 0);
    }

    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Formato Brutalista 00H 00M
    return `${hours}H ${minutes.toString().padStart(2, '0')}M`;
}

// Acciones
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
    if(!confirm('¿BORRAR?')) return;
    timers = timers.filter(t => t.id !== id);
    save();
    render();
}

function togglePause(id) {
    const timer = timers.find(t => t.id === id);
    if (timer.paused) {
        // Reanudar: Seteamos nuevo inicio ahora
        timer.startTime = Date.now();
        timer.paused = false;
    } else {
        // Pausar: Calculamos cuánto llevaba y lo guardamos
        const now = Date.now();
        timer.accumulated += (now - timer.startTime);
        timer.paused = true;
    }
    save();
    render();
}

function restartTimer(id) {
    if(!confirm('¿A CERO?')) return;
    const timer = timers.find(t => t.id === id);
    timer.startTime = Date.now();
    timer.accumulated = 0;
    timer.paused = false;
    save();
    render();
}

function save() {
    localStorage.setItem('cuanto_timers', JSON.stringify(timers));
}

// Sincronización con el reloj del sistema (Minuto exacto)
function syncClock() {
    render(); // Render inicial
    
    const now = new Date();
    // Calcular ms hasta el siguiente minuto exacto
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

    setTimeout(() => {
        render();
        // Una vez sincronizado, actualizamos cada 60s
        setInterval(render, 60000);
    }, msToNextMinute);
}

// Event Listeners UI
document.getElementById('addBtn').addEventListener('click', () => {
    editingId = null;
    form.reset();
    modal.showModal();
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.close();
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = titleInput.value.trim();
    if (title) {
        addTimer(title);
        modal.close();
    }
});

// Inicializar
syncClock();
