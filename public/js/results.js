let hasHashInUrl = document.location.href.indexOf("#") != -1;
let currentContestId = (
    hasHashInUrl ?
    document.location.href.split("#")[0].split("/")[4] :
    document.location.href.split("/")[4]
);

// Spinners to be soon hidden
let sidebarSpinner = document.querySelector("#sidebar-spinner");
let entriesPerLevelSpinner = document.querySelector("#entries-per-level-spinner");
let evalsPerEvaluatorSpinner = document.querySelector("#evals-per-evaluator-spinner");
let winnersSpinner = document.querySelector("#winners-spinner");
let entriesByAvgScoreSpinner = document.querySelector("#entries-by-avg-score-spinner");
// Hidden tables to be displayed once data is received.
let entriesPerLevelTable = document.querySelector("#entries-per-level-table");
let evalsPerEvaluatorTable = document.querySelector("#evals-per-evaluator-table");
let winnersTable = document.querySelector("#winners-table");
let entriesByAvgScoreTable = document.querySelector("#entries-by-avg-score-table");
// Containers to fill
let sidebar = document.querySelector(".side-bar");
let entriesPerLevelTableBody = document.querySelector("#entries-per-level-table-body");
let evalsPerEvaluatorTableBody = document.querySelector("#evals-per-evaluator-table-body");
let winnersTableBody = document.querySelector("#winners-table-body");
let entriesByAvgScoreTableBody = document.querySelector("#entries-by-avg-score-table-body");

let resultsContestName = document.querySelector("#results-contest-name");

request("get", "/api/internal/contests", null, (data) => {
    if (!data.error) {
        sidebarSpinner.style.display = "none";
        resultsContestName.textContent = `Results for ${data.contests.filter(c => c.contest_id == currentContestId)[0].contest_name}`;
        sidebar.innerHTML += `<h3>Contest</h3>`;
        data.contests.forEach(c => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/results/${c.contest_id}" id="contest-tab-${c.contest_id}">

                    <p>
                        ${c.contest_name.split("Contest: ")[1]}
                    </p>
                </a>
            `;
        });
        let navButton = document.querySelector(`#contest-tab-${currentContestId}`);
        navButton.classList.add("selected");
    } else {
        displayError(data.error);
    }
});

request("get", `/api/internal/results?contestId=${currentContestId}`, null, (data) => {
    if (!data.error) {
        entriesPerLevelSpinner.style.display = "none";
        entriesPerLevelTable.style.display = "table";
        data.results.entriesPerLevel.forEach(a => {
            entriesPerLevelTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.entry_level}
                </td>
                <td>
                    ${a.count}
                </td>
            </tr>`;
        });
        evalsPerEvaluatorSpinner.style.display = "none";
        evalsPerEvaluatorTable.style.display = "table";
        data.results.evaluationsPerEvaluator.forEach(a => {
            let entriesInGroup;
            if (data.logged_in) {
                data.results.entriesPerGroup.forEach(c => {
                    if (a.group_id === c.group_id) {
                        entriesInGroup = c.entry_count;
                    }
                });
            } else {
                entriesInGroup = 50;
            }
            evalsPerEvaluatorTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.nickname}
                </td>
                <td>
                    ${a.eval_count} / ${entriesInGroup}
                </td>
            </tr>`;
        });
        winnersSpinner.style.display = "none";
        winnersTable.style.display = "table";
        data.results.winners.forEach(a => {
            winnersTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.entry_id}
                </td>
                <td>
                    <a href="${a.entry_url}" target="_blank">
                        ${a.entry_title}
                    </a>
                </td>
                <td>
                    ${a.entry_author}
                </td>
                <td>
                    ${a.entry_level}
                </td>
                ${data.is_admin || permissions.manage_winners
                    ? `<td class="actions">
                            <i class="actions-dropdown-btn" onclick="showActionDropdown('winner-dropdown-${a.entry_id}');"></i>
                            <div class="actions-dropdown-content" hidden id="winner-dropdown-${a.entry_id}">
                                <a href="#" onclick="showConfirmModal('Remove Winner?', 'Are you sure you want to remove this winner? Remember that public users can see this change.', 'deleteWinner(${a.entry_id})', false, 'Remove')">Remove</a>
                            </div>
                       </td>`
                    : ""
                }
            </tr>`;
        });
        entriesByAvgScoreSpinner.style.display = "none";
        entriesByAvgScoreTable.style.display = "table";
        data.results.entriesByAvgScore.forEach(a => {
            entriesByAvgScoreTableBody.innerHTML += `
            <tr>
                <td>
                    ${a.entry_id}
                </td>
                <td>
                    <a href="${a.entry_url}" target="_blank">
                        ${a.title}
                    </a>
                </td>
                <td>
                    ${a.entry_author}
                </td>
                ${data.logged_in ? `
                    <td>
                        ${a.evaluations}
                    </td>
                    <td>
                        ${a.entry_level}
                    </td>
                    <td>
                        ${a.avg_score}
                    </td>` : ""
                }
                ${data.is_admin || permissions.manage_winners ? `
                    <td class="actions">
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('entry-dropdown-${a.entry_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="entry-dropdown-${a.entry_id}">
                            <a href="#" onclick="addWinner(${a.entry_id})">Mark as winner</a>
                        </div>
                    </td>
                    ` : ""
                }
            </tr>`;
        });
    } else {
        displayError(data.error);
    }
});

let addWinner = (entry_id) => {
    request("post", "/api/internal/winners", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
};

let deleteWinner = entry_id => {
    request("delete", "/api/internal/winners", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
};
