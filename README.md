# Detoxify — YouTube Comment Toxicity Analyzer

An AI-powered tool that detects offensive and toxic language in YouTube comments, helping build safer online spaces for women.

Built for **Tink-Her-Hack** hackathon.

## Features
- Paste any YouTube video URL and analyze the first 100 comments
- **AI-powered toxicity detection** using `cardiffnlp/twitter-roberta-base-offensive` (pretrained RoBERTa model, trained on ~58M tweets)
- **Safety Analysis Dashboard** — shows safe/flagged counts, severity breakdown (High/Medium/Low), and animated toxicity bar
- **Filter tabs** — view All, Safe, Flagged, or High Severity comments
- **Severity badges** on each comment card (color-coded: red for high, orange for medium, purple for low, green for safe)
- **PDF Report Generation** — download a branded evidence report with video info, summary stats, and a table of all flagged comments (username + comment + severity)
- Video info display (title, channel, views, likes, comment count)
- Glassmorphism UI with soft pinks, lavender & purple palette

## Setup

### 1. Get a YouTube API Key (Free)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Enable **YouTube Data API v3** from the API Library
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key

### 2. Configure the API Key
Open the `.env` file in the project root and replace the placeholder:
```
YOUTUBE_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Backend
```bash
cd backend
python app.py
```
The server starts at `http://127.0.0.1:5000`
> **Note:** The AI model (~500MB) downloads automatically on first run. Subsequent starts are instant.

### 5. Open the Frontend
Open `frontend/index.html` in your browser (just double-click it, or use Live Server in VS Code).

## Project Structure
```
Tink-Her-Hack/
├── backend/
│   └── app.py              # Flask API server + AI classifier
├── frontend/
│   ├── index.html           # Main page with dashboard & filters
│   ├── style.css            # Glassmorphism UI (women-friendly palette)
│   └── script.js            # Frontend logic + PDF generation
├── .env                     # Your API key (not committed)
├── .env.example             # Template for API key
├── .gitignore
├── requirements.txt
└── README.md
```

## Tech Stack
- **Backend:** Python, Flask, YouTube Data API v3
- **AI Model:** `cardiffnlp/twitter-roberta-base-offensive` (HuggingFace Transformers, PyTorch)
- **Frontend:** HTML, CSS, JavaScript (no frameworks)
- **PDF Generation:** jsPDF + jsPDF-AutoTable (client-side)
- **API:** Google YouTube Data API (free tier — 10,000 units/day)
