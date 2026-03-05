# Skinalo AI: Analysis Engine & Logic Documentation

This document outlines the internal "brain" of Skinalo—how the AI interprets skincare ingredients, processes user profiles, and generates personalized safety verdicts.

---

## 🧠 The Analysis Engine (Core Logic)

The Skinalo AI operates as a specialized **Ingredient Analyst**. It follows a strict set of heuristic rules to move beyond simple database lookups and into proactive skin coaching.

### 📜 AI System Prompt & Constraints
**Role:** Skinalo Ingredient Analyst  
**Output Constraint:** Return ONLY valid JSON.

### ⚙️ Engine Ruleset

1.  **The Product Format Rule:**
    *   **Wash-Off (Cleansers, Masks):** Reduced penalty for comedogenic (pore-clogging) ingredients due to short contact time.
    *   **Leave-On (Serums, Moisturizers):** Strict enforcement of comedogenicity and irritation rules.

2.  **Comedogenicity Check:**
    *   Uses a 0–5 comedogenic scale.
    *   If `user_profile.face_body_gap` is **true**, ingredients rated 3, 4, or 5 are flagged as **"BAD"** for facial use (unless it's a wash-off product).

3.  **The Balance Check:**
    *   The engine evaluates the formula holistically. A "BAD" ingredient (like a drying alcohol) can be mitigated or "neutralized" if the formula contains high concentrations of "GOOD" soothing agents (like Centella or Panthenol).

4.  **Seasonal & Environmental Modifier:**
    *   Adjusts recommendations based on `environment.climate` (e.g., suggesting humectants in humid weather but warning about them in bone-dry climates).

5.  **Conflict Logic:**
    *   Cross-references `user_profile.primary_goal` with the `ingredient_list` to identify clashing actives (e.g., Vitamin C + Retinol in the same step).

6.  **The "No Jargon" Rule:**
    *   Explanations must be human-readable. Words like "solvent" or "preservative" are forbidden.
    *   **Correct Example:** *"This acts as a gentle vacuum to pull excess oil out of your pores."*

---

## 🧪 User Profiling (The 5-Step Diagnostic)

Before the AI can analyze a product, it must understand the user. We use a specialized diagnostic to set the variables for the engine.

### 💧 Step 1: The "Oil & Hydration" Check (Baumann O/D)
*Determines: `skin_type`*
*   **Question:** "If you wash your face and apply nothing, how does your skin feel after 1 hour?"
    *   **Dry:** Tight or Flaky.
    *   **Normal:** Comfortable & Smooth.
    *   **Combination:** Shiny only on nose/forehead.
    *   **Oily:** Glistening or Oily all over.
*   **Trigger:** Rewards/penalizes "heavy" oils and alcohols.

### 🛡️ Step 2: The "Reaction" Check (Baumann S/R)
*Determines: `sensitivity`*
*   **Question:** "How often do you experience stinging, redness, or itching when trying a new soap or cream?"
    *   **Resistant:** Never.
    *   **Moderate:** Rarely / Only with strong stuff.
    *   **High:** Frequently / My skin is very picky.
*   **Trigger:** If **High**, flags Menthol, Fragrance, and high-strength Acids as **"BAD."**

### 🧬 Step 3: The "Breakout Trap" (Acne Cosmetica)
*Determines: `face_body_gap`*
*   **Question:** "Do you notice small, rough bumps or pimples on your face after using thick body lotions or hair oils?"
    *   **False:** No, my face can handle anything.
    *   **True:** Yes, I only use 'face-specific' products for a reason.
*   **Trigger:** If **True**, the engine is 2x stricter on pore-cloggers like Coconut Oil or Isopropyl Palmitate.

### ☀️ Step 4: The "Sun & Tone" Check (Fitzpatrick)
*Determines: `fitzpatrick` and `pigmentation`*
*   **Question:** "What happens to your skin after 30 minutes in the hot afternoon sun without protection?"
    *   **I-II:** Burn painfully, never tan.
    *   **III:** Burn first, then tan slowly.
    *   **IV:** Tan easily, rarely burn.
    *   **V-VI:** Never burn; deeply pigmented.
*   **Trigger:** Higher types get alerts for Post-Inflammatory Hyperpigmentation (PIH); lower types get Sun Sensitivity warnings.

### ⚔️ Step 5: The "Conflict" Check (Safety)
*Determines: `active_conflicts`*
*   **Question:** "Are you currently using any of these 'strong' ingredients in your routine?"
    *   **Options:** Retinol, Vitamin C, AHA/BHA, Benzoyl Peroxide.
*   **Trigger:** Prevents chemical burns by flagging incompatible scanned products.
*   **Feature: The Ghost Scan:** If unsure, users can "Scan my shelf" to automatically extract active conflicts from their current bottles.

---

## 📋 Data Output Schema

The engine communicates with the frontend via this standardized JSON format:

```json
{
  "verdict": {
    "status": "SAFE | CAUTION | NOT_RECOMMENDED",
    "summary": "2-sentence user-friendly explanation."
  },
  "ingredients": [
    { 
      "name": "...", 
      "effect": "Plain English explanation of skin benefit/action.", 
      "status": "GOOD | NEUTRAL | BAD" 
    }
  ],
  "recommendations": {
    "product_alternatives": ["Name A", "Name B", "Name C"],
    "ingredient_must_haves": ["...", "...", "..."]
  },
  "match_score": 0
}
```
