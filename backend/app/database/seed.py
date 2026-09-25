import sys
import os
from sqlalchemy.orm import Session
from uuid import uuid4

# Adjust PYTHONPATH to include backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.database.session import SessionLocal, engine
from app.database.session import Base
from app.models.product import Category, Product, ProductImage, Inventory, ProductStatus

def seed_database():
    print("Connecting to database and initializing tables...")
    # Make sure all tables are created (useful if running in Docker container or locally)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Check if already seeded to prevent duplicate work
        exists = db.query(Category).first()
        if exists:
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding premium categories...")
        categories = [
            Category(name="Electronics", slug="electronics", description="Premium design electronic items and next-gen tech accessories."),
            Category(name="Accessories", slug="accessories", description="Handcrafted personal accessories, carry goods, and leather bags."),
            Category(name="Apparel", slug="apparel", description="Minimalist style luxury garments, curated fabrics, and clean silhouettes."),
            Category(name="Home Decor", slug="home-decor", description="Contemporary workspace aesthetics, desk organizers, and statement furniture.")
        ]
        db.add_all(categories)
        db.commit()
        for c in categories:
            db.refresh(c)
        print("Categories seeded successfully.")

        cat_map = {c.slug: c.id for c in categories}

        print("Seeding premium products and inventory levels...")
        
        products_data = [
            {
                "name": "Aura Smart Chrono Watch",
                "slug": "aura-smart-chrono",
                "description": "An elegant, premium smart watch designed with an Outfit typography face, customizable dials, and comprehensive wellness tracking with a polished titanium finish.",
                "price": 299.00,
                "compare_at_price": 349.00,
                "sku": "SKU-CHRONO-AURA",
                "is_featured": True,
                "category_id": cat_map["electronics"],
                "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
                "qty": 45
            },
            {
                "name": "Neptune SoundCancelling Pro",
                "slug": "neptune-sound-pro",
                "description": "Studio-grade active noise cancelling headphones with hybrid driver array, ambient awareness modes, and memory foam glassmorphism cup housings.",
                "price": 189.00,
                "compare_at_price": None,
                "sku": "SKU-NEPTUNE-SND",
                "is_featured": True,
                "category_id": cat_map["electronics"],
                "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                "qty": 30
            },
            {
                "name": "Orion Metallic Glasses",
                "slug": "orion-metallic-glasses",
                "description": "Ultra-lightweight surgical stainless steel frames with blue-light filtering lenses and signature satin metallic nose piece details.",
                "price": 145.00,
                "compare_at_price": 160.00,
                "sku": "SKU-ORION-GLASSES",
                "is_featured": False,
                "category_id": cat_map["accessories"],
                "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
                "qty": 80
            },
            {
                "name": "Nomad Vegan Leather Bag",
                "slug": "nomad-vegan-bag",
                "description": "Weatherproof dual-compartment backpack constructed from premium plant-based vegan leather. Fits up to a 16-inch laptop with quick-access pockets.",
                "price": 220.00,
                "compare_at_price": None,
                "sku": "SKU-NOMAD-LEATHER-BAG",
                "is_featured": True,
                "category_id": cat_map["accessories"],
                "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
                "qty": 15
            },
            {
                "name": "Aura MagSafe Charger Stand",
                "slug": "aura-magsafe-stand",
                "description": "A floating magnetic docking stand designed with weighted brushed aluminium base and frosted glass charge pad. Elevate your desk aesthetics.",
                "price": 49.00,
                "compare_at_price": None,
                "sku": "SKU-MAGSAFE-STAND",
                "is_featured": False,
                "category_id": cat_map["electronics"],
                "image_url": "https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800",
                "qty": 60
            },
            {
                "name": "Meridian Minimalist Keyring",
                "slug": "meridian-keyring",
                "description": "A secure tension-lock key holder crafted from carbon fiber plates and military-grade spring mechanisms. Holds up to 6 keys.",
                "price": 29.00,
                "compare_at_price": 35.00,
                "sku": "SKU-MERIDIAN-KEY",
                "is_featured": False,
                "category_id": cat_map["accessories"],
                "image_url": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
                "qty": 120
            },
            {
                "name": "Lunar Ceramic Studio Vase",
                "slug": "lunar-ceramic-vase",
                "description": "Modern minimalist textured stoneware vase inspired by volcanic basalt textures. Made by hand in Kyoto.",
                "price": 95.00,
                "compare_at_price": 115.00,
                "sku": "SKU-LUNAR-CERAMIC-VASE",
                "is_featured": True,
                "category_id": cat_map["home-decor"],
                "image_url": "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800",
                "qty": 20
            }
        ]

        for p_data in products_data:
            p_id = uuid4()
            # 1. Create Product
            prod = Product(
                id=p_id,
                name=p_data["name"],
                slug=p_data["slug"],
                description=p_data["description"],
                price=p_data["price"],
                compare_at_price=p_data["compare_at_price"],
                sku=p_data["sku"],
                status=ProductStatus.PUBLISHED.value,
                is_featured=p_data["is_featured"],
                category_id=p_data["category_id"]
            )
            db.add(prod)
            
            # 2. Add Product Image
            p_img = ProductImage(
                product_id=p_id,
                image_url=p_data["image_url"],
                is_primary=True,
                display_order=1
            )
            db.add(p_img)
            
            # 3. Add Inventory
            inv = Inventory(
                product_id=p_id,
                quantity=p_data["qty"],
                low_stock_threshold=5
            )
            db.add(inv)
            
        db.commit()
        print("Products, images, and inventory seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
