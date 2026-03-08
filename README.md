# Skinalo: Intelligent Skincare Ingredient Analysis

Skinalo is a premium, clinical-grade skincare companion designed to demystify complex ingredients, identify chemical conflicts, and provide AI-driven adaptive roadmaps for personalized skin health.

---

## 🛡️ The Core Feature (MVP): AloWear (The Regimen Harmonizer)

**AloWear** is a live, logic-driven library that serves as the command center for your skincare journey. By digitizing your "vanity shelf," the AI runs a sophisticated cross-product conflict engine to identify chemical clashes and ingredient overlaps.

*   **Digital Shelf:** A synchronized library of your current products, automatically updated based on scan history.
*   **Conflict Engine:** Proactively identifies if mixing products will cause irritation or cancel out active ingredients.
*   **Core CTA:** [Analyze Compatibility] — Get an instant safety report for your entire routine.

---

## 💎 Skinalo Elite: The Premium Ecosystem

Elevate your journey with **Skinalo Elite**, a boutique experience featuring **Beautify: Your AI Skin Coach**. This clinical protocol engine dynamically calibrates your routine based on real-world data and biological cycles.

### ✨ Key Elite Features

*   **28-Day Clinical Protocols:** Outcome-driven roadmaps (e.g., "Texture Refinement," "Barrier Repair") that adapt to your progress.
*   **Dynamic Calibration:** Routines adjust weekly based on AI-vision photo snaps, local humidity levels, and skin turnover cycles.
*   **Progress Board:** A data-driven milestone tracking system to visualize improvements in skin health over time.
*   **Community Loop:** A curated social ecosystem for Elite users to share 'Before & After' transformations. Viewers can click **'Start a Plan'** on any post to instantly adopt the exact protocol that achieved those results.

### 📊 Free vs. Elite Comparison

| Feature | Skinalo Free | Skinalo Elite |
| :--- | :---: | :---: |
| **Ingredient Analysis** | Unlimited Scans | Unlimited Scans |
| **AloWear Digital Shelf** | Search & Library | Full Conflict Engine |
| **AI Skin Coach (Beautify)** | ❌ | ✅ (Clinical Roadmaps) |
| **Dynamic Calibration** | ❌ | ✅ (Humidity & Vision-based) |
| **Progress Board** | ❌ | ✅ (Milestone Tracking) |
| **Social Community Loop** | View Only | ✅ (Share & Adopt Plans) |

---

## 📍 Local Ecosystem: Market-Aware Recommendation Engine

To ensure accessibility, Skinalo employs a "Brand-Matrix" database combined with geo-location. This architecture ensures every product recommendation is physically available in your specific region (e.g., Nigeria, USA), eliminating frustration with unavailable products.

1.  **Geo-Awareness:** Identifies your region to filter the global product database.
2.  **Verified Brand-Matrix:** Cross-references recommendations against a database of brands with a verified physical presence in your market.
3.  **Authenticity Focus:** Connects users with authorized distributors to ensure product integrity.

---

## 🏗️ Technical Stack

*   **Frontend:** React Native
*   **Backend:** Appwrite (Database, Auth, Storage)
*   **AI Engine:** Gemini 3 Flash (Reasoning, OCR, and Visual Progress Analysis)

---

## ⚖️ Tone & Philosophy

Skinalo maintains a **clinical, authoritative, sophisticated, and transparent** tone. We focus exclusively on the individual, one-to-one relationship between the user and their AI Skin Coach, ensuring personalized precision for every skin type.
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
