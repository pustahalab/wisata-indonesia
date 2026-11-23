
-- =====================================================
-- NUSANTARAGO
-- SPRINT 1 - SQUAD 4
-- DATABASE: ACCOMMODATION & TRANSPORT SERVICES
-- =====================================================


-- =====================================================
-- 1. TABLE: ACCOMMODATIONS
-- Menyimpan informasi tempat penginapan
-- =====================================================

CREATE TABLE accommodations (
    accommodation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    accommodation_type VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_accommodation_latitude
        CHECK (
            latitude IS NULL
            OR latitude BETWEEN -90 AND 90
        ),

    CONSTRAINT chk_accommodation_longitude
        CHECK (
            longitude IS NULL
            OR longitude BETWEEN -180 AND 180
        )
);


-- =====================================================
-- 2. TABLE: ACCOMMODATION_ROOMS
-- Menyimpan informasi tipe kamar setiap penginapan
-- Relasi: accommodations (1) -> (N) accommodation_rooms
-- =====================================================

CREATE TABLE accommodation_rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accommodation_id UUID NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    total_rooms INTEGER NOT NULL DEFAULT 1,
    available_rooms INTEGER NOT NULL DEFAULT 1,
    base_price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_accommodation
        FOREIGN KEY (accommodation_id)
        REFERENCES accommodations(accommodation_id)
        ON DELETE CASCADE,

    CONSTRAINT chk_room_capacity
        CHECK (capacity > 0),

    CONSTRAINT chk_total_rooms
        CHECK (total_rooms > 0),

    CONSTRAINT chk_available_rooms
        CHECK (
            available_rooms >= 0
            AND available_rooms <= total_rooms
        ),

    CONSTRAINT chk_room_price
        CHECK (base_price >= 0),

    CONSTRAINT uq_accommodation_room_type
        UNIQUE (accommodation_id, room_type)
);


-- =====================================================
-- 3. TABLE: TRANSPORT_SERVICES
-- Menyimpan informasi layanan transportasi wisata
-- =====================================================

CREATE TABLE transport_services (
    transport_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(150) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    rental_scheme VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL,
    base_price NUMERIC(12,2) NOT NULL,
    price_unit VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_transport_capacity
        CHECK (capacity > 0),

    CONSTRAINT chk_transport_price
        CHECK (base_price >= 0),

    CONSTRAINT chk_rental_scheme
        CHECK (
            rental_scheme IN (
                'with_driver',
                'without_driver',
                'per_route'
            )
        ),

    CONSTRAINT chk_price_unit
        CHECK (
            price_unit IN (
                'per_hour',
                'per_day',
                'per_trip'
            )
        ),

    CONSTRAINT chk_transport_latitude
        CHECK (
            latitude IS NULL
            OR latitude BETWEEN -90 AND 90
        ),

    CONSTRAINT chk_transport_longitude
        CHECK (
            longitude IS NULL
            OR longitude BETWEEN -180 AND 180
        )
);


-- =====================================================
-- 4. SAMPLE DATA: ACCOMMODATIONS
-- Contoh data penginapan
-- =====================================================

INSERT INTO accommodations (
    name,
    accommodation_type,
    address,
    latitude,
    longitude,
    description
)
VALUES
(
    'Hotel Nusantara',
    'Hotel',
    'Jl. Raya Indramayu No. 10, Indramayu',
    -6.3271234,
    108.3201234,
    'Hotel dengan fasilitas lengkap untuk wisatawan.'
),
(
    'Villa Puncak Indah',
    'Villa',
    'Jl. Wisata Puncak, Bogor',
    -6.7021234,
    106.9501234,
    'Villa dengan suasana alam yang nyaman.'
);


-- =====================================================
-- 5. SAMPLE DATA: ACCOMMODATION_ROOMS
-- Contoh beberapa tipe kamar
-- =====================================================

INSERT INTO accommodation_rooms (
    accommodation_id,
    room_type,
    capacity,
    total_rooms,
    available_rooms,
    base_price
)
SELECT
    accommodation_id,
    'Standard Room',
    2,
    20,
    15,
    350000
FROM accommodations
WHERE name = 'Hotel Nusantara';

INSERT INTO accommodation_rooms (
    accommodation_id,
    room_type,
    capacity,
    total_rooms,
    available_rooms,
    base_price
)
SELECT
    accommodation_id,
    'Deluxe Room',
    3,
    10,
    8,
    550000
FROM accommodations
WHERE name = 'Hotel Nusantara';

INSERT INTO accommodation_rooms (
    accommodation_id,
    room_type,
    capacity,
    total_rooms,
    available_rooms,
    base_price
)
SELECT
    accommodation_id,
    'Standard Villa',
    4,
    5,
    3,
    800000
FROM accommodations
WHERE name = 'Villa Puncak Indah';


-- =====================================================
-- 6. SAMPLE DATA: TRANSPORT_SERVICES
-- Contoh data layanan transportasi
-- =====================================================

INSERT INTO transport_services (
    service_name,
    vehicle_type,
    rental_scheme,
    capacity,
    base_price,
    price_unit,
    address,
    latitude,
    longitude
)
VALUES
(
    'Rental Mobil Indramayu',
    'Mobil',
    'with_driver',
    6,
    500000,
    'per_day',
    'Jl. Jatibarang No. 15, Indramayu',
    -6.3451234,
    108.3101234
),
(
    'Rental Motor Indramayu',
    'Motor',
    'without_driver',
    2,
    100000,
    'per_day',
    'Jl. Sudirman No. 20, Indramayu',
    -6.3261234,
    108.3251234
),
(
    'Bus Pariwisata Bogor',
    'Bus',
    'with_driver',
    30,
    1500000,
    'per_trip',
    'Jl. Raya Bogor, Bogor',
    -6.5951234,
    106.7901234
);


-- =====================================================
-- 7. TESTING: VIEW ACCOMMODATIONS
-- Melihat seluruh data penginapan
-- =====================================================

SELECT *
FROM accommodations;


-- =====================================================
-- 8. TESTING: VIEW ACCOMMODATION_ROOMS
-- Melihat seluruh data kamar
-- =====================================================

SELECT *
FROM accommodation_rooms;


-- =====================================================
-- 9. TESTING: VIEW TRANSPORT_SERVICES
-- Melihat seluruh data transportasi
-- =====================================================

SELECT *
FROM transport_services;


-- =====================================================
-- 10. TESTING: JOIN ACCOMMODATIONS & ROOMS
-- Menguji relasi One-to-Many
-- =====================================================

SELECT
    a.accommodation_id,
    a.name AS accommodation_name,
    a.accommodation_type,
    r.room_id,
    r.room_type,
    r.capacity,
    r.total_rooms,
    r.available_rooms,
    r.base_price
FROM accommodations a
JOIN accommodation_rooms r
    ON a.accommodation_id = r.accommodation_id
ORDER BY a.name, r.room_type;


-- =====================================================
-- 11. TESTING: SEARCH TRANSPORT BY VEHICLE TYPE
-- Contoh pencarian kendaraan berdasarkan jenis
-- =====================================================

SELECT *
FROM transport_services
WHERE vehicle_type = 'Mobil';


-- =====================================================
-- 12. TESTING: SEARCH ACCOMMODATION BY NAME
-- Contoh pencarian penginapan berdasarkan nama
-- =====================================================

SELECT *
FROM accommodations
WHERE name ILIKE '%Hotel%';


-- =====================================================
