import mysql from 'mysql2/promise';
export const pool = mysql.createPool({uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 10});
export async function initializeDatabase() {
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY, role ENUM('student','admin','staff') NOT NULL DEFAULT 'student',
    full_name VARCHAR(160) NOT NULL, email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(40) NULL, password_hash VARCHAR(255) NOT NULL,
    email_verified_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS email_verification_codes (
    id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL,
    code_hash VARCHAR(64) NOT NULL, expires_at DATETIME NOT NULL,
    consumed_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id), INDEX idx_verify_user(user_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at DATETIME NOT NULL,
    consumed_at DATETIME NULL, FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS student_profiles (
    user_id VARCHAR(36) PRIMARY KEY, biodata JSON NULL, completed_at DATETIME NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL,
    reference_number VARCHAR(80) NOT NULL UNIQUE, programme VARCHAR(160) NOT NULL,
    session_name VARCHAR(100) NULL, study_centre VARCHAR(160) NULL,
    subjects JSON NULL, status ENUM('draft','submitted','under_review','approved','action_required','rejected') NOT NULL DEFAULT 'draft',
    submitted_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id), INDEX idx_applicant(user_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY, application_id VARCHAR(36) NOT NULL,
    provider VARCHAR(40) NOT NULL, provider_reference VARCHAR(160) NULL UNIQUE,
    amount_kobo BIGINT NOT NULL, currency CHAR(3) NOT NULL DEFAULT 'NGN',
    status ENUM('pending','verified','failed','refunded') NOT NULL DEFAULT 'pending',
    verified_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(application_id) REFERENCES applications(id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cbt_rooms (
    id VARCHAR(36) PRIMARY KEY, title VARCHAR(160) NOT NULL,
    status ENUM('waiting','running','ended') NOT NULL DEFAULT 'waiting',
    starts_at DATETIME NULL, duration_seconds INT NOT NULL DEFAULT 7200,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, started_at DATETIME NULL, ended_at DATETIME NULL
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cbt_room_candidates (
    room_id VARCHAR(36) NOT NULL, candidate_id VARCHAR(100) NOT NULL,
    status ENUM('joined','in_progress','submitted') NOT NULL DEFAULT 'joined',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, submitted_at DATETIME NULL,
    submit_reason VARCHAR(40) NULL, PRIMARY KEY(room_id,candidate_id),
    FOREIGN KEY(room_id) REFERENCES cbt_rooms(id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cbt_room_answers (
    room_id VARCHAR(36) NOT NULL, candidate_id VARCHAR(100) NOT NULL,
    question_id VARCHAR(100) NOT NULL, option_index INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(room_id,candidate_id,question_id),
    FOREIGN KEY(room_id,candidate_id) REFERENCES cbt_room_candidates(room_id,candidate_id)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS cbt_room_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY, room_id VARCHAR(36) NOT NULL,
    candidate_id VARCHAR(100) NOT NULL, event_type VARCHAR(40) NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_room_events(room_id,occurred_at)
  )`);
}
