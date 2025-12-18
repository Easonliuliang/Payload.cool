# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-18

### 🚀 Major Features
- **JSON Schema Validation V1**: 
  - Support for URL, Paste JSON, and Preset schemas.
  - Real-time error highlighting in editor and graph view.
  - Interactive validation error panel with click-to-jump.
- **Graph View**: Visualizes JSON structure with Dagre layout engine.
  - Supports large datasets with smart recursion limits.
  - Dark mode support.
- **Interactive Breadcrumbs**: Navigate deep JSON structures easily.
- **Privacy-First Architecture**: All processing happens locally in the browser via Web Workers. No data is ever uploaded.

### ✨ Enhancements
- **Performance**: Optimized editor selection with debounce.
- **UI/UX**: 
  - Full-screen modern interface with Split/Diff/Tree views.
  - Dark mode support across all components.
  - "Valid" status indicator with size and schema details.
- **Robustness**: 
  - Graceful handling of invalid JSON and large files.
  - Comprehensive error boundaries.

### 🐛 Fixed
- Tree View dark mode contrast issues.
- Graph View white screen on large files.
- Editor edge selection bugs.

---

## 🔮 Roadmap v1.1

- **Generate Example Data**: Create dummy data instantly from your JSON Schema.
- **Enhanced Schema Presets**: More built-in schemas for common config files.
