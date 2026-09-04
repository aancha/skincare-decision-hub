#!/usr/bin/env python3

import json
import uuid
from typing import Dict, List, Optional

try:
    from skincare_guardrails import (
        ACTIVE_LED_CONCERNS,
        BARRIER_FIRST_CONCERNS,
        BARRIER_SUPPORT_INGREDIENTS,
        CONCERN_STRATEGIES,
        EXFOLIATING_ACIDS,
        ROUTINE_STEP_PRIORITY,
        SKIN_PROFILES,
        STRONG_ACTIVE_INGREDIENTS,
    )
except ImportError:
    from scripts.skincare_guardrails import (
        ACTIVE_LED_CONCERNS,
        BARRIER_FIRST_CONCERNS,
        BARRIER_SUPPORT_INGREDIENTS,
        CONCERN_STRATEGIES,
        EXFOLIATING_ACIDS,
        ROUTINE_STEP_PRIORITY,
        SKIN_PROFILES,
        STRONG_ACTIVE_INGREDIENTS,
    )

def resolve_equivalent_identity_keys(products: List[Dict]) -> Dict[str, str]:
    """Group the fictional showcase's same-brand, same-name retailer offers."""
    identity_keys: Dict[str, str] = {}
    for product in products:
        product_id = str(product.get("id") or "").strip()
        if not product_id:
            continue
        brand = str(product.get("brand") or "").strip().casefold()
        name = str(product.get("name") or "").strip().casefold()
        category = str(product.get("category") or "").strip().casefold()
        identity_keys[product_id] = "|".join((brand, name, category))
    return identity_keys


ROUTINE_STEPS = {
    "am": [
        {"key": "cleanser", "label": "Cleanse", "categories": ["cleanser"]},
        {"key": "treat", "label": "Treat", "categories": ["serum", "toner", "treatment"]},
        {"key": "moisturize", "label": "Moisturize", "categories": ["moisturizer"]},
        {"key": "protect", "label": "Protect", "categories": ["sunscreen"]},
    ],
    "pm": [
        {"key": "cleanser", "label": "Cleanse", "categories": ["cleanser"]},
        {"key": "treat", "label": "Treat", "categories": ["serum", "toner", "treatment"]},
        {"key": "seal", "label": "Seal", "categories": ["moisturizer", "mask"]},
    ],
}

ROUTINE_BUDGETS = {
    "open": {"label": "Open budget", "cap": None, "bias": 0},
    "smart": {"label": "Smart spend", "cap": 110, "bias": 1.5},
    "under-75": {"label": "Under $75", "cap": 75, "bias": 3},
    "under-120": {"label": "Under $120", "cap": 120, "bias": 2},
    "premium": {"label": "Premium routine", "cap": None, "bias": -0.5},
}

def normalize_sensitivity(value: Optional[str]) -> str:
    normalized = str(value or "").strip().lower()
    return normalized if normalized in {"low", "moderate", "high"} else "moderate"


def normalize_actives_comfort(value: Optional[str]) -> str:
    normalized = str(value or "").strip().lower()
    return normalized if normalized in {"low", "medium", "high"} else "medium"


def normalize_profile(value: Optional[str]) -> str:
    normalized = str(value or "").strip().lower()
    return normalized if normalized in SKIN_PROFILES else "all"


def money(value: Optional[float]) -> str:
    if not isinstance(value, (int, float)):
        return "Price unavailable"
    return f"${value:,.2f}"


def title_case(text: str) -> str:
    return " ".join(part.capitalize() for part in str(text).split())


def format_list(items: List[str], limit: int = 2) -> str:
    clean = [item for item in items if item]
    if not clean:
        return ""
    if len(clean) == 1:
        return clean[0]
    if len(clean) <= limit:
        return ", ".join(clean[:-1]) + f" and {clean[-1]}"
    visible = clean[:limit]
    return ", ".join(visible) + f" +{len(clean) - limit} more"


def normalize_products(products: List[Dict]) -> List[Dict]:
    normalized = []
    for product in products:
        item = dict(product)
        item["concerns"] = list(item.get("concerns") or [])
        item["ingredients"] = [str(ingredient).lower() for ingredient in item.get("ingredients") or []]
        item["reviewCount"] = item.get("reviewCount", item.get("review_count"))
        item["ratingSource"] = item.get("ratingSource", item.get("rating_source"))
        normalized.append(item)
    return normalized


def normalize_draft_state(draft_state: Optional[Dict], timing: str) -> Dict:
    normalized_input = {}
    scoped_input = {}
    for raw_key, raw_value in (draft_state or {}).items():
        key = str(raw_key or "").strip()
        if not key:
            continue
        if ":" in key:
            prefix, _, suffix = key.partition(":")
            if prefix in {"am", "pm"} and suffix:
                if prefix != timing:
                    continue
                key = suffix
                scoped_input[key] = raw_value if isinstance(raw_value, dict) else {}
                continue
        normalized_input[key] = raw_value if isinstance(raw_value, dict) else {}
    result = {}
    for step in ROUTINE_STEPS.get(timing, []):
        raw = scoped_input.get(step["key"], normalized_input.get(step["key"], {}))
        result[step["key"]] = {
            "locked": bool(raw.get("locked")),
            "removed": bool(raw.get("removed")),
            "candidateIndex": max(0, int(raw.get("candidateIndex", 0) or 0)),
            "productId": raw.get("productId"),
        }
    return result


def _score_goal_fit(product: Dict, concern: str) -> float:
    score = 0.0
    if concern and concern != "all" and concern in product["concerns"]:
        score += 5
    if concern in ("dryness", "redness"):
        score += sum(1.2 for ingredient in product["ingredients"] if ingredient in BARRIER_SUPPORT_INGREDIENTS)
    if concern in ("acne", "pores"):
        score += sum(1.2 for ingredient in product["ingredients"] if ingredient in ["salicylic acid", "niacinamide", "retinol"])
    if concern in ("dark spots", "dullness"):
        score += sum(1.1 for ingredient in product["ingredients"] if ingredient in ["vitamin c", "niacinamide", "retinol", "glycolic acid", "lactic acid"])
    if concern == "wrinkles":
        score += sum(1.1 for ingredient in product["ingredients"] if ingredient in ["retinol", "peptides", "hyaluronic acid"])
    return score


def score_routine_match(product: Dict, concern: str, step: Dict) -> float:
    score = _score_goal_fit(product, concern)
    if product.get("category") in step["categories"]:
        score += 4
    if isinstance(product.get("price"), (int, float)):
        score += max(0, 2 - product["price"] / 60)
    return score


def score_routine_profile_fit(product: Dict, profile: Optional[str] = None) -> float:
    normalized = normalize_profile(profile)
    if normalized == "all":
        return 0.0
    profile_config = SKIN_PROFILES.get(normalized, SKIN_PROFILES["all"])
    score = 0.0
    score += sum(2.0 for concern in product["concerns"] if concern in profile_config["concerns"])
    score += sum(1.5 for ingredient in product["ingredients"] if ingredient in profile_config["ingredients"])
    if product.get("category") in profile_config["categories"]:
        score += 1.5
    return score


def score_routine_sensitivity_fit(product: Dict, sensitivity: Optional[str] = None) -> float:
    normalized = normalize_sensitivity(sensitivity)
    barrier_count = sum(1 for ingredient in product["ingredients"] if ingredient in BARRIER_SUPPORT_INGREDIENTS)
    strong_actives = sum(1 for ingredient in product["ingredients"] if ingredient in STRONG_ACTIVE_INGREDIENTS)

    if normalized == "high":
        return barrier_count * 1.5 - strong_actives * 2 + (1.5 if "redness" in product["concerns"] else 0.0)
    if normalized == "low":
        return strong_actives * 0.5
    return barrier_count * 0.5 - strong_actives * 0.5


def score_routine_actives_comfort_fit(product: Dict, actives_comfort: Optional[str] = None) -> float:
    normalized = normalize_actives_comfort(actives_comfort)
    strong_actives = sum(1 for ingredient in product["ingredients"] if ingredient in STRONG_ACTIVE_INGREDIENTS)

    if normalized == "low":
        score = 1.5 if product.get("category") in {"cleanser", "moisturizer", "sunscreen"} else 0.0
        return score - strong_actives * 2
    if normalized == "high":
        return (1.25 if product.get("category") in {"serum", "toner", "treatment"} else 0.0) + strong_actives * 1.25
    return -0.75 if strong_actives > 1 else 0.0


def score_routine_budget_fit(product: Dict, soft_cap: float, budget_lane: str) -> float:
    if not isinstance(product.get("price"), (int, float)):
        return 0
    mode = ROUTINE_BUDGETS.get(budget_lane, ROUTINE_BUDGETS["smart"])
    score = 0.0
    if mode["cap"] and product["price"] <= soft_cap:
        score += mode["bias"]
    if mode["cap"] and product["price"] > soft_cap:
        score -= min(3, (product["price"] - soft_cap) / 15)
    if budget_lane == "premium":
        score += min(2, product["price"] / 70)
    return score


def _product_warning_tags(product: Dict, timing: str, selected_products: List[Dict]) -> List[str]:
    warnings: List[str] = []
    ingredients = product["ingredients"]
    prior_ingredients = [ingredient for entry in selected_products for ingredient in entry["ingredients"]]
    if "retinol" in ingredients and timing == "am":
        warnings.append("retinol-am")
    if "spf" in ingredients and timing == "pm":
        warnings.append("pm-spf")
    if "benzoyl peroxide" in ingredients and ("retinol" in prior_ingredients or any(acid in prior_ingredients for acid in EXFOLIATING_ACIDS)):
        warnings.append("benzoyl-peroxide-stack")
    if "retinol" in ingredients and any(acid in prior_ingredients for acid in EXFOLIATING_ACIDS):
        warnings.append("retinol-acid-stack")
    if any(acid in ingredients for acid in EXFOLIATING_ACIDS) and "retinol" in prior_ingredients:
        warnings.append("retinol-acid-stack")
    return warnings


def score_routine_conflict_penalty(product: Dict, timing: str, selected_products: List[Dict]) -> float:
    return len(_product_warning_tags(product, timing, selected_products)) * -2.5


def score_routine_avoid_penalty(product: Dict, avoid_ingredients: Optional[List[str]] = None) -> float:
    avoid_set = {str(value).lower() for value in (avoid_ingredients or []) if value}
    if not avoid_set:
        return 0.0
    avoid_matches = sum(1 for ingredient in product["ingredients"] if ingredient in avoid_set)
    return avoid_matches * -7.0


def score_routine_shortlist_boost(product: Dict, step: Dict, saved_ids: List[str]) -> float:
    if product["id"] not in saved_ids:
        return 0
    score = 2.5
    if product.get("category") in step["categories"]:
        score += 2
    return score


def _comparison_lookup(products: List[Dict]) -> Dict[str, List[Dict]]:
    lookup: Dict[str, List[Dict]] = {}
    identity_keys = resolve_equivalent_identity_keys(products)
    lookup["__identity_by_product_id__"] = identity_keys
    for product in products:
        key = _routine_product_family_key(product, lookup)
        if not key:
            continue
        lookup.setdefault(key, []).append(product)
    return lookup


def _routine_product_family_key(
    product: Dict,
    comparison_lookup: Optional[Dict] = None,
) -> str:
    canonical_product_id = str(
        product.get("canonicalProductId") or ""
    ).strip()
    if canonical_product_id:
        return f"canonical::{canonical_product_id}"
    product_id = str(product.get("id") or "").strip()
    if comparison_lookup and product_id:
        identity_key = comparison_lookup.get(
            "__identity_by_product_id__", {}
        ).get(product_id)
        if identity_key:
            return identity_key
    if product_id:
        identity_key = resolve_equivalent_identity_keys([product]).get(
            product_id
        )
        if identity_key:
            return identity_key
    brand = str(product.get("brand") or "").strip().lower()
    name = str(product.get("name") or "").strip().lower()
    return f"{brand}::{name}"


def _normalized_retailer_name(value: object) -> str:
    return str(value or "").strip().casefold()


def build_reason_tags(product: Dict, step: Dict, concern: str, saved_ids: List[str], comparison_lookup: Dict[str, List[Dict]]) -> List[str]:
    tags: List[str] = []
    look_for = CONCERN_STRATEGIES.get(concern, CONCERN_STRATEGIES["general care"])["lookFor"]
    if any(ingredient in product["ingredients"] for ingredient in look_for):
        tags.append("ingredient-fit")
    if concern in product["concerns"]:
        tags.append("goal-fit")
    if product.get("category") in step["categories"]:
        tags.append("step-fit")
    if isinstance(product.get("rating"), (int, float)) and isinstance(product.get("reviewCount"), int) and product["reviewCount"] >= 1000:
        tags.append("review-signal")
    if isinstance(product.get("price"), (int, float)) and product["price"] <= 30:
        tags.append("budget-fit")
    if product["id"] in saved_ids:
        tags.append("saved-set-match")
    family_key = _routine_product_family_key(product, comparison_lookup)
    retailer_name = _normalized_retailer_name(product.get("retailer"))
    comparison_retailers = {
        _normalized_retailer_name(entry.get("retailer"))
        for entry in comparison_lookup.get(family_key, [])
        if _normalized_retailer_name(entry.get("retailer"))
    }
    if (
        family_key
        and retailer_name
        and any(
            comparison_retailer != retailer_name
            for comparison_retailer in comparison_retailers
        )
    ):
        tags.append("retailer-compare")
    return tags


def build_compact_reason(product: Dict, step: Dict, concern: str, reason_tags: List[str], comparison_lookup: Dict[str, List[Dict]]) -> str:
    look_for = CONCERN_STRATEGIES.get(concern, CONCERN_STRATEGIES["general care"])["lookFor"]
    matching = [title_case(ingredient) for ingredient in look_for if ingredient in product["ingredients"]]
    if matching:
        lead = format_list(matching, 2)
        if step["key"] == "cleanser":
            return f"{lead} keep this cleanse aligned with a {concern} plan"
        if step["key"] == "treat":
            return f"{lead} give the treatment step a clearer {concern} focus"
        if step["key"] in ("moisturize", "seal"):
            return f"{lead} make this the steadier support step in the plan"
        if step["key"] == "protect":
            return f"{lead} keep the daytime protection step working toward the same goal"
    if "review-signal" in reason_tags:
        return f"Has a strong synthetic fixture review signal at {product['rating']:.1f}★ from {product['reviewCount']:,} reviews"
    if "budget-fit" in reason_tags:
        return f"Keeps this step lower-commitment at {money(product.get('price'))}"
    if "retailer-compare" in reason_tags:
        family_key = _routine_product_family_key(product, comparison_lookup)
        retailer_name = _normalized_retailer_name(product.get("retailer"))
        retailers_by_name = {
            _normalized_retailer_name(entry.get("retailer")): str(
                entry.get("retailer") or ""
            ).strip()
            for entry in comparison_lookup.get(family_key, [])
            if _normalized_retailer_name(entry.get("retailer"))
            and _normalized_retailer_name(entry.get("retailer"))
            != retailer_name
        }
        retailers = sorted(retailers_by_name.values(), key=str.casefold)
        if retailers:
            return f"Has the same product available at {retailers[0]} if you want to compare retailer trust or price"
    if "step-fit" in reason_tags:
        return f"Fits the {step['label'].lower()} step with a clear {title_case(product['category']).lower()} match"
    if product["ingredients"]:
        return f"Leans on {format_list([title_case(value) for value in product['ingredients']], 2)} as the main signal"
    return f"Scored well for this {step['label'].lower()} step under your current routine settings"


def resolve_step_priority(timing: str, concern: str, step: Dict, product: Optional[Dict] = None) -> str:
    priority_map = ROUTINE_STEP_PRIORITY.get(timing, {})
    product_category = product.get("category") if product else None
    base_category = product_category or step["categories"][0]
    priority = "optional" if priority_map.get(base_category) == "optional" else "core"

    if step["key"] == "treat":
        if timing == "pm" and concern in BARRIER_FIRST_CONCERNS:
            priority = "optional"
        elif timing == "am" and concern in ACTIVE_LED_CONCERNS:
            priority = "core"
        if product_category == "toner" and concern in BARRIER_FIRST_CONCERNS:
            priority = "optional"

    if step["key"] == "seal" and product_category == "mask":
        priority = "optional"

    return priority


def build_routine_warning_entries(products: List[Dict], timing: str, avoid_ingredients: Optional[List[str]] = None) -> List[Dict]:
    all_ingredients = [ingredient for product in products for ingredient in product["ingredients"]]
    warning_entries: List[Dict] = []
    acid_count = sum(1 for ingredient in all_ingredients if ingredient in EXFOLIATING_ACIDS)
    has_retinol = "retinol" in all_ingredients
    has_benzoyl_peroxide = "benzoyl peroxide" in all_ingredients
    has_azelaic_acid = "azelaic acid" in all_ingredients
    has_vitamin_c = "vitamin c" in all_ingredients
    treatment_count = sum(1 for product in products if product.get("category") in ["serum", "toner", "treatment"])
    active_led_products = [
        product
        for product in products
        if product.get("category") in ["serum", "toner", "treatment"]
        or any(ingredient in STRONG_ACTIVE_INGREDIENTS for ingredient in product["ingredients"])
    ]
    identity_keys = resolve_equivalent_identity_keys(products)
    family_counts: Dict[str, int] = {}
    for product in products:
        product_id = str(product.get("id") or "").strip()
        family_key = (
            identity_keys.get(product_id)
            or _routine_product_family_key(product)
        )
        if not family_key:
            continue
        family_counts[family_key] = family_counts.get(family_key, 0) + 1
    avoid_matches = sorted({ingredient for ingredient in all_ingredients if ingredient in (avoid_ingredients or [])})

    def add(tag: str, message: str) -> None:
        if not any(entry["tag"] == tag for entry in warning_entries):
            warning_entries.append({"tag": tag, "message": message})

    if acid_count >= 2:
        add("acid-stack", "This routine stacks multiple exfoliating acids. Start slower if skin is sensitive.")
    if acid_count >= 1 and has_retinol:
        add("retinol-acid-stack", "Retinol plus acids can feel aggressive together. Alternate if irritation shows up.")
    if treatment_count >= 2 and len(active_led_products) >= 2:
        add("starter-plan-too-active", "This routine leans too heavily on treatment-style steps for a starter plan. Keep one main active and let the rest stay supportive.")
    if timing == "am" and has_retinol:
        add("retinol-am", "This AM routine includes retinol. Consider moving that step to PM.")
    if timing == "pm" and "spf" in all_ingredients:
        add("pm-spf", "This PM routine includes SPF. That step is usually more useful in AM.")
    if timing == "am" and has_benzoyl_peroxide and (acid_count >= 1 or has_retinol):
        add("benzoyl-peroxide-stack", "This AM routine combines benzoyl peroxide with other strong actives. Consider simplifying the morning stack.")
    if timing == "am" and has_azelaic_acid and treatment_count >= 2:
        add("azelaic-heavy-am", "This AM routine includes azelaic acid in a treatment-heavy setup. A calmer morning routine may fit better.")
    if timing == "pm" and has_vitamin_c and not has_retinol:
        add("vitamin-c-pm", "This PM routine leans on vitamin C, which some people prefer to prioritize in AM.")
    if any(count >= 2 for count in family_counts.values()):
        add("duplicate-product-family", "This routine repeats the same product family across multiple steps. Keep each step doing a clearer job.")
    if avoid_matches:
        add("avoid-list-match", f"The routine still includes {format_list([title_case(value) for value in avoid_matches], 2)} from your avoid list.")
    return warning_entries[:3]


def _serialize_product(product: Dict) -> Dict:
    return {
        "id": product["id"],
        "retailer": product.get("retailer"),
        "brand": product.get("brand"),
        "name": product.get("name"),
        "category": product.get("category"),
        "price": product.get("price"),
        "rating": product.get("rating"),
        "reviewCount": product.get("reviewCount"),
        "ratingSource": product.get("ratingSource"),
        "concerns": product.get("concerns", []),
        "ingredients": product.get("ingredients", []),
        "url": product.get("url"),
        "image": product.get("image"),
        "comparisonKey": product.get("comparisonKey"),
    }


def _build_step_candidates(
    products: List[Dict],
    concern: str,
    timing: str,
    budget_lane: str,
    step: Dict,
    selected_products: List[Dict],
    used_ids: set,
    saved_ids: List[str],
    profile: Optional[str] = None,
    avoid_ingredients: Optional[List[str]] = None,
    sensitivity: Optional[str] = None,
    actives_comfort: Optional[str] = None,
) -> List[Dict]:
    spent = sum(product.get("price") or 0 for product in selected_products)
    remaining_steps = max(1, len(ROUTINE_STEPS[timing]) - len(selected_products))
    budget_mode = ROUTINE_BUDGETS.get(budget_lane, ROUTINE_BUDGETS["smart"])
    remaining_cap = max(0, budget_mode["cap"] - spent) if budget_mode["cap"] is not None else None
    soft_cap = remaining_cap / remaining_steps if remaining_cap is not None else 10_000_000
    candidates = []
    for product in products:
        if product["id"] in used_ids:
            continue
        if product.get("category") not in step["categories"]:
            continue
        score = (
            score_routine_match(product, concern, step)
            + score_routine_profile_fit(product, profile)
            + score_routine_sensitivity_fit(product, sensitivity)
            + score_routine_actives_comfort_fit(product, actives_comfort)
            + score_routine_budget_fit(product, soft_cap, budget_lane)
            + score_routine_conflict_penalty(product, timing, selected_products)
            + score_routine_avoid_penalty(product, avoid_ingredients)
            + score_routine_shortlist_boost(product, step, saved_ids)
        )
        if score >= 4:
            candidates.append({"product": product, "score": score})
    candidates.sort(key=lambda entry: (-entry["score"], entry["product"].get("price") or 0, entry["product"]["name"]))
    return candidates


def _estimate_remaining_core_floor(
    products: List[Dict],
    concern: str,
    timing: str,
    budget_lane: str,
    steps: List[Dict],
    start_index: int,
    selected_products: List[Dict],
    used_ids: set,
    saved_ids: List[str],
    profile: Optional[str] = None,
    avoid_ingredients: Optional[List[str]] = None,
    sensitivity: Optional[str] = None,
    actives_comfort: Optional[str] = None,
) -> float:
    projected_selected = list(selected_products)
    projected_used = set(used_ids)
    floor_total = 0.0

    for future_step in steps[start_index + 1 :]:
        if resolve_step_priority(timing, concern, future_step) != "core":
            continue
        candidates = _build_step_candidates(
            products,
            concern,
            timing,
            budget_lane,
            future_step,
            projected_selected,
            projected_used,
            saved_ids,
            profile=profile,
            avoid_ingredients=avoid_ingredients,
            sensitivity=sensitivity,
            actives_comfort=actives_comfort,
        )
        if not candidates:
            continue
        priced_candidates = [entry["product"] for entry in candidates if isinstance(entry["product"].get("price"), (int, float))]
        chosen_floor = min(priced_candidates, key=lambda product: product.get("price") or 0) if priced_candidates else candidates[0]["product"]
        projected_used.add(chosen_floor["id"])
        projected_selected.append(chosen_floor)
        floor_total += chosen_floor.get("price") or 0

    return floor_total


def _build_step_guidance(selected_core_steps: int, core_steps: int, optional_steps_deferred: int) -> Optional[str]:
    if selected_core_steps < core_steps:
        return "Fill the remaining core steps first. Optional steps stay secondary until the main routine is complete."
    if optional_steps_deferred:
        return "Optional steps were held back to keep the core routine inside the current budget target."
    if core_steps:
        return "Core steps come first. Add optional steps only if budget and skin tolerance still allow."
    return None


def build_routine_plan(
    products: List[Dict],
    concern: str,
    timing: str,
    budget_lane: str,
    saved_ids: Optional[List[str]] = None,
    draft_state: Optional[Dict] = None,
    profile: Optional[str] = None,
    avoid_ingredients: Optional[List[str]] = None,
    sensitivity: Optional[str] = None,
    actives_comfort: Optional[str] = None,
) -> Dict:
    saved_ids = list(saved_ids or [])
    profile = normalize_profile(profile)
    avoid_ingredients = sorted({str(value).lower() for value in (avoid_ingredients or []) if value})
    sensitivity = normalize_sensitivity(sensitivity)
    actives_comfort = normalize_actives_comfort(actives_comfort)
    products = normalize_products(products)
    draft_state = normalize_draft_state(draft_state, timing)
    steps = ROUTINE_STEPS.get(timing, ROUTINE_STEPS["am"])
    comparison_lookup = _comparison_lookup(products)
    used_ids = set()
    selected_products: List[Dict] = []
    step_results = []
    selected_core_steps = 0
    optional_steps = 0
    optional_steps_deferred = 0
    budget_mode = ROUTINE_BUDGETS.get(budget_lane, ROUTINE_BUDGETS["smart"])
    core_total = 0.0
    core_steps = len([step for step in steps if resolve_step_priority(timing, concern, step) == "core"])

    for index, step in enumerate(steps):
        draft = draft_state.get(step["key"], {"locked": False, "removed": False, "candidateIndex": 0, "productId": None})
        priority = resolve_step_priority(timing, concern, step)
        if draft["removed"]:
            step_results.append(
                {
                    "step": {"key": step["key"], "label": step["label"], "categories": step["categories"]},
                    "priority": priority,
                    "removed": True,
                    "deferred": False,
                    "locked": False,
                    "fromSavedSet": False,
                    "product": None,
                    "reasonTags": [],
                    "reason": None,
                    "warningTags": [],
                    "warnings": [],
                }
            )
            continue

        candidates = _build_step_candidates(
            products,
            concern,
            timing,
            budget_lane,
            step,
            selected_products,
            used_ids,
            saved_ids,
            profile=profile,
            avoid_ingredients=avoid_ingredients,
            sensitivity=sensitivity,
            actives_comfort=actives_comfort,
        )
        candidate_products = [entry["product"] for entry in candidates]
        chosen = None
        if draft.get("productId"):
            chosen = next((product for product in candidate_products if product["id"] == draft["productId"]), None)
            if chosen is None:
                draft["productId"] = None
        if chosen is None and candidate_products:
            chosen = candidate_products[min(draft.get("candidateIndex", 0), max(0, len(candidate_products) - 1))]

        deferred = False
        deferred_reason = None
        if chosen is not None and not draft.get("productId") and budget_mode["cap"] is not None:
            future_core_floor = _estimate_remaining_core_floor(
                products,
                concern,
                timing,
                budget_lane,
                steps,
                index,
                selected_products,
                used_ids,
                saved_ids,
                profile=profile,
                avoid_ingredients=avoid_ingredients,
                sensitivity=sensitivity,
                actives_comfort=actives_comfort,
            )
            if priority == "core":
                remaining_budget_for_step = max(0.0, budget_mode["cap"] - sum(product.get("price") or 0 for product in selected_products) - future_core_floor)
                affordable = [
                    product
                    for product in candidate_products
                    if isinstance(product.get("price"), (int, float)) and product.get("price") <= remaining_budget_for_step
                ]
                if affordable:
                    chosen = affordable[0]
            elif priority == "optional":
                projected_total = sum(product.get("price") or 0 for product in selected_products) + (chosen.get("price") or 0) + future_core_floor
                if projected_total > budget_mode["cap"]:
                    chosen = None
                    deferred = True
                    deferred_reason = f"Held out to keep the core routine inside the {money(budget_mode['cap'])} target first."
                    optional_steps_deferred += 1

        if not chosen:
            step_results.append(
                {
                    "step": {"key": step["key"], "label": step["label"], "categories": step["categories"]},
                    "priority": priority,
                    "removed": False,
                    "deferred": deferred,
                    "locked": bool(draft.get("locked")),
                    "fromSavedSet": False,
                    "product": None,
                    "reasonTags": ["budget-held"] if deferred else [],
                    "reason": deferred_reason,
                    "warningTags": [],
                    "warnings": [],
                }
            )
            continue

        priority = resolve_step_priority(timing, concern, step, chosen)
        used_ids.add(chosen["id"])
        selected_products.append(chosen)
        if priority == "core":
            selected_core_steps += 1
            core_total += chosen.get("price") or 0
        else:
            optional_steps += 1

        reason_tags = build_reason_tags(chosen, step, concern, saved_ids, comparison_lookup)
        warning_tags = _product_warning_tags(chosen, timing, selected_products[:-1])
        step_results.append(
            {
                "step": {"key": step["key"], "label": step["label"], "categories": step["categories"]},
                "priority": priority,
                "removed": False,
                "deferred": False,
                "locked": bool(draft.get("locked")),
                "fromSavedSet": chosen["id"] in saved_ids,
                "product": _serialize_product(chosen),
                "reasonTags": reason_tags,
                "reason": build_compact_reason(chosen, step, concern, reason_tags, comparison_lookup),
                "warningTags": warning_tags,
                "warnings": warning_tags,
            }
        )

    total = sum(product.get("price") or 0 for product in selected_products)
    within_budget = budget_mode["cap"] is None or total <= budget_mode["cap"]
    if within_budget:
        budget_assessment = "within_target"
    elif core_total <= (budget_mode["cap"] or core_total):
        budget_assessment = "optional-first-cut"
    else:
        budget_assessment = "core-needs-swap"

    warnings = build_routine_warning_entries(selected_products, timing, avoid_ingredients)
    if timing == "pm" and concern in BARRIER_FIRST_CONCERNS and any(
        entry["step"]["key"] == "treat" and not entry["removed"] and entry["product"]
        for entry in step_results
    ):
        warnings = [
            {
                "tag": "support-first-pm",
                "message": "For a barrier-first PM plan, the treatment step is optional. Start with cleanse and seal, then add actives later if needed.",
            },
            *warnings,
        ]
    summary = {
        "selectedSteps": len([entry for entry in step_results if not entry["removed"] and entry["product"]]),
        "total": round(total, 2),
        "budgetLane": budget_lane,
        "budgetLabel": budget_mode["label"],
        "budgetCap": budget_mode["cap"],
        "withinBudget": within_budget,
        "budgetAssessment": budget_assessment,
        "coreStepsSelected": selected_core_steps,
        "coreStepsTotal": core_steps,
        "optionalStepsSelected": optional_steps,
        "optionalStepsDeferred": optional_steps_deferred,
        "keptSteps": len([entry for entry in step_results if entry["locked"]]),
        "removedSteps": len([entry for entry in step_results if entry["removed"]]),
        "savedSetSteps": len([entry for entry in step_results if entry["fromSavedSet"]]),
        "stepGuidance": _build_step_guidance(selected_core_steps, core_steps, optional_steps_deferred),
        "warnings": warnings[:3],
        "warningTags": [entry["tag"] for entry in warnings[:3]],
    }
    return {
        "context": {
            "concern": concern,
            "timing": timing,
            "budgetLane": budget_lane,
            "savedIds": saved_ids,
            "draftState": draft_state,
            "profile": profile,
            "avoidIngredients": avoid_ingredients,
            "sensitivity": sensitivity,
            "activesComfort": actives_comfort,
        },
        "steps": step_results,
        "summary": summary,
    }


def build_step_alternatives(
    products: List[Dict],
    concern: str,
    timing: str,
    budget_lane: str,
    step_key: str,
    saved_ids: Optional[List[str]] = None,
    draft_state: Optional[Dict] = None,
    profile: Optional[str] = None,
    avoid_ingredients: Optional[List[str]] = None,
    sensitivity: Optional[str] = None,
    actives_comfort: Optional[str] = None,
) -> Dict:
    saved_ids = list(saved_ids or [])
    profile = normalize_profile(profile)
    avoid_ingredients = sorted({str(value).lower() for value in (avoid_ingredients or []) if value})
    sensitivity = normalize_sensitivity(sensitivity)
    actives_comfort = normalize_actives_comfort(actives_comfort)
    plan = build_routine_plan(
        products,
        concern,
        timing,
        budget_lane,
        saved_ids=saved_ids,
        draft_state=draft_state,
        profile=profile,
        avoid_ingredients=avoid_ingredients,
        sensitivity=sensitivity,
        actives_comfort=actives_comfort,
    )
    step_entry = next((entry for entry in plan["steps"] if entry["step"]["key"] == step_key), None)
    if not step_entry or not step_entry["product"]:
        return {"current": None, "savedSetMatches": [], "otherStrongFits": []}

    products = normalize_products(products)
    steps = ROUTINE_STEPS.get(timing, ROUTINE_STEPS["am"])
    target_step = next((step for step in steps if step["key"] == step_key), None)
    if not target_step:
        return {"current": step_entry["product"], "savedSetMatches": [], "otherStrongFits": []}

    comparison_lookup = _comparison_lookup(products)
    selected_other_products = [
        normalize_products([entry["product"]])[0]
        for entry in plan["steps"]
        if entry["step"]["key"] != step_key and entry["product"]
    ]
    used_ids = {entry["product"]["id"] for entry in plan["steps"] if entry["step"]["key"] != step_key and entry["product"]}
    candidates = _build_step_candidates(
        products,
        concern,
        timing,
        budget_lane,
        target_step,
        selected_other_products,
        used_ids,
        saved_ids,
        profile=profile,
        avoid_ingredients=avoid_ingredients,
        sensitivity=sensitivity,
        actives_comfort=actives_comfort,
    )
    items = []
    for entry in candidates:
        product = entry["product"]
        if product["id"] == step_entry["product"]["id"]:
            continue
        reason_tags = build_reason_tags(product, target_step, concern, saved_ids, comparison_lookup)
        items.append(
            {
                "product": _serialize_product(product),
                "reasonTags": reason_tags,
                "reason": build_compact_reason(product, target_step, concern, reason_tags, comparison_lookup),
                "score": round(entry["score"], 2),
                "fromSavedSet": product["id"] in saved_ids,
            }
        )
    return {
        "current": step_entry["product"],
        "savedSetMatches": [item for item in items if item["fromSavedSet"]][:4],
        "otherStrongFits": [item for item in items if not item["fromSavedSet"]][:4],
    }


def new_routine_draft_id() -> str:
    return f"routine-draft-{uuid.uuid4().hex[:12]}"


def serialize_json(value: object) -> str:
    return json.dumps(value, ensure_ascii=True, sort_keys=True)
