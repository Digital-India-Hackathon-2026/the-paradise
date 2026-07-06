# Digital India Hackathon 2026

## Team Name
The Paradise

## Repository
the-paradise

## Domain
Healthcare & Social Impact

## Idea
Project : NeuroGuardian AI
1. Clinical Problem Statement
In acute stroke management, clinical outcomes are strictly dictated by the "Time is Brain" paradigm. Every minute an acute stroke remains untreated results in the irreversible loss of approximately 1.9 million neurons, accelerating tissue death and long-term disability.
Current emergency department (ED) triage pipelines suffer from three systemic bottlenecks:
The Diagnostic Latency: Conventional workflows—consisting of manual radiological review, decentralized documentation, and specialist consultations—create a 60+ minute bottleneck, causing the majority of patients to miss the critical "Golden Hour" therapeutic window.
The Fatal Contraindication Risk: Frontline clinicians must immediately differentiate between an Ischemic stroke (thrombus blocking blood flow) and a Hemorrhagic stroke (active intracranial hemorrhage). Administering thrombolytic therapy (such as tPA) to a patient experiencing a hemorrhagic stroke is universally fatal.
The Specialist Resource Deficit: Low-resource, suburban, and rural clinics rarely operate with 24/7 on-site neurological expertise or advanced diagnostic infrastructure. General practitioners are forced to make high-stakes, time-sensitive treatment decisions in complete isolation.
2. Technical Solution
NeuroGuardian AI is a browser-accessible, multimodal decision-support system designed to serve as an expert digital co-pilot for emergency clinicians. The platform processes heterogeneous clinical data streams simultaneously to deliver automated, specialist-grade diagnostic insights.
Asynchronous Multimodal Data Fusion: The system ingests and unifies complex, unstructured clinical telemetry (such as patient vitals, history, and metrics) alongside heavy volumetric neuroimaging data (3D DICOM/NIfTI arrays).
Automated Lesion Classification: Utilizing state-of-the-art deep learning architectures—specifically SwinUNETR (Swin Transformer for Biomedical Image Segmentation) and a Hybrid ResNet backbone—the core engine segments structural brain anomalies. It isolates and classifies the stroke subtype with expert-level precision within seconds.
Advanced WebGL Telemetry Rendering: To maximize clinical utility under high-fatigue scenarios, the platform translates raw coordinate and diagnostic data into an interactive, hardware-accelerated 3D structural roadmap of the human brain using Three.js, projecting localized lesion zones directly in a standard web browser.
3. Architectural Architecture Stack
To support real-time processing of heavy medical image arrays under high concurrency, the application is engineered on a resilient, enterprise-grade foundation:
Backend Framework: Spring Boot 3.x with Spring WebFlux (Reactive Stack). Traditional servlet containers rely on blocking, thread-per-request execution models that fail under heavy concurrent medical data transfers. A non-blocking, asynchronous reactive pipeline processes volumetric arrays as fluid byte streams for ultra-low latency.
AI & Embedding Inference Core: High-performance model orchestration is managed via Google Vertex AI endpoints. Unstructured clinical notes and case histories are parsed using Vertex AI Embeddings, generating semantic vector representations to refine the system’s contextual risk assessments.
Reactive Persistence Layer: Database operations are handled via Spring Data R2DBC coupled with PostgreSQL. This ensures that patient triage logs, audit trails, and radiological metadata are securely persisted without introducing blocking bottlenecks into the diagnostic loop.
4. Measurable Clinical Impact
99% Reduction in Triage Time: Compresses the industry-standard 60-minute manual diagnostic window down to a 30-second automated verdict, saving millions of viable neurons per patient.
Mitigation of Fatal Misdiagnoses: Delivers data-driven, absolute differentiation between Ischemic and Hemorrhagic anomalies, eliminating human error in high-stress clinical decision-making.
Democratization of Specialized Care: Removes the requirement for expensive, on-premise computing infrastructure. By deploying the solution via a web interface, elite diagnostic confidence is delivered directly to rural and understaffed public clinics globally on standard terminal hardware.

## Team Members
- Roshan MOHAMMED ROSHAN WALI
- Mokshith K Mokshith Datta Reddy
- Rahil Mohammed Rahil

## GitHub Profiles
- https://www.github.com/roshan2006-dev
- https://github.com/Kuro-gif77
- https://github.com/Kuro-gif77

---
This file is an immutable record of the team's original hackathon submission.
