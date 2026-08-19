<?php
/**
 * ANTI-PSYCHOPATH.ORG / IBOGAINE DAO — Rehab Directory API
 * Endpoint: GET /api/rehabs.php?category={all|drug|behavioral|ptsd|online}
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=300');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
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

$category = strtolower(trim($_GET['category'] ?? 'all'));

// Static Fallback Facilities List (matching index.html DOM cards)
$static_rehabs = [
    [
        'id'          => 1,
        'name'        => 'Hope De-Addiction & Wellness Center',
        'category'    => 'drug',
        'location'    => 'Mumbai & Delhi, India (Rehabs.in Partner)',
        'description' => 'Medically supervised detoxification, 24/7 psychiatric oversight, Cognitive Behavioral Therapy (CBT), and holistic recovery programs.',
        'services'    => 'Opioid Detox · Alcohol Recovery · CBT',
        'badge'       => '✓ Verified Medical Facility'
    ],
    [
        'id'          => 2,
        'name'        => 'NeuroTrauma Clinical Institute',
        'category'    => 'ptsd',
        'location'    => 'Zurich, Switzerland & Telehealth Global',
        'description' => 'Leading research-backed trauma facility specializing in PTSD, veteran combat trauma, memory reconsolidation, and neuromodulation.',
        'services'    => 'PTSD Therapy · Neuromodulation · EMDR',
        'badge'       => '✓ Verified Medical Facility'
    ],
    [
        'id'          => 3,
        'name'        => 'Behavioral Recovery & Intimacy Center',
        'category'    => 'behavioral',
        'location'    => 'California, USA & Online Global',
        'description' => 'Confidential residential and outpatient facility treating Compulsive Sexual Behavior Disorder (CSBD), porn addiction, and impulse disorders.',
        'services'    => 'CSBD Therapy · Dopamine Reset · Couples Care',
        'badge'       => '✓ Verified Medical Facility'
    ],
    [
        'id'          => 4,
        'name'        => 'Global Tele-Psychiatry & Recovery Portal',
        'category'    => 'online',
        'location'    => 'Worldwide 24/7 Encrypted Tele-Psychiatry',
        'description' => 'Immediate virtual consultations with board-certified psychiatrists specializing in addiction medicine, CSBD, and trauma recovery.',
        'services'    => '24/7 Telehealth · E-Prescriptions · CBT',
        'badge'       => '✓ Verified Telehealth Service'
    ]
];

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

    $stmt = $pdo->query("SELECT * FROM retreat_partners WHERE status = 'approved' ORDER BY id ASC");
    $db_rehabs = $stmt->fetchAll();

    if (!empty($db_rehabs)) {
        $formatted = array_map(function($r) {
            $cat = 'drug';
            $loc = strtolower(($r['location_city'] ?? '') . ' ' . ($r['location_country'] ?? ''));
            if (strpos($loc, 'online') !== false || strpos($loc, 'telehealth') !== false) {
                $cat = 'online';
            } elseif (strpos(strtolower($r['description'] ?? ''), 'ptsd') !== false || strpos(strtolower($r['description'] ?? ''), 'trauma') !== false) {
                $cat = 'ptsd';
            } elseif (strpos(strtolower($r['description'] ?? ''), 'sexual') !== false || strpos(strtolower($r['description'] ?? ''), 'behavioral') !== false) {
                $cat = 'behavioral';
            }

            return [
                'id'          => (int) $r['id'],
                'name'        => $r['name'],
                'category'    => $cat,
                'location'    => ($r['location_city'] ?? '') . ', ' . ($r['location_country'] ?? ''),
                'description' => $r['description'] ?? '',
                'services'    => '24/7 Medical · ECG Telemetry · Integration',
                'badge'       => '✓ DAO Verified Partner'
            ];
        }, $db_rehabs);

        if ($category !== 'all') {
            $formatted = array_values(array_filter($formatted, function($item) use ($category) {
                return $item['category'] === $category;
            }));
        }

        http_response_code(200);
        echo json_encode([
            'success'  => true,
            'source'   => 'database',
            'category' => $category,
            'count'    => count($formatted),
            'data'     => $formatted
        ]);
        exit;
    }
} catch (Exception $e) {
    // Database connection or table absent - fall back to static list
}

// Fallback logic
$filtered = $static_rehabs;
if ($category !== 'all') {
    $filtered = array_values(array_filter($static_rehabs, function($item) use ($category) {
        return $item['category'] === $category;
    }));
}

http_response_code(200);
echo json_encode([
    'success'  => true,
    'source'   => 'static',
    'category' => $category,
    'count'    => count($filtered),
    'data'     => $filtered
]);
