from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False, index=True)  # Face Wash, Moisturizer, Sunscreen, Serum, Toner, Treatment Products, Face Masks
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)  # in INR ₹
    ingredients = Column(Text, nullable=False)  # Full ingredients CSV / text
    active_ingredients = Column(Text, nullable=False)  # Key active ingredients CSV
    skin_types = Column(Text, nullable=False)  # JSON or CSV list of compatible skin types (e.g. "DRY,SENSITIVE,NORMAL")
    skin_concerns = Column(Text, nullable=False)  # JSON or CSV list of target concerns (e.g. "Acne,Hyperpigmentation")
    fragrance_free = Column(Boolean, default=True, nullable=False)
    alcohol_free = Column(Boolean, default=True, nullable=False)
    cruelty_free = Column(Boolean, default=True, nullable=False)
    status = Column(String, default="ACTIVE", nullable=False)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    recommendations = relationship("ProductRecommendation", back_populates="product", cascade="all, delete-orphan")


class ProductRecommendation(Base):
    __tablename__ = "product_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    suitability_score = Column(Integer, nullable=False)  # 0 to 100
    recommended = Column(Boolean, default=True, nullable=False)
    reasons = Column(Text, nullable=False)  # JSON array of reasons string
    potential_conflicts = Column(Text, nullable=True)  # JSON array of conflict notes or empty
    matching_concerns = Column(Text, nullable=True)  # JSON array of matched concerns
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="product_recommendations")
    product = relationship("Product", back_populates="recommendations")
