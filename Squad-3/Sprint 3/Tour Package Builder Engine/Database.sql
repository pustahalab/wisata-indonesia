CREATE TABLE paket_tour (
    id SERIAL PRIMARY KEY,
    title VARCHAR (255) NOT NULL,
    duration_days INT NOT NULL,
    base_currency VARCHAR (10) DEFAULT 'IDR',
    itinerary JSONB NOT NULL,
    pricing_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE INDEX nusantarago_tour_itinerary ON paket_tour USING GIN (itinerary);