-- Haris Bhai Perfumes — schema (utf8mb4, InnoDB, FK-enforced)

CREATE TABLE IF NOT EXISTS collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  public_id VARCHAR(64) NOT NULL UNIQUE,
  handle VARCHAR(191) NOT NULL UNIQUE,
  kicker VARCHAR(191) NOT NULL DEFAULT '',
  title VARCHAR(191) NOT NULL,
  page_title VARCHAR(191) NULL,
  hero_image VARCHAR(512) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  public_id VARCHAR(64) NOT NULL UNIQUE,
  collection_id INT NOT NULL,
  handle VARCHAR(191) NOT NULL UNIQUE,
  title VARCHAR(191) NOT NULL,
  kicker VARCHAR(191) NULL,
  price INT NOT NULL,
  compare_at_price INT NULL,
  image VARCHAR(512) NULL,
  gender ENUM('unisex', 'women', 'men') NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  description TEXT NULL,
  size VARCHAR(64) NULL,
  stock_count INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE RESTRICT,
  INDEX idx_products_collection (collection_id),
  INDEX idx_products_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  public_id VARCHAR(64) NOT NULL UNIQUE,
  type ENUM('EDT', 'EDP', 'Perfume') NULL,
  size ENUM('35ml', '50ml', '100ml') NOT NULL,
  price INT NOT NULL,
  compare_at_price INT NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  -- NULL `type` values are never considered equal by MySQL/MariaDB's unique
  -- index, so this alone doesn't stop two 35ml rows on one product — that
  -- ("at most one 35ml variant") is enforced in the application layer.
  UNIQUE KEY uniq_variant_product_type_size (product_id, type, size),
  INDEX idx_variants_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS featured_product (
  id INT PRIMARY KEY DEFAULT 1,
  handle VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(512) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_featured_product_singleton CHECK (id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS featured_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  featured_product_id INT NOT NULL DEFAULT 1,
  size VARCHAR(64) NOT NULL,
  price INT NOT NULL,
  compare_at_price INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_featured_variants_product FOREIGN KEY (featured_product_id) REFERENCES featured_product(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS look_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  handle VARCHAR(191) NOT NULL UNIQUE,
  image VARCHAR(512) NULL,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS look_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  look_group_id INT NOT NULL,
  handle VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  price INT NOT NULL,
  image VARCHAR(512) NULL,
  top INT NOT NULL DEFAULT 0,
  `left` INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_look_items_group FOREIGN KEY (look_group_id) REFERENCES look_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(64) PRIMARY KEY,
  value JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  admin_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
