-- IBOGAINE DAO — MySQL Schema
-- Import via Hostinger hPanel → phpMyAdmin → Import
-- Database: ibogaine_dao

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

-- ── DAO PROPOSALS ──
CREATE TABLE IF NOT EXISTS `proposals` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title`          VARCHAR(255) NOT NULL,
  `description`    TEXT NOT NULL,
  `status`         ENUM('pending','active','passed','rejected') DEFAULT 'pending',
  `votes_for`      INT UNSIGNED DEFAULT 0,
  `votes_against`  INT UNSIGNED DEFAULT 0,
  `total_votes`    INT UNSIGNED DEFAULT 0,
  `approval_pct`   TINYINT UNSIGNED DEFAULT 0,
  `ends_at`        DATETIME NULL,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_ends_at` (`ends_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── DAO VOTES ──
CREATE TABLE IF NOT EXISTS `votes` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `proposal_id`   INT UNSIGNED NOT NULL,
  `wallet_addr`   VARCHAR(64) NOT NULL,
  `vote`          ENUM('for','against') NOT NULL,
  `gaine_balance` DECIMAL(18,6) DEFAULT 0,
  `ip_hash`       VARCHAR(64) NULL COMMENT 'SHA-256 of IP for abuse detection, not stored in plaintext',
  `created_at`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_vote` (`proposal_id`, `wallet_addr`),
  INDEX `idx_wallet` (`wallet_addr`),
  CONSTRAINT `fk_vote_proposal` FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── RETREAT REGISTRY ──
CREATE TABLE IF NOT EXISTS `retreat_partners` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`            VARCHAR(255) NOT NULL,
  `location_city`   VARCHAR(100) NOT NULL,
  `location_country`VARCHAR(100) NOT NULL,
  `contact_email`   VARCHAR(255) NOT NULL,
  `website_url`     VARCHAR(255) NULL,
  `description`     TEXT NULL,
  `capacity`        SMALLINT UNSIGNED DEFAULT 0 COMMENT 'Max patients per month',
  -- Safety Criteria (DAO-verified)
  `has_ecg_24h`     TINYINT(1) DEFAULT 0 COMMENT '24/7 ECG monitoring',
  `has_cardiologist`TINYINT(1) DEFAULT 0 COMMENT 'Cardiologist on-site',
  `has_magnesium_iv`TINYINT(1) DEFAULT 0 COMMENT 'Magnesium IV protocol',
  `has_cyp2d6`      TINYINT(1) DEFAULT 0 COMMENT 'CYP2D6 genotyping',
  `has_integration` TINYINT(1) DEFAULT 0 COMMENT '6-month integration therapy',
  `is_gita_member`  TINYINT(1) DEFAULT 0 COMMENT 'GITA membership',
  -- Compliance
  `decree_compliant`TINYINT(1) DEFAULT 0 COMMENT 'Gabon Decree 0239 compliant',
  `nagoya_compliant`TINYINT(1) DEFAULT 0 COMMENT 'Nagoya Protocol ABS compliant',
  -- Status
  `status`          ENUM('pending','reviewing','approved','rejected','suspended') DEFAULT 'pending',
  `certification_nft` VARCHAR(88) NULL COMMENT 'Solana NFT mint address for on-chain cert',
  `dao_proposal_id`   INT UNSIGNED NULL COMMENT 'Linked DAO certification proposal',
  `certified_at`    DATETIME NULL,
  `created_at`      DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_country` (`location_country`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── AIRDROP REGISTRY ──
CREATE TABLE IF NOT EXISTS `airdrop_claims` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `wallet_addr`     VARCHAR(64) NOT NULL UNIQUE,
  `gaine_balance`   DECIMAL(18,6) DEFAULT 0,
  `tier`            ENUM('bronze','silver','gold','diamond') DEFAULT 'bronze',
  `allocation`      DECIMAL(18,6) DEFAULT 0 COMMENT 'GAINE tokens allocated',
  `claimed`         TINYINT(1) DEFAULT 0,
  `claim_tx`        VARCHAR(88) NULL COMMENT 'Solana TX signature of claim',
  `season`          TINYINT UNSIGNED DEFAULT 1,
  `eligible_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `claimed_at`      DATETIME NULL,
  INDEX `idx_wallet` (`wallet_addr`),
  INDEX `idx_season` (`season`),
  INDEX `idx_tier` (`tier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── NEWS CACHE ──
CREATE TABLE IF NOT EXISTS `news_cache` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `source_name` VARCHAR(64) NOT NULL,
  `category`    VARCHAR(32) NOT NULL,
  `title`       VARCHAR(512) NOT NULL,
  `url`         VARCHAR(1024) NOT NULL,
  `description` TEXT NULL,
  `pub_date`    DATETIME NULL,
  `fetched_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_pub_date` (`pub_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── SAMPLE DATA (MVP demo) ──
INSERT INTO `proposals` (`title`, `description`, `status`, `votes_for`, `votes_against`, `total_votes`, `approval_pct`, `ends_at`) VALUES
('Fund ICEERS Voacanga africana Clinical Trial Phase 2', 'Allocate 15,000 GAINE treasury to fund continuation of ICEERS Spain/Gabon ibogaine trial using sustainable Voacanga africana sourcing. Phase 2 targets 80 participants.', 'active', 207, 77, 284, 73, DATE_ADD(NOW(), INTERVAL 3 DAY)),
('Certify 3 New Retreat Partners (Mexico, Netherlands, South Africa)', 'DAO review of three new retreat center applications: Crossroads v2 (Mexico), BEOND Medical (Netherlands), Tabula Rasa (South Africa). All meet Stanford safety criteria.', 'active', 375, 37, 412, 91, DATE_ADD(NOW(), INTERVAL 6 DAY)),
('Add GAINE/USDC Pool to Jupiter V6 with 5,000 GAINE Seed Liquidity', 'Expands GAINE trading pairs to 30+. Increases arbitrage bot activity, maximizing 2% fee collection for treasury and Gabon operations.', 'passed', 468, 63, 531, 88, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Allocate $10K GAINE Treasury to Gabon Anti-Poaching Patrols 2026', 'Direct quarterly allocation to OEKOFORCE anti-poaching patrol network protecting iboga stands in Lopé National Park.', 'pending', 0, 0, 0, 0, DATE_ADD(NOW(), INTERVAL 14 DAY));

INSERT INTO `retreat_partners` (`name`, `location_city`, `location_country`, `contact_email`, `website_url`, `description`, `has_ecg_24h`, `has_cardiologist`, `has_magnesium_iv`, `has_cyp2d6`, `has_integration`, `is_gita_member`, `decree_compliant`, `nagoya_compliant`, `status`, `certified_at`) VALUES
('Crossroads Treatment Center', 'Rosarito Beach', 'Mexico', 'info@crossroads.com', 'https://crossroads-ibogaine.com', '24/7 physician, continuous ECG, magnesium IV, integration therapy, 6-month follow-up. 88 patients documented in peer-reviewed study.', 1, 1, 1, 1, 1, 1, 1, 1, 'approved', NOW()),
('BEOND Medical', 'Amsterdam', 'Netherlands', 'info@beond.nl', 'https://beond.nl', 'Medical-grade protocol, psychiatrist-led, cardiologist on-site. GITA-member. Legal jurisdiction with full regulatory oversight.', 1, 1, 1, 1, 1, 1, 1, 1, 'approved', NOW());
