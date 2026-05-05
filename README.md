# Neuro-Ink

**Cognitive and motor assessment via AI-powered handwriting analysis.** A web application that uses machine learning to analyze handwriting dynamics for early screening of Alzheimer's disease and Parkinson's disease. Designed for research use on tablets and touch devices with stylus input.

---

## Overview

Neuro-Ink captures **online handwriting** (x, y, pressure, timestamp over time) during drawing and writing tasks, extracts kinematic and temporal features, and runs disease-specific AI models to produce risk scores and biomarkers. Results are stored in Firebase and displayed in the assessment UI. The app supports two disease modes:

| Disease | Model | Data Source | Key Metrics |
|---------|-------|-------------|-------------|
| **Alzheimer's** | LightGBM (DARWIN) | `src/models/*` | ~88.57% accuracy, ~96% AUC |
| **Parkinson's** | BLSTM-style (PaHaW) | `parkmodel/Parkinsons-Detection` | ~68.3% val accuracy, ~70.5% AUC |

---

## Features

### Core Functionality
- **AI-powered handwriting analysis** – Analyzes stroke patterns, pressure, timing, velocity, and spatial relationships
- **Disease-specific flows** – Separate assessment paths for Alzheimer's and Parkinson's
- **Real-time analysis** – On-device feature extraction and model inference
- **Results storage** – Firebase Firestore + localStorage fallback, tagged by disease

### Alzheimer's Assessment
- **20+ cognitive and motor tests** – Clock drawing, spiral drawing, word recall, image association, selection memory, maze navigation, pattern completion, and more
- **LightGBM model** – Trained on DARWIN dataset, exported to JSON for web
- **Biomarkers** – Pressure, spatial accuracy, temporal consistency, cognitive load

### Parkinson's Assessment
- **3 motor/coordination tasks** – Spiral drawing, line tracing, free writing
- **PaHaW BLSTM-style model** – Calibrated from `parkmodel/Parkinsons-Detection` (PaHaW dataset)
- **Motor biomarkers** – Pressure stability, spatial accuracy, temporal consistency, cognitive load

### User Experience
- **Responsive design** – Optimized for tablet and mobile
- **Disease toggle** – Switch between Alzheimer's and Parkinson's modes
- **PWA support** – Installable app for Parkinson's assessment
- **Protected routes** – Login, consent, and mobile-only guards for tests

---

## Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, React Router |
| **Styling** | Styled Components |
| **Animations** | Framer Motion |
| **Canvas** | HTML5 Canvas for stylus capture |
| **Charts** | Recharts |
| **Backend** | Firebase (Auth, Firestore, Hosting) |
| **Build** | Create React App |

---

## Project Structure

```
Neuro-Ink/
├── src/
│   ├── components/          # Layout, DrawingCanvas, TestHarness, DiseaseToggle, etc.
│   ├── context/             # AuthContext, DiseaseContext, AppFlowContext
│   ├── data/                # parkinsonsTasks, handwritingTasks
│   ├── firebase.ts          # Firebase config
│   ├── pages/
│   │   ├── tests/           # 20+ Alzheimer's test components
│   │   └── parkinsons/      # Parkinson's task selection, test, assessment, results
│   ├── services/
│   │   ├── analysis/        # AnalysisServiceFactory, AlzheimersAnalysisService, ParkinsonsAnalysisService
│   │   ├── aiAnalysisService.ts   # LightGBM Alzheimer model
│   │   ├── testAnalysisService.ts # Orchestrates analysis by disease
│   │   ├── resultsStorageService.ts
│   │   └── drawingValidationService.ts
│   ├── models/              # LightGBM JSON models, scalers (Alzheimer's)
│   └── App.tsx
├── parkmodel/
│   └── Parkinsons-Detection/  # PaHaW BLSTM notebooks, data, results_metrics.json
├── training/                # Python scripts for LightGBM/DARWIN training
├── web_models/             # Exported web-ready models
├── public/
├── firebase.json
├── firestore.rules
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
git clone <repository-url>
cd Neuro-Ink
npm install
```

### Environment

Create a `.env` file in the project root with your Firebase config:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

---

## Key Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/alzheimers` | Alzheimer's awareness & entry |
| `/parkinsons` | Parkinson's awareness & entry |
| `/login`, `/signup` | Auth |
| `/consent` | Informed consent |
| `/dashboard` | User dashboard (post-login) |
| `/tasks` | Task selection (Alzheimer's) |
| `/test/:taskId` | Individual Alzheimer's tests |
| `/parkinsons/tests` | Parkinson's task selection |
| `/parkinsons/test/:taskId` | Parkinson's simple test (UI demo) |
| `/parkinsons/assessment-test/:taskId` | Parkinson's assessment (with AI analysis) |
| `/parkinsons/assessment-results` | Parkinson's assessment summary |
| `/results`, `/ai-analysis` | Alzheimer's results |
| `/model-demo` | LightGBM model demo |

---

## AI Models

### Alzheimer's (LightGBM)
- **Source**: `src/models/lightgbm_model.json`, `lightgbm_scaler.json`
- **Training**: `training/` Python scripts, DARWIN dataset
- **Features**: Kinematics (velocity, acceleration, jerk), curvature, pauses, pressure
- **Output**: Risk level (low/moderate/high), probability, biomarkers

### Parkinson's (BLSTM-style)
- **Source**: `parkmodel/Parkinsons-Detection/` (PaHaW dataset, BLSTM notebooks)
- **Frontend**:
  - `ParkinsonsAnalysisService` – disease-specific feature extraction + PaHaW-calibrated fallback scoring
  - Optional direct BLSTM inference via TensorFlow.js from `public/models/parkinsons-blstm/model.json`
- **Features**: Path length, velocity, stroke/pause timing, pressure
- **Output**: PD probability, risk level, motor biomarkers

---

## Firebase

- **Auth**: User sign-in; guest fallback for unauthenticated use
- **Firestore**: `users/{uid}/testResults` – stores `AIAnalysisResult`, features, metadata, disease tag
- **Rules**: `firestore.rules`, `storage.rules`
- **Deploy**: `firebase deploy`

---

## Medical Disclaimer

**This application is for research and screening purposes only.** It does not provide medical diagnosis or treatment. Results should be interpreted by qualified healthcare professionals. Consult a neurologist or movement disorder specialist for formal assessment of Alzheimer's or Parkinson's disease.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT License – see the LICENSE file for details.

---

Built for early detection and better cognitive health outcomes.
