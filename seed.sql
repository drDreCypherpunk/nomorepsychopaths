-- IBOGAINE DAO — Production Seed Dataset
-- Compatibility: MySQL 5.7 / 8.0+ / MariaDB 10.3+
-- Purpose: Populates all 5 database schema tables with realistic clinical study data, DAO proposals, certified retreat centers, airdrop allocations, and votes.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- ── 1. PROPOSALS TABLE ──
TRUNCATE TABLE `votes`;
TRUNCATE TABLE `proposals`;

INSERT INTO `proposals` (
  `id`, `title`, `description`, `status`, `votes_for`, `votes_against`, `total_votes`, `approval_pct`, `ends_at`, `created_at`, `updated_at`
) VALUES
(
  1,
  'Fund ICEERS Voacanga africana Clinical Trial Phase 2',
  'Allocate 15,000 GAINE treasury tokens to fund continuation of ICEERS Spain/Gabon ibogaine clinical trial using sustainable Voacanga africana semi-synthesis sourcing. Phase 2 targets 80 participants with full CYP2D6 genotyping and continuous 24/7 QTc telemetry.',
  'active',
  245,
  35,
  280,
  88,
  DATE_ADD(NOW(), INTERVAL 5 DAY),
  DATE_SUB(NOW(), INTERVAL 2 DAY),
  DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
  2,
  'Certify 3 New Retreat Partners (Mexico, Netherlands, Portugal)',
  'DAO review of three new retreat center applications: Crossroads Treatment Center (Rosarito, Mexico), BEOND Medical (Amsterdam, Netherlands), and Tabula Rasa Retreat (Alentejo, Portugal). All meet Stanford safety criteria including 24/7 ECG monitoring, cardiologist on-site, and magnesium IV protocols.',
  'active',
  380,
  20,
  400,
  95,
  DATE_ADD(NOW(), INTERVAL 7 DAY),
  DATE_SUB(NOW(), INTERVAL 1 DAY),
  DATE_SUB(NOW(), INTERVAL 1 DAY)
),
(
  3,
  'Add GAINE/USDC Pool to Jupiter V6 with 5,000 GAINE Seed Liquidity',
  'Expands GAINE trading pairs to 30+. Increases DEX liquidity and arbitrage efficiency across Solana ecosystem, maximizing 2% fee collection directed to treasury and Gabon rainforest conservation.',
  'passed',
  512,
  48,
  560,
  91,
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  DATE_SUB(NOW(), INTERVAL 10 DAY),
  DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
  4,
  'Allocate $10K GAINE Treasury to Gabon Anti-Poaching Patrols 2026',
  'Direct quarterly allocation to OEKOFORCE anti-poaching ranger network protecting wild Tabernanthe iboga stands in Lopé and Ivindo National Parks under Gabon Decree 0239 benefit-sharing mandates.',
  'pending',
  0,
  0,
  0,
  0,
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  NOW(),
  NOW()
),
(
  5,
  'Noribogaine Synthetic Derivative Open-Source Patent Defense Fund',
  'Establish a 25,000 GAINE DAO defense fund to maintain open-source public domain access for noribogaine treatment protocols against proprietary pharmaceutical patent blocking.',
  'passed',
  620,
  30,
  650,
  95,
  DATE_SUB(NOW(), INTERVAL 12 DAY),
  DATE_SUB(NOW(), INTERVAL 19 DAY),
  DATE_SUB(NOW(), INTERVAL 12 DAY)
),
(
  6,
  'Fund Bwiti House Cultural Preservation & Sanctuary Infrastructure',
  'Direct community grant of 10,000 GAINE to support traditional Babongo Bwiti ritual spaces, indigenous knowledge preservation, and educational centers in Libreville and Tsamba-Magotsi, Gabon.',
  'active',
  195,
  15,
  210,
  93,
  DATE_ADD(NOW(), INTERVAL 4 DAY),
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- ── 2. VOTES TABLE ──
INSERT INTO `votes` (
  `id`, `proposal_id`, `wallet_addr`, `vote`, `gaine_balance`, `ip_hash`, `created_at`
) VALUES
(1, 1, 'GAinSTufAma6Z53W1EveJPYSXh2bJySw4k2kZ1TMoLF3', 'for', 50000.000000, SHA2('192.168.1.1', 256), DATE_SUB(NOW(), INTERVAL 47 HOUR)),
(2, 1, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'for', 12500.000000, SHA2('192.168.1.2', 256), DATE_SUB(NOW(), INTERVAL 40 HOUR)),
(3, 1, '3KzJ4q9Pxs3G1V3L9oH7tX7Z2sY1W9k5B2v8M4N1Q7r2', 'against', 2500.000000, SHA2('192.168.1.3', 256), DATE_SUB(NOW(), INTERVAL 32 HOUR)),
(4, 1, '5HqW9r2M4v7B1N3K8z5P2L9X7s4Q1W8k3V6M2N9R4t1', 'for', 8000.000000, SHA2('192.168.1.4', 256), DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(5, 2, 'GAinSTufAma6Z53W1EveJPYSXh2bJySw4k2kZ1TMoLF3', 'for', 50000.000000, SHA2('192.168.1.1', 256), DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(6, 2, '9mP2v5K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1', 'for', 1500.000000, SHA2('192.168.1.5', 256), DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(7, 2, '2B7v1M4N9R4t1Q7r5K1W8z3Q4L7n8J2M5X1V9k4B7s2', 'against', 1800.000000, SHA2('192.168.1.6', 256), DATE_SUB(NOW(), INTERVAL 14 HOUR)),
(8, 3, '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 'for', 12500.000000, SHA2('192.168.1.2', 256), DATE_SUB(NOW(), INTERVAL 8 DAY)),
(9, 3, '3KzJ4q9Pxs3G1V3L9oH7tX7Z2sY1W9k5B2v8M4N1Q7r2', 'for', 2500.000000, SHA2('192.168.1.3', 256), DATE_SUB(NOW(), INTERVAL 7 DAY)),
(10, 5, 'GAinSTufAma6Z53W1EveJPYSXh2bJySw4k2kZ1TMoLF3', 'for', 50000.000000, SHA2('192.168.1.1', 256), DATE_SUB(NOW(), INTERVAL 16 DAY)),
(11, 5, '4N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N9R4', 'for', 1200.000000, SHA2('192.168.1.7', 256), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(12, 6, '8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1K1W9R4t1', 'for', 3200.000000, SHA2('192.168.1.8', 256), DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ── 3. RETREAT PARTNERS TABLE ──
TRUNCATE TABLE `retreat_partners`;

INSERT INTO `retreat_partners` (
  `id`, `name`, `location_city`, `location_country`, `contact_email`, `website_url`, `description`, `capacity`,
  `has_ecg_24h`, `has_cardiologist`, `has_magnesium_iv`, `has_cyp2d6`, `has_integration`, `is_gita_member`,
  `decree_compliant`, `nagoya_compliant`, `status`, `certification_nft`, `dao_proposal_id`, `certified_at`, `created_at`, `updated_at`
) VALUES
(
  1,
  'Crossroads Treatment Center',
  'Rosarito Beach',
  'Mexico',
  'info@crossroads-ibogaine.com',
  'https://crossroads-ibogaine.com',
  'Physician-led clinical facility featuring continuous 24/7 ECG telemetry, pre-treatment QTc risk screening, magnesium IV co-administration, and 6-month structured integration coaching. Over 88 cases published in peer-reviewed journals.',
  15,
  1, 1, 1, 1, 1, 1, 1, 1,
  'approved',
  'CertNFT1111111111111111111111111111111111111',
  2,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 60 DAY),
  DATE_SUB(NOW(), INTERVAL 30 DAY)
),
(
  2,
  'BEOND Medical',
  'Amsterdam',
  'Netherlands',
  'info@beond.nl',
  'https://beond.nl',
  'Hospital-grade medical protocol under Dutch health regulations. On-site cardiologist, ICU-trained nursing staff, psychiatric evaluation, and CYP2D6 genetic testing.',
  12,
  1, 1, 1, 1, 1, 1, 1, 1,
  'approved',
  'CertNFT2222222222222222222222222222222222222',
  2,
  DATE_SUB(NOW(), INTERVAL 20 DAY),
  DATE_SUB(NOW(), INTERVAL 45 DAY),
  DATE_SUB(NOW(), INTERVAL 20 DAY)
),
(
  3,
  'Tabula Rasa Retreat',
  'Alentejo',
  'Portugal',
  'info@tabularasaretreat.com',
  'https://tabularasaretreat.com',
  'European medically monitored retreat facility specializing in addiction detox and PTSD recovery using certified Gabon-sourced ibogaine with full benefit-sharing adherence.',
  10,
  1, 1, 1, 1, 1, 1, 1, 1,
  'approved',
  'CertNFT3333333333333333333333333333333333333',
  2,
  DATE_SUB(NOW(), INTERVAL 15 DAY),
  DATE_SUB(NOW(), INTERVAL 40 DAY),
  DATE_SUB(NOW(), INTERVAL 15 DAY)
),
(
  4,
  'Ambanga Bwiti Sanctuary',
  'Libreville',
  'Gabon',
  'contact@ambanga-bwiti.ga',
  'https://ambanga-bwiti.ga',
  'Flagship Gabonese spiritual sanctuary operating in direct partnership with local Babongo elders under Gabon Decree 0239 benefit-sharing mandates and Nagoya Protocol compliance.',
  8,
  1, 1, 1, 0, 1, 1, 1, 1,
  'approved',
  'CertNFT4444444444444444444444444444444444444',
  NULL,
  DATE_SUB(NOW(), INTERVAL 90 DAY),
  DATE_SUB(NOW(), INTERVAL 90 DAY),
  DATE_SUB(NOW(), INTERVAL 90 DAY)
),
(
  5,
  'Clear Sky Recovery',
  'Cancun',
  'Mexico',
  'info@clearskyibogaine.com',
  'https://clearskyibogaine.com',
  'Hospital-setting ibogaine treatment center with intensive cardiac monitoring, board-certified emergency physicians, and long-term integration therapy.',
  20,
  1, 1, 1, 1, 1, 1, 1, 1,
  'approved',
  'CertNFT5555555555555555555555555555555555555',
  NULL,
  DATE_SUB(NOW(), INTERVAL 10 DAY),
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
  6,
  'Iboga Tree Healing House',
  'Koh Phangan',
  'Thailand',
  'info@ibogatree.org',
  'https://ibogatree.org',
  'Holistic wellness sanctuary providing pre-treatment medical screening, baseline ECG diagnostics, and post-treatment integration in a serene tropical setting.',
  6,
  1, 0, 1, 1, 1, 0, 1, 1,
  'reviewing',
  NULL,
  2,
  NULL,
  DATE_SUB(NOW(), INTERVAL 5 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
  7,
  'Ananda Ibogaine Center',
  'San José',
  'Costa Rica',
  'contact@anandaibogaine.cr',
  'https://anandaibogaine.cr',
  'Integrative medical and spiritual retreat center pending DAO certification review for 24/7 ECG telemetry compliance.',
  8,
  1, 0, 1, 0, 1, 1, 0, 1,
  'pending',
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);

-- ── 4. AIRDROP CLAIMS TABLE ──
TRUNCATE TABLE `airdrop_claims`;

INSERT INTO `airdrop_claims` (
  `id`, `wallet_addr`, `gaine_balance`, `tier`, `allocation`, `claimed`, `claim_tx`, `season`, `eligible_at`, `claimed_at`
) VALUES
(
  1,
  'GAinSTufAma6Z53W1EveJPYSXh2bJySw4k2kZ1TMoLF3',
  50000.000000,
  'diamond',
  10000.000000,
  1,
  '5K2b8Xz1V9k4B7s2N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k',
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 25 DAY)
),
(
  2,
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  25000.000000,
  'diamond',
  5000.000000,
  0,
  NULL,
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NULL
),
(
  3,
  '3KzJ4q9Pxs3G1V3L9oH7tX7Z2sY1W9k5B2v8M4N1Q7r2',
  12500.000000,
  'gold',
  2500.000000,
  1,
  '3M9v4B7s2N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N',
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 15 DAY)
),
(
  4,
  '5HqW9r2M4v7B1N3K8z5P2L9X7s4Q1W8k3V6M2N9R4t1',
  8000.000000,
  'gold',
  1600.000000,
  0,
  NULL,
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NULL
),
(
  5,
  '9mP2v5K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1',
  2500.000000,
  'silver',
  500.000000,
  0,
  NULL,
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NULL
),
(
  6,
  '2B7v1M4N9R4t1Q7r5K1W8z3Q4L7n8J2M5X1V9k4B7s2',
  1800.000000,
  'silver',
  360.000000,
  1,
  '7P4w1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r',
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
  7,
  '4N1Q7r5M8B2v1K1W8z3Q4L7n8J2M5X1V9k4B7s2N9R4',
  450.000000,
  'bronze',
  100.000000,
  0,
  NULL,
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NULL
),
(
  8,
  '8z3Q4L7n8J2M5X1V9k4B7s2N1Q7r5M8B2v1K1W9R4t1',
  200.000000,
  'bronze',
  50.000000,
  0,
  NULL,
  1,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NULL
);

-- ── 5. NEWS CACHE TABLE ──
TRUNCATE TABLE `news_cache`;

INSERT INTO `news_cache` (
  `id`, `source_name`, `category`, `title`, `url`, `description`, `pub_date`, `fetched_at`
) VALUES
(
  1,
  'Nature Mental Health',
  'research',
  'Stanford Medicine: Ibogaine Dramatically Reduces PTSD in Veterans',
  'https://med.stanford.edu/news/all-news/2024/01/ibogaine-ptsd.html',
  '30 special ops veterans with TBI + PTSD showed 88% symptom reduction after single ibogaine treatment with magnesium co-administration. Brain imaging confirms theta rhythm neuroplasticity.',
  DATE_SUB(NOW(), INTERVAL 10 DAY),
  NOW()
),
(
  2,
  'BBC Future',
  'neuro',
  'BBC Future: How Ibogaine is Helping Veterans Overcome PTSD',
  'https://www.bbc.com/future/article/20260514-how-hallucinogenic-ibogaine-helps-veterans-overcome-ptsd',
  'Functional disability improved from WHO score 30.2 to 5.1. Executive function restored. Reduced cortical complexity in PTSD-linked brain regions.',
  DATE_SUB(NOW(), INTERVAL 15 DAY),
  NOW()
),
(
  3,
  'Texas Tribune',
  'policy',
  'Texas Allocates $50M for Ibogaine Clinical Trials After FDA Track Fails',
  'pages/news.html#texas',
  'Texas Tribune reports state-funded program launching after pharmaceutical companies failed terms for FDA-track ibogaine development.',
  DATE_SUB(NOW(), INTERVAL 20 DAY),
  NOW()
),
(
  4,
  'Jonathan Dickinson',
  'gabon',
  'Gabon 2026: Law Restructuring on Iboga/Ibogaine Export & Anti-Poaching',
  'pages/news.html#gabon',
  'Gabon transitional government tightens iboga law: stricter anti-poaching enforcement, community benefit-sharing mandates under Decree 0239.',
  DATE_SUB(NOW(), INTERVAL 25 DAY),
  NOW()
),
(
  5,
  'Frontiers in Pharmacology',
  'research',
  'Mash et al.: 191-Person Ibogaine Opioid Detoxification Study',
  'https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2018.00529/full',
  '100% opioid detox completion rate in medically supervised setting. Rapid withdrawal resolution in 12–18 hours.',
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  NOW()
),
(
  6,
  'University of Basel',
  'research',
  'Köck et al. 2022 Systematic Review: 705 Patients Across 24 Studies',
  'https://pubmed.ncbi.nlm.nih.gov/35012793/',
  'Comprehensive meta-analysis showing 78% reduction in opioid withdrawal and 54–80% sustained long-term abstinence.',
  DATE_SUB(NOW(), INTERVAL 35 DAY),
  NOW()
),
(
  7,
  'MAPS Bulletin',
  'neuro',
  'MAPS Observational Study: Long-term Outcomes of Ibogaine Treatment for Addiction',
  'https://maps.org/research/ibogaine-study/',
  'Longitudinal analysis of patients undergoing ibogaine treatment showing significant reductions in drug use and depressive symptoms at 12-month follow-up.',
  DATE_SUB(NOW(), INTERVAL 40 DAY),
  NOW()
),
(
  8,
  'ICEERS Foundation',
  'gabon',
  'Voacanga africana Semi-Synthesis: Sustainable Alternatives for Global Ibogaine Supply',
  'https://www.iceers.org/voacanga-synthesis-report',
  'Technical report demonstrating high-yield conversion of voacangine to noribogaine, reducing pressure on wild Tabernanthe iboga populations in Central Africa.',
  DATE_SUB(NOW(), INTERVAL 45 DAY),
  NOW()
);

SET FOREIGN_KEY_CHECKS = 1;
