// Global variables
let currentUser = null;
let currentMetric = 'steps';
let trendsChart = null;
let healthData = [];
let goals = {
    daily: { steps: 10000, water: 2000, sleep: 8, calories: 2000 },
    weekly: { steps: 70000, water: 14000, sleep: 56, calories: 14000 },
    monthly: { steps: 300000, water: 60000, sleep: 240, calories: 60000 }
};

// Database simulation (using localStorage)
class Database {
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static load(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    static remove(key) {
        localStorage.removeItem(key);
    }
}

// User authentication
function switchAuth(form) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (form === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

function register(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    // Check if user already exists
    const existingUsers = Database.load('users') || [];
    if (existingUsers.find(user => user.email === email)) {
        showMessage('User with this email already exists!', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Simple encoding (not secure for production)
        joinedDate: new Date().toISOString()
    };
    
    existingUsers.push(newUser);
    Database.save('users', existingUsers);
    
    showMessage('Registration successful! Please login.', 'success');
    switchAuth('login');
    
    // Clear form
    document.getElementById('register-form').reset();
}

function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const users = Database.load('users') || [];
    const user = users.find(u => u.email === email && u.password === btoa(password));
    
    if (user) {
        currentUser = user;
        Database.save('currentUser', user);
        showApp();
        loadUserData();
        showMessage('Login successful!', 'success');
    } else {
        showMessage('Invalid email or password!', 'error');
    }
}

function logout() {
    currentUser = null;
    Database.remove('currentUser');
    showAuth();
    showMessage('Logged out successfully!', 'success');
}

function showAuth() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    updateProfileInfo();
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to corresponding nav link
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load section-specific data
    if (sectionName === 'trends') {
        updateTrendsChart();
    } else if (sectionName === 'history') {
        loadHistory();
    } else if (sectionName === 'goals') {
        loadGoals();
    }
}

// Health data management
function addHealthData(event) {
    event.preventDefault();
    
    const steps = parseInt(document.getElementById('add-steps').value);
    const water = parseInt(document.getElementById('add-water').value);
    const sleep = parseFloat(document.getElementById('add-sleep').value);
    const calories = parseInt(document.getElementById('add-calories').value);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if data already exists for today
    const existingData = healthData.find(data => data.date === today);
    
    if (existingData) {
        // Update existing data
        existingData.steps = steps;
        existingData.water = water;
        existingData.sleep = sleep;
        existingData.calories = calories;
    } else {
        // Add new data
        const newData = {
            id: Date.now().toString(),
            userId: currentUser.id,
            date: today,
            steps,
            water,
            sleep,
            calories,
            createdAt: new Date().toISOString()
        };
        healthData.push(newData);
    }
    
    Database.save('healthData', healthData);
    closeAddDataModal();
    updateDashboard();
    showMessage('Health data saved successfully!', 'success');
}

function updateHealthData(event) {
    event.preventDefault();
    
    const recordId = document.getElementById('edit-record-id').value;
    const steps = parseInt(document.getElementById('edit-steps').value);
    const water = parseInt(document.getElementById('edit-water').value);
    const sleep = parseFloat(document.getElementById('edit-sleep').value);
    const calories = parseInt(document.getElementById('edit-calories').value);
    
    const dataIndex = healthData.findIndex(data => data.id === recordId);
    if (dataIndex !== -1) {
        healthData[dataIndex].steps = steps;
        healthData[dataIndex].water = water;
        healthData[dataIndex].sleep = sleep;
        healthData[dataIndex].calories = calories;
        
        Database.save('healthData', healthData);
        closeEditDataModal();
        updateDashboard();
        loadHistory();
        showMessage('Health data updated successfully!', 'success');
    }
}

function deleteHealthData(recordId) {
    if (confirm('Are you sure you want to delete this record?')) {
        healthData = healthData.filter(data => data.id !== recordId);
        Database.save('healthData', healthData);
        updateDashboard();
        loadHistory();
        showMessage('Health data deleted successfully!', 'success');
    }
}

function editHealthData(recordId) {
    const data = healthData.find(d => d.id === recordId);
    if (data) {
        document.getElementById('edit-record-id').value = data.id;
        document.getElementById('edit-steps').value = data.steps;
        document.getElementById('edit-water').value = data.water;
        document.getElementById('edit-sleep').value = data.sleep;
        document.getElementById('edit-calories').value = data.calories;
        showEditDataModal();
    }
}

// Modal functions
function showAddDataModal() {
    document.getElementById('add-data-modal').style.display = 'block';
}

function closeAddDataModal() {
    document.getElementById('add-data-modal').style.display = 'none';
    document.getElementById('add-data-modal').querySelector('form').reset();
}

function showEditDataModal() {
    document.getElementById('edit-data-modal').style.display = 'block';
}

function closeEditDataModal() {
    document.getElementById('edit-data-modal').style.display = 'none';
}

// Dashboard updates
function updateDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const todayData = healthData.find(data => data.date === today && data.userId === currentUser.id);
    
    if (todayData) {
        document.getElementById('today-steps').textContent = todayData.steps.toLocaleString();
        document.getElementById('today-water').textContent = todayData.water.toLocaleString();
        document.getElementById('today-sleep').textContent = todayData.sleep;
        document.getElementById('today-calories').textContent = todayData.calories.toLocaleString();
    } else {
        document.getElementById('today-steps').textContent = '0';
        document.getElementById('today-water').textContent = '0';
        document.getElementById('today-sleep').textContent = '0';
        document.getElementById('today-calories').textContent = '0';
    }
    
    // Update goal displays
    document.getElementById('steps-goal').textContent = goals.daily.steps.toLocaleString();
    document.getElementById('water-goal').textContent = goals.daily.water.toLocaleString();
    document.getElementById('sleep-goal').textContent = goals.daily.sleep;
    document.getElementById('calories-goal').textContent = goals.daily.calories.toLocaleString();
}

// Trends and Charts
function switchMetric(metric) {
    currentMetric = metric;
    
    // Update button states
    document.querySelectorAll('.metric-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-metric="${metric}"]`).classList.add('active');
    
    updateTrendsChart();
}

function updateTrendsChart() {
    const timeframe = parseInt(document.getElementById('timeframe-select').value);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    
    // Filter data for the selected timeframe
    const filteredData = healthData
        .filter(data => {
            const dataDate = new Date(data.date);
            return dataDate >= startDate && dataDate <= endDate && data.userId === currentUser.id;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Prepare chart data
    const labels = [];
    const values = [];
    const goalValues = [];
    
    for (let i = 0; i < timeframe; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (timeframe - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const dayData = filteredData.find(d => d.date === dateStr);
        values.push(dayData ? dayData[currentMetric] : 0);
        
        // Calculate goal value for this timeframe
        let goalValue = goals.daily[currentMetric];
        if (timeframe >= 7 && timeframe < 30) {
            goalValue = goals.weekly[currentMetric] / 7;
        } else if (timeframe >= 30) {
            goalValue = goals.monthly[currentMetric] / 30;
        }
        goalValues.push(goalValue);
    }
    
    // Chart colors based on VIBGYOR
    const colors = {
        steps: '#ff0000',    // Red
        water: '#ff7f00',    // Orange
        sleep: '#ffff00',    // Yellow
        calories: '#00ff00'  // Green
    };
    
    const ctx = document.getElementById('trends-chart').getContext('2d');
    
    if (trendsChart) {
        trendsChart.destroy();
    }
    
    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1)} (Actual)`,
                data: values,
                borderColor: colors[currentMetric] || '#667eea',
                backgroundColor: `${colors[currentMetric] || '#667eea'}20`,
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Goal',
                data: goalValues,
                borderColor: '#666',
                backgroundColor: '#66620',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${currentMetric.charAt(0).toUpperCase() + currentMetric.slice(1)} Trends - Last ${timeframe} Days`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
}

// Goals management
function loadGoals() {
    document.getElementById('daily-steps-goal').value = goals.daily.steps;
    document.getElementById('daily-water-goal').value = goals.daily.water;
    document.getElementById('daily-sleep-goal').value = goals.daily.sleep;
    document.getElementById('daily-calories-goal').value = goals.daily.calories;
    
    document.getElementById('weekly-steps-goal').value = goals.weekly.steps;
    document.getElementById('weekly-water-goal').value = goals.weekly.water;
    document.getElementById('weekly-sleep-goal').value = goals.weekly.sleep;
    document.getElementById('weekly-calories-goal').value = goals.weekly.calories;
    
    document.getElementById('monthly-steps-goal').value = goals.monthly.steps;
    document.getElementById('monthly-water-goal').value = goals.monthly.water;
    document.getElementById('monthly-sleep-goal').value = goals.monthly.sleep;
    document.getElementById('monthly-calories-goal').value = goals.monthly.calories;
}

function updateGoals(event, period) {
    event.preventDefault();
    
    const form = event.target;
    const steps = parseInt(form.querySelector(`#${period}-steps-goal`).value);
    const water = parseInt(form.querySelector(`#${period}-water-goal`).value);
    const sleep = parseFloat(form.querySelector(`#${period}-sleep-goal`).value);
    const calories = parseInt(form.querySelector(`#${period}-calories-goal`).value);
    
    goals[period] = { steps, water, sleep, calories };
    Database.save('goals', goals);
    
    updateDashboard();
    showMessage(`${period.charAt(0).toUpperCase() + period.slice(1)} goals updated successfully!`, 'success');
}

// History management
function loadHistory() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    
    let filteredData = healthData.filter(data => data.userId === currentUser.id);
    
    if (startDate) {
        filteredData = filteredData.filter(data => data.date >= startDate);
    }
    if (endDate) {
        filteredData = filteredData.filter(data => data.date <= endDate);
    }
    
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';
    
    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data found for the selected period</td></tr>';
        return;
    }
    
    filteredData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(data.date).toLocaleDateString()}</td>
            <td>${data.steps.toLocaleString()}</td>
            <td>${data.water.toLocaleString()}</td>
            <td>${data.sleep}</td>
            <td>${data.calories.toLocaleString()}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-small btn-edit" onclick="editHealthData('${data.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteHealthData('${data.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Profile management
function updateProfileInfo() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-joined').textContent = new Date(currentUser.joinedDate).toLocaleDateString();
    
    // Calculate statistics
    const userData = healthData.filter(data => data.userId === currentUser.id);
    const totalDays = userData.length;
    
    if (totalDays > 0) {
        const avgSteps = Math.round(userData.reduce((sum, data) => sum + data.steps, 0) / totalDays);
        const avgWater = Math.round(userData.reduce((sum, data) => sum + data.water, 0) / totalDays);
        const avgSleep = (userData.reduce((sum, data) => sum + data.sleep, 0) / totalDays).toFixed(1);
        
        document.getElementById('total-days').textContent = totalDays;
        document.getElementById('avg-steps').textContent = avgSteps.toLocaleString();
        document.getElementById('avg-water').textContent = avgWater.toLocaleString();
        document.getElementById('avg-sleep').textContent = avgSleep;
    } else {
        document.getElementById('total-days').textContent = '0';
        document.getElementById('avg-steps').textContent = '0';
        document.getElementById('avg-water').textContent = '0';
        document.getElementById('avg-sleep').textContent = '0';
    }
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function loadUserData() {
    // Load health data
    const savedHealthData = Database.load('healthData');
    healthData = savedHealthData || [];
    
    // Load goals
    const savedGoals = Database.load('goals');
    if (savedGoals) {
        goals = savedGoals;
    }
    
    // Set default date range for history
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    
    document.getElementById('start-date').value = lastMonthStr;
    document.getElementById('end-date').value = today;
    
    updateDashboard();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = Database.load('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showApp();
        loadUserData();
    } else {
        showAuth();
    }
    
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Navigation click handlers
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (event) => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});
