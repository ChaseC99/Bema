let article_id = window.location.href.substring(window.location.href.lastIndexOf("/")+1);
let articleContainer = document.getElementById("article-container");
let editArticleSectionDropdown = document.querySelector("#article-section-dropdown .select-dropdown-content");
let sections;

/***** Loads page data *****/
request("get", "/api/internal/kb/articles?articleId=" + article_id, null, (data) => {
    let a = data.article;
    request("get", "/api/internal/users?userId=" + data.article.article_author, null, (data) => {
        let author_name = data.evaluator.evaluator_name;

        if (!data.error) {
            articleContainer.innerHTML = `
                <div class="preview col-8 standard">
                    <div class="db-header">
                        <p>${a.article_name}</p>
                            ${data.is_admin || permissions.edit_kb_content || permissions.delete_kb_content ? `
                                <i class="actions-dropdown-btn" onclick="showActionDropdown('article-dropdown-${a.article_id}');"></i>
                                <div class="actions-dropdown-content" hidden id="article-dropdown-${a.article_id}">
                                    ${permissions.edit_kb_content || permissions.publish_kb_content || data.is_admin ? `<a href="javascript:void(0);" onclick="showEditArticleForm(${a.article_id})">Edit</a>` : ""}
                                    ${data.is_admin ? `<a href="javascript:void(0);" onclick="showEditArticlePropertiesForm(${a.article_id})">Properties</a>` : ""}
                                    ${permissions.delete_kb_content || data.is_admin ? `<a href="javascript:void(0);" onclick="showConfirmModal('Delete Article?', 'Are you sure you want to delete this article? This action cannot be undone.', 'deleteArticle(${a.article_id})', true, 'Delete')">Delete</a>` : ""}
                                </div>
                            ` : ``}
                    </div>
                    <div class="preview-content">
                        ${a.article_content}

                         <div class="article-meta">
                            <p><span class="label">Last Updated:</span> ${a.last_updated}</p>
                            <p><span class="label">Created By:</span> ${author_name}</p>
                            ${data.is_admin || permissions.edit_kb_content || permissions.publish_kb_content ? `<p><span class="label">Published:</span> ${a.is_published ? "Yes" : "No"}</p>
                            <p><span class="label">Visibility:</span> ${a.article_visibility}</p>
                        </div>` : ``}
                    </div>
                </div>
            `;
        } else {
            displayError(data.error);
        }
    });
});

request("get", "/api/internal/kb/sections", null, (data) => {
    if (!data.error) {
        if (data.is_admin) {
            sections = data.sections;
            data.sections.forEach((s, idx) => {
                // Fill forms with sections
                editArticleSectionDropdown.innerHTML += `
                    <a href="javascript:void(0);" onclick="setSelectValue('article-section', ${s.section_id}, '${s.section_name}');">${s.section_name}</a>
                `;
            });
        }
    } else {
        displayError(data.error);
    }
});

/***** Send Form Requests *****/
let editArticle = (e) => {
    e.preventDefault();
    let saveType = e.submitter.value;
    let draft_id = e.target["draft_id"].value;
    let body = {};
    for (key of e.target) {
        body[key.name] = key.value;
    }
    body["article_content"] = document.querySelector("#edit-article-editor").firstChild.innerHTML;
    delete body[""];
    delete body["action_type"];

    if (saveType === "Save Draft") {
        request(draft_id > 0 ? "put" : "post", "/api/internal/kb/articles/drafts", body, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    } else if (saveType === "Save and Publish") {
        request("put", "/api/internal/kb/articles", body, (data) => {
            if (!data.error) {
                window.setTimeout(() => window.location.reload(), 1000);
            } else {
                displayError(data.error);
            }
        });
    }
}

let editArticleProperties = (e) => {
    e.preventDefault();
    let body = {};
    for (key of e.target) {
        if (key.name === "is_published") {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    delete body[""];

    request("put", "/api/internal/kb/articles/properties", body, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

let deleteArticle = (id) => {
    request("delete", "/api/internal/kb/articles", {article_id: id}, (data) => {
        if (!data.error) {
            window.setTimeout(() => window.location.reload(), 1000);
        } else {
            displayError(data.error);
        }
    });
}

/***** Show forms *****/
let showEditArticleForm = (id) => {
    let editArticleForm = document.querySelector("#edit-article-form");
    request("get", "/api/internal/kb/articles/drafts?articleId=" + id, null, (data) => {
        let draft = data.draft;
        if (draft !== null) {
            // A draft exists, so load the draft into the editor
            editArticleForm["draft_id"].value = draft.draft_id;
            editArticleForm["article_id"].value = draft.article_id;
            editArticleForm["article_name"].value = draft.draft_name;
            document.querySelector("#edit-article-editor").firstChild.innerHTML = draft.draft_content;
        } else {
            // A draft does not exist, so load the existing article into the editor
            request("get", "/api/internal/kb/articles?articleId=" + id, null, (data) => {
                editArticleForm["draft_id"].value = 0;
                editArticleForm["article_id"].value = data.article.article_id;
                editArticleForm["article_name"].value = data.article.article_name;
                document.querySelector("#edit-article-editor").firstChild.innerHTML = data.article.article_content;
            });
        }
    });

    showPage("edit-article-page");
}

let showEditArticlePropertiesForm = (id) => {
    let form = document.querySelector("#edit-article-properties-form");
    request("get", "/api/internal/kb/articles?articleId=" + id, null, (data) => {
        form["article_id"].value = data.article.article_id;
        form["article_visibility"].value = data.article.article_visibility;
        form["article_section"].value = data.article.section_id;
        form["is_published"].checked = data.article.is_published;

        let sectionName = "";
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].section_id === data.article.section_id) {
                sectionName = sections[i].section_name;
                break;
            }
        }
        setSelectValue('article-section', data.article.section_id, sectionName);

        setSelectValue('article-visibility', data.article.article_visibility, data.article.article_visibility);
    });

    showPage("edit-article-properties-page");
}

/***** Create text editors *****/
var editArticleEditor = new Quill("#edit-article-editor", quillOptions);
