import mysql from 'mysql2/promise';
export const pool = mysql.createPool({uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 10});
export async function initializeDatabase() {
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
