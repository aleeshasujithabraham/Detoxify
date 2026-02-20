const API_BASE = "http://127.0.0.1:5000";

// Store comments globally for filtering
let allComments = [];

/**
 * Main function: fetches YouTube comments and runs AI analysis
 */
async function fetchComments() {
    const urlInput = document.getElementById("youtubeUrl");
    const analyzeBtn = document.getElementById("analyzeBtn");
    const btnText = analyzeBtn.querySelector(".btn-text");
    const btnLoader = analyzeBtn.querySelector(".btn-loader");
    const videoInfo = document.getElementById("videoInfo");
    const commentsSection = document.getElementById("commentsSection");
    const dashboard = document.getElementById("analysisDashboard");
    const filterTabs = document.getElementById("filterTabs");

    const url = urlInput.value.trim();

    if (!url) {
        showError("Please paste a YouTube video URL.");
        urlInput.focus();
        return;
    }

    // Reset UI
    hideError();
    videoInfo.style.display = "none";
    commentsSection.style.display = "none";
    dashboard.style.display = "none";
    filterTabs.style.display = "none";

    // Show loading state
    analyzeBtn.disabled = true;
    btnText.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Analyzing...`;
    btnLoader.style.display = "inline-flex";

    try {
        const response = await fetch(`${API_BASE}/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.error || "Something went wrong. Please try again.");
            return;
        }

        // Store comments globally
        allComments = data.comments;

        // Display video info
        displayVideoInfo(data.video);

        // Display analysis dashboard
        displayDashboard(data.analysis);

        // Display filter tabs and comments
        filterTabs.style.display = "flex";
        resetFilterButtons();
        displayComments(data.comments, data.totalFetched);

    } catch (err) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
            showError("Cannot connect to the server. Make sure the backend is running on port 5000.");
        } else {
            showError("An unexpected error occurred. Please try again.");
        }
        console.error("Fetch error:", err);
    } finally {
        analyzeBtn.disabled = false;
        btnText.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Analyze`;
        btnLoader.style.display = "none";
    }
}

/**
 * Display video information card
 */
function displayVideoInfo(video) {
    const section = document.getElementById("videoInfo");
    document.getElementById("videoThumbnail").src = video.thumbnail;
    document.getElementById("videoTitle").textContent = video.title;
    document.getElementById("videoChannel").textContent = video.channelTitle;
    document.getElementById("videoViews").textContent = formatNumber(video.viewCount) + " views";
    document.getElementById("videoLikes").textContent = formatNumber(video.likeCount) + " likes";
    document.getElementById("videoCommentCount").textContent = formatNumber(video.commentCount) + " comments";
    section.style.display = "block";
}

/**
 * Display the analysis dashboard with stats
 */
function displayDashboard(analysis) {
    const dashboard = document.getElementById("analysisDashboard");

    document.getElementById("safeCount").textContent = analysis.safeCount;
    document.getElementById("flaggedCount").textContent = analysis.flaggedCount;
    document.getElementById("highCount").textContent = analysis.highSeverity;
    document.getElementById("mediumCount").textContent = analysis.mediumSeverity;
    document.getElementById("lowCount").textContent = analysis.lowSeverity;

    const percent = analysis.toxicityPercentage;
    document.getElementById("toxicityPercent").textContent = percent + "%";

    // Animate the toxicity bar
    const fill = document.getElementById("toxicityFill");
    fill.style.width = "0%";
    fill.className = "toxicity-fill";

    if (percent > 50) fill.classList.add("toxicity-high");
    else if (percent > 25) fill.classList.add("toxicity-medium");
    else fill.classList.add("toxicity-low");

    setTimeout(() => { fill.style.width = percent + "%"; }, 100);

    dashboard.style.display = "block";
}

/**
 * Filter comments by category
 */
function filterComments(filter) {
    // Update active button
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    let filtered;
    switch (filter) {
        case "safe":
            filtered = allComments.filter(c => !c.isSexist);
            break;
        case "flagged":
            filtered = allComments.filter(c => c.isSexist);
            break;
        case "high":
            filtered = allComments.filter(c => c.severity === "high");
            break;
        default:
            filtered = allComments;
    }

    displayComments(filtered, filtered.length, false);
}

function resetFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === "all");
    });
}

/**
 * Display comments list with stagger animation
 */
function displayComments(comments, totalFetched, scroll = true) {
    const section = document.getElementById("commentsSection");
    const list = document.getElementById("commentsList");
    const badge = document.getElementById("commentCountBadge");

    badge.textContent = `${totalFetched} shown`;
    list.innerHTML = "";

    if (comments.length === 0) {
        list.innerHTML = `
            <div class="comment-card" style="text-align:center; color: var(--neutral-400); padding: 40px;">
                <p>No comments match this filter.</p>
            </div>
        `;
        section.style.display = "block";
        return;
    }

    comments.forEach((comment, index) => {
        const card = createCommentCard(comment, index + 1);
        card.style.animationDelay = `${index * 0.025}s`;
        list.appendChild(card);
    });

    section.style.display = "block";

    if (scroll) {
        setTimeout(() => {
            document.getElementById("videoInfo").scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
    }
}

/**
 * Create a single comment card element with analysis badge
 */
function createCommentCard(comment, number) {
    const card = document.createElement("div");
    card.className = "comment-card";

    // Add severity class for flagged comments
    if (comment.isSexist) {
        card.classList.add("flagged");
        card.classList.add(`severity-${comment.severity}`);
    }

    const initial = comment.author ? comment.author.charAt(0).toUpperCase() : "?";
    const dateStr = formatDate(comment.publishedAt);
    const escapedText = escapeHtml(comment.text);

    let avatarHtml;
    if (comment.authorProfileImage && !comment.authorProfileImage.includes("default")) {
        avatarHtml = `<img src="${comment.authorProfileImage}" alt="${escapeHtml(comment.author)}" class="comment-avatar" onerror="this.outerHTML='<div class=\\'comment-avatar-placeholder\\'>${initial}</div>'">`;
    } else {
        avatarHtml = `<div class="comment-avatar-placeholder">${initial}</div>`;
    }

    // Build the analysis badge
    let analysisBadge = "";
    if (comment.isSexist) {
        const severityLabel = comment.severity.charAt(0).toUpperCase() + comment.severity.slice(1);
        analysisBadge = `
            <span class="analysis-badge badge-${comment.severity}" title="${comment.confidence}% confidence">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                ${severityLabel} · ${comment.confidence}%
            </span>`;
    } else {
        analysisBadge = `
            <span class="analysis-badge badge-safe">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                Safe
            </span>`;
    }

    card.innerHTML = `
        <div class="comment-header">
            ${avatarHtml}
            <div class="comment-meta">
                <span class="comment-author">${escapeHtml(comment.author)}</span>
                <span class="comment-date">${dateStr}</span>
            </div>
            ${analysisBadge}
            <span class="comment-number">#${number}</span>
        </div>
        <div class="comment-text">${escapedText}</div>
        <div class="comment-footer">
            ${comment.likeCount > 0 ? `
            <div class="comment-likes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                </svg>
                ${formatNumber(comment.likeCount)}
            </div>` : ""}
        </div>
    `;

    return card;
}

// ===== Utilities =====

function showError(message) {
    const errorDisplay = document.getElementById("errorDisplay");
    document.getElementById("errorMessage").textContent = message;
    errorDisplay.style.display = "block";
}

function hideError() {
    document.getElementById("errorDisplay").style.display = "none";
}

function formatNumber(num) {
    if (!num || num === "N/A") return "N/A";
    return parseInt(num).toLocaleString();
}

function formatDate(isoDate) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("youtubeUrl").addEventListener("keydown", (e) => {
        if (e.key === "Enter") fetchComments();
    });
});
