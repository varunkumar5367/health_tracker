-- Health Tracker System Database Schema
-- This SQL file contains the complete database structure for the Health Tracker System

-- Create database
CREATE DATABASE IF NOT EXISTS health_tracker;
USE health_tracker;

-- Users table for storing user accounts
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Health data table for storing daily health metrics
CREATE TABLE IF NOT EXISTS health_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    steps INT DEFAULT 0,
    water_ml INT DEFAULT 0,
    sleep_hours DECIMAL(4,2) DEFAULT 0,
    calories INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date),
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_user_date (user_id, date)
);

-- Goals table for storing user health goals
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_type ENUM('daily', 'weekly', 'monthly') NOT NULL,
    steps_goal INT DEFAULT 0,
    water_goal INT DEFAULT 0,
    sleep_goal DECIMAL(4,2) DEFAULT 0,
    calories_goal INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_goal_type (user_id, goal_type),
    INDEX idx_user_id (user_id),
    INDEX idx_goal_type (goal_type)
);

-- User sessions table for managing user sessions (optional for enhanced security)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Health insights table for storing calculated insights and recommendations
CREATE TABLE IF NOT EXISTS health_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    insight_type ENUM('achievement', 'warning', 'recommendation') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    metric_type ENUM('steps', 'water', 'sleep', 'calories') NOT NULL,
    target_date DATE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_insight_type (insight_type),
    INDEX idx_metric_type (metric_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Insert default goals for new users (trigger will handle this)
DELIMITER //

CREATE TRIGGER IF NOT EXISTS set_default_goals_after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    -- Insert default daily goals
    INSERT INTO goals (user_id, goal_type, steps_goal, water_goal, sleep_goal, calories_goal)
    VALUES (NEW.id, 'daily', 10000, 2000, 8.0, 2000);
    
    -- Insert default weekly goals
    INSERT INTO goals (user_id, goal_type, steps_goal, water_goal, sleep_goal, calories_goal)
    VALUES (NEW.id, 'weekly', 70000, 14000, 56.0, 14000);
    
    -- Insert default monthly goals
    INSERT INTO goals (user_id, goal_type, steps_goal, water_goal, sleep_goal, calories_goal)
    VALUES (NEW.id, 'monthly', 300000, 60000, 240.0, 60000);
END//

DELIMITER ;

-- Views for common queries

-- Daily progress view
CREATE OR REPLACE VIEW daily_progress AS
SELECT 
    hd.user_id,
    hd.date,
    hd.steps,
    hd.water_ml,
    hd.sleep_hours,
    hd.calories,
    dg.steps_goal as daily_steps_goal,
    dg.water_goal as daily_water_goal,
    dg.sleep_goal as daily_sleep_goal,
    dg.calories_goal as daily_calories_goal,
    ROUND((hd.steps / dg.steps_goal) * 100, 2) as steps_percentage,
    ROUND((hd.water_ml / dg.water_goal) * 100, 2) as water_percentage,
    ROUND((hd.sleep_hours / dg.sleep_goal) * 100, 2) as sleep_percentage,
    ROUND((hd.calories / dg.calories_goal) * 100, 2) as calories_percentage
FROM health_data hd
LEFT JOIN goals dg ON hd.user_id = dg.user_id AND dg.goal_type = 'daily';

-- Weekly summary view
CREATE OR REPLACE VIEW weekly_summary AS
SELECT 
    hd.user_id,
    YEAR(hd.date) as year,
    WEEK(hd.date) as week,
    MIN(hd.date) as week_start,
    MAX(hd.date) as week_end,
    SUM(hd.steps) as total_steps,
    SUM(hd.water_ml) as total_water,
    AVG(hd.sleep_hours) as avg_sleep,
    SUM(hd.calories) as total_calories,
    COUNT(*) as days_tracked,
    wg.steps_goal as weekly_steps_goal,
    wg.water_goal as weekly_water_goal,
    wg.sleep_goal as weekly_sleep_goal,
    wg.calories_goal as weekly_calories_goal,
    ROUND((SUM(hd.steps) / wg.steps_goal) * 100, 2) as steps_percentage,
    ROUND((SUM(hd.water_ml) / wg.water_goal) * 100, 2) as water_percentage,
    ROUND((AVG(hd.sleep_hours) / (wg.sleep_goal / 7)) * 100, 2) as sleep_percentage,
    ROUND((SUM(hd.calories) / wg.calories_goal) * 100, 2) as calories_percentage
FROM health_data hd
LEFT JOIN goals wg ON hd.user_id = wg.user_id AND wg.goal_type = 'weekly'
GROUP BY hd.user_id, YEAR(hd.date), WEEK(hd.date), wg.steps_goal, wg.water_goal, wg.sleep_goal, wg.calories_goal;

-- Monthly summary view
CREATE OR REPLACE VIEW monthly_summary AS
SELECT 
    hd.user_id,
    YEAR(hd.date) as year,
    MONTH(hd.date) as month,
    MIN(hd.date) as month_start,
    MAX(hd.date) as month_end,
    SUM(hd.steps) as total_steps,
    SUM(hd.water_ml) as total_water,
    AVG(hd.sleep_hours) as avg_sleep,
    SUM(hd.calories) as total_calories,
    COUNT(*) as days_tracked,
    mg.steps_goal as monthly_steps_goal,
    mg.water_goal as monthly_water_goal,
    mg.sleep_goal as monthly_sleep_goal,
    mg.calories_goal as monthly_calories_goal,
    ROUND((SUM(hd.steps) / mg.steps_goal) * 100, 2) as steps_percentage,
    ROUND((SUM(hd.water_ml) / mg.water_goal) * 100, 2) as water_percentage,
    ROUND((AVG(hd.sleep_hours) / (mg.sleep_goal / 30)) * 100, 2) as sleep_percentage,
    ROUND((SUM(hd.calories) / mg.calories_goal) * 100, 2) as calories_percentage
FROM health_data hd
LEFT JOIN goals mg ON hd.user_id = mg.user_id AND mg.goal_type = 'monthly'
GROUP BY hd.user_id, YEAR(hd.date), MONTH(hd.date), mg.steps_goal, mg.water_goal, mg.sleep_goal, mg.calories_goal;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.created_at as joined_date,
    COUNT(hd.id) as total_days_tracked,
    COALESCE(AVG(hd.steps), 0) as avg_daily_steps,
    COALESCE(AVG(hd.water_ml), 0) as avg_daily_water,
    COALESCE(AVG(hd.sleep_hours), 0) as avg_daily_sleep,
    COALESCE(AVG(hd.calories), 0) as avg_daily_calories,
    MAX(hd.date) as last_activity_date
FROM users u
LEFT JOIN health_data hd ON u.id = hd.user_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Stored procedures for common operations

-- Procedure to get user's health data for a date range
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetUserHealthData(
    IN p_user_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        hd.*,
        dg.steps_goal as daily_steps_goal,
        dg.water_goal as daily_water_goal,
        dg.sleep_goal as daily_sleep_goal,
        dg.calories_goal as daily_calories_goal
    FROM health_data hd
    LEFT JOIN goals dg ON hd.user_id = dg.user_id AND dg.goal_type = 'daily'
    WHERE hd.user_id = p_user_id 
    AND hd.date BETWEEN p_start_date AND p_end_date
    ORDER BY hd.date DESC;
END//
DELIMITER ;

-- Procedure to get user's trends data for charts
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS GetUserTrendsData(
    IN p_user_id INT,
    IN p_days INT,
    IN p_metric ENUM('steps', 'water_ml', 'sleep_hours', 'calories')
)
BEGIN
    DECLARE v_start_date DATE;
    SET v_start_date = DATE_SUB(CURDATE(), INTERVAL p_days DAY);
    
    SELECT 
        hd.date,
        CASE p_metric
            WHEN 'steps' THEN hd.steps
            WHEN 'water_ml' THEN hd.water_ml
            WHEN 'sleep_hours' THEN hd.sleep_hours
            WHEN 'calories' THEN hd.calories
        END as metric_value,
        CASE p_metric
            WHEN 'steps' THEN dg.steps_goal
            WHEN 'water_ml' THEN dg.water_goal
            WHEN 'sleep_hours' THEN dg.sleep_goal
            WHEN 'calories' THEN dg.calories_goal
        END as daily_goal
    FROM health_data hd
    LEFT JOIN goals dg ON hd.user_id = dg.user_id AND dg.goal_type = 'daily'
    WHERE hd.user_id = p_user_id 
    AND hd.date >= v_start_date
    ORDER BY hd.date ASC;
END//
DELIMITER ;

-- Procedure to update or insert health data
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS UpsertHealthData(
    IN p_user_id INT,
    IN p_date DATE,
    IN p_steps INT,
    IN p_water_ml INT,
    IN p_sleep_hours DECIMAL(4,2),
    IN p_calories INT
)
BEGIN
    INSERT INTO health_data (user_id, date, steps, water_ml, sleep_hours, calories)
    VALUES (p_user_id, p_date, p_steps, p_water_ml, p_sleep_hours, p_calories)
    ON DUPLICATE KEY UPDATE
        steps = p_steps,
        water_ml = p_water_ml,
        sleep_hours = p_sleep_hours,
        calories = p_calories,
        updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Sample data for testing (optional)
-- Uncomment the following lines to insert sample data for testing

/*
-- Insert sample user
INSERT INTO users (name, email, password_hash) 
VALUES ('John Doe', 'john@example.com', '$2b$10$example_hash_here');

-- Get the user ID for sample data
SET @user_id = LAST_INSERT_ID();

-- Insert sample health data for the last 30 days
INSERT INTO health_data (user_id, date, steps, water_ml, sleep_hours, calories)
SELECT 
    @user_id,
    DATE_SUB(CURDATE(), INTERVAL seq.seq DAY) as date,
    FLOOR(RAND() * 5000) + 8000 as steps,
    FLOOR(RAND() * 1000) + 1500 as water_ml,
    ROUND(RAND() * 2 + 7, 1) as sleep_hours,
    FLOOR(RAND() * 500) + 1800 as calories
FROM (
    SELECT 0 as seq UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION
    SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION
    SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29
) seq
ORDER BY seq;
*/

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_data_user_date ON health_data(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_type ON goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_health_insights_user_type ON health_insights(user_id, insight_type);

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON health_tracker.* TO 'health_tracker_user'@'localhost' IDENTIFIED BY 'secure_password';
-- FLUSH PRIVILEGES;
