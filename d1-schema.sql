-- Schema D1 (SQLite) para Gym SaaS
-- Ejecutar con: wrangler d1 execute gym-saas-db --file=d1-schema.sql

CREATE TABLE IF NOT EXISTS gyms (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    city TEXT,
    logo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'suspended'
    trial_ends_at TEXT DEFAULT (datetime('now', '+7 days')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    features TEXT, -- JSON string
    max_members INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES subscription_plans(id),
    status TEXT DEFAULT 'active',
    started_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    profile_image_url TEXT,
    status TEXT DEFAULT 'active',
    joined_at TEXT DEFAULT (datetime('now')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(gym_id, user_id)
);

CREATE TABLE IF NOT EXISTS ticket_packages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    total_sessions INTEGER NOT NULL DEFAULT 30,
    validity_days INTEGER NOT NULL DEFAULT 30,
    price REAL NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS member_tickets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    package_id TEXT REFERENCES ticket_packages(id),
    total_sessions INTEGER NOT NULL,
    remaining_sessions INTEGER NOT NULL,
    purchase_date TEXT DEFAULT (datetime('now')),
    expiration_date TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    payment_status TEXT DEFAULT 'pending',
    payment_amount REAL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attendances (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    ticket_id TEXT REFERENCES member_tickets(id) ON DELETE SET NULL,
    payment_type TEXT NOT NULL DEFAULT 'ticket',
    cash_amount REAL,
    check_in_time TEXT DEFAULT (datetime('now')),
    check_out_time TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS daily_revenue (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    ticket_sales_count INTEGER DEFAULT 0,
    ticket_sales_amount REAL DEFAULT 0,
    cash_payments_count INTEGER DEFAULT 0,
    cash_payments_amount REAL DEFAULT 0,
    total_attendances INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(gym_id, date)
);

CREATE TABLE IF NOT EXISTS monthly_revenue (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    ticket_sales_count INTEGER DEFAULT 0,
    ticket_sales_amount REAL DEFAULT 0,
    cash_payments_count INTEGER DEFAULT 0,
    cash_payments_amount REAL DEFAULT 0,
    total_attendances INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(gym_id, year, month)
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    recipient_id TEXT NOT NULL,
    recipient_type TEXT NOT NULL,
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    related_entity_id TEXT,
    related_entity_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_image_url TEXT,
    message TEXT NOT NULL,
    reply_to_id TEXT REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS message_reactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    message_id TEXT REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    reaction TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(message_id, user_id, reaction)
);

CREATE TABLE IF NOT EXISTS developer_feedback (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gym_suggestions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    gym_id TEXT REFERENCES gyms(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    category TEXT,
    is_anonymous INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Configuración de pagos por gimnasio (ePayco + Nequi del dueño)
CREATE TABLE IF NOT EXISTS gym_payment_config (
    gym_id TEXT PRIMARY KEY REFERENCES gyms(id) ON DELETE CASCADE,
    epayco_public_key TEXT,
    epayco_private_key TEXT,
    nequi_number TEXT,
    accepts_epayco INTEGER DEFAULT 0,
    accepts_nequi INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_members_gym_id ON members(gym_id);
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_member_tickets_member_id ON member_tickets(member_id);
CREATE INDEX IF NOT EXISTS idx_member_tickets_status ON member_tickets(status);
CREATE INDEX IF NOT EXISTS idx_member_tickets_expiration ON member_tickets(expiration_date);
CREATE INDEX IF NOT EXISTS idx_attendances_member_id ON attendances(member_id);
CREATE INDEX IF NOT EXISTS idx_attendances_gym_id ON attendances(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendances_check_in ON attendances(check_in_time);
CREATE INDEX IF NOT EXISTS idx_daily_revenue_gym_date ON daily_revenue(gym_id, date);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_gym_period ON monthly_revenue(gym_id, year, month);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_chat_messages_gym_id ON chat_messages(gym_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
