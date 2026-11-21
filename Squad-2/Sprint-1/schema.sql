-- Migration MySQL untuk tabel partners dan destination_tickets.

CREATE TABLE partners (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    business_name VARCHAR(200) NOT NULL,
    partner_type ENUM(
        'attraction',
        'tour_agent',
        'accommodation',
        'transport'
    ) NOT NULL,
    legal_doc_url TEXT NULL,
    bank_account_info JSON NOT NULL,
    is_verified ENUM(
        'pending',
        'verified',
        'rejected'
    ) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_partners_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE destination_tickets (
    id CHAR(36) PRIMARY KEY,
    destination_id CHAR(36) NOT NULL,
    ticket_name VARCHAR(100) NOT NULL,
    visitor_type ENUM(
        'domestic',
        'foreign'
    ) NOT NULL,
    day_type ENUM(
        'weekday',
        'weekend'
    ) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    daily_quota INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_tickets_destination
        FOREIGN KEY (destination_id)
        REFERENCES destinations(id)
) ENGINE=InnoDB;
