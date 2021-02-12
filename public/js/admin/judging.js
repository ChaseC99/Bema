let flaggedEntriesTable = document.querySelector("#flagged-entries-table");
let flaggedEntriesTableBody = document.querySelector("#flagged-entries-table-body");
let judgingGroupsTable = document.querySelector("#judging-groups-table");
let judgingGroupsTableBody = document.querySelector("#judging-groups-table-body");
let assignedGroupsTable = document.querySelector("#assigned-groups-table");
let assignedGroupsTableBody = document.querySelector("#assigned-groups-table-body");
let judgingCriteriaTableBody = document.querySelector("#judging-criteria-table-body");
let assignedGroupsList = document.querySelector("#group-id-dropdown .select-dropdown-content");
let flaggedEntriesSpinner = document.querySelector("#flagged-entries-spinner");
let judgingGroupsSpinner = document.querySelector("#judging-groups-spinner");
let assignedGroupsSpinner = document.querySelector("#assigned-groups-spinner");
let judgingCriteriaSpinner = document.querySelector("#judging-criteria-spinner");
let tab = document.querySelector("#sidebar-judging");

// Load page data
request("get", "/api/internal/entries/flagged", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            flaggedEntriesSpinner.style.display = "none";

            if (data.flaggedEntries.length === 0) {
                flaggedEntriesTable.innerHTML = "All flagged entries have been reviewed!"
            } else {
                data.flaggedEntries.forEach(e => {
                    flaggedEntriesTableBody.innerHTML += `
                    <tr id="${e.entry_id}">
                        <td>${e.entry_id}</td>
                        <td><a href="${e.entry_url}" target="_blank">${e.entry_title}</a></td>
                        <td>${e.entry_author}</td>
                        <td>${e.entry_created}</td>
                        ${permissions.edit_entries || permissions.delete_entries || data.is_admin ? `
                            <td id="${e.entry_id}-actions" class="flagged-entry-actions actions">
                                ${permissions.edit_entries || data.is_admin ? `
                                    <a class="btn-tertiary" onclick="approveEntry(${e.entry_id})">Approve</a>
                                    <a class="btn-destructive-tertiary" onclick="disqualifyEntry(${e.entry_id})">Disqualify</a>
                                ` : ""}
                                ${permissions.delete_entries || data.is_admin ? `
                                    <a class="btn-destructive-tertiary" onclick="showConfirmModal('Delete Entry?', 'Are you sure you want to delete this entry? This action cannot be undone.', 'deleteEntry(${e.entry_id})', true, 'Delete')">Delete</a>
                                ` : ""}
                            </td>`
                        : ""}
                    </tr>`;
                });
            }
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/admin/getEvaluatorGroups", null, data => {
    if (!data.error) {
        if (data.logged_in) {
            judgingGroupsSpinner.style.display = "none";

            if (data.evaluatorGroups.length === 0) {
                judgingGroupsTable.innerHTML = "No judging groups have been created."
            } else {
                data.evaluatorGroups.forEach(g => {
                    judgingGroupsTableBody.innerHTML += `
                    <tr>
                        <td>${g.group_id}</td>
                        <td>${g.group_name}</td>
                        <td>${g.is_active ? "Active" : "Inactive"}</td>
                        ${permissions.manage_judging_groups || data.is_admin ? `
                            <td class="judging-group-actions actions">
                                <i class="actions-dropdown-btn" onclick="showActionDropdown('judging-group-dropdown-${g.group_id}');"></i>
                                <div class="actions-dropdown-content" hidden id="judging-group-dropdown-${g.group_id}">
                                    <a href="#" onclick="showEditEvaluatorGroupForm(${g.group_id}, '${g.group_name}', ${g.is_active})">Edit</a>
                                    <a href="#" onclick="showConfirmModal('Delete Group?', 'Are you sure you want to delete this judging group? This action cannot be undone, and any evaluators or entries assigned to the group will be unassigned.', 'deleteEvaluatorGroup(${g.group_id})', true, 'Delete')">Delete</a>
                                </div>
                            </td>`
                        : ""}
                    </tr>`;

                    if (g.is_active && permissions.assign_evaluator_groups) {
                        assignedGroupsList.innerHTML += `<a href="#" onclick="setSelectValue('group-id', ${g.group_id}, '${g.group_id} - ${g.group_name}');">${g.group_id} - ${g.group_name}</a>`;
                    }
                });
            }
            assignedGroupsSpinner.style.display = "none";
            data.evaluators.forEach(e => {
                let groupName = "";
                data.evaluatorGroups.forEach(g => {
                    if (e.group_id === g.group_id) {
                        groupName = " - " + g.group_name;
                    }
                });

                assignedGroupsTableBody.innerHTML += `
                <tr>
                    <td>${e.evaluator_id}</td>
                    <td>${e.evaluator_name}</td>
                    <td>${e.group_id ? e.group_id : "None"}${groupName}</td>
                    ${permissions.assign_evaluator_groups || data.is_admin ? `
                        <td class="assigned-group-actions actions">
                            <a href="#" class="btn-tertiary" onclick="showAssignEvaluatorGroupForm(${e.evaluator_id}, '${e.evaluator_name}', ${e.group_id}, '${groupName}')">Change Group</a>
                        </td>
                    ` : ""}
                </tr>`;
            });
        }
    } else {
        displayError(data.error);
    }
});

request("get", "/api/internal/judging/allCriteria", null, data => {
    if (!data.error) {
        judgingCriteriaSpinner.style.display = "none";

        data.judging_criteria.forEach(c => {
            judgingCriteriaTableBody.innerHTML += `
            <tr id="${c.criteria_id}">
                <td>${c.criteria_id}</td>
                <td>${c.criteria_name}</td>
                <td style='text-align: left'>${c.criteria_description}</td>
                <td>${c.is_active ? 'Yes' : 'No'}</td>
                <td>${c.sort_order}</td>
                ${permissions.manage_judging_criteria || data.is_admin ? `
                    <td class="actions">
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('judging-criteria-dropdown-${c.criteria_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="judging-criteria-dropdown-${c.criteria_id}">
                            <a href="#" onclick="showEditJudgingCriteriaForm(${c.criteria_id}, '${c.criteria_name}', '${c.criteria_description}', ${c.is_active}, ${c.sort_order})">Edit</a>
                            <a href="#" onclick="showConfirmModal('Delete Criteria?', 'Are you sure you want to delete this judging criteria? This action cannot be undone. Make the criteria inactive instead to preserve its contents.', 'deleteJudgingCriteria(${c.criteria_id})', true, 'Delete')">Delete</a>
                        </div>
                    </td>`
                : "" }
            </tr>`;
        });
    } else {
        displayError(data.error);
    }
});

// Handle entry action requests
let approveEntry = (entry_id) => {
    request("put", "/api/internal/entries/approve", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let disqualifyEntry = (entry_id) => {
    request("put", "/api/internal/entries/disqualify", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}
let deleteEntry = (entry_id) => {
    request("delete", "/api/internal/entries", {
        entry_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Handle group action requests
let addEvaluatorGroup = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];

    request("post", "/api/internal/admin/addEvaluatorGroup", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let editEvaluatorGroup = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "is_active") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];

    request("put", "/api/internal/admin/editEvaluatorGroup", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let deleteEvaluatorGroup = (group_id) => {
    request("delete", "/api/internal/admin/deleteEvaluatorGroup", {
        group_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let assignEvaluatorGroup = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];

    request("put", "/api/internal/users/assignToEvaluatorGroup", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let addJudgingCriteria = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "is_active") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];

    request("post", "/api/internal/judging/criteria", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let editJudgingCriteria = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "is_active") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];

    request("put", "/api/internal/judging/criteria", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let deleteJudgingCriteria = (criteria_id) => {
    request("delete", "/api/internal/judging/criteria", {
        criteria_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Displays forms
let showJudgingSettings = () => {
    let pages = document.querySelectorAll(".content-container");
    for (let i = 0; i < pages.length; i++) {
        pages[i].style.display = "none";
    }

    document.querySelector("#judging-page").style.display = "block";
}

let showAddEvaluatorGroupForm = () => {
    let addEvaluatorGroup = document.querySelector("#create-group-page");
    let judgingPage = document.querySelector("#judging-page");
    judgingPage.style.display = "none";
    addEvaluatorGroup.style.display = "block";
}

let showEditEvaluatorGroupForm = (...args) => {
    // args: group_id, group_name, is_active

    let editEvaluatorGroup = document.querySelector("#edit-group-page");
    let judgingPage = document.querySelector("#judging-page");
    let editEvaluatorGroupForm = document.querySelector("#edit-judging-group-form");
    judgingPage.style.display = "none";
    editEvaluatorGroup.style.display = "block";

    // Set form values
    for (let i = 0; i < editEvaluatorGroupForm.length - 1; i++) {
        if (editEvaluatorGroupForm[i].name === "is_active") {
            editEvaluatorGroupForm[i].checked = args[i];
        } else {
            editEvaluatorGroupForm[i].value = args[i];
        }
    }
}

let showAssignEvaluatorGroupForm = (...args) => {
    // args: evaluator_id, evaluator_name, group_id, group_name

    let assignEvaluatorGroup = document.querySelector("#assign-group-page");
    let judgingPage = document.querySelector("#judging-page");
    let assignEvaluatorGroupForm = document.querySelector("#assign-judging-group-form");
    judgingPage.style.display = "none";
    assignEvaluatorGroup.style.display = "block";

    // Set form values
    for (let i = 0; i < assignEvaluatorGroupForm.length - 1; i++) {
        assignEvaluatorGroupForm[i].value = args[i];
    }

    document.querySelector("#group-id-dropdown .custom-select-btn").innerHTML = `${args[2] ? '${args[2]} ${args[3]}' : 'None'}<i class="fas fa-angle-down"></i>`;
}

let showAddJudgingCriteriaForm = () => {
    let addJudgingCriteria = document.querySelector("#create-judging-criteria-page");
    let judgingPage = document.querySelector("#judging-page");
    judgingPage.style.display = "none";
    addJudgingCriteria.style.display = "block";
}

let showEditJudgingCriteriaForm = (...args) => {
    let editJudgingCriteria = document.querySelector("#edit-judging-criteria-page");
    let judgingPage = document.querySelector("#judging-page");
    let editJudgingCriteriaForm = document.querySelector("#edit-judging-criteria-form");
    judgingPage.style.display = "none";
    editJudgingCriteria.style.display = "block";

    // Set form values
    for (let i = 0; i < editJudgingCriteriaForm.length - 1; i++) {
        if (editJudgingCriteriaForm[i].name === "is_active") {
            editJudgingCriteriaForm[i].checked = args[i];
        } else {
            editJudgingCriteriaForm[i].value = args[i];
        }
    }
}

// Update navbar highlighting
tab.classList.add("selected");
