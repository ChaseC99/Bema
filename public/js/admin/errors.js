let errorsTableBody = document.querySelector("#errors-table-body");
let errorsSpinner = document.querySelector("#errors-spinner");
let errorsPage = document.querySelector("#errors-page");
let detailedErrorPage = document.querySelector("#detailed-error-page");
let detailedErrorHeader = document.querySelector("#detailed-error-header");
let detailedErrorContainer = document.querySelector("#detailed-error-container");
let cachedErrors;

request("get", "/api/internal/errors", null, data => {
    if (!data.error) {
        cachedErrors = data.errors;
        data.errors.forEach(e => {
            errorsTableBody.innerHTML += `
            <tr id="${e.error_id}">
                <td>${e.error_id}</td>
                <td>${e.evaluator_id}</td>
                <td>${e.error_tstz}</td>
                <td>${e.error_message}</td>
                <td><span style="cursor: pointer" onclick="showError(${e.error_id})">View</span></td>
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
            <h2>Error #${e.error_id}</h2>
            <div>
                <span id="back-btn" class="admin-button" onclick="showAllErrors()">View All Errors</span>
                <span id="delete-error-btn" class="admin-button warning-button" onclick="deleteError(${e.error_id})">Delete Error</span>
            </div>
        `;

        detailedErrorContainer.innerHTML = `
            <p><strong>User ID: </strong>${e.evaluator_id}</p>
            <p><strong>Date: </strong>${e.error_tstz}</p>
            <p><strong>Request Origin: </strong>${e.request_origin}</p>
            <p><strong>Request Referer: </strong>${e.request_referer}</p>
            <p><strong>User Agent: </strong>${e.user_agent}</p>
            <p><strong>Error Message: </strong>${e.error_message}</p>
            <p><strong>Call Stack:</strong></p>
        `;
        let stack = e.error_stack.split(")");
        for (var i = 0; i < stack.length - 1; i++) {
            detailedErrorContainer.innerHTML += `<p>${stack[i]})</p>`;
        }

        errorsPage.style.display = "none";
        detailedErrorPage.style.display = "block";
    }
}

let showAllErrors = () => {
    detailedErrorPage.style.display = "none";
    errorsPage.style.display = "block";
}

let deleteError = (error_id) => {
    let confirm = window.confirm("Are you sure you want to delete this error?");
    if (confirm) {
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
}
