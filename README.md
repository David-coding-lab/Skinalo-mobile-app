# Skinalo: Intelligent Skincare Ingredient Analysis

Skinalo is a smart skincare companion designed to demystify complex ingredient lists. By leveraging AI-driven analysis, it helps users understand exactly what they are putting on their skin, ensuring their routine matches their specific skin type and environmental conditions.

---

## 🚀 Features Roadmap

The feature set is categorized to distinguish between the core utility and the expanded ecosystem for local commerce. For a detailed breakdown and progress tracking, see [FEATURES.md](FEATURES.md).

### 🛡️ Core & MVP (Minimum Viable Product)
*   **Instant Label Scanner:** High-accuracy OCR to extract ingredient lists from product packaging or gallery images.
*   **Ingredient Breakdown:** Detailed analysis of each chemical component, highlighting its purpose (e.g., humectant, occlusive, active).
*   **Safety & Compatibility Check:** Real-time alerts for potential irritants based on the user's specific skin profile (e.g., sensitivity to Lemon Peel Oil or Kojic Acid).
*   **Sun Sensitivity Alerts:** Automatic warnings for ingredients that increase photosensitivity, with mandatory sunscreen reminders.

### 🔓 Free Tier
*   **Single Product Analysis:** Unlimited scans for individual skincare items.
*   **Basic Skin Profile:** Storage for primary skin type (Dry, Oily, Combination) and top concerns.
*   **Ingredient Dictionary:** A searchable library explaining common skincare chemicals in plain language.

### 💎 Paid / Premium Tier
*   **Holistic Routine Audit:** A "Whole Shelf" analysis where users scan their entire collection. Skinalo analyzes how products interact—identifying "ingredient overlaps" (using too much of one active) or "chemical conflicts" (mixing ingredients that cancel each other out or cause irritation).
*   **The Progress Board (Future Feature):** A visual tracking system. Users take weekly photos; after 30 days, the app generates a high-format "Before & After" report with data overlays showing improvements in skin texture or tone.
*   **Advanced Lab Reports:** Deep-dive PDF exports of routine compatibility and long-term skin health forecasts.

###  Local Ecosystem (Shop Section)
*   **Geo-Located Recommendations:** Based on the user's GPS, Skinalo suggests nearby verified cosmetic stores that stock the analyzed "safe" products.
*   **Market-Aware Recommendation Engine:** A hyper-local logic layer that limits AI suggestions to brands and products physically available in the user's specific region (e.g., Nigeria, USA, China), eliminating "geographic hallucinations."
*   **Partner Integration:** A portal for local cosmetic retailers to sign up, list their inventory, and offer exclusive discounts to Skinalo users.
*   **Authenticity Verification:** Helping users find authorized distributors to avoid counterfeit products in local markets.

---

## 🏗️ System Architecture & Logic

### 🧠 Market-Aware Recommendation Engine
To provide high-relevance, accessible product alternatives, Skinalo employs a "Brand-Matrix" logic. This architecture ensures every recommendation is something the user can actually purchase at their local pharmacy or supermarket.

#### **Mechanism & Workflow**
1.  **Geo-Trigger:** The system identifies the user's country/region from their profile settings.
2.  **Brand Fetching:** It retrieves a "Regional Brand List"—a curated collection of 100+ verified brands popular and available in that specific territory (e.g., *Nivea, Simple, Arami, CeraVe* for Nigeria).
3.  **AI Constraint Reasoning:** The **Gemini 3 Flash** engine uses this list as a strict boundary. It evaluates the user's skin needs and recommends specific, high-performing products *only* from those verified companies.

#### **Technical Stack**
*   **Database:** Appwrite `RegionalBrands` collection.
*   **Inference:** Gemini 3 Flash (leveraging internal knowledge of global brand catalogs under regional constraints).

---

## ✨ Skinalo Elite: Premium Skin Coaching

Elevate your skincare journey with **Skinalo Elite**, a boutique experience designed for those who seek expert-led results and professional-grade skin coaching. Move beyond simple ingredient analysis into a realm of clinical precision and personalized care.

### 💎 Exclusive Features: "Beautify"

*   **Personalized Roadmaps:** Access structured, outcome-driven skincare protocols such as *Clear Dark Spots*, *Lighten Up*, or *Smoothing*. These are not static plans; they are dynamically calibrated based on your unique skin profile, local humidity, and real-time environmental UV indexes.
*   **Dynamic Routine Calibration:** Your skin is alive and ever-changing. If you report a localized breakout or sudden sensitivity, the "Beautify" engine automatically modifies your daily routine, ensuring you use the right ingredients at the precise moment your skin needs them most.
*   **The Progress Tracker:** Transform your journey into a visual narrative. Elite users gain access to the **Timeline View**, a sophisticated logging system that tracks milestones and visual improvements, turning daily consistency into a data-driven progress chart.

### 📊 Free vs. Elite Comparison

| Feature | Skinalo Free | Skinalo Elite |
| :--- | :---: | :---: |
| **Ingredient Analysis** | Unlimited Scans | Unlimited Scans |
| **Safety Alerts** | Basic Irritants | Advanced Chemical Conflicts |
| **Personalized Roadmaps** | ❌ | ✅ (Outcome-Driven) |
| **Dynamic Calibration** | ❌ | ✅ (Real-time adjustments) |
| **Progress Tracker** | ❌ | ✅ (Timeline & Milestone logs) |
| **Expert Coaching** | ❌ | ✅ (Clinical-grade guidance) |

---

## 🏗️ Feature Incubation & Consideration

As Skinalo evolves, we are exploring new ways to deepen the relationship between users and their skincare collections. The following concepts represent our strategic roadmap for future ecosystem expansion.

### 📸 Ghost Scan: Integration Strategy
**Concept:** A camera-based AI assistant designed to extract active ingredients (Retinol, Vitamin C, AHA/BHA, Benzoyl Peroxide) directly from a user's product bottle during the 'Profile Setup' or 'AloWear Shelf' creation.

#### ⚖️ Strategic Decisions (Pending)
*   **Onboarding Integration:** Evaluating if 'Ghost Scan' belongs in the Profile Setup Flow (e.g., Step 5: Active Conflicts). 
    *   **Pros:** Captures high-fidelity data early in the user lifecycle.
    *   **Cons:** Risk of onboarding fatigue or dropout due to technical scan friction.
*   **Fallback Strategy:** Should a scan fail, we must decide between a mandatory "Manual Select" grid for continuity or allowing users to skip and finish later in the 'AloWear' section.
*   **The "Truth Threshold":** Given the safety implications, we must define a certainty metric. If AI confidence is <90%, should the system force manual manual verification or reject the scan entirely to prevent ingredient misinformation?
*   **Resource Balancing:** Determining if the increased token cost of using **Gemini 3 Flash** for vision-based OCR during onboarding is justified by the resulting data accuracy and safety profile.

---

## 🛠️ Technical Stack (Current)

*   **Frontend:** React Native (Cross-platform iOS/Android)
*   **Backend:** Appwrite (Database, Auth, and Storage)
*   **Image Processing:** Nano Banana / OCR Integration
*   **State Management:** Vite / React Hooks

---

## 📈 Future Vision

Beyond simple analysis, Skinalo aims to become a global standard for skin health transparency, bridging the gap between complex dermatology and daily consumer habits through community-driven data and local commerce.
