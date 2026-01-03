-- Esquema de base de datos para Gym SaaS
-- Este archivo debe ejecutarse en Supabase SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de gimnasios (owners)
CREATE TABLE IF NOT EXISTS gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id TEXT NOT NULL UNIQUE, -- Clerk user ID del dueño
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de planes de suscripción para gimnasios
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    features JSONB,
    max_members INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de suscripciones de gimnasios al SaaS
CREATE TABLE IF NOT EXISTS gym_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de miembros del gimnasio
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    profile_image_url TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, suspended
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, user_id)
);

-- Tabla de tiqueteras (paquetes de sesiones)
CREATE TABLE IF NOT EXISTS ticket_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    total_sessions INTEGER NOT NULL DEFAULT 30,
    validity_days INTEGER NOT NULL DEFAULT 30,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de compras de tiqueteras por miembros
CREATE TABLE IF NOT EXISTS member_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    package_id UUID REFERENCES ticket_packages(id),
    total_sessions INTEGER NOT NULL,
    remaining_sessions INTEGER NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, exhausted
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    payment_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES member_tickets(id) ON DELETE SET NULL,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'ticket', -- ticket, cash
    cash_amount DECIMAL(10, 2), -- Monto si es pago en efectivo
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de resumen de ingresos diarios
CREATE TABLE IF NOT EXISTS daily_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    ticket_sales_count INTEGER DEFAULT 0,
    ticket_sales_amount DECIMAL(10, 2) DEFAULT 0,
    cash_payments_count INTEGER DEFAULT 0,
    cash_payments_amount DECIMAL(10, 2) DEFAULT 0,
    total_attendances INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, date)
);

-- Tabla de resumen de ingresos mensuales
CREATE TABLE IF NOT EXISTS monthly_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    ticket_sales_count INTEGER DEFAULT 0,
    ticket_sales_amount DECIMAL(10, 2) DEFAULT 0,
    cash_payments_count INTEGER DEFAULT 0,
    cash_payments_amount DECIMAL(10, 2) DEFAULT 0,
    total_attendances INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, year, month)
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id TEXT NOT NULL, -- Clerk user ID
    recipient_type VARCHAR(50) NOT NULL, -- member, owner
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- ticket_expiring, ticket_expired, payment_reminder, general
    is_read BOOLEAN DEFAULT false,
    related_entity_id UUID, -- ID relacionado (ticket_id, etc)
    related_entity_type VARCHAR(50), -- ticket, attendance, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes del chat/red social
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- Clerk user ID
    sender_name VARCHAR(255) NOT NULL,
    sender_image_url TEXT,
    message TEXT NOT NULL,
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reacciones a mensajes
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- Clerk user ID
    reaction VARCHAR(50) NOT NULL, -- emoji
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)
);

-- Tabla de feedback para el desarrollador (tú)
CREATE TABLE IF NOT EXISTS developer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- Clerk user ID del dueño del gym
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50), -- bug, feature_request, question, other
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, resolved, closed
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de buzón de sugerencias para dueños de gimnasios
CREATE TABLE IF NOT EXISTS gym_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    category VARCHAR(50), -- facilities, classes, staff, equipment, other
    is_anonymous BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, implemented, dismissed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_member_tickets_member_id ON member_tickets(member_id);
CREATE INDEX idx_member_tickets_status ON member_tickets(status);
CREATE INDEX idx_member_tickets_expiration ON member_tickets(expiration_date);
CREATE INDEX idx_attendances_member_id ON attendances(member_id);
CREATE INDEX idx_attendances_gym_id ON attendances(gym_id);
CREATE INDEX idx_attendances_check_in ON attendances(check_in_time);
CREATE INDEX idx_attendances_payment_type ON attendances(payment_type);
CREATE INDEX idx_daily_revenue_gym_date ON daily_revenue(gym_id, date DESC);
CREATE INDEX idx_monthly_revenue_gym_period ON monthly_revenue(gym_id, year DESC, month DESC);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX idx_chat_messages_gym_id ON chat_messages(gym_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_developer_feedback_status ON developer_feedback(status, is_read);
CREATE INDEX idx_gym_suggestions_gym_id ON gym_suggestions(gym_id, is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_suggestions ENABLE ROW LEVEL SECURITY;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_packages_updated_at BEFORE UPDATE ON ticket_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_tickets_updated_at BEFORE UPDATE ON member_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_revenue_updated_at BEFORE UPDATE ON daily_revenue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_revenue_updated_at BEFORE UPDATE ON monthly_revenue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar sesiones expiradas y actualizar estado
CREATE OR REPLACE FUNCTION check_expired_tickets()
RETURNS void AS $$
BEGIN
    UPDATE member_tickets
    SET status = 'expired'
    WHERE status = 'active'
    AND expiration_date < NOW();

    UPDATE member_tickets
    SET status = 'exhausted'
    WHERE status = 'active'
    AND remaining_sessions <= 0;
END;
$$ LANGUAGE plpgsql;

-- Función para crear notificaciones de tiqueteras por vencer
CREATE OR REPLACE FUNCTION create_expiring_ticket_notifications()
RETURNS void AS $$
BEGIN
    INSERT INTO notifications (recipient_id, recipient_type, gym_id, title, message, type, related_entity_id, related_entity_type)
    SELECT
        m.user_id,
        'member',
        mt.gym_id,
        'Tu tiquetera está por vencer',
        'Te quedan ' || (mt.expiration_date - NOW())::TEXT || ' para que venza tu tiquetera. ¡Renueva ahora!',
        'ticket_expiring',
        mt.id,
        'ticket'
    FROM member_tickets mt
    INNER JOIN members m ON mt.member_id = m.id
    WHERE mt.status = 'active'
    AND mt.expiration_date BETWEEN NOW() AND NOW() + INTERVAL '5 days'
    AND mt.remaining_sessions > 0
    AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.related_entity_id = mt.id
        AND n.type = 'ticket_expiring'
        AND n.created_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar resumen de ingresos cuando se registra asistencia
CREATE OR REPLACE FUNCTION update_revenue_on_attendance()
RETURNS TRIGGER AS $$
DECLARE
    attendance_date DATE;
    attendance_year INTEGER;
    attendance_month INTEGER;
BEGIN
    attendance_date := DATE(NEW.check_in_time);
    attendance_year := EXTRACT(YEAR FROM NEW.check_in_time);
    attendance_month := EXTRACT(MONTH FROM NEW.check_in_time);

    -- Actualizar resumen diario
    INSERT INTO daily_revenue (gym_id, date, total_attendances, cash_payments_count, cash_payments_amount, total_revenue)
    VALUES (
        NEW.gym_id,
        attendance_date,
        1,
        CASE WHEN NEW.payment_type = 'cash' THEN 1 ELSE 0 END,
        COALESCE(NEW.cash_amount, 0),
        COALESCE(NEW.cash_amount, 0)
    )
    ON CONFLICT (gym_id, date) DO UPDATE SET
        total_attendances = daily_revenue.total_attendances + 1,
        cash_payments_count = daily_revenue.cash_payments_count + CASE WHEN NEW.payment_type = 'cash' THEN 1 ELSE 0 END,
        cash_payments_amount = daily_revenue.cash_payments_amount + COALESCE(NEW.cash_amount, 0),
        total_revenue = daily_revenue.total_revenue + COALESCE(NEW.cash_amount, 0),
        updated_at = NOW();

    -- Actualizar resumen mensual
    INSERT INTO monthly_revenue (gym_id, year, month, total_attendances, cash_payments_count, cash_payments_amount, total_revenue)
    VALUES (
        NEW.gym_id,
        attendance_year,
        attendance_month,
        1,
        CASE WHEN NEW.payment_type = 'cash' THEN 1 ELSE 0 END,
        COALESCE(NEW.cash_amount, 0),
        COALESCE(NEW.cash_amount, 0)
    )
    ON CONFLICT (gym_id, year, month) DO UPDATE SET
        total_attendances = monthly_revenue.total_attendances + 1,
        cash_payments_count = monthly_revenue.cash_payments_count + CASE WHEN NEW.payment_type = 'cash' THEN 1 ELSE 0 END,
        cash_payments_amount = monthly_revenue.cash_payments_amount + COALESCE(NEW.cash_amount, 0),
        total_revenue = monthly_revenue.total_revenue + COALESCE(NEW.cash_amount, 0),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar resumen de ingresos cuando se vende tiquetera
CREATE OR REPLACE FUNCTION update_revenue_on_ticket_sale()
RETURNS TRIGGER AS $$
DECLARE
    sale_date DATE;
    sale_year INTEGER;
    sale_month INTEGER;
BEGIN
    -- Solo actualizar si es una nueva venta (INSERT) o cambio de estado a completed
    IF (TG_OP = 'INSERT' AND NEW.payment_status = 'completed') OR
       (TG_OP = 'UPDATE' AND OLD.payment_status != 'completed' AND NEW.payment_status = 'completed') THEN

        sale_date := DATE(NEW.purchase_date);
        sale_year := EXTRACT(YEAR FROM NEW.purchase_date);
        sale_month := EXTRACT(MONTH FROM NEW.purchase_date);

        -- Actualizar resumen diario
        INSERT INTO daily_revenue (gym_id, date, ticket_sales_count, ticket_sales_amount, total_revenue)
        VALUES (
            NEW.gym_id,
            sale_date,
            1,
            COALESCE(NEW.payment_amount, 0),
            COALESCE(NEW.payment_amount, 0)
        )
        ON CONFLICT (gym_id, date) DO UPDATE SET
            ticket_sales_count = daily_revenue.ticket_sales_count + 1,
            ticket_sales_amount = daily_revenue.ticket_sales_amount + COALESCE(NEW.payment_amount, 0),
            total_revenue = daily_revenue.total_revenue + COALESCE(NEW.payment_amount, 0),
            updated_at = NOW();

        -- Actualizar resumen mensual
        INSERT INTO monthly_revenue (gym_id, year, month, ticket_sales_count, ticket_sales_amount, total_revenue)
        VALUES (
            NEW.gym_id,
            sale_year,
            sale_month,
            1,
            COALESCE(NEW.payment_amount, 0),
            COALESCE(NEW.payment_amount, 0)
        )
        ON CONFLICT (gym_id, year, month) DO UPDATE SET
            ticket_sales_count = monthly_revenue.ticket_sales_count + 1,
            ticket_sales_amount = monthly_revenue.ticket_sales_amount + COALESCE(NEW.payment_amount, 0),
            total_revenue = monthly_revenue.total_revenue + COALESCE(NEW.payment_amount, 0),
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar ingresos en asistencias
CREATE TRIGGER trigger_update_revenue_on_attendance
    AFTER INSERT ON attendances
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_on_attendance();

-- Trigger para actualizar ingresos en ventas de tiqueteras
CREATE TRIGGER trigger_update_revenue_on_ticket_sale
    AFTER INSERT OR UPDATE ON member_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_on_ticket_sale();
