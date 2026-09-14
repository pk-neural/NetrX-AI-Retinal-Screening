# NetrX — AI-Assisted Retinal Screening Platform

> **See Better. Detect Earlier. Refer Smarter.**

NetrX is an AI-assisted retinal screening platform designed to analyze retinal fundus photographs and provide structured screening insights for diabetic retinopathy (DR), diabetic macular edema (DME) risk, and retinal vascular abnormalities.

The system combines computer vision, deep learning, explainable AI, image-quality assessment, and a clinician-friendly reporting interface into a single end-to-end screening workflow.

---

## Overview

Retinal fundus photography is widely used for screening and monitoring retinal diseases. However, reliable automated analysis depends heavily on receiving an appropriate retinal image and maintaining sufficient image quality.

NetrX addresses this through a sequential AI-assisted pipeline:

```text
                 ┌──────────────────────┐
                 │   Fundus Image Upload │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ YOLO Domain Check    │
                 │ Fundus / Non-Fundus  │
                 └──────────┬───────────┘
                            │
                    Valid Fundus Image
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Image Preprocessing  │
                 │ Noise Reduction      │
                 │ CLAHE Enhancement    │
                 │ Resize / Normalize   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Image Quality Check  │
                 │ Focus                │
                 │ Illumination         │
                 │ Field of View        │
                 └──────────┬───────────┘
                            │
                     Quality Accepted
                            │
                            ▼
                 ┌──────────────────────┐
                 │ AI Analysis           │
                 ├──────────────────────┤
                 │ Diabetic Retinopathy │
                 │ DME Risk              │
                 │ Vessel Analysis       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Explainable AI        │
                 │ Grad-CAM              │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Clinical Report      │
                 │ Findings             │
                 │ Interpretation       │
                 │ Recommendation       │
                 └──────────────────────┘
