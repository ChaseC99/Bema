let sectionsContainer = document.getElementById("sections-container");
let createArticleSectionDropdown = document.querySelector("#create-article-section-dropdown .select-dropdown-content");

/***** Loads page data *****/
request("get", "/api/internal/kb/sections", null, (data) => {
    if (!data.error) {
        data.sections.forEach((s, idx) => {
            // Fill forms with sections
            if (permissions.edit_kb_content || data.is_admin) {
                createArticleSectionDropdown.innerHTML += `
                    <a href="javascript:void(0);" onclick="setSelectValue('create-article-section', ${s.section_id}, '${s.section_name}');">${s.section_name}</a>
                `;
            }

            // Fill page with sections
            sectionsContainer.innerHTML += `
            <div class="preview col-12 standard">
                <div class="db-header">
                    <p>${s.section_name}</p>
                    ${data.is_admin || permissions.edit_kb_content || permissions.delete_kb_content ? `
                        <i class="actions-dropdown-btn" onclick="showActionDropdown('sections-dropdown-${s.section_id}');"></i>
                        <div class="actions-dropdown-content" hidden id="sections-dropdown-${s.section_id}">
                            ${permissions.edit_kb_content || data.is_admin ? `<a href="javascript:void(0);" onclick="showEditSectionForm(${s.section_id})">Edit</a>` : ""}
                            ${permissions.delete_kb_content || data.is_admin ? `<a href="javascript:void(0);" onclick="showConfirmModal('Delete Section?', 'Are you sure you want to delete this section? This action cannot be undone.', 'deleteSection(${s.section_id})', true, 'Delete')">Delete</a>` : ""}
                        </div>
                    ` : "" }
                </div>
                <div class="preview-content article-section" id="section-${s.section_id}">
                </div>
            </div>`
        });

        data.sections.forEach((s, idx) => {
            fillSection(s.section_id);
        });
    } else {
        displayError(data.error);
    }
});

// Fills a given section with articles
let fillSection = (id) => {
    let sectionContainer = document.getElementById("section-" + id);
    request("get", "/api/internal/kb/articles?sectionId=" + id, null, (data) => {
        if (!data.error) {
            data.articles.forEach((a, idx) => {
                sectionContainer.innerHTML += `
                    <div class="article-preview preview col-6">
                        <i class="far fa-file"></i>
                        <a href="/kb/article/${a.article_id}">${a.article_name}</a>
                        ${a.is_published ? "" : `<span class="draft-tag">Draft</span>`}
                    </div>
                `;
            });
        } else {
            displayError(data.error);
        }
    });
}


/***** These send form post requests *****/
let createSection = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("post", "/api/internal/kb/sections", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let editSection = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    delete body[""];
    request("put", "/api/internal/kb/sections", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let deleteSection = (id) => {
    let body = {section_id: id};
    request("delete", "/api/internal/kb/sections", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let createArticle = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    body["article_content"] = document.querySelector("#new-article-editor").firstChild.innerHTML;
    delete body[""];
    request("post", "/api/internal/kb/articles", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

// Displays forms
let showEditSectionForm = (id) => {
    let editSectionForm = document.querySelector("#edit-section-form");
    request("get", "/api/internal/kb/getSection?sectionId=" + id, null, (data) => {
        data = data.section;
        editSectionForm[0].value = data.section_id;
        editSectionForm[1].value = data.section_name;
        editSectionForm[2].value = data.section_description;
        editSectionForm[3].value = data.section_visibility;
        setSelectValue('edit-section', data.section_visibility, data.section_visibility);
    });

    showPage("edit-section-page");
}

/***** Create text editors *****/
let newArticleEditor = new Quill("#new-article-editor", quillOptions);
