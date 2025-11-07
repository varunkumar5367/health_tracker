<?php
/**
 * Health Tracker System - API Backend
 * This file provides REST API endpoints for database integration
 * 
 * Usage: Replace localStorage functions in script.js with API calls to this file
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$config = [
    'host' => 'localhost',
    'dbname' => 'health_tracker',
    'username' => 'health_tracker_user',
    'password' => 'secure_password',
    'charset' => 'utf8mb4'
];

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}",
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api.php', '', $path);

// Parse request data
$input = json_decode(file_get_contents('php://input'), true);

// Route requests
switch ($method) {
    case 'POST':
        if ($path === '/auth/register') {
            registerUser($pdo, $input);
        } elseif ($path === '/auth/login') {
            loginUser($pdo, $input);
        } elseif ($path === '/health-data') {
            addHealthData($pdo, $input);
        } elseif ($path === '/goals') {
            updateGoals($pdo, $input);
        }
        break;
        
    case 'GET':
        if ($path === '/health-data') {
            getHealthData($pdo, $_GET);
        } elseif ($path === '/trends') {
            getTrendsData($pdo, $_GET);
        } elseif ($path === '/goals') {
            getGoals($pdo, $_GET);
        } elseif ($path === '/statistics') {
            getUserStatistics($pdo, $_GET);
        }
        break;
        
    case 'PUT':
        if (preg_match('/^\/health-data\/(\d+)$/', $path, $matches)) {
            updateHealthData($pdo, $matches[1], $input);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/^\/health-data\/(\d+)$/', $path, $matches)) {
            deleteHealthData($pdo, $matches[1]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// User registration
function registerUser($pdo, $data) {
    try {
        // Validate input
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name, email, and password are required']);
            return;
        }
        
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'User with this email already exists']);
            return;
        }
        
        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $passwordHash]);
        
        $userId = $pdo->lastInsertId();
        
        // Create default goals (trigger should handle this, but adding as backup)
        $goalTypes = ['daily', 'weekly', 'monthly'];
        $defaultGoals = [
            'daily' => [10000, 2000, 8.0, 2000],
            'weekly' => [70000, 14000, 56.0, 14000],
            'monthly' => [300000, 60000, 240.0, 60000]
        ];
        
        foreach ($goalTypes as $type) {
            $goals = $defaultGoals[$type];
            $stmt = $pdo->prepare("INSERT INTO goals (user_id, goal_type, steps_goal, water_goal, sleep_goal, calories_goal) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $type, $goals[0], $goals[1], $goals[2], $goals[3]]);
        }
        
        echo json_encode(['success' => true, 'user_id' => $userId, 'message' => 'User registered successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
    }
}

// User login
function loginUser($pdo, $data) {
    try {
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }
        
        // Remove password hash from response
        unset($user['password_hash']);
        $user['user_id'] = $user['id'];
        unset($user['id']);
        
        echo json_encode(['success' => true, 'user' => $user, 'message' => 'Login successful']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
    }
}

// Add health data
function addHealthData($pdo, $data) {
    try {
        $required = ['user_id', 'date', 'steps', 'water_ml', 'sleep_hours', 'calories'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }
        
        $stmt = $pdo->prepare("CALL UpsertHealthData(?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['date'],
            $data['steps'],
            $data['water_ml'],
            $data['sleep_hours'],
            $data['calories']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Health data saved successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save health data: ' . $e->getMessage()]);
    }
}

// Get health data
function getHealthData($pdo, $params) {
    try {
        if (empty($params['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }
        
        $startDate = $params['start_date'] ?? date('Y-m-d', strtotime('-30 days'));
        $endDate = $params['end_date'] ?? date('Y-m-d');
        
        $stmt = $pdo->prepare("CALL GetUserHealthData(?, ?, ?)");
        $stmt->execute([$params['user_id'], $startDate, $endDate]);
        $data = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $data]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch health data: ' . $e->getMessage()]);
    }
}

// Get trends data
function getTrendsData($pdo, $params) {
    try {
        if (empty($params['user_id']) || empty($params['days']) || empty($params['metric'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID, days, and metric are required']);
            return;
        }
        
        $metricMap = [
            'steps' => 'steps',
            'water' => 'water_ml',
            'sleep' => 'sleep_hours',
            'calories' => 'calories'
        ];
        
        $metric = $metricMap[$params['metric']] ?? 'steps';
        
        $stmt = $pdo->prepare("CALL GetUserTrendsData(?, ?, ?)");
        $stmt->execute([$params['user_id'], $params['days'], $metric]);
        $data = $stmt->fetchAll();
        
        echo json_encode(['success' => true, 'data' => $data]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch trends data: ' . $e->getMessage()]);
    }
}

// Update health data
function updateHealthData($pdo, $recordId, $data) {
    try {
        $required = ['steps', 'water_ml', 'sleep_hours', 'calories'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "Field '$field' is required"]);
                return;
            }
        }
        
        $stmt = $pdo->prepare("UPDATE health_data SET steps = ?, water_ml = ?, sleep_hours = ?, calories = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([
            $data['steps'],
            $data['water_ml'],
            $data['sleep_hours'],
            $data['calories'],
            $recordId
        ]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Health data updated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update health data: ' . $e->getMessage()]);
    }
}

// Delete health data
function deleteHealthData($pdo, $recordId) {
    try {
        $stmt = $pdo->prepare("DELETE FROM health_data WHERE id = ?");
        $stmt->execute([$recordId]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Record not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'message' => 'Health data deleted successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete health data: ' . $e->getMessage()]);
    }
}

// Get goals
function getGoals($pdo, $params) {
    try {
        if (empty($params['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT * FROM goals WHERE user_id = ? ORDER BY goal_type");
        $stmt->execute([$params['user_id']]);
        $goals = $stmt->fetchAll();
        
        // Format goals by type
        $formattedGoals = [];
        foreach ($goals as $goal) {
            $formattedGoals[$goal['goal_type']] = [
                'steps' => $goal['steps_goal'],
                'water' => $goal['water_goal'],
                'sleep' => $goal['sleep_goal'],
                'calories' => $goal['calories_goal']
            ];
        }
        
        echo json_encode(['success' => true, 'goals' => $formattedGoals]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch goals: ' . $e->getMessage()]);
    }
}

// Update goals
function updateGoals($pdo, $data) {
    try {
        if (empty($data['user_id']) || empty($data['goal_type'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and goal type are required']);
            return;
        }
        
        $goalType = $data['goal_type'];
        $goals = $data['goals'] ?? [];
        
        $stmt = $pdo->prepare("UPDATE goals SET steps_goal = ?, water_goal = ?, sleep_goal = ?, calories_goal = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND goal_type = ?");
        $stmt->execute([
            $goals['steps'] ?? 0,
            $goals['water'] ?? 0,
            $goals['sleep'] ?? 0,
            $goals['calories'] ?? 0,
            $data['user_id'],
            $goalType
        ]);
        
        echo json_encode(['success' => true, 'message' => ucfirst($goalType) . ' goals updated successfully']);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update goals: ' . $e->getMessage()]);
    }
}

// Get user statistics
function getUserStatistics($pdo, $params) {
    try {
        if (empty($params['user_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT * FROM user_statistics WHERE user_id = ?");
        $stmt->execute([$params['user_id']]);
        $stats = $stmt->fetch();
        
        if (!$stats) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            return;
        }
        
        echo json_encode(['success' => true, 'statistics' => $stats]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch user statistics: ' . $e->getMessage()]);
    }
}
?>
