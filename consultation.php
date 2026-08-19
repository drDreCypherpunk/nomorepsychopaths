<?php
/**
 * ANTI-PSYCHOPATH.ORG / IBOGAINE DAO — Psychiatric Consultation Intake API
 * Endpoint: POST /api/consultation.php
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Config & DB connection
$config_file = __DIR__ . '/../config.php';
if (file_exists($config_file)) {
    require_once $config_file;
}

define('DB_HOST', getenv('DB_HOST') ?: (defined('DB_HOST_CONST') ? DB_HOST_CONST : 'localhost'));
define('DB_NAME', getenv('DB_NAME') ?: (defined('DB_NAME_CONST') ? DB_NAME_CONST : 'ibogaine_dao'));
define('DB_USER', getenv('DB_USER') ?: (defined('DB_USER_CONST') ? DB_USER_CONST : 'root'));
define('DB_PASS', getenv('DB_PASS') ?: (defined('DB_PASS_CONST') ? DB_PASS_CONST : ''));

// Read JSON payload or Form payload
$raw_input = file_get_contents('php://input');
$body = json_decode($raw_input, true);
if (!is_array($body)) {
    $body = $_POST;
}

$full_name      = htmlspecialchars(trim($body['full_name'] ?? ''), ENT_QUOTES, 'UTF-8');
$contact_info   = htmlspecialchars(trim($body['contact_info'] ?? ''), ENT_QUOTES, 'UTF-8');
$condition_type = htmlspecialchars(trim($body['condition_type'] ?? 'General Intake'), ENT_QUOTES, 'UTF-8');
$notes          = htmlspecialchars(trim($body['notes'] ?? ''), ENT_QUOTES, 'UTF-8');

if (empty($full_name) || empty($contact_info)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Full name and contact information are required.']);
    exit;
}

// Attempt Database Storage
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER, DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 2
        ]
    );

    // Auto-create consultations table if not exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `consultations` (
            `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            `full_name`      VARCHAR(255) NOT NULL,
            `contact_info`   VARCHAR(255) NOT NULL,
            `condition_type` VARCHAR(100) NOT NULL,
            `notes`          TEXT NULL,
            `ip_hash`        VARCHAR(64) NULL,
            `status`         ENUM('new','contacted','resolved') DEFAULT 'new',
            `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');

    $stmt = $pdo->prepare("
        INSERT INTO consultations (full_name, contact_info, condition_type, notes, ip_hash)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$full_name, $contact_info, $condition_type, $notes, $ip_hash]);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Thank you. Your confidential consultation request has been received. A psychiatric specialist will reach out to you within 24 hours.',
        'id'      => (int) $pdo->lastInsertId()
    ]);
} catch (Exception $e) {
    // Database connection or operation failed - fallback to log file storage
    $log_dir = __DIR__ . '/../cache';
    if (!is_dir($log_dir)) {
        @mkdir($log_dir, 0755, true);
    }
    $log_data = [
        'timestamp'      => date('Y-m-d H:i:s'),
        'full_name'      => $full_name,
        'contact_info'   => $contact_info,
        'condition_type' => $condition_type,
        'notes'          => $notes,
        'ip_hash'        => hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1')
    ];
    @file_put_contents($log_dir . '/consultations_fallback.log', json_encode($log_data) . PHP_EOL, FILE_APPEND);

    http_response_code(200);
    echo json_encode([
        'success'  => true,
        'message'  => 'Thank you. Your confidential consultation request has been received. A psychiatric specialist will reach out to you within 24 hours.',
        'fallback' => true
    ]);
}
