#!/usr/bin/env python3

import json
import pathlib
import re
from functools import lru_cache
from typing import Dict, List, Optional


ROOT = pathlib.Path(__file__).resolve().parents[1]
GUARDRAILS_PATH = ROOT / "web" / "skincare_guardrails.json"

SEVERITY_ORDER = {"none": 0, "info": 1, "warning": 2, "redirect": 3}


@lru_cache(maxsize=1)
def load_guardrails_payload() -> Dict:
    return json.loads(GUARDRAILS_PATH.read_text(encoding="utf-8"))


PAYLOAD = load_guardrails_payload()
INGREDIENT_RULES = PAYLOAD["ingredientRules"]
EQUIVALENT_INGREDIENT_GROUPS = PAYLOAD["equivalentIngredientGroups"]
AVOID_INGREDIENT_OPTIONS = PAYLOAD["avoidIngredientOptions"]
SKIN_PROFILES = PAYLOAD["skinProfiles"]
CONCERN_STRATEGIES = PAYLOAD["concernStrategies"]
SOURCE_CONCERN_ALIASES = PAYLOAD.get("sourceConcernAliases", {})
ROUTINE_RULES = PAYLOAD["routine"]
ROUTINE_STEP_PRIORITY = ROUTINE_RULES["stepPriority"]
STRONG_ACTIVE_INGREDIENTS = ROUTINE_RULES["strongActiveIngredients"]
EXFOLIATING_ACIDS = ROUTINE_RULES["exfoliatingAcids"]
BARRIER_SUPPORT_INGREDIENTS = ROUTINE_RULES["barrierSupportIngredients"]
BARRIER_FIRST_CONCERNS = set(ROUTINE_RULES["barrierFirstConcerns"])
ACTIVE_LED_CONCERNS = set(ROUTINE_RULES["activeLedConcerns"])
SENSITIVE_SAFE_CATEGORIES = set(ROUTINE_RULES["sensitiveSafeCategories"])
HIGH_ACTIVES_CATEGORIES = set(ROUTINE_RULES["highActivesCategories"])
RECOMMENDATION_GUARDRAILS = PAYLOAD["recommendationGuardrails"]
QUESTION_SIGNAL_RULES = RECOMMENDATION_GUARDRAILS["questionSignals"]
INGREDIENT_GROUPS = RECOMMENDATION_GUARDRAILS["ingredientGroups"]
PREGNANCY_INGREDIENT_RULES = RECOMMENDATION_GUARDRAILS["pregnancyIngredientRules"]
SHORTLIST_PROMPT_RULES = RECOMMENDATION_GUARDRAILS["shortlistPromptRules"]


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


def normalize_text(value: Optional[str]) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().lower()


def extract_ingredients_from_text(text: Optional[str]) -> List[str]:
    lowered = normalize_text(text)
    return [
        ingredient
        for ingredient, keywords in INGREDIENT_RULES.items()
        if any(keyword in lowered for keyword in keywords)
    ]


def get_product_search_text(product: Optional[Dict]) -> str:
    if not isinstance(product, dict):
        return ""
    return " ".join(
        str(value)
        for value in [
            product.get("brand"),
            product.get("name"),
            product.get("category"),
            product.get("description"),
            " ".join(product.get("concerns") or []),
            " ".join(product.get("ingredients") or []),
        ]
        if value
    )


def get_product_ingredients(product: Optional[Dict]) -> List[str]:
    explicit = [normalize_text(value) for value in (product or {}).get("ingredients") or [] if value]
    inferred = extract_ingredients_from_text(get_product_search_text(product))
    return sorted({value for value in [*explicit, *inferred] if value})


def product_matches_group(product: Optional[Dict], group_name: str) -> bool:
    if not isinstance(product, dict):
        return False
    group_values = {normalize_text(value) for value in INGREDIENT_GROUPS.get(group_name, [])}
    if not group_values:
        return False
    product_ingredients = set(get_product_ingredients(product))
    product_text = normalize_text(get_product_search_text(product))
    return any(value in product_ingredients or value in product_text for value in group_values)


def assess_product_guardrails(product: Optional[Dict]) -> Dict:
    ingredients = get_product_ingredients(product)
    ingredient_set = set(ingredients)
    strong_active_count = sum(1 for ingredient in ingredient_set if ingredient in STRONG_ACTIVE_INGREDIENTS)
    barrier_support_count = sum(1 for ingredient in ingredient_set if ingredient in BARRIER_SUPPORT_INGREDIENTS)
    category = normalize_text((product or {}).get("category"))
    fragrance_free = "fragrance-free" in ingredient_set
    sensitive_safe = False

    if fragrance_free and strong_active_count <= 1:
        sensitive_safe = True
    elif barrier_support_count >= 2 and strong_active_count == 0:
        sensitive_safe = True
    elif category in SENSITIVE_SAFE_CATEGORIES and barrier_support_count >= 1 and category not in HIGH_ACTIVES_CATEGORIES and strong_active_count == 0:
        sensitive_safe = True

    pregnancy_tags = [
        rule["tag"]
        for rule in PREGNANCY_INGREDIENT_RULES
        if any(product_matches_group(product, group_name) for group_name in rule.get("ingredientGroupsAny", []))
    ]

    tags: List[str] = []
    if sensitive_safe:
        tags.append("sensitive-safe")
    if barrier_support_count:
        tags.append("barrier-support")
    if strong_active_count >= 2:
        tags.append("high-irritation-active")
    elif strong_active_count == 1:
        tags.append("active-led")
    tags.extend(pregnancy_tags)

    return {
        "ingredients": ingredients,
        "barrierSupportCount": barrier_support_count,
        "strongActiveCount": strong_active_count,
        "sensitiveSafe": sensitive_safe,
        "pregnancyCautionTags": pregnancy_tags,
        "tags": tags,
    }


def _rule_matches(text: str, patterns: List[str]) -> bool:
    return any(re.search(pattern, text, re.I) for pattern in patterns or [])


def evaluate_question_guardrails(question: Optional[str], products: Optional[List[Dict]] = None) -> Dict:
    normalized_question = normalize_text(question)
    products = list(products or [])
    matches: List[Dict] = []

    def add_match(rule: Dict, source: str) -> None:
        if any(entry["tag"] == rule["tag"] for entry in matches):
            return
        matches.append(
            {
                "id": rule["id"],
                "tag": rule["tag"],
                "severity": rule["severity"],
                "message": rule["message"],
                "source": source,
            }
        )

    pregnancy_requested = False
    for rule in QUESTION_SIGNAL_RULES:
        if _rule_matches(normalized_question, rule.get("patterns", [])):
            add_match(rule, "question")
            if rule["id"] == "pregnancy-request":
                pregnancy_requested = True

    if pregnancy_requested:
        for rule in PREGNANCY_INGREDIENT_RULES:
            if any(product_matches_group(product, group_name) for product in products for group_name in rule.get("ingredientGroupsAny", [])):
                add_match(rule, "product")

    severity = "none"
    primary_match = None
    for match in matches:
        if SEVERITY_ORDER[match["severity"]] >= SEVERITY_ORDER[severity]:
            severity = match["severity"]
            primary_match = match
    if primary_match is None and matches:
        primary_match = matches[0]

    return {
        "hasGuardrail": bool(matches),
        "severity": severity,
        "primaryTag": primary_match["tag"] if primary_match else None,
        "primaryMessage": primary_match["message"] if primary_match else "",
        "tags": [entry["tag"] for entry in matches],
        "matches": matches,
        "pregnancyRequested": pregnancy_requested,
    }


def choose_conservative_product(products: Optional[List[Dict]]) -> Optional[Dict]:
    ranked = []
    for product in products or []:
        posture = assess_product_guardrails(product)
        score = 0
        if posture["sensitiveSafe"]:
            score += 10
        score += posture["barrierSupportCount"] * 2
        score -= posture["strongActiveCount"] * 4
        score -= len(posture["pregnancyCautionTags"]) * 6
        if normalize_text(product.get("category")) in SENSITIVE_SAFE_CATEGORIES:
            score += 1
        if isinstance(product.get("price"), (int, float)):
            score -= float(product["price"]) / 200
        ranked.append((score, product))
    if not ranked:
        return None
    ranked.sort(key=lambda item: item[0], reverse=True)
    return ranked[0][1]


def build_guardrailed_shortlist_answer(payload: Dict) -> Optional[Dict]:
    question = str(payload.get("question") or "").strip()
    context = payload.get("context") or {}
    products = list(context.get("products") or [])
    evaluation = evaluate_question_guardrails(question, products)
    if not evaluation["hasGuardrail"]:
        return None

    safer = choose_conservative_product(products)
    safer_name = f"{safer.get('brand')} {safer.get('name')}".strip() if safer else "the calmest cleanser, moisturizer, and sunscreen trio you can tolerate"
    tags = set(evaluation["tags"])

    if evaluation["severity"] == "redirect":
        answer = "\n".join(
            [
                "Guardrail check for this question.",
                "Start with: Pause new actives and keep the routine simple while the skin issue is active.",
                f"Safer option: {safer_name} reads as the most conservative option in this saved set, but the symptoms themselves matter more than choosing a stronger product right now.",
                f"Tradeoff: {evaluation['primaryMessage']} Shopping advice should stay conservative until the reaction or symptom is assessed.",
                "Budget note: Price is secondary when swelling, burning, rash, open skin, or other red-flag symptoms are in play.",
                "Next step: Stop new actives, use only a gentle cleanser, simple moisturizer, and sunscreen if tolerated, and get medical guidance.",
            ]
        )
        return {"evaluation": evaluation, "answer": answer}

    if evaluation["pregnancyRequested"] or any("pregnancy" in tag for tag in tags):
        answer = "\n".join(
            [
                "Guardrail check for this question.",
                f"Start with: {safer_name} is the most conservative place to start from this saved set while the routine stays simple.",
                "Safer option: Favor cleanser, moisturizer, and sunscreen before adding treatment pressure back in, and avoid calling an active definitively pregnancy-safe.",
                f"Tradeoff: {evaluation['primaryMessage']} That shifts the read away from stronger treatment claims and toward conservative support.",
                "Budget note: The cheaper move is usually the simpler move here: one cleanser, one moisturizer, and one sunscreen beat buying multiple actives before ingredient review.",
                "Next step: Confirm the full ingredient list with a clinician before buying a treatment step for a pregnancy-related routine.",
            ]
        )
        return {"evaluation": evaluation, "answer": answer}

    answer = "\n".join(
        [
            "Guardrail check for this question.",
            f"Start with: {safer_name} is still the better first move if you want the routine to stay realistic and repeatable.",
            "Safer option: Keep one main treatment step and let the rest of the routine stay supportive instead of chasing a faster result with more actives.",
            f"Tradeoff: {evaluation['primaryMessage']} Pores, dark spots, texture, and wrinkle changes usually need steady use over weeks, not overnight pressure.",
            "Budget note: Stacking extra actives usually costs more without making the timeline realistic.",
            "Next step: Pick one lead product, wear sunscreen consistently when the goal needs it, and judge progress over weeks rather than days.",
        ]
    )
    return {"evaluation": evaluation, "answer": answer}
