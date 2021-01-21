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

// Dropdown accordion handler
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

let displayError = (error) => {
    if (error.status === 401 || error.status === 403) {
        showUnautorizedModal(error);
    } else {
        showErrorModal(error);
    }
}

// Popup modal functions
let showErrorModal = (error) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>Oops! We've encountered an error.</h2>`;
    modalBody.innerHTML = `<p>${error.message}</p><p>This issue has been reported to us so we can investigate and fix it! If you need immediate assistance, please reach out <a href="https://support.khanacademy.org/hc/en-us/community/topics/360000022111-KACP-Challenge-Council-Discussion-restricted-access-" target="_blank">here</a>. Please be sure to mention error code #${error.id} in your post.</p>`;
    modal.style.display = "block";
}

let showUnautorizedModal = (error) => {
    var modal = document.querySelector("#main-modal");
    var modalHeader = document.querySelector("#main-modal .modal-header");
    var modalBody = document.querySelector("#main-modal .modal-body");
    modalHeader.innerHTML = `<span class="modal-close" onclick="hideModal('main-modal')">&times;</span><h2>Unauthorized</h2>`;
    modalBody.innerHTML = `<p>${error.message}</p>`;
    modal.style.display = "block";
}

let hideModal = (modalId) => {
    var modal = document.querySelector("#" + modalId);
    modal.style.display = "none";
}
