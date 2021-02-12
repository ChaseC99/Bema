let hasHashInUrl = document.location.href.indexOf("#") != -1;
let current_contest_id = (
    hasHashInUrl ?
    parseInt(document.location.href.split("#")[0].split("/")[6]) :
    parseInt(document.location.href.split("/")[6])
);
let current_evaluator_id = document.location.href.split("/")[5];

let evaluationsTable = document.querySelector("#evaluations-table");
let evaluationsTableHead = document.querySelector("#evaluations-table-head");
let evaluationsTableBody = document.querySelector("#evaluations-table-body");
let evaluationsSpinner = document.querySelector("#evaluations-spinner");
let evaluationsContestName = document.querySelector("#evaluations-contest-name");
let titleSpinner = document.querySelector("#title-spinner");
let sidebar = document.querySelector(".side-bar");
let sidebarSpinner = document.querySelector("#sidebar-spinner");
let editable_contest;

// Get the current contest
request("get", `/api/internal/contests/getCurrentContest`, null, (data) => {
    if (!data.error) {
        editable_contest = data.currentContest.contest_id;

        if (editable_contest === current_contest_id && !data.is_admin && !permissions.edit_all_evaluations && !permissions.delete_all_evaluations) {
            evaluationsTableHead.innerHTML = evaluationsTableHead.innerHTML.split("</tr>")[0] + '<th style="width: 1%">Actions</th>' + evaluationsTableHead.innerHTML.split("</tr>")[1];
        }
    } else {
        displayError(data.error);
    }
});

// Load page data
request("get", "/api/internal/contests/getContestsEvaluatedByUser?userId=" + current_evaluator_id, null, (data) => {
    if (!data.error) {
        if (data.contests.length > 0) {
            titleSpinner.style.display = "none";
            evaluationsContestName.textContent = `${data.contests.filter(c => c.contest_id == current_contest_id)[0].contest_name} --- Evaluations For ` + evaluationsContestName.textContent;

            sidebarSpinner.style.display = "none";
            sidebar.innerHTML += `<h3>Contest</h3>`;
            data.contests.forEach((c, idx) => {
                sidebar.innerHTML += `
                    <a class="nav-button" href="/admin/evaluations/${current_evaluator_id}/${c.contest_id}" id="contest-tab-${c.contest_id}">
                        <p>
                            ${c.contest_name.split("Contest: ")[1]}
                        </p>
                    </a>
                `;
            });
            let navButton = document.querySelector(`#contest-tab-${current_contest_id}`);
            navButton.classList.add("selected");
        } else {
            // This user has not submitted any evaluations, so display different page data
            titleSpinner.style.display = "none";
            evaluationsContestName.textContent = `Evaluations For ` + evaluationsContestName.textContent;

            sidebarSpinner.style.display = "none";

            evaluationsTable.innerHTML = "<p>This user has not evaluated any entries!</p>";
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/users?userId=" + current_evaluator_id, null, (data) => {
    if (!data.error) {
        evaluationsContestName.textContent += `${data.evaluator.nickname}`;
    } else {
        displayError(data.error);
    }
});

request("get", `/api/internal/evaluations?contestId=${current_contest_id}&userId=${current_evaluator_id}`, null, (data) => {
    if (!data.error) {

        evaluationsTable.style.display = "block";
        data.evaluations.forEach((e, idx) => {
            evaluationsTableBody.innerHTML += `
            <tr id="${e.evaluation_id}">
                <td>
                    ${e.evaluation_id}
                </td>
                <td>
                    ${e.entry_id}
                </td>
                <td>
                    <a href='${e.entry_url}' target='_blank'>${e.entry_title}</a>
                </td>
                <td>
                    ${e.creativity}
                </td>
                <td>
                    ${e.complexity}
                </td>
                <td>
                    ${e.execution}
                </td>
                <td>
                    ${e.interpretation}
                </td>
                <td>
                    ${e.creativity + e.complexity + e.execution + e.interpretation}
                </td>
                <td>
                    ${e.evaluation_level}
                </td>
                    ${editable_contest === current_contest_id && !data.is_admin && !permissions.delete_all_evaluations && !permissions.edit_all_evaluations ? `<td id="${e.evaluation_id}-actions"><i class="control-btn far fa-edit" onclick="showEditEvaluationForm(${e.evaluation_id}, ${e.entry_id}, ${e.creativity}, ${e.complexity}, ${e.execution}, ${e.interpretation}, '${e.evaluation_level}')"></i></td>` : ""}
                    ${data.is_admin || permissions.edit_all_evaluations || permissions.delete_all_evaluations ? `<td class="actions">
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('evaluation-dropdown-${e.evaluation_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="evaluation-dropdown-${e.evaluation_id}">
                            ${permissions.edit_all_evaluations || data.is_admin ? `<a href="#" onclick="showEditEvaluationForm(${e.evaluation_id}, ${e.entry_id}, ${e.creativity}, ${e.complexity}, ${e.execution}, ${e.interpretation}, '${e.evaluation_level}')">Edit</a>` : ""}
                            ${permissions.delete_all_evaluations || data.is_admin ? `<a href="#" onclick="showConfirmModal('Delete Evaluation?', 'Are you sure you want to delete this evaluation? This action cannot be undone.', 'deleteEvaluation(${e.evaluation_id})', true, 'Delete')">Delete</a>` : ""}
                        </div>
                    </td>` : ""}
            </tr>`;
        });
        evaluationsSpinner.style.display = "none";
    } else {
        displayError(data.error);
    }
});

///// These send form post requests /////
let editEvaluation = (e) => {
    e.preventDefault();

    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("put", "/api/internal/evaluations", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let deleteEvaluation = (evaluation_id) => {
    request("delete", "/api/internal/evaluations", {
        evaluation_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

///// HTML modifier functions (like displaying forms) /////
let showViewEvaluations = () => {
    let editEvaluationPage = document.querySelector("#edit-evaluation-page");
    let viewEvaluationsPage = document.querySelector("#evaluation-list");

    editEvaluationPage.style.display = "none";
    viewEvaluationsPage.style.display = "block";
}
let showEditEvaluationForm = (...args) => {
    // evaluation id, creativity, complexity, quality, interpretation, skill level
    let editEvaluationPage = document.querySelector("#edit-evaluation-page");
    let viewEvaluationsPage = document.querySelector("#evaluation-list");
    let editEvaluationForm = document.querySelector("#edit-evaluation-form");
    viewEvaluationsPage.style.display = "none";
    editEvaluationPage.style.display = "block";

    // Just need to set values of inputs to provided params.
    for (let i = 0; i < editEvaluationForm.length - 1; i++) {
        editEvaluationForm[i].value = args[i];
    }

    setSelectValue('evaluation-level', args[6], args[6]);
};
