<?php
/**
 * IBOGAINE DAO — DAO Proposals API
 * MySQL-backed proposal CRUD + voting
 * Requires: DB_HOST, DB_NAME, DB_USER, DB_PASS in env or config.php
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── CONFIG ──
$config_file = __DIR__ . '/../config.php';
if (file_exists($config_file)) require_once $config_file;

define('DB_HOST', getenv('DB_HOST') ?: (defined('DB_HOST_CONST') ? DB_HOST_CONST : 'localhost'));
define('DB_NAME', getenv('DB_NAME') ?: (defined('DB_NAME_CONST') ? DB_NAME_CONST : 'ibogaine_dao'));
define('DB_USER', getenv('DB_USER') ?: (defined('DB_USER_CONST') ? DB_USER_CONST : 'root'));
define('DB_PASS', getenv('DB_PASS') ?: (defined('DB_PASS_CONST') ? DB_PASS_CONST : ''));

// ── DATABASE ──
function get_db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;
  try {
    $pdo = new PDO(
      'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
      DB_USER, DB_PASS,
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
    // Create tables if not exist
    $pdo->exec("
      CREATE TABLE IF NOT EXISTS proposals (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        title       VARCHAR(255)  NOT NULL,
        description TEXT          NOT NULL,
        status      ENUM('active','passed','rejected','pending') DEFAULT 'pending',
        votes_for   INT DEFAULT 0,
        votes_against INT DEFAULT 0,
        total_votes INT DEFAULT 0,
        ends_at     DATETIME,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votes (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id INT NOT NULL,
        wallet_addr VARCHAR(64) NOT NULL,
        vote        ENUM('for','against') NOT NULL,
        gaine_balance DECIMAL(18,6) DEFAULT 0,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (proposal_id, wallet_addr),
        FOREIGN KEY (proposal_id) REFERENCES proposals(id)
      );
    ");
    return $pdo;
  } catch (PDOException $e) {
    http_response_code(503);
    echo json_encode(['error' => 'Database unavailable', 'detail' => $e->getMessage()]);
    exit;
  }
}

// ── ROUTE ──
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

if ($method === 'GET') {
  if ($action === 'list') {
    list_proposals();
  } elseif ($action === 'get' && isset($_GET['id'])) {
    get_proposal((int) $_GET['id']);
  } else {
    json_error(400, 'Unknown action');
  }
} elseif ($method === 'POST') {
  $body = json_decode(file_get_contents('php://input'), true) ?? [];
  if ($action === 'vote') {
    submit_vote($body);
  } elseif ($action === 'create') {
    create_proposal($body);
  } else {
    json_error(400, 'Unknown action');
  }
} else {
  json_error(405, 'Method not allowed');
}

// ── HANDLERS ──
function list_proposals(): void {
  $db = get_db();
  $status = $_GET['status'] ?? null;

  if ($status) {
    $stmt = $db->prepare('SELECT * FROM proposals WHERE status = ? ORDER BY created_at DESC LIMIT 20');
    $stmt->execute([$status]);
  } else {
    $stmt = $db->query('SELECT * FROM proposals ORDER BY created_at DESC LIMIT 20');
  }

  $proposals = $stmt->fetchAll();

  // Add approval_pct
  foreach ($proposals as &$p) {
    $total = $p['votes_for'] + $p['votes_against'];
    $p['approval_pct'] = $total > 0 ? round($p['votes_for'] / $total * 100) : 0;
  }

  echo json_encode(['proposals' => $proposals, 'count' => count($proposals)]);
}

function get_proposal(int $id): void {
  $db = get_db();
  $stmt = $db->prepare('SELECT * FROM proposals WHERE id = ?');
  $stmt->execute([$id]);
  $p = $stmt->fetch();
  if (!$p) { json_error(404, 'Proposal not found'); return; }
  $total = $p['votes_for'] + $p['votes_against'];
  $p['approval_pct'] = $total > 0 ? round($p['votes_for'] / $total * 100) : 0;
  echo json_encode($p);
}

function submit_vote(array $body): void {
  $proposal_id = (int) ($body['proposal_id'] ?? 0);
  $wallet      = sanitize_wallet($body['wallet_addr'] ?? '');
  $vote        = in_array($body['vote'] ?? '', ['for', 'against']) ? $body['vote'] : null;
  $balance     = (float) ($body['gaine_balance'] ?? 0);

  if (!$proposal_id || !$wallet || !$vote) {
    json_error(400, 'Missing required fields: proposal_id, wallet_addr, vote');
    return;
  }

  // Minimum GAINE balance to vote
  if ($balance < 100) {
    json_error(403, 'Minimum 100 GAINE required to vote');
    return;
  }

  $db = get_db();

  // Check proposal is active
  $stmt = $db->prepare('SELECT * FROM proposals WHERE id = ? AND status = "active"');
  $stmt->execute([$proposal_id]);
  if (!$stmt->fetch()) { json_error(403, 'Proposal is not active'); return; }

  try {
    $db->prepare('INSERT INTO votes (proposal_id, wallet_addr, vote, gaine_balance) VALUES (?, ?, ?, ?)')
       ->execute([$proposal_id, $wallet, $vote, $balance]);

    // Update vote counts
    $db->prepare('UPDATE proposals SET votes_for = (SELECT COUNT(*) FROM votes WHERE proposal_id=? AND vote="for"), votes_against = (SELECT COUNT(*) FROM votes WHERE proposal_id=? AND vote="against"), total_votes = (SELECT COUNT(*) FROM votes WHERE proposal_id=?) WHERE id=?')
       ->execute([$proposal_id, $proposal_id, $proposal_id, $proposal_id]);

    echo json_encode(['success' => true, 'message' => 'Vote recorded']);
  } catch (PDOException $e) {
    if (str_contains($e->getMessage(), 'Duplicate')) {
      json_error(409, 'You have already voted on this proposal');
    } else {
      json_error(500, 'Vote recording failed');
    }
  }
}

function create_proposal(array $body): void {
  // In production: verify DAO admin signature
  $title       = htmlspecialchars(trim($body['title']       ?? ''), ENT_QUOTES, 'UTF-8');
  $description = htmlspecialchars(trim($body['description'] ?? ''), ENT_QUOTES, 'UTF-8');
  $ends_at     = $body['ends_at'] ?? date('Y-m-d H:i:s', strtotime('+7 days'));

  if (!$title || !$description) { json_error(400, 'Title and description required'); return; }

  $db = get_db();
  $stmt = $db->prepare('INSERT INTO proposals (title, description, status, ends_at) VALUES (?, ?, "pending", ?)');
  $stmt->execute([$title, $description, $ends_at]);

  echo json_encode(['success' => true, 'id' => $db->lastInsertId()]);
}

// ── UTILS ──
function sanitize_wallet(string $addr): string {
  // Basic Solana address validation (base58, 32-44 chars)
  if (!preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $addr)) return '';
  return $addr;
}

function json_error(int $code, string $msg): void {
  http_response_code($code);
  echo json_encode(['error' => $msg]);
  exit;
}
