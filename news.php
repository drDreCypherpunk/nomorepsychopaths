<?php
/**
 * IBOGAINE DAO — News Feed RSS Aggregator
 * Aggregates multiple RSS sources, caches for 30 minutes
 * Endpoint: GET /api/news.php?limit=20&category=all
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: public, max-age=1800');

// ── CONFIG ──
define('CACHE_FILE', __DIR__ . '/../cache/news_feed.json');
define('CACHE_TTL',  1800); // 30 minutes
define('MAX_ITEMS',  50);

$limit    = min((int) ($_GET['limit']    ?? 20), MAX_ITEMS);
$category = strtolower($_GET['category'] ?? 'all');

// ── RSS SOURCES ──
$sources = [
  [
    'url'      => 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=ibogaine&format=rss&limit=10',
    'category' => 'research',
    'name'     => 'PubMed',
  ],
  [
    'url'      => 'https://www.iceers.org/feed/',
    'category' => 'research',
    'name'     => 'ICEERS',
  ],
  [
    'url'      => 'https://chacruna.net/feed/',
    'category' => 'research',
    'name'     => 'Chacruna',
  ],
  [
    'url'      => 'https://maps.org/feed/',
    'category' => 'research',
    'name'     => 'MAPS',
  ],
  [
    'url'      => 'https://www.nature.com/subjects/psychiatry.rss',
    'category' => 'neuro',
    'name'     => 'Nature Medicine',
  ],
];

// ── CACHE CHECK ──
if (file_exists(CACHE_FILE) && (time() - filemtime(CACHE_FILE)) < CACHE_TTL) {
  $cached = json_decode(file_get_contents(CACHE_FILE), true);
  echo json_encode(filter_items($cached, $category, $limit));
  exit;
}

// ── FETCH FEEDS ──
$all_items = [];

foreach ($sources as $source) {
  $xml = fetch_rss($source['url']);
  if (!$xml) continue;

  $items = parse_rss($xml, $source['name'], $source['category']);
  $all_items = array_merge($all_items, $items);
}

// Sort by date descending
usort($all_items, fn($a, $b) => $b['timestamp'] - $a['timestamp']);

// Deduplicate by URL
$seen = [];
$all_items = array_filter($all_items, function($item) use (&$seen) {
  if (isset($seen[$item['url']])) return false;
  $seen[$item['url']] = true;
  return true;
});

$all_items = array_values($all_items);

// Cache result
@mkdir(dirname(CACHE_FILE), 0755, true);
file_put_contents(CACHE_FILE, json_encode($all_items), LOCK_EX);

echo json_encode(filter_items($all_items, $category, $limit));

// ── HELPERS ──
function fetch_rss(string $url): ?string {
  $ctx = stream_context_create([
    'http' => [
      'method'          => 'GET',
      'timeout'         => 8,
      'user_agent'      => 'IBOGaineDAO/1.0 (+https://ibogaine.dao)',
      'follow_location' => true,
    ],
    'ssl' => ['verify_peer' => false], // Hostinger shared hosting may need this
  ]);

  $content = @file_get_contents($url, false, $ctx);
  return $content ?: null;
}

function parse_rss(string $xml_str, string $source, string $category): array {
  libxml_use_internal_errors(true);
  $xml = simplexml_load_string($xml_str, 'SimpleXMLElement', LIBXML_NOCDATA);
  if (!$xml) return [];

  $items = [];

  // Standard RSS 2.0
  $channel = $xml->channel ?? $xml;
  foreach ($channel->item as $item) {
    $title   = trim((string) ($item->title ?? ''));
    $link    = trim((string) ($item->link  ?? ''));
    $desc    = strip_tags(trim((string) ($item->description ?? '')));
    $date    = trim((string) ($item->pubDate ?? ''));
    $ts      = $date ? strtotime($date) : time();

    // Filter for ibogaine/psychedelic relevance
    $text = strtolower($title . ' ' . $desc);
    $relevant_keywords = ['ibogaine', 'iboga', 'psychedelic', 'psilocybin', 'ptsd', 'addiction', 'bwiti', 'noribogaine', 'opioid', 'gaine'];
    $is_relevant = false;
    foreach ($relevant_keywords as $kw) {
      if (strpos($text, $kw) !== false) { $is_relevant = true; break; }
    }

    if (!$title || !$link) continue;

    $items[] = [
      'title'     => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
      'url'       => filter_var($link, FILTER_SANITIZE_URL),
      'desc'      => mb_substr($desc, 0, 300),
      'source'    => $source,
      'category'  => $category,
      'relevant'  => $is_relevant,
      'date'      => $date ?: date('r'),
      'timestamp' => $ts ?: time(),
    ];
  }

  return $items;
}

function filter_items(array $items, string $category, int $limit): array {
  if ($category !== 'all') {
    $items = array_filter($items, fn($i) => $i['category'] === $category);
  }
  return array_slice(array_values($items), 0, $limit);
}
