let contestSummary = document.querySelector("#contest-summary");
let entryStats = document.querySelector("#entry-stats");
let tab = document.querySelector("#sidebar-dashboard");

// Load page data
request("get", "/api/internal/admin/stats", null, (data) => {
    if (!data.error) {
        contestSummary.innerHTML = '';

        reviewedEntriesPercent = Math.round((data.yourReviewedEntriesCount / data.groupEntriesCount) * 100) || 0;
        contestSummary.innerHTML += `
        <div class="progress-ring-container">
            <div class="progress-ring">
                <svg>
                    <circle cx="90" cy="90" r="90"></circle>
                    <circle cx="90" cy="90" r="90" style="stroke-dashoffset: calc(564 - (564 * ${reviewedEntriesPercent}) / 100);"></circle>
                </svg>
                <div class="progress-ring-percent">
                    <p>${reviewedEntriesPercent}<span>%</span></p>
                    <p class="progress-ring-percent-label">${data.yourReviewedEntriesCount} / ${data.groupEntriesCount}</p>
                </div>
            </div>
            <p class="progress-ring-label">Your Progress</p>
        </div>
        `;

        groupEvaluationsPercent = Math.round((data.groupEvaluationsCount / (data.groupEntriesCount * data.groupEvaluatorCount)) * 100) || 0;
        contestSummary.innerHTML += `
        <div class="progress-ring-container">
            <div class="progress-ring">
                <svg>
                    <circle cx="90" cy="90" r="90"></circle>
                    <circle cx="90" cy="90" r="90" style="stroke-dashoffset: calc(564 - (564 * ${groupEvaluationsPercent}) / 100);"></circle>
                </svg>
                <div class="progress-ring-percent">
                    <p>${groupEvaluationsPercent}<span>%</span></p>
                    <p class="progress-ring-percent-label">${data.groupEvaluationsCount} / ${data.groupEntriesCount * data.groupEvaluatorCount}</p>
                </div>
            </div>
            <p class="progress-ring-label">Group Progress</p>
        </div>
        `;

        if (data.is_admin || permissions.view_admin_stats) {
            totalReviewedEntriesPercent = Math.round((data.totalReviewedEntries / data.totalEntriesCount) * 100) || 0;
            contestSummary.innerHTML += `
            <div class="progress-ring-container">
                <div class="progress-ring">
                    <svg>
                        <circle cx="90" cy="90" r="90"></circle>
                        <circle cx="90" cy="90" r="90" style="stroke-dashoffset: calc(564 - (564 * ${totalReviewedEntriesPercent}) / 100);"></circle>
                    </svg>
                    <div class="progress-ring-percent">
                        <p>${totalReviewedEntriesPercent}<span>%</span></p>
                        <p class="progress-ring-percent-label">${data.totalReviewedEntries} / ${data.totalEntriesCount}</p>
                    </div>
                </div>
                <p class="progress-ring-label">Total Reviewed Entries</p>
            </div>
            `;

            totalEvaluationsPercent = Math.round((data.totalEvaluationsCount / (data.totalActiveEvaluators * data.totalEntriesCount)) * 100) || 0;
            contestSummary.innerHTML += `
            <div class="progress-ring-container">
                <div class="progress-ring">
                    <svg>
                        <circle cx="90" cy="90" r="90"></circle>
                        <circle cx="90" cy="90" r="90" style="stroke-dashoffset: calc(564 - (564 * ${totalEvaluationsPercent}) / 100);"></circle>
                    </svg>
                    <div class="progress-ring-percent">
                        <p>${totalEvaluationsPercent}<span>%</span></p>
                        <p class="progress-ring-percent-label">${data.totalEvaluationsCount} / ${data.totalActiveEvaluators * data.totalEntriesCount}</p>
                    </div>
                </div>
                <p class="progress-ring-label">Total Evaluations</p>
            </div>
            `;

            entryStats.innerText = `Flagged Entries: ${data.totalFlaggedEntries}\n
                Disqualified Entries: ${data.totalDisqualifiedEntries}\n
                Total Entries: ${data.totalEntriesCount}`;
        }
    } else {
        displayError(data.error);
    }
});

// Update navbar highlighting
tab.classList.add("selected");
