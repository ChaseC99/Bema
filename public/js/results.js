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
        data.contests.forEach(c => {
            sidebar.innerHTML += `
                <a class="nav-button" href="/results/${c.contest_id}" id="contest-tab-${c.contest_id}">
                    <i class="fas fa-trophy"></i>
                    <p>
                        ${c.contest_name}
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
        entriesPerLevelTable.style.display = "block";
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
        evalsPerEvaluatorTable.style.display = "block";
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
        winnersTable.style.display = "block";
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
                ${data.is_admin
                    ? `<td id="${a.entry_id}-actions">
                           <i class="control-btn red far fa-trash-alt" onclick="deleteWinner(${a.entry_id})"></i>
                       </td>`
                    : ""
                }
            </tr>`;
        });
        entriesByAvgScoreSpinner.style.display = "none";
        entriesByAvgScoreTable.style.display = "block";
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
                ${data.is_admin ? `
                    <td>
                        <i class="fas fa-trophy" onclick="addWinner(${a.entry_id})"></i>
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
    let shouldDelete = confirm("Are you sure you want to delete this winner?");

    if (shouldDelete) {
        request("delete", "/api/internal/winners", {
            entry_id
        }, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    }
};
