let weddings = JSON.parse(localStorage.getItem('weddings')) || [];
let editingId = null;

// Adicione no início do scripts.js
function checkLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if(username === 'admin' && password === '123456') {
        sessionStorage.setItem('authenticated', 'true');
        document.getElementById('login-modal').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        return true;
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('login-error').textContent = 'Credenciais inválidas!';
        return false;
    }
}

// Modifique a inicialização para verificar a autenticação
document.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = sessionStorage.getItem('authenticated');
    
    if(!isAuthenticated) {
        document.getElementById('login-modal').style.display = 'flex';
        document.querySelector('.container').style.display = 'none';
    } else {
        document.getElementById('login-modal').style.display = 'none';
        document.querySelector('.container').style.display = 'block';
        loadWeddings();
    }
});

// Adicione esta função para logout (opcional)
function logout() {
    sessionStorage.removeItem('authenticated');
    window.location.reload();
}

// Função para salvar no Firebase
async function handleSubmit(event) {
    event.preventDefault();
    const weddingData = {
        servidor: document.getElementById('servidor').value,
        weddingDate: document.getElementById('wedding-date').value,
        weddingTime: document.getElementById('wedding-time').value,
        habilitationDate: document.getElementById('habilitation-date').value,
        bride: document.getElementById('bride-name').value,
        groom: document.getElementById('groom-name').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        if (editingId) {
            await weddingsCollection.doc(editingId).update(weddingData);
        } else {
            await weddingsCollection.add(weddingData);
        }
        closeModal();
        resetForm();
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar agendamento!");
    }
}

// Função para carregar dados
function loadWeddings() {
    weddingsCollection.orderBy("createdAt").onSnapshot((snapshot) => {
        const weddings = [];
        snapshot.forEach((doc) => {
            weddings.push({ id: doc.id, ...doc.data() });
        });
        renderWeddings(weddings);
    });
}

// Função para excluir
async function deleteWedding(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        try {
            await weddingsCollection.doc(id).delete();
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir agendamento!");
        }
    }
}

// Atualize a função renderWeddings para usar os dados do Firebase
function renderWeddings(weddings) {
    // ... (mantenha a função renderWeddings existente) ...
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadWeddings(); // Carrega os dados do Firebase
});

// Funções do Modal
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    cancelEdit();
}

// Funções CRUD
function handleSubmit(event) {
    event.preventDefault();
    const weddingData = {
        id: document.getElementById('wedding-id').value || Date.now(),
        servidor: document.getElementById('servidor').value,
        weddingDate: document.getElementById('wedding-date').value,
        weddingTime: document.getElementById('wedding-time').value,
        habilitationDate: document.getElementById('habilitation-date').value,
        bride: document.getElementById('bride-name').value,
        groom: document.getElementById('groom-name').value
    };

    if (editingId) {
        const index = weddings.findIndex(w => w.id == editingId);
        weddings[index] = weddingData;
    } else {
        weddings.push(weddingData);
    }

    localStorage.setItem('weddings', JSON.stringify(weddings));
    closeModal();
    renderWeddings();
    resetForm();
}

function editWedding(id) {
    const wedding = weddings.find(w => w.id == id);
    if (wedding) {
        editingId = id;
        document.getElementById('form-title').textContent = 'Editar Agendamento';
        document.getElementById('wedding-id').value = wedding.id;
        document.getElementById('servidor').value = wedding.servidor;
        document.getElementById('wedding-date').value = wedding.weddingDate;
        document.getElementById('wedding-time').value = wedding.weddingTime;
        document.getElementById('habilitation-date').value = wedding.habilitationDate;
        document.getElementById('bride-name').value = wedding.bride;
        document.getElementById('groom-name').value = wedding.groom;
        openModal();
    }
}

function deleteWedding(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        weddings = weddings.filter(wedding => wedding.id != id);
        localStorage.setItem('weddings', JSON.stringify(weddings));
        renderWeddings();
    }
}

function cancelEdit() {
    editingId = null;
    resetForm();
    document.getElementById('form-title').textContent = 'Novo Agendamento';
}

function resetForm() {
    document.getElementById('wedding-id').value = '';
    document.getElementById('servidor').value = '';
    document.getElementById('wedding-date').value = '';
    document.getElementById('wedding-time').value = '';
    document.getElementById('habilitation-date').value = '';
    document.getElementById('bride-name').value = '';
    document.getElementById('groom-name').value = '';
}

// Renderização
function renderWeddings(weddingsToRender = weddings) {
    const today = new Date().toISOString().split('T')[0];
    const todayList = document.getElementById('today-weddings');
    const upcomingList = document.getElementById('upcoming-weddings');
    const pastList = document.getElementById('past-weddings');

    [todayList, upcomingList, pastList].forEach(list => list.innerHTML = '');

    weddingsToRender.sort((a, b) => new Date(a.weddingDate) - new Date(b.weddingDate));

    weddingsToRender.forEach(wedding => {
        const item = document.createElement('div');
        item.className = 'wedding-item';
        item.innerHTML = `
            <div class="action-buttons">
                <i class="fas fa-edit edit-btn" onclick="editWedding(${wedding.id})"></i>
                <i class="fas fa-trash delete-btn" onclick="deleteWedding(${wedding.id})"></i>
            </div>
            <h3>${wedding.bride} & ${wedding.groom}</h3>
            <p>Dia: ${formatDate(wedding.weddingDate)}</p>
            <p>Horário: ${wedding.weddingTime}</p>
            <p>Agendado por: ${wedding.servidor}</p>
            <p>Habilitado em: ${formatDate(wedding.habilitationDate)}</p>
        `;

        const weddingDate = new Date(wedding.weddingDate);
        const todayDate = new Date();

        if (wedding.weddingDate === today) {
            todayList.appendChild(item);
        } else if (weddingDate > todayDate) {
            upcomingList.appendChild(item);
        } else {
            pastList.appendChild(item);
        }
    });
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Event Listeners
document.getElementById('search-input').addEventListener('input', function(e) {
    const searchTerm = this.value.toLowerCase();
    const filteredWeddings = weddings.filter(wedding => 
        wedding.bride.toLowerCase().includes(searchTerm) ||
        wedding.groom.toLowerCase().includes(searchTerm)
    );
    renderWeddings(filteredWeddings);
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderWeddings();
});

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}