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
                                <a href="javascript:void(0);" onclick="showConfirmModal('Remove Winner?', 'Are you sure you want to remove this winner? Remember that public users can see this change.', 'deleteWinner(${a.entry_id})', true, 'Remove')">Remove</a>
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
                    ${a.voted_by_user > 0 ? `<i class="far fa-thumbs-up" style="margin-left: 3px; color: #1865f2"></i>` : ''}
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
                    </td>
                    <td>
                        ${a.vote_count > 0 ? `
                            <a href="javascript:void(0)" onclick="showVotes(${a.entry_id})">${a.vote_count}</a>
                        ` : '0'}
                    </td>
                ` : ""
                }
                ${data.is_admin || permissions.manage_winners || permissions.judge_entries ? `
                    <td class="actions">
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('entry-dropdown-${a.entry_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="entry-dropdown-${a.entry_id}">
                            ${(data.is_admin || permissions.judge_entries) && a.voted_by_user == 0 ? `<a href="javascript:void(0);" onclick="showVoteForm(${a.entry_id}, '${a.title.replace("'", "\\\'")}')">Vote for entry</a>` : ""}
                            ${(data.is_admin || permissions.judge_entries) && a.voted_by_user > 0 ? `<a href="javascript:void(0);" onclick="showConfirmModal('Delete vote?', 'Are you sure you want to delete your vote for this entry? This action cannot be undone.', 'deleteVote(${a.entry_id})', true, 'Delete Vote')">Remove vote</a>` : ""}
                            ${data.is_admin || permissions.manage_winners ? `<a href="javascript:void(0);" onclick="addWinner(${a.entry_id})">Mark as winner</a>` : ""}
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

/* Form and action request handlers */
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
let submitVote = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/winners/votes", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let deleteVote = (entry_id, vote_id) => {
    request("delete", "/api/internal/winners/votes", {
        entry_id,
        vote_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
};
let showVotes = (entry_id) => {
    request("get", "/api/internal/winners/votes?entryId="+entry_id, null, (data) => {
        if (!data.error) {
            let body = "";
            data.votes.forEach(a => {
                body += `
                    <h3>${a.nickname} ${data.is_admin ? `<span class="btn-destructive-tertiary" onclick="deleteVote(0, ${a.vote_id})">Delete</span>` : ''}</h3>
                    <p>${a.feedback.replace("\n", "<br><br>")}</p>
                `;
            });

            showInfoModal("Votes for Entry #"+entry_id, body);
        } else {
            displayError(data.error);
        }
    });
}


let showVoteForm = (entry_id, entry_name) => {
    let header = document.getElementById("vote-form-header");
    header.innerHTML = `Vote for Entry #${entry_id} -- ${entry_name}`;

    let form = document.getElementById("vote-form");
    form[0].value = entry_id;

    showPage("vote-form-page");
}
