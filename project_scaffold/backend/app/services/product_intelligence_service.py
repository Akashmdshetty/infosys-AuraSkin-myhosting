import logging
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import Product, ProductRecommendation, User, SkinProfile, SkinAssessment
from app.schemas.product_intelligence import (
    ProductResponse, ProductSuitabilityDetail, ProductRecommendationResponse,
    ProductComparisonResponse, ProductComparisonItem, AlternativeProductsResponse
)
from app.services.safety_service import evaluate_ingredient_safety

logger = logging.getLogger(__name__)

# Initial comprehensive catalog of curated skincare products
SEED_PRODUCT_CATALOG: List[Dict[str, Any]] = [
    # 1. Face Wash / Cleansers
    {
        "name": "Gentle Hydrating Ceramide Cleanser",
        "brand": "CeraHydra Labs",
        "category": "Face Wash",
        "description": "Non-foaming cream cleanser enriched with 3 essential ceramides and hyaluronic acid to cleanse without disrupting the skin barrier.",
        "price": 449.0,
        "ingredients": "Water, Glycerin, Cetearyl Alcohol, Ceramide NP, Ceramide AP, Ceramide EOP, Hyaluronic Acid, Phytosphingosine, Cholesterol",
        "active_ingredients": "Ceramides (NP, AP, EOP), Hyaluronic Acid, Glycerin",
        "skin_types": "DRY,SENSITIVE,NORMAL,COMBINATION",
        "skin_concerns": "Dry Skin,Sensitive Skin,Redness",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Salicylic Acid Purifying Gel Cleanser 2%",
        "brand": "DermaClear Clinical",
        "category": "Face Wash",
        "description": "Deep pore clarifying gel cleanser formulated with 2% BHA and zinc PCA to dissolve sebum and unclog pores.",
        "price": 399.0,
        "ingredients": "Aqua, Cocamidopropyl Betaine, Salicylic Acid, Zinc PCA, Niacinamide, Glycerin, Tea Tree Leaf Extract",
        "active_ingredients": "Salicylic Acid (2%), Zinc PCA, Niacinamide",
        "skin_types": "OILY,COMBINATION",
        "skin_concerns": "Acne,Oily Skin,Dark Spots",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Centella Soothing Foam Cleanser",
        "brand": "PureCica Botanicals",
        "category": "Face Wash",
        "description": "Gentle, low-pH amino acid cleansing foam infused with 42% Centella Asiatica to calm reactive and inflamed skin.",
        "price": 599.0,
        "ingredients": "Centella Asiatica Extract, Sodium Cocoyl Isethionate, Glycerin, Madecassoside, Allantoin, Panthenol",
        "active_ingredients": "Centella Asiatica, Madecassoside, Panthenol",
        "skin_types": "SENSITIVE,DRY,NORMAL,OILY,COMBINATION",
        "skin_concerns": "Redness,Sensitive Skin,Acne",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },

    # 2. Toners
    {
        "name": "Multi-Molecular Hyaluronic Barrier Toner",
        "brand": "AuraHydra",
        "category": "Toner",
        "description": "Replenishing liquid toner featuring 5 molecular weights of Hyaluronic Acid, Panthenol, and Beta-Glucan for multi-layer hydration.",
        "price": 549.0,
        "ingredients": "Water, Butylene Glycol, Sodium Hyaluronate, Hydrolyzed Hyaluronic Acid, Panthenol, Beta-Glucan, Allantoin",
        "active_ingredients": "Hyaluronic Acid, Panthenol, Beta-Glucan",
        "skin_types": "DRY,SENSITIVE,NORMAL,COMBINATION,OILY",
        "skin_concerns": "Dry Skin,Fine Lines,Sensitive Skin",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "AHA Glycolic Resurfacing Clarifying Tonic 7%",
        "brand": "Radiance Science",
        "category": "Toner",
        "description": "Gentle exfoliating toner with 7% Glycolic Acid, amino acids, and Tasmanian Pepperberry to brighten and refine texture.",
        "price": 799.0,
        "ingredients": "Aqua, Glycolic Acid, Rosa Damascena Flower Water, Aloe Barbadensis Leaf Water, Panax Ginseng Root Extract",
        "active_ingredients": "Glycolic Acid (AHA), Ginseng Extract, Aloe Water",
        "skin_types": "NORMAL,COMBINATION,OILY",
        "skin_concerns": "Hyperpigmentation,Dark Spots,Uneven Skin Tone",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },

    # 3. Serums
    {
        "name": "Pure Niacinamide 10% + Zinc 1% Dermal Serum",
        "brand": "DermaBalance",
        "category": "Serum",
        "description": "High-strength vitamin and mineral blemish formula designed to reduce the appearance of blemishes and balance sebum.",
        "price": 599.0,
        "ingredients": "Aqua, Niacinamide, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Phenoxyethanol",
        "active_ingredients": "Niacinamide (10%), Zinc PCA (1%)",
        "skin_types": "OILY,COMBINATION,NORMAL,SENSITIVE",
        "skin_concerns": "Hyperpigmentation,Dark Spots,Oily Skin,Redness",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Advanced Pure L-Ascorbic Acid 15% + Ferulic Serum",
        "brand": "LuminaDerm Clinical",
        "category": "Serum",
        "description": "Gold standard photoprotective antioxidant serum targeting photo-aging, dark spots, and dull complexions.",
        "price": 1299.0,
        "ingredients": "Water, Ethoxydiglycol, L-Ascorbic Acid, Propylene Glycol, Glycerin, Laureth-23, Alpha Tocopherol, Ferulic Acid",
        "active_ingredients": "Vitamin C (L-Ascorbic Acid 15%), Ferulic Acid (0.5%), Vitamin E",
        "skin_types": "NORMAL,DRY,COMBINATION,OILY",
        "skin_concerns": "Hyperpigmentation,Dark Spots,Fine Lines,Uneven Skin Tone",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Multi-Peptide Matrixyl 3000 + Copper Peptide Serum",
        "brand": "PeptideComplex Labs",
        "category": "Serum",
        "description": "Comprehensive peptide concentrate supporting structural collagen synthesis and youthful skin elasticity.",
        "price": 1499.0,
        "ingredients": "Aqua, Glycerin, Palmitoyl Tripeptide-1, Palmitoyl Tetrapeptide-7, Copper Tripeptide-1, Sodium Hyaluronate",
        "active_ingredients": "Peptides (Matrixyl 3000, Copper Tripeptide-1), Hyaluronic Acid",
        "skin_types": "NORMAL,DRY,COMBINATION,SENSITIVE,OILY",
        "skin_concerns": "Wrinkles,Fine Lines,Uneven Skin Tone",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Azelaic Acid 10% Calming Suspension",
        "brand": "DermaSoothe Rx",
        "category": "Serum",
        "description": "Multi-functional brightening and redness-relieving cream-gel with 10% high-purity Azelaic Acid.",
        "price": 699.0,
        "ingredients": "Aqua, Azelaic Acid, Dipropylene Glycol, Polyacrylamide, C13-14 Isoparaffin, Laureth-7, Allantoin",
        "active_ingredients": "Azelaic Acid (10%), Allantoin",
        "skin_types": "SENSITIVE,OILY,COMBINATION,NORMAL,DRY",
        "skin_concerns": "Redness,Acne,Hyperpigmentation,Dark Spots",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },

    # 4. Moisturizers
    {
        "name": "Intense Ceramide Barrier Repair Cream",
        "brand": "CeraHydra Labs",
        "category": "Moisturizer",
        "description": "Rich lipid-replenishing moisture cream designed with bio-identical 3:1:1 physiological ceramide to cholesterol ratio.",
        "price": 699.0,
        "ingredients": "Aqua, Glycerin, Caprylic/Capric Triglyceride, Ceramide NP, Ceramide AP, Ceramide EOP, Phytosphingosine, Cholesterol, Squalane",
        "active_ingredients": "Ceramides (NP, AP, EOP), Squalane, Cholesterol",
        "skin_types": "DRY,SENSITIVE,NORMAL",
        "skin_concerns": "Dry Skin,Sensitive Skin,Redness",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Oil-Free Ultra-Light Hydrating Water Gel",
        "brand": "HydroLite Science",
        "category": "Moisturizer",
        "description": "Ultra-lightweight oil-free water gel providing 72-hour continuous hydration without clogging pores or greasy residue.",
        "price": 499.0,
        "ingredients": "Water, Dimethicone, Glycerin, Dimethicone/Vinyl Dimethicone Crosspolymer, Sodium Hyaluronate, Polyacrylamide, C13-14 Isoparaffin",
        "active_ingredients": "Hyaluronic Acid, Glycerin, Amino Acids",
        "skin_types": "OILY,COMBINATION,NORMAL",
        "skin_concerns": "Oily Skin,Acne,Fine Lines",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Calming Centella Barrier Relief Balm",
        "brand": "PureCica Botanicals",
        "category": "Moisturizer",
        "description": "Intensive rescue balm with Madecassoside and Panthenol 5% to repair compromised, irritated, or peeling skin.",
        "price": 849.0,
        "ingredients": "Aqua, Hydrogenated Polyisobutene, Dimethicone, Glycerin, Butyrospermum Parkii (Shea) Butter, Panthenol, Madecassoside",
        "active_ingredients": "Panthenol (5%), Madecassoside, Shea Butter",
        "skin_types": "SENSITIVE,DRY,NORMAL",
        "skin_concerns": "Sensitive Skin,Redness,Dry Skin",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },

    # 5. Sunscreens
    {
        "name": "Ultra-Light Mineral Sunscreen SPF 50+ PA++++",
        "brand": "SolarShield Clinical",
        "category": "Sunscreen",
        "description": "100% mineral Zinc Oxide sunscreen that leaves zero white cast and provides superior broad-spectrum UVA/UVB defense.",
        "price": 799.0,
        "ingredients": "Zinc Oxide (20%), Aqua, Cyclopentasiloxane, Caprylic/Capric Triglyceride, Niacinamide, Tocopherol, Bisabolol",
        "active_ingredients": "Zinc Oxide (20%), Niacinamide, Vitamin E",
        "skin_types": "SENSITIVE,DRY,OILY,COMBINATION,NORMAL",
        "skin_concerns": "Sun Exposure,Hyperpigmentation,Dark Spots,Redness",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Matte Finish Oil-Control Sunscreen Gel SPF 50",
        "brand": "DermaClear Clinical",
        "category": "Sunscreen",
        "description": "Non-greasy, fast-absorbing sunscreen gel with sebum regulators and antioxidants for all-day shine-free protection.",
        "price": 499.0,
        "ingredients": "Aqua, Octocrylene, Ethylhexyl Salicylate, Homosalate, Butyl Methoxydibenzoylmethane, Silica, Niacinamide",
        "active_ingredients": "UV Filters, Niacinamide, Silica",
        "skin_types": "OILY,COMBINATION,NORMAL",
        "skin_concerns": "Oily Skin,Acne,Sun Exposure",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },

    # 6. Treatment Products
    {
        "name": "Micro-Encapsulated Retinol 0.3% Night Treatment",
        "brand": "RetinoTech Labs",
        "category": "Treatment Products",
        "description": "Slow-release encapsulated retinol serum buffered with ceramides to promote cell renewal with minimal retinization.",
        "price": 999.0,
        "ingredients": "Aqua, Caprylic/Capric Triglyceride, Glycerin, Retinol, Ceramide NP, Squalane, Phospholipids, Polysorbate 20",
        "active_ingredients": "Encapsulated Retinol (0.3%), Ceramides, Squalane",
        "skin_types": "NORMAL,OILY,COMBINATION",
        "skin_concerns": "Wrinkles,Fine Lines,Acne,Hyperpigmentation",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Targeted Blemish Spot Drying Treatment",
        "brand": "DermaClear Clinical",
        "category": "Treatment Products",
        "description": "Fast-acting overnight spot treatment with Sulfur, Salicylic Acid, and Calamine to rapidly shrink active breakouts.",
        "price": 349.0,
        "ingredients": "Isopropyl Alcohol, Aqua, Zinc Oxide, Salicylic Acid, Calamine, Camphor, Colloidal Sulfur",
        "active_ingredients": "Salicylic Acid, Sulfur, Calamine",
        "skin_types": "OILY,COMBINATION",
        "skin_concerns": "Acne,Oily Skin",
        "fragrance_free": True,
        "alcohol_free": False,
        "cruelty_free": True
    },

    # 7. Face Masks
    {
        "name": "Centella Asiatica Soothing Barrier Sheet Mask (Pack of 5)",
        "brand": "PureCica Botanicals",
        "category": "Face Masks",
        "description": "Ultra-fine bamboo sheet mask soaked in 25ml of concentrated Madecassoside and Hyaluronic Acid calming essence.",
        "price": 499.0,
        "ingredients": "Aqua, Centella Asiatica Leaf Extract, Glycerin, Sodium Hyaluronate, Madecassoside, Allantoin, Panthenol",
        "active_ingredients": "Centella Asiatica, Madecassoside, Hyaluronic Acid",
        "skin_types": "SENSITIVE,DRY,NORMAL,OILY,COMBINATION",
        "skin_concerns": "Redness,Sensitive Skin,Dry Skin",
        "fragrance_free": True,
        "alcohol_free": True,
        "cruelty_free": True
    },
    {
        "name": "Purifying Kaolin & Charcoal Pore Refining Mask",
        "brand": "DermaClear Clinical",
        "category": "Face Masks",
        "description": "Creamy detoxifying clay mask with activated bamboo charcoal and 1% BHA to draw out impurities without over-drying.",
        "price": 549.0,
        "ingredients": "Aqua, Kaolin, Bentonite, Glycerin, Charcoal Powder, Salicylic Acid, Melaleuca Alternifolia Leaf Oil",
        "active_ingredients": "Kaolin Clay, Charcoal Powder, Salicylic Acid",
        "skin_types": "OILY,COMBINATION",
        "skin_concerns": "Acne,Oily Skin,Dark Spots",
        "fragrance_free": False,
        "alcohol_free": True,
        "cruelty_free": True
    }
]

def seed_products_if_empty(db: Session):
    count = db.query(Product).count()
    if count == 0:
        logger.info("Seeding product catalog with initial %d products...", len(SEED_PRODUCT_CATALOG))
        for item in SEED_PRODUCT_CATALOG:
            prod = Product(
                name=item["name"],
                brand=item["brand"],
                category=item["category"],
                description=item["description"],
                price=item["price"],
                ingredients=item["ingredients"],
                active_ingredients=item["active_ingredients"],
                skin_types=item["skin_types"],
                skin_concerns=item["skin_concerns"],
                fragrance_free=item["fragrance_free"],
                alcohol_free=item["alcohol_free"],
                cruelty_free=item["cruelty_free"],
                status="ACTIVE"
            )
            db.add(prod)
        db.commit()
        logger.info("Product catalog successfully seeded.")

def evaluate_product_suitability(
    product: Product,
    user: User,
    budget_max: Optional[float] = None
) -> ProductSuitabilityDetail:
    skin_prof: Optional[SkinProfile] = user.skin_profile
    skin_type = skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NORMAL"
    allergies = (skin_prof.allergies or "") if skin_prof else ""
    sensitivities = (skin_prof.sensitivities or "") if skin_prof else ""

    if skin_prof and skin_prof.skin_concerns:
        if isinstance(skin_prof.skin_concerns, str):
            user_concerns = [c.strip().lower() for c in skin_prof.skin_concerns.split(",") if c.strip()]
        elif isinstance(skin_prof.skin_concerns, list):
            user_concerns = [str(c).strip().lower() for c in skin_prof.skin_concerns if str(c).strip()]
        else:
            user_concerns = []
    else:
        user_concerns = []

    ignore_words = {"none", "none recorded", "n/a", "no", "nil", "nothing"}
    allergies_list = [a.strip().lower() for a in allergies.split(",") if a.strip() and a.strip().lower() not in ignore_words]
    sensitivities_list = [s.strip().lower() for s in sensitivities.split(",") if s.strip() and s.strip().lower() not in ignore_words]

    prod_skin_types = [st.strip().upper() for st in product.skin_types.split(",") if st.strip()]
    prod_concerns = [c.strip().lower() for c in product.skin_concerns.split(",") if c.strip()]
    prod_ingredients_str = product.ingredients.lower() + " " + product.active_ingredients.lower()

    score = 50  # Baseline score
    reasons: List[str] = []
    matching_concerns: List[str] = []
    compatible_ingredients: List[str] = []
    potential_conflicts: List[str] = []

    # 1. Skin Type Compatibility (+20 or -15)
    if skin_type.upper() in prod_skin_types:
        score += 20
        reasons.append(f"Specifically formulated for {skin_type.capitalize()} skin types.")
    else:
        score -= 15
        potential_conflicts.append(f"Not optimal for {skin_type.capitalize()} skin profile.")

    # 2. Skin Concerns Matched (+10 each up to +25)
    matched = [c for c in user_concerns if any(c in pc or pc in c for pc in prod_concerns)]
    if matched:
        match_boost = min(len(matched) * 10, 25)
        score += match_boost
        matching_concerns = matched
        reasons.append(f"Directly targets active user concerns: {', '.join([m.capitalize() for m in matched])}.")
    elif prod_concerns:
        reasons.append(f"Supports general dermal maintenance and skin health.")

    # 3. Allergen Safety Evaluation (-50 if allergen found)
    for alg in allergies_list:
        if alg in prod_ingredients_str or (len(alg) > 3 and any(w in prod_ingredients_str for w in alg.split())):
            score -= 50
            potential_conflicts.append(f"STRICT ALLERGY WARNING: Contains or conflicts with '{alg}'.")

    # 4. Sensitivity Safety Evaluation (-30 if sensitivity found)
    for sens in sensitivities_list:
        if sens in prod_ingredients_str or ("retin" in sens and "retin" in prod_ingredients_str) or ("acid" in sens and "salicylic" in prod_ingredients_str):
            score -= 30
            potential_conflicts.append(f"SENSITIVITY ALERT: Contains '{sens}', which may irritate sensitive skin.")

    # 5. Barrier & Fragrance Flags (+10 or -10)
    if product.fragrance_free:
        score += 5
        reasons.append("100% Fragrance-free; reduces contact dermatitis risk.")
    elif "sensitive" in skin_type.lower():
        score -= 10
        potential_conflicts.append("Contains fragrance components that may irritate reactive skin barriers.")

    if product.alcohol_free:
        score += 5

    # 6. Biocompatible Active Ingredients List
    for act in product.active_ingredients.split(","):
        act_clean = act.strip()
        if act_clean and not any(act_clean.lower() in pc.lower() for pc in potential_conflicts):
            compatible_ingredients.append(act_clean)

    # 7. Budget Fit Analysis
    budget_fit = "EXCELLENT"
    if budget_max is not None:
        if product.price <= budget_max * 0.75:
            budget_fit = "EXCELLENT"
            reasons.append(f"Well within specified budget of ₹{budget_max:,.0f} (₹{product.price:,.0f}).")
        elif product.price <= budget_max:
            budget_fit = "GOOD"
            reasons.append(f"Matches specified budget cap of ₹{budget_max:,.0f}.")
        else:
            budget_fit = "ABOVE_BUDGET"
            potential_conflicts.append(f"Exceeds current budget preference of ₹{budget_max:,.0f}.")

    # Clamp score to [0, 100]
    final_score = max(0, min(100, score))
    is_recommended = final_score >= 70 and not any("ALLERGY" in c for c in potential_conflicts)

    prod_res = ProductResponse(
        id=product.id,
        name=product.name,
        brand=product.brand,
        category=product.category,
        description=product.description,
        price=product.price,
        ingredients=product.ingredients,
        active_ingredients=product.active_ingredients,
        skin_types=[st.strip() for st in product.skin_types.split(",") if st.strip()],
        skin_concerns=[sc.strip() for sc in product.skin_concerns.split(",") if sc.strip()],
        fragrance_free=product.fragrance_free,
        alcohol_free=product.alcohol_free,
        cruelty_free=product.cruelty_free,
        status=product.status,
        image_url=product.image_url,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

    # Sub-component points
    skin_pts = 20 if skin_type.upper() in prod_skin_types else 5
    concern_pts = min(len(matching_concerns) * 12, 25) if matching_concerns else 10
    ing_pts = 20 if not any("ALLERGY" in c for c in potential_conflicts) else 0
    if any("SENSITIVITY" in c for c in potential_conflicts):
        ing_pts = max(0, ing_pts - 10)
    barrier_pts = 15 if (product.fragrance_free and product.alcohol_free) else 8
    routine_pts = 15 if final_score >= 70 else 7

    from app.schemas.product_intelligence import ProductScoreBreakdown
    breakdown = ProductScoreBreakdown(
        skin_type_points=skin_pts,
        concern_match_points=concern_pts,
        ingredient_compatibility_points=ing_pts,
        barrier_support_points=barrier_pts,
        routine_compatibility_points=routine_pts,
        total_score=final_score
    )

    return ProductSuitabilityDetail(
        product=prod_res,
        suitability_score=final_score,
        recommended=is_recommended,
        reasons=reasons,
        matching_concerns=matching_concerns,
        compatible_ingredients=compatible_ingredients,
        potential_conflicts=potential_conflicts,
        price=product.price,
        budget_fit=budget_fit,
        score_breakdown=breakdown
    )

def get_product_recommendations(
    db: Session,
    user: User,
    category: Optional[str] = None,
    budget_max: Optional[float] = None,
    target_concern: Optional[str] = None,
    limit: int = 10
) -> ProductRecommendationResponse:
    seed_products_if_empty(db)

    query = db.query(Product).filter(Product.status == "ACTIVE")
    if category and category.strip():
        query = query.filter(Product.category.ilike(f"%{category.strip()}%"))

    all_products = query.all()

    evaluated: List[ProductSuitabilityDetail] = []
    for prod in all_products:
        detail = evaluate_product_suitability(prod, user, budget_max=budget_max)
        # Strictly exclude products with active allergen conflicts
        if any("ALLERGY" in c for c in detail.potential_conflicts):
            continue
        # Apply budget filter if specified
        if budget_max is not None and prod.price > budget_max:
            continue
        # Apply concern filter if specified
        if target_concern and target_concern.strip():
            if not any(target_concern.lower() in c.lower() for c in detail.product.skin_concerns):
                continue
        evaluated.append(detail)

    # Sort by suitability score descending, then price ascending (prioritize suitability first)
    evaluated.sort(key=lambda x: (-x.suitability_score, x.price))

    top_results = evaluated[:limit]

    skin_prof: Optional[SkinProfile] = user.skin_profile
    skin_type = skin_prof.skin_type.value if (skin_prof and skin_prof.skin_type) else "NORMAL"
    primary_concern = skin_prof.skin_concerns[0] if (skin_prof and skin_prof.skin_concerns) else "Barrier Support"

    top_cat = top_results[0].product.category if top_results else None

    return ProductRecommendationResponse(
        user_skin_type=skin_type,
        primary_concern=primary_concern,
        total_matches=len(evaluated),
        recommendations=top_results,
        budget_filter_applied=budget_max,
        top_recommended_category=top_cat
    )

def compare_products(
    db: Session,
    user: User,
    product_ids: List[int]
) -> ProductComparisonResponse:
    seed_products_if_empty(db)

    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    if not products:
        return ProductComparisonResponse(
            compared_products=[],
            best_match_id=None,
            best_value_id=None,
            summary_verdict="No valid products found to compare."
        )

    items: List[ProductComparisonItem] = []
    for p in products:
        eval_detail = evaluate_product_suitability(p, user)
        allergen_conflicts = [c for c in eval_detail.potential_conflicts if "ALLERGY" in c]
        sensitivity_conflicts = [c for c in eval_detail.potential_conflicts if "SENSITIVITY" in c or "irritate" in c]
        barrier_supp = p.fragrance_free and ("ceramide" in p.ingredients.lower() or "panthenol" in p.ingredients.lower() or "cica" in p.ingredients.lower() or "hyaluronic" in p.ingredients.lower())

        items.append(ProductComparisonItem(
            product=eval_detail.product,
            suitability_score=eval_detail.suitability_score,
            is_safe_for_user=len(allergen_conflicts) == 0,
            reasons=eval_detail.reasons,
            allergen_conflicts=allergen_conflicts,
            sensitivity_conflicts=sensitivity_conflicts,
            key_actives=[a.strip() for a in p.active_ingredients.split(",") if a.strip()],
            target_concerns_addressed=eval_detail.matching_concerns,
            barrier_support=barrier_supp,
            fragrance_free=p.fragrance_free,
            price=p.price
        ))

    # Determine best match and best value
    sorted_by_score = sorted(items, key=lambda x: -x.suitability_score)
    best_match = sorted_by_score[0] if sorted_by_score else None
    
    # Best value: highest ratio of suitability to price among safe products
    safe_items = [i for i in items if i.is_safe_for_user]
    best_value = max(safe_items, key=lambda x: (x.suitability_score / max(x.price, 1))) if safe_items else (best_match if best_match else None)

    summary = (
        f"Compared {len(items)} products. Best overall skin compatibility match is '{best_match.product.name}' "
        f"({best_match.suitability_score}% suitability). Best value choice is '{best_value.product.name}'."
    )

    return ProductComparisonResponse(
        compared_products=items,
        best_match_id=best_match.product.id if best_match else None,
        best_value_id=best_value.product.id if best_value else None,
        summary_verdict=summary
    )

def get_alternative_products(
    db: Session,
    user: User,
    product_id: int
) -> AlternativeProductsResponse:
    seed_products_if_empty(db)

    target_prod = db.query(Product).filter(Product.id == product_id).first()
    if not target_prod:
        raise ValueError(f"Product with id={product_id} does not exist.")

    target_eval = evaluate_product_suitability(target_prod, user)
    reason = (
        "; ".join(target_eval.potential_conflicts)
        if target_eval.potential_conflicts
        else "Looking for enhanced biocompatibility, better active ingredient synergies, or alternate budget tiers."
    )

    # Find alternatives in the same category first
    candidates = db.query(Product).filter(
        Product.id != product_id,
        Product.category == target_prod.category,
        Product.status == "ACTIVE"
    ).all()

    # If same category has fewer than 2 items, widen to general catalog
    if len(candidates) < 2:
        all_active = db.query(Product).filter(Product.id != product_id, Product.status == "ACTIVE").all()
        candidates.extend([p for p in all_active if p.id not in [c.id for c in candidates]])

    alternatives_eval: List[ProductSuitabilityDetail] = []
    for c in candidates:
        detail = evaluate_product_suitability(c, user)
        # Prioritize allergen-free candidates
        if not any("ALLERGY" in conf for conf in detail.potential_conflicts):
            alternatives_eval.append(detail)

    # If all candidates had conflicts (unlikely), evaluate without strict allergen filter
    if not alternatives_eval:
        for c in candidates:
            alternatives_eval.append(evaluate_product_suitability(c, user))

    # Sort alternatives by highest suitability score, then by lowest price
    alternatives_eval.sort(key=lambda x: (-x.suitability_score, x.price))

    return AlternativeProductsResponse(
        unsuitable_product=target_eval.product,
        unsuitability_reason=reason,
        alternatives=alternatives_eval[:6]
    )

