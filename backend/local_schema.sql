-- Local Development Database Schema
-- Adapted from supabase_schema.sql for local PostgreSQL (without auth.users dependency)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Define Roles & Status Types (use VARCHAR check instead of ENUM for simpler local dev)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('draft', 'published', 'out_of_stock');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'razorpay', 'cod');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles Table (standalone for local dev, no auth.users FK)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(50) DEFAULT 'Home' NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    sku VARCHAR(100) UNIQUE NOT NULL,
    status product_status DEFAULT 'draft' NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    category_id INTEGER REFERENCES public.categories(id) ON DELETE SET NULL,
    attributes JSONB DEFAULT '{}'::jsonb NOT NULL,
    specifications JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Inventory Table
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE UNIQUE NOT NULL,
    quantity INT DEFAULT 0 NOT NULL CHECK (quantity >= 0),
    low_stock_threshold INT DEFAULT 5 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. Cart Table
CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(cart_id, product_id)
);

-- 9. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(profile_id, product_id)
);

-- 10. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL,
    min_purchase_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT,
    used_count INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending' NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    shipping_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    billing_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 12. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 13. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
    provider payment_provider NOT NULL,
    transaction_id VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    status payment_status DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 14. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(profile_id, product_id)
);

-- 15. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 16. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 17. Recently Viewed Table
CREATE TABLE IF NOT EXISTS public.recently_viewed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(profile_id, product_id)
);

-- 18. Search Analytics Table
CREATE TABLE IF NOT EXISTS public.search_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    parsed_intent JSONB DEFAULT '{}'::jsonb NOT NULL,
    results_count INT DEFAULT 0 NOT NULL,
    latency_ms INT DEFAULT 0 NOT NULL,
    session_id VARCHAR(100),
    clicked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    converted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 19. Conversational Sessions Table
CREATE TABLE IF NOT EXISTS public.conversational_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(100) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    history JSONB DEFAULT '[]'::jsonb NOT NULL,
    current_filters JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Standard update modification timestamp function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at Triggers
DO $$ BEGIN
    CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_addresses_modtime BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_categories_modtime BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_products_modtime BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_inventory_modtime BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_carts_modtime BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_cart_items_modtime BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
    CREATE TRIGGER update_conversational_sessions_modtime BEFORE UPDATE ON public.conversational_sessions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Seed sample data for development
INSERT INTO public.categories (name, slug, description) VALUES
    ('Electronics', 'electronics', 'Gadgets, wearables, and smart devices'),
    ('Fashion', 'fashion', 'Clothing, accessories, and footwear'),
    ('Home & Living', 'home-living', 'Furniture, decor, and kitchen essentials')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, price, compare_at_price, sku, status, is_featured, category_id, attributes, specifications) VALUES
    ('Aura Smart Chrono Watch', 'aura-smart-chrono', 'Engineered for precision and elegance. The Aura Smart Chrono Watch balances sleek metallic framing with integrated health parameters.', 299.00, 349.00, 'SKU-CHRONO', 'published', true, 1, '{"brand": "Aura", "color": "Midnight Black", "use_case": "fitness", "water_resistant": true}'::jsonb, '{"battery_life": "7 days", "display": "1.4 inch AMOLED", "weight": "45g", "connectivity": "Bluetooth 5.3"}'::jsonb),
    ('Neptune SoundCancelling Pro', 'neptune-sound-pro', 'Premium noise-cancelling headphones with spatial audio and 40-hour battery life.', 189.00, NULL, 'SKU-NEPTUNE', 'published', true, 1, '{"brand": "Neptune", "color": "Matte Silver", "use_case": "audio", "noise_cancelling": true}'::jsonb, '{"battery_life": "40 hours", "driver": "40mm titanium", "weight": "250g", "noise_cancelling_level": "Active ANC"}'::jsonb),
    ('Zenith Ultrabook Pro 16GB', 'zenith-ultrabook-pro', 'Ultra-thin gaming and productivity laptop with M3 chip, 16GB RAM, RTX GPU option, and 14-inch Retina display.', 1199.00, 1399.00, 'SKU-ZENITH', 'published', true, 1, '{"brand": "Zenith", "color": "Space Gray", "ram": "16GB", "gpu": "RTX 4060", "use_case": "gaming", "weight_class": "lightweight"}'::jsonb, '{"processor": "M3 Pro / Intel i7", "ram": "16GB DDR5", "storage": "512GB NVMe", "battery_life": "14 hours", "weight": "1.3kg"}'::jsonb),
    ('Apex Beast Gaming Laptop', 'apex-beast-gaming-laptop', 'High-performance gaming laptop with 32GB RAM, RTX 4080 GPU, and 240Hz screen.', 1499.00, 1699.00, 'SKU-APEX-GAME', 'published', true, 1, '{"brand": "Apex", "color": "Obsidian Black", "ram": "32GB", "gpu": "RTX 4080", "use_case": "gaming", "weight_class": "heavy"}'::jsonb, '{"processor": "Intel i9 14900HX", "ram": "32GB DDR5", "storage": "1TB NVMe", "battery_life": "6 hours", "weight": "2.4kg"}'::jsonb),
    ('Nike Air Zoom Runner', 'nike-air-zoom-runner', 'Lightweight breathable running shoes engineered for peak marathon performance.', 95.00, 120.00, 'SKU-NIKE-RUN', 'published', true, 2, '{"brand": "Nike", "color": "Black", "size": "10", "use_case": "running", "gender": "unisex"}'::jsonb, '{"upper_material": "Flyknit Mesh", "cushioning": "Air Zoom Unit", "sole": "Rubber Grip", "weight": "210g"}'::jsonb),
    ('Luxe Leather Crossbody', 'luxe-leather-crossbody', 'Handcrafted Italian leather crossbody bag with gold hardware.', 149.00, NULL, 'SKU-LUXE', 'published', false, 2, '{"brand": "Luxe", "color": "Caramel Brown", "material": "Italian Leather", "use_case": "fashion"}'::jsonb, '{"dimensions": "24 x 18 x 7 cm", "strap_length": "120cm adjustable", "weight": "420g"}'::jsonb),
    ('Minimalist Ergonomic Chair', 'minimalist-ergonomic-chair', 'Breathable mesh office chair with lumbar support for healthy posture during extended work sessions.', 280.00, 350.00, 'SKU-ERGO-CHAIR', 'published', true, 3, '{"brand": "ErgoForm", "color": "Charcoal Black", "use_case": "office", "type": "chair"}'::jsonb, '{"weight_capacity": "150kg", "material": "High-density mesh", "adjustments": "4D armrests + lumbar"}'::jsonb),
    ('Minimalist LED Desk Lamp', 'minimalist-desk-lamp', 'Touch-controlled LED desk lamp with adjustable color temperature and wireless phone charger base.', 59.99, 79.99, 'SKU-LAMP', 'published', false, 3, '{"brand": "Aura", "color": "Pure White", "use_case": "office", "type": "lighting"}'::jsonb, '{"brightness": "1000 lumens", "color_temp": "2700K - 6500K", "power": "12W LED"}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- Add product images
INSERT INTO public.product_images (product_id, image_url, is_primary) VALUES
    ((SELECT id FROM public.products WHERE slug = 'aura-smart-chrono'), 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'neptune-sound-pro'), 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'zenith-ultrabook-pro'), 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'apex-beast-gaming-laptop'), 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'nike-air-zoom-runner'), 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'luxe-leather-crossbody'), 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'minimalist-ergonomic-chair'), 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500', true),
    ((SELECT id FROM public.products WHERE slug = 'minimalist-desk-lamp'), 'https://images.unsplash.com/photo-1507473885765-e6ed057ab854?w=500', true)
ON CONFLICT DO NOTHING;

-- Add inventory
INSERT INTO public.inventory (product_id, quantity, low_stock_threshold) VALUES
    ((SELECT id FROM public.products WHERE slug = 'aura-smart-chrono'), 15, 3),
    ((SELECT id FROM public.products WHERE slug = 'neptune-sound-pro'), 28, 5),
    ((SELECT id FROM public.products WHERE slug = 'zenith-ultrabook-pro'), 8, 2),
    ((SELECT id FROM public.products WHERE slug = 'apex-beast-gaming-laptop'), 5, 2),
    ((SELECT id FROM public.products WHERE slug = 'nike-air-zoom-runner'), 30, 5),
    ((SELECT id FROM public.products WHERE slug = 'luxe-leather-crossbody'), 42, 10),
    ((SELECT id FROM public.products WHERE slug = 'minimalist-ergonomic-chair'), 12, 3),
    ((SELECT id FROM public.products WHERE slug = 'minimalist-desk-lamp'), 65, 10)
ON CONFLICT (product_id) DO NOTHING;

-- Add a sample coupon
INSERT INTO public.coupons (code, discount_type, discount_value, min_purchase_amount, start_date, end_date, usage_limit, is_active) VALUES
    ('WELCOME10', 'percentage', 10.00, 50.00, '2026-01-01 00:00:00+00', '2027-12-31 23:59:59+00', 1000, true),
    ('FLAT20', 'fixed', 20.00, 100.00, '2026-01-01 00:00:00+00', '2027-12-31 23:59:59+00', 500, true)
ON CONFLICT (code) DO NOTHING;

