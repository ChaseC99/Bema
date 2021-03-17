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
        if (permissions.edit_kb_content || data.is_admin) {
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
    let body = {};
    for (key of e.target) {
        if (key.name === 'is_published') {
            body[key.name] = key.checked;
        } else {
            body[key.name] = key.value;
        }
    }
    body["article_content"] = document.querySelector("#edit-article-editor").firstChild.innerHTML;
    delete body[""];
    request("put", "/api/internal/kb/articles", body, (data) => {
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
    request("get", "/api/internal/kb/articles?articleId=" + id, null, (data) => {
        data = data.article;
        console.log(sections);
        editArticleForm["article_id"].value = data.article_id;
        editArticleForm["article_name"].value = data.article_name;
        editArticleForm["article_visibility"].value = data.article_visibility;
        editArticleForm["article_section"].value = data.section_id;
        editArticleForm["is_published"].checked = data.is_published;

        setSelectValue('article-visibility', data.article_visibility, data.article_visibility);

        let sectionName = "";
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].section_id === data.section_id) {
                sectionName = sections[i].section_name;
                break;
            }
        }
        setSelectValue('article-section', data.section_id, sectionName);

        document.querySelector("#edit-article-editor").firstChild.innerHTML = data.article_content;
    });

    showPage("edit-article-page");
}

/***** Create text editors *****/
var editArticleEditor = new Quill("#edit-article-editor", quillOptions);
