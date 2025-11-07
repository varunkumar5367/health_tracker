/**
 * Health Tracker System - Configuration File
 * Modify these settings to customize the application
 */

const CONFIG = {
    // Application settings
    APP_NAME: 'Health Tracker',
    VERSION: '1.0.0',
    
    // Default goals
    DEFAULT_GOALS: {
        daily: {
            steps: 10000,
            water: 2000,
            sleep: 8,
            calories: 2000
        },
        weekly: {
            steps: 70000,
            water: 14000,
            sleep: 56,
            calories: 14000
        },
        monthly: {
            steps: 300000,
            water: 60000,
            sleep: 240,
            calories: 60000
        }
    },
    
    // Chart colors (VIBGYOR theme)
    CHART_COLORS: {
        steps: '#ff0000',      // Red
        water: '#ff7f00',      // Orange
        sleep: '#ffff00',      // Yellow
        calories: '#00ff00'    // Green
    },
    
    // Chart settings
    CHART_CONFIG: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
        },
        plugins: {
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
    },
    
    // Timeframe options
    TIMEFRAME_OPTIONS: [
        { value: 7, label: 'Last 7 Days' },
        { value: 14, label: 'Last 14 Days' },
        { value: 30, label: 'Last 30 Days' },
        { value: 90, label: 'Last 3 Months' }
    ],
    
    // Metric options
    METRIC_OPTIONS: [
        { key: 'steps', label: 'Steps', icon: 'fas fa-walking' },
        { key: 'water', label: 'Water (ml)', icon: 'fas fa-tint' },
        { key: 'sleep', label: 'Sleep (h)', icon: 'fas fa-bed' },
        { key: 'calories', label: 'Calories', icon: 'fas fa-fire' }
    ],
    
    // Storage keys
    STORAGE_KEYS: {
        USERS: 'health_tracker_users',
        HEALTH_DATA: 'health_tracker_health_data',
        GOALS: 'health_tracker_goals',
        CURRENT_USER: 'health_tracker_current_user',
        SETTINGS: 'health_tracker_settings'
    },
    
    // API settings (if using backend)
    API: {
        BASE_URL: '', // Set to your API endpoint if using backend
        ENDPOINTS: {
            REGISTER: '/api.php/auth/register',
            LOGIN: '/api.php/auth/login',
            HEALTH_DATA: '/api.php/health-data',
            GOALS: '/api.php/goals',
            TRENDS: '/api.php/trends',
            STATISTICS: '/api.php/statistics'
        },
        TIMEOUT: 10000 // 10 seconds
    },
    
    // Validation rules
    VALIDATION: {
        PASSWORD_MIN_LENGTH: 6,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        NAME_MIN_LENGTH: 2,
        STEPS_MAX: 100000,
        WATER_MAX: 10000,
        SLEEP_MAX: 24,
        CALORIES_MAX: 10000
    },
    
    // UI settings
    UI: {
        ANIMATION_DURATION: 300,
        MESSAGE_DISPLAY_TIME: 3000,
        CHART_HEIGHT: 400,
        MOBILE_BREAKPOINT: 768
    },
    
    // Feature flags
    FEATURES: {
        ENABLE_NOTIFICATIONS: false,
        ENABLE_EXPORT: true,
        ENABLE_IMPORT: true,
        ENABLE_GOAL_ACHIEVEMENTS: true,
        ENABLE_SOCIAL_FEATURES: false,
        ENABLE_ADVANCED_ANALYTICS: true
    },
    
    // Theme settings
    THEME: {
        PRIMARY_COLOR: '#667eea',
        SECONDARY_COLOR: '#764ba2',
        SUCCESS_COLOR: '#28a745',
        WARNING_COLOR: '#ffc107',
        ERROR_COLOR: '#dc3545',
        INFO_COLOR: '#17a2b8'
    },
    
    // Date format settings
    DATE_FORMAT: {
        DISPLAY: 'MMM DD, YYYY',
        INPUT: 'YYYY-MM-DD',
        CHART: 'MMM DD'
    },
    
    // Export settings
    EXPORT: {
        FORMATS: ['csv', 'json', 'pdf'],
        DEFAULT_FORMAT: 'csv',
        INCLUDE_GOALS: true,
        INCLUDE_STATISTICS: true
    }
};

// Utility functions for configuration
const ConfigUtils = {
    // Get configuration value by path
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], CONFIG);
    },
    
    // Set configuration value by path
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, CONFIG);
        target[lastKey] = value;
    },
    
    // Get theme color
    getThemeColor(colorName) {
        return CONFIG.THEME[colorName.toUpperCase() + '_COLOR'] || CONFIG.THEME.PRIMARY_COLOR;
    },
    
    // Get chart color for metric
    getChartColor(metric) {
        return CONFIG.CHART_COLORS[metric] || CONFIG.THEME.PRIMARY_COLOR;
    },
    
    // Check if feature is enabled
    isFeatureEnabled(featureName) {
        return CONFIG.FEATURES[featureName.toUpperCase()] || false;
    },
    
    // Get storage key
    getStorageKey(keyName) {
        return CONFIG.STORAGE_KEYS[keyName.toUpperCase()] || keyName;
    },
    
    // Validate input based on rules
    validate(input, type) {
        const rules = CONFIG.VALIDATION;
        
        switch (type) {
            case 'email':
                return rules.EMAIL_REGEX.test(input);
            case 'password':
                return input.length >= rules.PASSWORD_MIN_LENGTH;
            case 'name':
                return input.length >= rules.NAME_MIN_LENGTH;
            case 'steps':
                return input >= 0 && input <= rules.STEPS_MAX;
            case 'water':
                return input >= 0 && input <= rules.WATER_MAX;
            case 'sleep':
                return input >= 0 && input <= rules.SLEEP_MAX;
            case 'calories':
                return input >= 0 && input <= rules.CALORIES_MAX;
            default:
                return true;
        }
    },
    
    // Format date according to config
    formatDate(date, format = 'DISPLAY') {
        const dateObj = new Date(date);
        const formatStr = CONFIG.DATE_FORMAT[format];
        
        switch (formatStr) {
            case 'MMM DD, YYYY':
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            case 'YYYY-MM-DD':
                return dateObj.toISOString().split('T')[0];
            case 'MMM DD':
                return dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            default:
                return dateObj.toLocaleDateString();
        }
    }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
window.ConfigUtils = ConfigUtils;
