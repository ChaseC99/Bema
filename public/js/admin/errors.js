let tab = document.querySelector("#sidebar-errors");
let errorsTableBody = document.querySelector("#errors-table-body");
let errorsSpinner = document.querySelector("#errors-spinner");
let detailedErrorHeader = document.querySelector("#detailed-error-header");
let detailedErrorContainer = document.querySelector("#detailed-error-container");
let cachedErrors;
let is_admin = false;

request("get", "/api/internal/errors", null, data => {
    if (!data.error) {
        cachedErrors = data.errors;
        is_admin = data.is_admin;
        data.errors.forEach(e => {
            errorsTableBody.innerHTML += `
            <tr id="${e.error_id}">
                <td>${e.error_id}</td>
                <td>${e.evaluator_id}</td>
                <td>${e.error_tstz}</td>
                <td>${e.error_message}</td>
                <td class="actions"><span class="btn-tertiary" onclick="showError(${e.error_id})">View</span></td>
            </tr>`;
        });

        errorsSpinner.style.display = "none";
    } else {
        displayError(data.error);
    }
});


let showError = (id) => {
    let e;
    for (var i = 0; i < cachedErrors.length; i++) {
        if (cachedErrors[i].error_id === id) {
            e = cachedErrors[i];
            break;
        }
    }
    if (e) {
        detailedErrorHeader.innerHTML = `
            <h2><a href="javascript:void(0);" onclick="showPage('errors-page');">Errors</a> > Error #${e.error_id}</h2>
            <div>
                ${permissions.delete_errors || is_admin ? `<span id="delete-error-btn" class="btn-destructive-primary" onclick="showConfirmModal('Delete error?', 'Are you sure you want to delete this error? This action cannot be undone.', 'deleteError(${e.error_id})', true, 'Delete');">Delete Error</span>` : ""}
            </div>
        `;

        detailedErrorContainer.innerHTML = `
            <p><strong>User ID: </strong>${e.evaluator_id}</p>
            <p><strong>Date: </strong>${e.error_tstz}</p>
            <p><strong>Request Origin: </strong>${e.request_origin}</p>
            <p><strong>Request Referer: </strong>${e.request_referer}</p>
            <p><strong>User Agent: </strong>${e.user_agent}</p>
            <p><strong>Error Message: </strong>${e.error_message}</p>
            ${e.error_stack ? "<p><strong>Call Stack:</strong></p>" : "<p><strong>Call Stack:</strong> None</p>"}
        `;
        if (e.error_stack) {
            let stack = e.error_stack.split(")");
            for (var i = 0; i < stack.length - 1; i++) {
                detailedErrorContainer.innerHTML += `<p>${stack[i]})</p>`;
            }
        }

        showPage("detailed-error-page");
    }
}

let deleteError = (error_id) => {
    request("delete", "/api/internal/errors", {
        error_id
    }, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Update navbar highlighting
tab.classList.add("selected");
