/**
 * Do Commit ao Código — Git e GitHub na prática
 * Apresentação interativa offline-first
 */
'use strict';

// =============================================================================
// 1. Constantes e Estado Global
// =============================================================================

let currentIndex = 0;
let simStep = 0;
let toastTimeout = null;

// Passos do Simulador Git (Slide 11)
const SIM_STEPS = [
    {
        title: 'Tudo começa com um arquivo editado.',
        output: '$ git status\nmodified: README.md'
    },
    {
        title: 'git add prepara o conteúdo.',
        output: '$ git add README.md\n$ git status\nChanges to be committed: README.md'
    },
    {
        title: 'git commit registra localmente.',
        output: '$ git commit -m "docs: atualiza README"\n[main a8f74de] docs: atualiza README'
    },
    {
        title: 'git push publica no remoto.',
        output: '$ git push origin main\nmain -> main  ✓'
    }
];

// =============================================================================
// 2. Elementos do DOM
// =============================================================================

const stage = document.getElementById('stage');
const slides = Array.from(document.querySelectorAll('.slide'));
const totalSlides = slides.length;

// Indicadores do cabeçalho e rodapé
const sectionLabel = document.getElementById('sectionLabel');
const timingLabel = document.getElementById('timing');
const slideCounter = document.getElementById('slideCounter');
const progressBar = document.getElementById('progressBar');

// Controles de navegação
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Painel de notas do palestrante
const notesBtn = document.getElementById('notesBtn');
const notesPanel = document.getElementById('notesPanel');
const closeNotes = document.getElementById('closeNotes');
const notesContent = document.getElementById('notesContent');

// Modal de visão geral (Mapa de slides)
const overviewBtn = document.getElementById('overviewBtn');
const overviewModal = document.getElementById('overview');
const closeOverview = document.getElementById('closeOverview');
const overviewGrid = document.getElementById('overviewGrid');

// Tela cheia e Toast
const fullscreenBtn = document.getElementById('fullscreenBtn');
const toastEl = document.getElementById('toast');

// =============================================================================
// 3. Notificação Toast
// =============================================================================

function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('visible');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastEl.classList.remove('visible');
    }, 2000);
}

// =============================================================================
// 4. Navegação entre Slides
// =============================================================================

function renderSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    currentIndex = index;

    // Ativa apenas o slide atual
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentIndex);
    });

    const activeSlide = slides[currentIndex];

    // Atualiza indicadores informativos
    if (sectionLabel) {
        sectionLabel.textContent = activeSlide.dataset.section || '';
    }
    if (timingLabel) {
        timingLabel.textContent = activeSlide.dataset.timing || '';
    }
    if (slideCounter) {
        const formattedNum = String(currentIndex + 1).padStart(2, '0');
        slideCounter.innerHTML = `${formattedNum} <em>/ ${totalSlides}</em>`;
    }
    if (progressBar) {
        const progress = ((currentIndex + 1) / totalSlides) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Atualiza as notas do palestrante para o slide atual
    if (notesContent) {
        const noteEl = activeSlide.querySelector('.slide-notes');
        notesContent.textContent = noteEl ? noteEl.textContent.trim() : '';
    }

    // Habilita/desabilita botões nos limites da apresentação
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;

    // Se o slide possuir o simulador Git, reinicia para o estado inicial
    if (activeSlide.querySelector('.simulator')) {
        simStep = 0;
        updateSimulator();
    }

    // Reseta rolagem para o topo
    stage.scrollTop = 0;
    activeSlide.scrollTop = 0;

    // Sincroniza a hash da URL (#1, #2, etc.)
    history.replaceState(null, '', `#${currentIndex + 1}`);

    // Fecha o mapa de visão geral se estiver aberto
    if (overviewModal?.classList.contains('open')) {
        toggleOverview(false);
    }
}

function goToSlide(index) {
    renderSlide(index);
}

// =============================================================================
// 5. Painel de Notas do Palestrante
// =============================================================================

function toggleNotes(force) {
    if (!notesPanel) return;
    const shouldOpen = force !== undefined ? force : !notesPanel.classList.contains('open');
    notesPanel.classList.toggle('open', shouldOpen);
}

// =============================================================================
// 6. Visão Geral / Mapa de Slides
// =============================================================================

function toggleOverview(force) {
    if (!overviewModal) return;
    const shouldOpen = force !== undefined ? force : !overviewModal.classList.contains('open');
    overviewModal.classList.toggle('open', shouldOpen);

    if (shouldOpen) {
        renderOverview();
    }
}

function renderOverview() {
    if (!overviewGrid) return;
    overviewGrid.innerHTML = '';

    slides.forEach((slide, i) => {
        const num = String(i + 1).padStart(2, '0');
        const section = slide.dataset.section || '';
        const title = slide.dataset.title || '';

        const btn = document.createElement('button');
        btn.className = `overview-item ${i === currentIndex ? 'current' : ''}`;
        btn.dataset.goto = String(i);
        btn.innerHTML = `<span>${num} / ${section}</span><b>${title}</b>`;
        btn.addEventListener('click', () => {
            goToSlide(i);
            toggleOverview(false);
        });
        overviewGrid.appendChild(btn);
    });
}

// =============================================================================
// 7. Lógica do Simulador Git (Slide 11)
// =============================================================================

function updateSimulator() {
    const nodeIds = ['simWork', 'simStage', 'simLocal', 'simRemote'];
    nodeIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', i === simStep);
    });

    const simTitle = document.getElementById('simTitle');
    const simOutput = document.getElementById('simOutput');
    const simAdvance = document.getElementById('simAdvance');

    const stepData = SIM_STEPS[simStep];
    if (simTitle && stepData) simTitle.textContent = stepData.title;
    if (simOutput && stepData) {
        simOutput.textContent = stepData.output;
        // Anima a saída do terminal simulado
        simOutput.classList.remove('typing');
        void simOutput.offsetWidth; // Força reflow para reiniciar animação
        simOutput.classList.add('typing');
    }

    if (simAdvance) {
        const isLast = simStep === SIM_STEPS.length - 1;
        simAdvance.disabled = isLast;
        simAdvance.textContent = isLast ? 'CICLO CONCLUÍDO ✓' : 'EXECUTAR PRÓXIMO →';
    }
}

function advanceSimulator() {
    if (simStep < SIM_STEPS.length - 1) {
        simStep++;
        updateSimulator();
    }
}

function resetSimulator() {
    simStep = 0;
    updateSimulator();
}

// =============================================================================
// 8. Cópia de Comandos do Terminal
// =============================================================================

async function copyCommandText(button) {
    const terminal = button.closest('.terminal');
    const pre = terminal?.querySelector('pre');
    const text = button.dataset.copy
        ? decodeURIComponent(button.dataset.copy)
        : (pre ? pre.innerText : '');

    if (!text) return;

    const originalLabel = button.textContent;

    try {
        await navigator.clipboard.writeText(text);
        showToast('Comandos copiados!');
    } catch {
        // Fallback para navegadores sem permissão de Clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        showToast('Comandos copiados!');
    }

    // Feedback visual no botão de cópia
    button.textContent = '✓ COPIADO';
    button.classList.add('copied');
    setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove('copied');
    }, 1800);
}

// =============================================================================
// 9. Modo Tela Cheia
// =============================================================================

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {
            showToast('Tela cheia indisponível.');
        });
    } else {
        document.exitFullscreen?.();
    }
}

// =============================================================================
// 10. Event Listeners
// =============================================================================

// Botões fixos do rodapé e da barra superior
prevBtn?.addEventListener('click', () => goToSlide(currentIndex - 1));
nextBtn?.addEventListener('click', () => goToSlide(currentIndex + 1));
notesBtn?.addEventListener('click', () => toggleNotes());
closeNotes?.addEventListener('click', () => toggleNotes(false));
overviewBtn?.addEventListener('click', () => toggleOverview());
closeOverview?.addEventListener('click', () => toggleOverview(false));
fullscreenBtn?.addEventListener('click', toggleFullscreen);

// Delegação de cliques para elementos interativos dentro dos slides
document.addEventListener('click', (e) => {
    // Copiar comandos
    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
        copyCommandText(copyBtn);
        return;
    }

    // Revelar resposta no Quiz
    const revealBtn = e.target.closest('.reveal-btn');
    if (revealBtn) {
        revealBtn.closest('.quiz-card')?.classList.add('revealed');
        return;
    }

    // Avançar no Simulador Git
    if (e.target.id === 'simAdvance') {
        advanceSimulator();
        return;
    }

    // Reiniciar o Simulador Git
    if (e.target.id === 'simReset') {
        resetSimulator();
        return;
    }
});

// Atalhos do teclado
document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    // Teclas quando o índice de slides estiver aberto
    if (overviewModal?.classList.contains('open')) {
        if (e.key === 'Escape' || e.key.toLowerCase() === 'g') {
            toggleOverview(false);
        }
        return;
    }

    switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
            e.preventDefault();
            goToSlide(currentIndex + 1);
            break;
        case 'ArrowLeft':
        case 'PageUp':
            e.preventDefault();
            goToSlide(currentIndex - 1);
            break;
        case 'Home':
            goToSlide(0);
            break;
        case 'End':
            goToSlide(totalSlides - 1);
            break;
        case 'f':
        case 'F':
            toggleFullscreen();
            break;
        case 'n':
        case 'N':
            toggleNotes();
            break;
        case 'g':
        case 'G':
            toggleOverview();
            break;
        case 'Escape':
            toggleNotes(false);
            break;
    }
});

// Suporte a gestos por toque (Swipe em dispositivos móveis)
let touchStartX = null;

stage?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
}, { passive: true });

stage?.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 85) {
        goToSlide(currentIndex + (deltaX < 0 ? 1 : -1));
    }
    touchStartX = null;
}, { passive: true });

// Sincronização com a Hash da URL (#1, #2...)
function parseHash() {
    const hashVal = Number(location.hash.replace('#', ''));
    if (Number.isInteger(hashVal) && hashVal >= 1 && hashVal <= totalSlides) {
        return hashVal - 1;
    }
    return 0;
}

window.addEventListener('hashchange', () => {
    const targetIndex = parseHash();
    if (targetIndex !== currentIndex) {
        renderSlide(targetIndex);
    }
});

// =============================================================================
// 11. Inicialização
// =============================================================================

const initialSlide = parseHash();
renderSlide(initialSlide);