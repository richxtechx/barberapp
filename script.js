// User management
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// App data
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let services = JSON.parse(localStorage.getItem('services')) || [
    { id: 1, name: 'Corte Clásico', price: 15, description: 'Corte tradicional con tijeras y máquina. Incluye lavado y peinado.', duration: 30 },
    { id: 2, name: 'Fade Moderno', price: 20, description: 'Corte degradado moderno con detalles precisos. Incluye lavado y styling.', duration: 45 },
    { id: 3, name: 'Barba + Corte', price: 25, description: 'Servicio completo: corte de cabello + arreglo de barba con navaja.', duration: 60 },
    { id: 4, name: 'Corte Niños', price: 12, description: 'Corte especial para niños menores de 12 años. Ambiente amigable.', duration: 25 }
];
let blockedSlots = JSON.parse(localStorage.getItem('blocked_slots')) || {};

const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
];

let selectedTimeSlot = null;

// Save data to localStorage
function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('services', JSON.stringify(services));
    localStorage.setItem('blocked_slots', JSON.stringify(blockedSlots));
}

// Authentication functions
function showAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    // Usamos event.currentTarget para referirnos al botón clickeado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

function registerUser() {
    const name = document.getElementById('registerName').value;
    const phone = document.getElementById('registerPhone').value;
    const email = document.getElementById('registerEmail').value;
    const address = document.getElementById('registerAddress').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showModal('<div class="error-message">Las contraseñas no coinciden</div>');
        return false;
    }

    if (users.find(user => user.name === name)) {
        showModal('<div class="error-message">Ya existe un usuario con ese nombre</div>');
        return false;
    }

    const newUser = {
        id: Date.now(),
        name,
        phone,
        email,
        address,
        password,
        type: 'client',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveData();
    
    showModal('<div class="success-message">Usuario creado exitosamente. Ahora puedes iniciar sesión.</div>');
    // Forzar el cambio a la pestaña de login
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
    
    return false;
}

function login() {
    const name = document.getElementById('loginName').value;
    const password = document.getElementById('loginPassword').value;

    // Check if it's default admin login (first time)
    if (name === 'admin' && password === 'admin123') {
        const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials')) || null;
        
        if (!adminCredentials) {
            // First time login - force credential change
            showChangeAdminCredentials();
            return false;
        }
    }

    // Check if it's custom admin login
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials')) || null;
    if (adminCredentials && name === adminCredentials.username && password === adminCredentials.password) {
        currentUser = { id: 'admin', name: 'Administrador', type: 'admin' };
        saveData();
        showMainApp('admin');
        return false;
    }

    // Check if it's a client login
    const user = users.find(u => u.name === name && u.password === password && u.type === 'client');
    
    if (user) {
        currentUser = user;
        saveData();
        showMainApp('client');
    } else {
        showModal('<div class="error-message">Nombre de usuario o contraseña incorrectos</div>');
    }
    
    return false;
}

function showChangeAdminCredentials() {
    showModal(`
        <h3 style="color: #d4af37;">🔒 Cambio de Credenciales Obligatorio</h3>
        <p style="color: #cccccc; margin-bottom: 20px;">Por seguridad, debes cambiar las credenciales por defecto en tu primer acceso.</p>
        <form id="changeCredentialsForm">
            <div class="form-group">
                <label class="form-label">Nuevo Usuario</label>
                <input type="text" id="newAdminUser" class="form-input" placeholder="Tu nuevo nombre de usuario" required>
            </div>
            <div class="form-group">
                <label class="form-label">Nueva Contraseña</label>
                <input type="password" id="newAdminPassword" class="form-input" placeholder="Mínimo 8 caracteres" required minlength="8">
            </div>
            <div class="form-group">
                <label class="form-label">Confirmar Contraseña</label>
                <input type="password" id="confirmAdminPassword" class="form-input" placeholder="Repite la contraseña" required>
            </div>
            <button type="submit" class="btn">Guardar Credenciales</button>
        </form>
    `);

    document.getElementById('changeCredentialsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newUser = document.getElementById('newAdminUser').value;
        const newPassword = document.getElementById('newAdminPassword').value;
        const confirmPassword = document.getElementById('confirmAdminPassword').value;

        if (newPassword !== confirmPassword) {
            showModal('<div class="error-message">Las contraseñas no coinciden</div>');
            return;
        }

        const adminCredentials = {
            username: newUser,
            password: newPassword
        };

        localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
        
        currentUser = { id: 'admin', name: 'Administrador', type: 'admin' };
        saveData();
        closeModal();
        showMainApp('admin');
        
        showModal('<div class="success-message">Credenciales actualizadas exitosamente. ¡Bienvenido a BarberShop Pro!</div>');
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('authScreen').style.display = 'block';
    document.getElementById('mainApp').style.display = 'none';
    
    // Reset forms
    document.querySelectorAll('form').forEach(form => form.reset());
}

function showMainApp(userType) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentUser').textContent = currentUser.name;
    
    if (userType === 'client') {
        document.getElementById('clientDashboard').classList.add('active');
        document.getElementById('adminDashboard').classList.remove('active');
        loadClientDashboard();
        // Simular clic en el primer tab para activarlo
        document.querySelector('#clientDashboard .nav-tab').classList.add('active');
        document.getElementById('client-dashboard').classList.add('active');

    } else {
        document.getElementById('adminDashboard').classList.add('active');
        document.getElementById('clientDashboard').classList.remove('active');
        loadAdminDashboard();
        // Simular clic en el primer tab para activarlo
        document.querySelector('#adminDashboard .nav-tab').classList.add('active');
        document.getElementById('admin-dashboard').classList.add('active');
    }
}

// Client dashboard functions
function showClientTab(tabName) {
    document.querySelectorAll('#clientDashboard .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#clientDashboard .nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById('client-' + tabName).classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    switch(tabName) {
        case 'dashboard':
            loadClientDashboard();
            break;
        case 'services':
            loadClientServices();
            break;
        case 'appointments':
            loadClientAppointments();
            break;
        case 'profile':
            loadClientProfile();
            break;
    }
}

function loadClientDashboard() {
    const userAppointments = appointments.filter(apt => apt.userId === currentUser.id);
    
    document.getElementById('clientTotalAppointments').textContent = userAppointments.length;
    document.getElementById('clientPendingAppointments').textContent = 
        userAppointments.filter(apt => apt.status === 'pending').length;
    document.getElementById('clientCompletedAppointments').textContent = 
        userAppointments.filter(apt => apt.status === 'completed').length;
    
    const totalSpent = userAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + parseInt(apt.price), 0);
    document.getElementById('clientTotalSpent').textContent = '$' + totalSpent;

    const upcoming = userAppointments
        .filter(apt => new Date(apt.date + ' ' + apt.time) >= new Date())
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
        .slice(0, 3);

    const upcomingContainer = document.getElementById('clientUpcomingAppointments');
    if (upcoming.length === 0) {
        upcomingContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No tienes citas próximas</p></div>';
    } else {
        upcomingContainer.innerHTML = upcoming.map(apt => createClientAppointmentCard(apt)).join('');
    }
}

function loadClientServices() {
    const servicesList = document.getElementById('clientServicesList');
    servicesList.innerHTML = services.map(service => `
        <div class="service-card">
            <div class="service-header">
                <div class="service-name">${service.name}</div>
                <div class="service-price">$${service.price}</div>
            </div>
            <div class="service-description">${service.description}</div>
            <button class="btn" onclick="selectService('${service.name}', ${service.price})">Reservar Ahora</button>
        </div>
    `).join('');
}

function selectService(serviceName, price) {
    document.getElementById('selectedService').value = serviceName + ' - $' + price;
    document.getElementById('selectedPrice').value = price;
    
    // Activar la pestaña de reserva
    showClientTab('booking');
    document.querySelector('#clientDashboard [onclick="showClientTab(\'booking\')"]').classList.add('active');
    
    // Generar los slots de la fecha por defecto
    generateClientTimeSlots();
}

function loadClientAppointments() {
    const userAppointments = appointments.filter(apt => apt.userId === currentUser.id);
    const appointmentsList = document.getElementById('clientAppointmentsList');
    
    if (userAppointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <h3>No tienes citas programadas</h3>
                <p>Reserva tu primera cita en la sección de servicios</p>
            </div>
        `;
        return;
    }

    appointmentsList.innerHTML = userAppointments.map(apt => createClientAppointmentCard(apt)).join('');
}

function createClientAppointmentCard(apt) {
    return `
        <div class="appointment-card">
            <div class="appointment-header">
                <div class="appointment-service">${apt.service}</div>
                <div class="appointment-status status-${apt.status}">
                    ${apt.status === 'pending' ? 'Pendiente' : apt.status === 'confirmed' ? 'Confirmada' : 'Completada'}
                </div>
            </div>
            <div class="appointment-details">
                <p><strong>📅 Fecha:</strong> ${apt.date}</p>
                <p><strong>🕐 Hora:</strong> ${apt.time}</p>
                <p><strong>💰 Precio:</strong> $${apt.price}</p>
            </div>
            <div class="appointment-actions">
                ${apt.status === 'pending' || apt.status === 'confirmed' ? `
                    <button class="btn btn-danger btn-small" onclick="cancelClientAppointment(${apt.id})">Cancelar</button>
                ` : ''}
            </div>
        </div>
    `;
}

function loadClientProfile() {
    const profileInfo = document.getElementById('clientProfileInfo');
    profileInfo.innerHTML = `
        <div class="profile-info">
            <p><strong>Nombre:</strong> ${currentUser.name}</p>
            <p><strong>Teléfono:</strong> ${currentUser.phone}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Dirección:</strong> ${currentUser.address}</p>
            <p><strong>Cliente desde:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
        </div>
    `;
}

function editProfile() {
    showModal(`
        <h3 style="color: #d4af37;">Editar Perfil</h3>
        <form id="editProfileForm">
            <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" id="editName" class="form-input" value="${currentUser.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" id="editPhone" class="form-input" value="${currentUser.phone}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="editEmail" class="form-input" value="${currentUser.email}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Dirección</label>
                <input type="text" id="editAddress" class="form-input" value="${currentUser.address}" required>
            </div>
            <button type="submit" class="btn">Guardar Cambios</button>
        </form>
    `);

    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        currentUser.name = document.getElementById('editName').value;
        currentUser.phone = document.getElementById('editPhone').value;
        currentUser.email = document.getElementById('editEmail').value;
        currentUser.address = document.getElementById('editAddress').value;
        
        // Update user in users array
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
        }
        
        saveData();
        closeModal();
        loadClientProfile();
        showModal('<div class="success-message">Perfil actualizado exitosamente</div>');
    });
}

// Admin dashboard functions
function showAdminTab(tabName) {
    document.querySelectorAll('#adminDashboard .tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('#adminDashboard .nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById('admin-' + tabName).classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    switch(tabName) {
        case 'dashboard':
            loadAdminDashboard();
            break;
        case 'appointments':
            loadAdminAppointments();
            break;
        case 'clients':
            loadAdminClients();
            break;
        case 'services':
            loadAdminServices();
            break;
        case 'schedule':
            loadAdminSchedule();
            break;
        case 'earnings':
            loadAdminEarnings();
            break;
    }
}

function loadAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today);
    const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
    
    document.getElementById('todayAppointments').textContent = todayAppointments.length;
    document.getElementById('pendingAppointments').textContent = pendingAppointments.length;
    
    const todayEarnings = todayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + parseInt(apt.price), 0);
    document.getElementById('todayEarnings').textContent = '$' + todayEarnings;
    
    document.getElementById('totalClients').textContent = users.filter(u => u.type === 'client').length;

    const upcoming = appointments
        .filter(apt => new Date(apt.date + ' ' + apt.time) >= new Date())
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
        .slice(0, 5);

    const upcomingContainer = document.getElementById('upcomingAppointments');
    if (upcoming.length === 0) {
        upcomingContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><p>No hay citas próximas</p></div>';
    } else {
        upcomingContainer.innerHTML = upcoming.map(apt => createAdminAppointmentCard(apt)).join('');
    }
}

function loadAdminAppointments() {
    const appointmentsList = document.getElementById('adminAppointmentsList');
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📅</div><h3>No hay citas registradas</h3></div>';
        return;
    }

    const sortedAppointments = appointments.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
    );

    appointmentsList.innerHTML = sortedAppointments.map(apt => createAdminAppointmentCard(apt)).join('');
}

function createAdminAppointmentCard(apt) {
    const user = users.find(u => u.id === apt.userId);
    const clientName = user ? user.name : apt.name || 'Cliente no registrado';
    const clientPhone = user ? user.phone : apt.phone || 'N/A';
    
    return `
        <div class="appointment-card" data-status="${apt.status}">
            <div class="appointment-header">
                <div class="appointment-service">${apt.service}</div>
                <div class="appointment-status status-${apt.status}">
                    ${apt.status === 'pending' ? 'Pendiente' : apt.status === 'confirmed' ? 'Confirmada' : 'Completada'}
                </div>
            </div>
            <div class="appointment-details">
                <p><strong>📅 Fecha:</strong> ${apt.date}</p>
                <p><strong>🕐 Hora:</strong> ${apt.time}</p>
                <p><strong>👤 Cliente:</strong> ${clientName}</p>
                <p><strong>📱 Teléfono:</strong> ${clientPhone}</p>
                <p><strong>💰 Precio:</strong> $${apt.price}</p>
            </div>
            <div class="appointment-actions">
                ${apt.status === 'pending' ? `
                    <button class="btn btn-success btn-small" onclick="confirmAppointment(${apt.id})">Confirmar</button>
                ` : ''}
                ${apt.status === 'confirmed' ? `
                    <button class="btn btn-info btn-small" onclick="completeAppointment(${apt.id})">Completar</button>
                ` : ''}
                <button class="btn btn-secondary btn-small" onclick="callClient('${clientPhone}')">Llamar</button>
                <button class="btn btn-danger btn-small" onclick="cancelAppointment(${apt.id})">Cancelar</button>
            </div>
        </div>
    `;
}

function loadAdminClients() {
    const clientsList = document.getElementById('adminClientsList');
    const clients = users.filter(u => u.type === 'client');
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><h3>No hay clientes registrados</h3></div>';
        return;
    }

    clientsList.innerHTML = clients.map(client => {
        const clientAppointments = appointments.filter(apt => apt.userId === client.id);
        const totalSpent = clientAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + parseInt(apt.price), 0);

        return `
            <div class="profile-card">
                <div class="service-header">
                    <div class="service-name">${client.name}</div>
                    <div class="service-price">$${totalSpent}</div>
                </div>
                <div class="profile-info">
                    <p><strong>📱 Teléfono:</strong> ${client.phone}</p>
                    <p><strong>📧 Email:</strong> ${client.email}</p>
                    <p><strong>📍 Dirección:</strong> ${client.address}</p>
                    <p><strong>📅 Cliente desde:</strong> ${new Date(client.createdAt).toLocaleDateString()}</p>
                    <p><strong>🎯 Citas totales:</strong> ${clientAppointments.length}</p>
                </div>
                <div class="service-actions">
                    <button class="btn btn-secondary btn-small" onclick="callClient('${client.phone}')">Llamar</button>
                    <button class="btn btn-info btn-small" onclick="viewClientHistory(${client.id})">Ver Historial</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewClientHistory(clientId) {
    const client = users.find(u => u.id === clientId);
    const clientAppointments = appointments.filter(apt => apt.userId === clientId);
    
    showModal(`
        <h3 style="color: #d4af37;">Historial de ${client.name}</h3>
        <div style="max-height: 400px; overflow-y: auto;">
            ${clientAppointments.length === 0 ? 
                '<p style="color: #999;">No hay citas registradas</p>' :
                clientAppointments.map(apt => `
                    <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <p><strong>${apt.service}</strong> - $${apt.price}</p>
                        <p style="color: #999; font-size: 14px;">${apt.date} a las ${apt.time}</p>
                        <p style="color: #999; font-size: 14px;">Estado: ${apt.status === 'pending' ? 'Pendiente' : apt.status === 'confirmed' ? 'Confirmada' : 'Completada'}</p>
                    </div>
                `).join('')
            }
        </div>
        <button class="btn" onclick="closeModal()">Cerrar</button>
    `);
}

// Shared functions for appointments
function generateClientTimeSlots() {
    const timeSlotsContainer = document.getElementById('clientTimeSlots');
    const selectedDate = document.getElementById('appointmentDate').value;
    
    timeSlotsContainer.innerHTML = '';
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        const slotKey = `${selectedDate}_${time}`;
        const isBooked = appointments.some(apt => apt.date === selectedDate && apt.time === time && apt.status !== 'completed');
        const isBlocked = blockedSlots[slotKey];
        
        if (isBooked || isBlocked) {
            slot.classList.add('unavailable');
        } else {
            slot.onclick = () => selectClientTimeSlot(slot, time);
        }
        
        timeSlotsContainer.appendChild(slot);
    });
}

function selectClientTimeSlot(element, time) {
    document.querySelectorAll('#clientTimeSlots .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedTimeSlot = time;
}

function cancelClientAppointment(id) {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
        appointments = appointments.filter(apt => apt.id !== id);
        saveData();
        loadClientAppointments();
        loadClientDashboard();
        showModal('<div class="success-message">Cita cancelada exitosamente</div>');
    }
}

// Admin appointment functions
function filterAppointments(status) {
    document.querySelectorAll('#adminDashboard .filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    const cards = document.querySelectorAll('#adminAppointmentsList .appointment-card');
    cards.forEach(card => {
        if (status === 'all' || card.dataset.status === status) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function confirmAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    apt.status = 'confirmed';
    saveData();
    loadAdminAppointments();
    showModal('<div class="success-message">Cita confirmada exitosamente</div>');
}

function completeAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    apt.status = 'completed';
    
    // Free up the time slot when work is completed
    const slotKey = `${apt.date}_${apt.time}`;
    if (blockedSlots[slotKey]) {
        delete blockedSlots[slotKey];
    }
    
    saveData();
    loadAdminAppointments();
    loadAdminDashboard(); // Refresh dashboard to update earnings
    showModal('<div class="success-message">Cita completada. El horario está disponible nuevamente.</div>');
}

function cancelAppointment(id) {
    if (confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
        appointments = appointments.filter(apt => apt.id !== id);
        saveData();
        loadAdminAppointments();
        showModal('<div class="success-message">Cita cancelada exitosamente</div>');
    }
}

function callClient(phone) {
    showModal(`
        <h3 style="color: #d4af37;">Contactar Cliente</h3>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <div style="margin: 20px 0;">
            <button class="btn" onclick="window.open('tel:${phone}', '_blank')" style="margin-bottom: 10px;">📞 Llamar Ahora</button>
            <button class="btn btn-secondary" onclick="window.open('sms:${phone}', '_blank')">💬 Enviar SMS</button>
        </div>
        <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
    `);
}

// Service management functions
function loadAdminServices() {
    const servicesList = document.getElementById('adminServicesList');
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item">
            <div class="service-header">
                <div class="service-name">${service.name}</div>
                <div class="service-price">$${service.price}</div>
            </div>
            <p style="color: #cccccc; margin: 10px 0;">${service.description}</p>
            <p style="color: #999; font-size: 14px;">⏱️ Duración: ${service.duration} min</p>
            <div class="service-actions">
                <button class="btn btn-secondary btn-small" onclick="editService(${service.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteService(${service.id})">Eliminar</button>
            </div>
        </div>
    `).join('');
}

function showAddServiceModal() {
    showModal(`
        <h3 style="color: #d4af37;">Agregar Nuevo Servicio</h3>
        <form id="serviceForm">
            <div class="form-group">
                <label class="form-label">Nombre del Servicio</label>
                <input type="text" id="serviceName" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Precio ($)</label>
                <input type="number" id="servicePrice" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <input type="text" id="serviceDescription" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">Duración (minutos)</label>
                <input type="number" id="serviceDuration" class="form-input" required>
            </div>
            <button type="submit" class="btn">Agregar Servicio</button>
        </form>
    `);

    document.getElementById('serviceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newService = {
            id: Date.now(),
            name: document.getElementById('serviceName').value,
            price: parseInt(document.getElementById('servicePrice').value),
            description: document.getElementById('serviceDescription').value,
            duration: parseInt(document.getElementById('serviceDuration').value)
        };
        services.push(newService);
        saveData();
        closeModal();
        loadAdminServices();
        showModal('<div class="success-message">Servicio agregado exitosamente</div>');
    });
}

function editService(id) {
    const service = services.find(s => s.id === id);
    showModal(`
        <h3 style="color: #d4af37;">Editar Servicio</h3>
        <form id="editServiceForm">
            <div class="form-group">
                <label class="form-label">Nombre del Servicio</label>
                <input type="text" id="editServiceName" class="form-input" value="${service.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Precio ($)</label>
                <input type="number" id="editServicePrice" class="form-input" value="${service.price}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Descripción</label>
                <input type="text" id="editServiceDescription" class="form-input" value="${service.description}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Duración (minutos)</label>
                <input type="number" id="editServiceDuration" class="form-input" value="${service.duration}" required>
            </div>
            <button type="submit" class="btn">Guardar Cambios</button>
        </form>
    `);

    document.getElementById('editServiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        service.name = document.getElementById('editServiceName').value;
        service.price = parseInt(document.getElementById('editServicePrice').value);
        service.description = document.getElementById('editServiceDescription').value;
        service.duration = parseInt(document.getElementById('editServiceDuration').value);
        saveData();
        closeModal();
        loadAdminServices();
        showModal('<div class="success-message">Servicio actualizado exitosamente</div>');
    });
}

function deleteService(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
        services = services.filter(s => s.id !== id);
        saveData();
        loadAdminServices();
        showModal('<div class="success-message">Servicio eliminado exitosamente</div>');
    }
}

// Schedule management
function loadAdminSchedule() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('scheduleDate').value = today;
    generateAdminScheduleSlots();
}

function generateAdminScheduleSlots() {
    const selectedDate = document.getElementById('scheduleDate').value;
    const timeSlotsContainer = document.getElementById('adminTimeSlots');
    
    timeSlotsContainer.innerHTML = '';
    
    timeSlots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;
        
        const slotKey = `${selectedDate}_${time}`;
        const isBooked = appointments.some(apt => apt.date === selectedDate && apt.time === time && apt.status !== 'completed');
        const isBlocked = blockedSlots[slotKey];
        
        if (isBooked) {
            slot.classList.add('available');
            slot.textContent += ' (Ocupado)';
        } else if (isBlocked) {
            slot.classList.add('blocked');
            slot.textContent += ' (Bloqueado)';
        } else {
            slot.classList.add('available');
            slot.textContent += ' (Disponible)';
        }
        
        if (!isBooked) {
            slot.onclick = () => toggleSlotBlock(slotKey, slot);
        }
        
        timeSlotsContainer.appendChild(slot);
    });
}

function toggleSlotBlock(slotKey, element) {
    if (blockedSlots[slotKey]) {
        delete blockedSlots[slotKey];
        element.classList.remove('blocked');
        element.classList.add('available');
        element.textContent = element.textContent.replace(' (Bloqueado)', ' (Disponible)');
    } else {
        blockedSlots[slotKey] = true;
        element.classList.remove('available');
        element.classList.add('blocked');
        element.textContent = element.textContent.replace(' (Disponible)', ' (Bloqueado)');
    }
}

function saveScheduleChanges() {
    saveData();
    showModal('<div class="success-message">Cambios de horario guardados exitosamente</div>');
}

// Earnings management
function loadAdminEarnings() {
    // Forzar el filtro "Hoy" al cargar la pestaña
    const todayButton = document.querySelector('#admin-earnings .filter-btn[onclick*="today"]');
    if (todayButton) {
        todayButton.classList.add('active');
        filterEarnings('today', todayButton);
    }
}

function filterEarnings(period, clickedElement) {
    document.querySelectorAll('#admin-earnings .filter-btn').forEach(btn => btn.classList.remove('active'));
    
    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let filteredAppointments;

    switch(period) {
        case 'today':
            filteredAppointments = appointments.filter(apt => 
                apt.date === today && apt.status === 'completed'
            );
            break;
        case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            filteredAppointments = appointments.filter(apt => 
                apt.date >= weekAgo && apt.status === 'completed'
            );
            break;
        case 'month':
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            filteredAppointments = appointments.filter(apt => 
                apt.date >= monthStart && apt.status === 'completed'
            );
            break;
    }

    const totalEarnings = filteredAppointments.reduce((sum, apt) => sum + parseInt(apt.price), 0);
    const serviceBreakdown = {};

    filteredAppointments.forEach(apt => {
        // La información del servicio está en apt.service, ej: "Corte Clásico - $15"
        const serviceName = apt.service.split(' - ')[0]; 
        if (!serviceBreakdown[serviceName]) {
            serviceBreakdown[serviceName] = { count: 0, total: 0 };
        }
        serviceBreakdown[serviceName].count++;
        serviceBreakdown[serviceName].total += parseInt(apt.price);
    });

    const earningsSummary = document.getElementById('earningsSummary');
    earningsSummary.innerHTML = `
        <div class="earnings-summary">
            <h3 style="color: #d4af37; margin-bottom: 20px;">Resumen de Ganancias</h3>
            ${Object.entries(serviceBreakdown).map(([service, data]) => `
                <div class="earnings-row">
                    <span>${service} (${data.count})</span>
                    <span>$${data.total}</span>
                </div>
            `).join('')}
            <div class="earnings-row">
                <span>Total</span>
                <span>$${totalEarnings}</span>
            </div>
        </div>
    `;

    const earningsDetails = document.getElementById('earningsDetails');
    if (filteredAppointments.length === 0) {
        earningsDetails.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💰</div><p>No hay ganancias en este período</p></div>';
    } else {
        earningsDetails.innerHTML = filteredAppointments.map(apt => {
            const user = users.find(u => u.id === apt.userId);
            const clientName = user ? user.name : apt.name || 'Cliente no registrado';
            
            return `
                <div class="appointment-card">
                    <div class="appointment-header">
                        <div class="appointment-service">${apt.service}</div>
                        <div class="service-price">$${apt.price}</div>
                    </div>
                    <div class="appointment-details">
                        <p><strong>📅 Fecha:</strong> ${apt.date}</p>
                        <p><strong>🕐 Hora:</strong> ${apt.time}</p>
                        <p><strong>👤 Cliente:</strong> ${clientName}</p>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Shared utility functions
function openPaymentLink(method) {
    let message = '';
    if (method === 'zelle') {
        message = 'Información de Zelle:\n\nEmail: barbershoppro@email.com\n\nPor favor incluye tu nombre y fecha de cita en el concepto del pago.';
    } else if (method === 'cashapp') {
        message = 'Información de Cash App:\n\nUsuario: $BarberShopPro\n\nPor favor incluye tu nombre y fecha de cita en el concepto del pago.';
    }
    
    showModal(`
        <h3 style="color: #d4af37;">💰 Información de Pago</h3>
        <div style="background: #2d2d2d; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="white-space: pre-line; color: #cccccc;">${message}</p>
        </div>
        <div style="background: #1a4d3a; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50;">
            <p style="color: #ffffff; font-size: 13px; margin: 0;">
                <strong>📋 Recuerda:</strong> Una vez realizado el pago, el barbero lo confirmará en su app y tu cita cambiará a "Confirmada". 
                Las ganancias se registran automáticamente cuando se confirma el pago.
            </p>
        </div>
        <button class="btn" onclick="closeModal()">Entendido</button>
    `);
}

function showModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Event listeners
document.getElementById('appointmentDate').addEventListener('change', generateClientTimeSlots);
document.getElementById('scheduleDate').addEventListener('change', generateAdminScheduleSlots);

// Form submissions
document.getElementById('mainRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    registerUser();
});

document.getElementById('mainLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    login();
});

document.getElementById('bookingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
        showModal('<div class="error-message">Por favor selecciona un horario</div>');
        return;
    }

    // Validar si el servicio ha sido seleccionado (para prevenir errores si el usuario va directamente a la pestaña de reserva)
    if (!document.getElementById('selectedService').value) {
        showModal('<div class="error-message">Por favor selecciona un servicio en la pestaña "Servicios"</div>');
        return;
    }
    
    const appointment = {
        id: Date.now(),
        userId: currentUser.id,
        service: document.getElementById('selectedService').value,
        price: document.getElementById('selectedPrice').value,
        date: document.getElementById('appointmentDate').value,
        time: selectedTimeSlot,
        status: 'pending'
    };

    appointments.push(appointment);
    saveData();

    showModal(`
        <div class="success-message">¡Cita reservada exitosamente!</div>
        <h3 style="color: #d4af37;">Detalles de tu cita:</h3>
        <div style="background: #2d2d2d; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Servicio:</strong> ${appointment.service}</p>
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Precio:</strong> $${appointment.price}</p>
        </div>
        <div style="background: #1a4d3a; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4CAF50;">
            <p style="color: #ffffff; font-size: 14px; margin: 0;">
                <strong>💰 Siguiente paso:</strong> Realiza el pago de $${appointment.price} por Zelle o Cash App. 
                Tu cita será confirmada cuando el barbero reciba el pago.
            </p>
        </div>
        <button class="btn" onclick="closeModal(); showClientTab('profile'); document.querySelector('#clientDashboard [onclick=\\'showClientTab(\\'profile\\')\\']').classList.add('active');">Ver Información de Pago</button>
    `);

    // Reset form
    document.getElementById('bookingForm').reset();
    selectedTimeSlot = null;
    document.querySelectorAll('#clientTimeSlots .time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Refresh dashboard
    loadClientDashboard();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('appointmentDate').value = tomorrow.toISOString().split('T')[0];
    
    // Save initial services if not exists
    if (!localStorage.getItem('services')) {
        saveData();
    }
    
    // Check if user is already logged in
    if (currentUser) {
        if (currentUser.type === 'admin') {
            showMainApp('admin');
        } else {
            showMainApp('client');
        }
    }
});
