// Global click handler
window.onclick = function(event) {
    if (!event.target.matches('.actions-dropdown-btn') && !event.target.matches('.custom-select-btn')) {
        let dropdowns = document.querySelectorAll(".actions-dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].hidden = true;
        }
    }

    if (!event.target.matches('.custom-select-btn')) {
        let dropdowns = document.querySelectorAll(".select-dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].hidden = true;
        }
    }
}

// Page functions
let hideAllPages = () => {
    let pages = document.querySelectorAll(".content-container");
    for (let i = 0; i < pages.length; i++) {
        pages[i].hidden = true;
    }
}
let showPage = (page_id) => {
    hideAllPages();
    document.getElementById(page_id).hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Request handler
let request = (method = "post", path, data, callback) => {
    fetch(path, (method === "get") ? null : {
        method,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => callback(data))
    .catch(err => alert(err)); // Will change later.
};

// Accordion handler
document.addEventListener("DOMContentLoaded", function(event){
    var collapsables = document.getElementsByClassName("collapsable");

    for (var i = 0; i < collapsables.length; i++) {
        collapsables[i].addEventListener("click", function() {
            this.classList.toggle("expanded");
            var panel = this.nextElementSibling;
            panel.classList.toggle("closed");
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        });
    }
});

// Dropdown action menu handler
let showActionDropdown = (id) => {
    let dropdownContent = document.getElementById(id);
    if (dropdownContent.hidden) {
        dropdownContent.hidden = false;
    } else {
        dropdownContent.hidden = true;
    }
}
let showSelectDropdown = (id) => {
    let dropdownContent = document.querySelector("#" + id + " .select-dropdown-content");
    if (dropdownContent.hidden) {
        dropdownContent.hidden = false;
    } else {
        dropdownContent.hidden = true;
    }
}

// Custom select functionality
function setSelectValue(selectId, value, text) {
    var input = document.getElementById(selectId + '-input');
    input.value = value;

    var selectBtn = document.querySelector("#" + selectId + '-dropdown .custom-select-btn');
    selectBtn.innerHTML = text + '<i class="fas fa-angle-down">';
}

// Text editor settings
var quillOptions = {
    modules: {
    toolbar: [
      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'link', { 'list': 'bullet' }, 'image', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
    ]
    },
    handlers: {
        'link': function(value) {
          if (value) {
            var href = prompt('Enter the URL');
            this.quill.format('link', href);
          } else {
            this.quill.format('link', false);
          }
        }
    },
    theme: 'snow'
};

// Error handling
let displayError = (error) => {
    if (error.status === 401 || error.status === 403) {
        showUnautorizedModal(error);
    } else {
        showErrorModal(error);
    }
}

// Popup modal functions
let showInfoModal = (title, body) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    var modalFooter = document.querySelector("#main-modal .modal-footer");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>${title}</h2>`;
    modalBody.innerHTML = body;
    modalFooter.innerHTML = '';
    modal.style.display = "block";

    var body = document.querySelector("body");
    body.classList.add("noscroll");
}
let showErrorModal = (error) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    var modalFooter = document.querySelector("#main-modal .modal-footer");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>Oops! We've encountered an error.</h2>`;
    modalBody.innerHTML = `<p>${error.message}</p><p>This issue has been reported to us so we can investigate and fix it! ${permissions.judge_entries ? `If you need immediate assistance, please reach out <a href="https://support.khanacademy.org/hc/en-us/community/topics/360000022111-KACP-Challenge-Council-Discussion-restricted-access-" target="_blank">here</a>. Please be sure to mention error code #${error.id} in your post.</p>` : ''}`;
    modalFooter.innerHTML = '';
    modal.style.display = "block";

    var body = document.querySelector("body");
    body.classList.add("noscroll");
}
let showUnautorizedModal = (error) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    var modalFooter = document.querySelector("#main-modal .modal-footer");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>Unauthorized</h2>`;
    modalBody.innerHTML = `<p>${error.message}</p>`;
    modalFooter.innerHTML = '';
    modal.style.display = "block";

    var body = document.querySelector("body");
    body.classList.add("noscroll");
}
let showConfirmModal = (title, message, action, isDestructive, actionText) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    var modalFooter = document.querySelector("#main-modal .modal-footer");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>${title}</h2>`;
    modalBody.innerHTML = `<p>${message}</p>`;
    modalFooter.innerHTML = `
    <span>
        <a href="javascript:void(0);" class="btn-tertiary" onclick="hideModal('main-modal')">Cancel</a>
        <a href="javascript:void(0);" class="${isDestructive ? 'btn-destructive-primary' : 'btn-primary'}" onclick=\"${action}\">${actionText}</a>
    </span>
    `;
    modal.style.display = "block";

    var body = document.querySelector("body");
    body.classList.add("noscroll");
}
let hideModal = (modalId) => {
    var modal = document.querySelector("#" + modalId);
    modal.style.display = "none";

    var body = document.querySelector("body");
    body.classList.remove("noscroll");
}
