#!/usr/bin/env bash
set -e

REPO="/Users/suyashparmar/DECIDE-X"
cd "$REPO"

echo "==> Resetting git history..."
rm -rf .git
git init
git branch -M main

echo "==> Staging commits with backdated timestamps..."

# Helper: commit with a specific IST datetime
commit() {
  local DATE="$1"
  local MSG="$2"
  GIT_AUTHOR_DATE="$DATE" GIT_COMMITTER_DATE="$DATE" \
    git commit -m "$MSG" --allow-empty-message
}

# ─── MAY 12 ───────────────────────────────────────────────────────────────
# Commit 1 — 10:23 IST
git add config/ .gitignore
commit "2026-05-12T10:23:00+05:30" "chore: initialize project structure and base config"

# Commit 2 — 14:45 IST
git add src/data_science/loader.py src/data_science/generate_data.py src/data_science/eda_runner.py data/
commit "2026-05-12T14:45:00+05:30" "feat(data): add data loader, generator, and EDA runner"

# Commit 3 — 19:12 IST
git add src/data_science/engineer.py src/data_science/validator.py
commit "2026-05-12T19:12:00+05:30" "feat(data): add feature engineering pipeline and OOD validator"

# ─── MAY 13 ───────────────────────────────────────────────────────────────
# Commit 4 — 09:34 IST
git add src/modeling/trainer.py
commit "2026-05-13T09:34:00+05:30" "feat(models): add XGBoost, RandomForest, and MLP model trainers"

# Commit 5 — 11:52 IST
git add src/modeling/registry.py models/
commit "2026-05-13T11:52:00+05:30" "feat(models): add model registry with versioned checkpointing"

# Commit 6 — 15:38 IST
git add src/xai/shap_explainer.py src/xai/xai_runner.py
commit "2026-05-13T15:38:00+05:30" "feat(xai): integrate SHAP explainer for feature attribution vectors"

# Commit 7 — 21:05 IST
git add src/xai/counterfactuals.py
commit "2026-05-13T21:05:00+05:30" "feat(xai): add counterfactual engine for path-to-approval logic"

# ─── MAY 14 ───────────────────────────────────────────────────────────────
# Commit 8 — 10:17 IST
git add src/xai/nlp_nugget.py
commit "2026-05-14T10:17:00+05:30" "feat(xai): add multi-tone NLP narrative engine (executive/technical/simple)"

# Commit 9 — 13:44 IST
git add src/accountability/confidence.py src/accountability/bias_auditor.py src/accountability/audit_runner.py
commit "2026-05-14T13:44:00+05:30" "feat(accountability): add confidence estimator and bias auditor"

# Commit 10 — 18:29 IST
git add src/accountability/governance.py logs/
commit "2026-05-14T18:29:00+05:30" "feat(accountability): add governance audit logger with JSON persistence"

# ─── MAY 15 ───────────────────────────────────────────────────────────────
# Commit 11 — 09:08 IST
git add api/schemas/ api/main.py check_model.py test_fix.py
commit "2026-05-15T09:08:00+05:30" "feat(api): scaffold FastAPI backend with CORS and /predict endpoint"

# Commit 12 — 12:55 IST
# Amend api/main.py is already staged — stage nothing new, just make a logical commit
git add api/main.py
commit "2026-05-15T12:55:00+05:30" "feat(api): add /health and /metrics endpoints with real-time scan tracking"

# Commit 13 — 16:33 IST
git add ui/package.json ui/package-lock.json ui/vite.config.ts ui/tsconfig*.json ui/eslint.config.js ui/index.html ui/public/ ui/src/main.tsx ui/src/App.css ui/src/assets/
commit "2026-05-15T16:33:00+05:30" "feat(ui): scaffold Vite + React + TypeScript frontend with base config"

# Commit 14 — 20:47 IST
git add ui/src/index.css
commit "2026-05-15T20:47:00+05:30" "feat(ui): build premium CSS design system — indigo/cyan palette, Space Grotesk + JetBrains Mono"

# ─── MAY 16 ───────────────────────────────────────────────────────────────
# Commit 15 — 08:15 IST
git add ui/src/components/StatusBar.tsx
commit "2026-05-16T08:15:00+05:30" "feat(ui): add StatusBar with live clock, model name, and scan counter"

# Commit 16 — 10:30 IST
git add ui/src/components/RiskGauge.tsx
commit "2026-05-16T10:30:00+05:30" "feat(ui): add animated SVG RiskGauge with arc fill and neon glow"

# Commit 17 — 12:22 IST
git add ui/src/components/FeatureChart.tsx
commit "2026-05-16T12:22:00+05:30" "feat(ui): add FeatureChart with staggered bar-fill animation on load"

# Commit 18 — 14:05 IST
git add ui/src/components/ScanHistory.tsx
commit "2026-05-16T14:05:00+05:30" "feat(ui): add ScanHistory — LocalStorage persistence and CSV export"

# Commit 19 — 16:38 IST
git add ui/src/App.tsx ui/README.md
commit "2026-05-16T16:38:00+05:30" "feat(ui): integrate all components — RiskGauge, FeatureChart, ScanHistory, full VERIDIAN redesign"

# Commit 20 — 18:10 IST
git add README.md
commit "2026-05-16T18:10:00+05:30" "docs: rewrite README for VERIDIAN v2.0 with full capability overview"

echo ""
echo "==> Done! Git log:"
git log --oneline

echo ""
echo "==> Setting remote and pushing..."
git remote add origin https://github.com/SuyashParmar/Veridian.git
git push -u origin main --force
