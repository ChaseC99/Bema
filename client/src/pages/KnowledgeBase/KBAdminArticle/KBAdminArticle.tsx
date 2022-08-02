import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import parse from "html-react-parser";
import { Link, Navigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import KBAdminSidebar from "../../../shared/Sidebars/KBAdminSidebar";
import useAppError from "../../../util/errors";
import { ConfirmModal, FormModal } from "../../../shared/Modals";
import ActionMenu, { Action } from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import { Form } from "../../../shared/Forms";
import useAppState from "../../../state/useAppState";

type Draft = {
  id: string
  title: string
  content: string
  author: {
    id: string
    nickname: string
  }
  lastUpdated: string
}

type Article = {
  id: string
  section: {
    id: string
    name: string
  }
  title: string
  content: string
  lastUpdated: string
  visibility: string
  author: {
    id: string
    nickname: string
  }
  isPublished: boolean
  hasDraft: boolean
  draft: Draft
}

type GetArticleResponse = {
  article: Article
}

const GET_ARTICLE = gql`
  query GetArticle($articleId: ID!) {
    article(id: $articleId) {
      id
      section {
        id
        name
      }
      title
      content
      lastUpdated
      visibility
      author {
        id
        nickname
      }
      isPublished
      hasDraft
      draft {
        id
        title
        content
        author {
          id
          nickname
        }
        lastUpdated
      }
    }
  }
`;

type Section = {
  id: string
  name: string
}

type GetSectionsResponse = {
  sections: Section[]
}

const GET_SECTIONS = gql`
  query GetSections {
    sections {
      id
      name
    }
  }
`;

type EditPropertiesResponse = {
  article: Article
}

const EDIT_PROPERTIES = gql`
  mutation EditArticleProperties($id: ID!, $visibility: String!, $section: ID!) {
    article: editArticleProperties(id: $id, visibility: $visibility, section: $section) {
      id
      section {
        id
        name
      }
      title
      content
      author {
        id
        nickname
      }
      lastUpdated
      visibility
      isPublished
    }
  }
`;

type EditArticleResponse = {
  article: Article
}

const EDIT_ARTICLE = gql`
  mutation EditArticle($id: ID!, $input: KBArticleInput!) {
    article: editArticle(id: $id, input: $input) {
      id
      section {
        id
        name
      }
      title
      content
      lastUpdated
      visibility
      author {
        id
        nickname
      }
      isPublished
      hasDraft
      draft {
        id
        title
        content
        author {
          id
          nickname
        }
        lastUpdated
      }
    }
  }
`;

type PublishArticleResponse = {
  article: Article
}

const PUBLISH_ARTICLE = gql`
  mutation PublishArticle($id: ID!) {
    article: publishArticle(id: $id) {
      id
      section {
        id
        name
      }
      title
      content
      lastUpdated
      visibility
      author {
        id
        nickname
      }
      isPublished
      hasDraft
      draft {
        id
        title
        content
        author {
          id
          nickname
        }
        lastUpdated
      }
    }
  }
`;

type DeleteArticleResponse = {
  article: Article
}

const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      id
      section {
        id
        name
      }
      title
      content
      lastUpdated
      visibility
      author {
        id
        nickname
      }
      isPublished
      hasDraft
      draft {
        id
        title
        content
        author {
          id
          nickname
        }
        lastUpdated
      }
    }
  }
`;

export default function KBAdminArticle() {
  const { articleId } = useParams();
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const [showEditProperties, setShowEditProperties] = useState<boolean>(false);
  const [showEditArticle, setShowEditArticle] = useState<boolean>(false);
  const [showConfirmPublishModal, setShowConfirmPublishModal] = useState<boolean>(false);
  const [showConfirmDeleteArticleModal, setShowConfirmDeleteArticleModal] = useState<boolean>(false);
  const [shouldNavigate, setShouldNavigate] = useState<boolean>(false);

  const { loading: articleIsLoading, data: articleData, refetch: refetchArticle } = useQuery<GetArticleResponse>(GET_ARTICLE, {
    variables: {
      articleId: articleId
    },
    onError: handleGQLError
  });
  const { loading: sectionsIsLoading, data: sectionsData } = useQuery<GetSectionsResponse>(GET_SECTIONS, { onError: handleGQLError });

  const [editArticle, { loading: editArticleIsLoading }] = useMutation<EditArticleResponse>(EDIT_ARTICLE, { onError: handleGQLError });
  const [editProperties, { loading: editPropertiesIsLoading }] = useMutation<EditPropertiesResponse>(EDIT_PROPERTIES, { onError: handleGQLError });
  const [publishArticle, { loading: publishArticleIsLoading }] = useMutation<PublishArticleResponse>(PUBLISH_ARTICLE, { onError: handleGQLError });
  const [deleteArticle, { loading: deleteArticleIsLoading }] = useMutation<DeleteArticleResponse>(DELETE_ARTICLE, { onError: handleGQLError });

  const openEditPropertiesModal = () => {
    setShowEditProperties(true);
  }

  const closeEditPropertiesModal = () => {
    setShowEditProperties(false);
  }

  const showEditArticleForm = () => {
    setShowEditArticle(true);
  }

  const hideEditArticleForm = () => {
    setShowEditArticle(false);
  }

  const openConfirmPublishDraftModal = () => {
    setShowConfirmPublishModal(true);
  }

  const closeConfirmPublishDraftModal = () => {
    setShowConfirmPublishModal(false);
  }

  const handleEditProperties = async (values: { [name: string]: any }) => {
    await editProperties({
      variables: {
        id: articleId,
        visibility: values.visibility,
        section: values.section,
      }
    });

    refetchArticle();
    closeEditPropertiesModal();
  }

  const handleEditArticle = async (values: { [name: string]: any }) => {
    await editArticle({
      variables: {
        id: articleId,
        input: {
          section: articleData?.article.section.id,
          title: values.title,
          content: values.content,
          visibility: articleData?.article.visibility,
        },
      }
    });

    refetchArticle();
    hideEditArticleForm();
  }

  const handlePublishDraft = async () => {
    await publishArticle({
      variables: {
        id: articleId,
      },
    });

    refetchArticle();
    closeConfirmPublishDraftModal();
  }

  const openConfirmDeleteArticleModal = () => {
    setShowConfirmDeleteArticleModal(true);
  }

  const closeConfirmDeleteArticleModal = () => {
    setShowConfirmDeleteArticleModal(false);
  }

  const handleDeleteArticle = async () => {
    await deleteArticle({
      variables: {
        id: articleId,
      },
    });

    closeConfirmDeleteArticleModal();
    setShouldNavigate(true);
  }

  const getActions = () => {
    const actions: Action[] = [
      {
        role: 'button',
        action: openEditPropertiesModal,
        text: 'Edit Properties',
      }
    ];

    if (state.user?.permissions.publish_kb_content || state.isAdmin) {
      actions.push({
        role: 'button',
        action: openConfirmDeleteArticleModal,
        text: 'Delete Article',
      });
    }

    return actions;
  }

  if (shouldNavigate) {
    return <Navigate to="/admin/kb" />;
  }

  return (
    <React.Fragment>
      <KBAdminSidebar />

      <section id="kb-admin-section" className="container col-12">
        <div className="col-12">
          {(articleIsLoading || sectionsIsLoading) && <LoadingSpinner size='LARGE' />}

          {(!articleIsLoading && articleData && !sectionsIsLoading && sectionsData) &&
            <>
              <div className="section-header">
                <h2>{articleData.article.title}</h2>
                <Button type="tertiary" role="link" action={"/kb/article/" + articleId} text="View in Knowledge Base" />
              </div>
              <div className="section-body container row col-12">
                {!showEditArticle &&
                  <div className="card col-8">
                    <div className="card-body article-content" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: '20px' }}>
                        <Button type="tertiary" role="button" action={showEditArticleForm} text="Edit Article" />
                      </div>
                      {articleData.article.content !== "" ? 
                        parse(articleData.article.content.replaceAll("\n\n", "</p><p>").replaceAll("<p><br></p>", ""))
                        :
                        <p>This article does not have any published content.</p>
                      }
                    </div>
                  </div>
                }

                {showEditArticle &&
                  <div className='col-8'>
                    <Form
                      onSubmit={handleEditArticle}
                      onCancel={hideEditArticleForm}
                      submitLabel='Save Draft'
                      loading={editArticleIsLoading}
                      fields={[
                        {
                          fieldType: 'INPUT',
                          type: 'text',
                          name: 'title',
                          id: 'title',
                          defaultValue: articleData.article.hasDraft ? articleData.article.draft.title : articleData.article.title,
                          label: '',
                          size: 'LARGE',
                        },
                        {
                          fieldType: 'TEXTEDITOR',
                          name: 'content',
                          id: 'content',
                          defaultValue: articleData.article.hasDraft ? articleData.article.draft.content : articleData.article.content,
                          label: '',
                        }
                      ]}
                      cols={12}
                    />
                  </div>
                }
                <div className="container col-4" style={{ marginTop: '0' }}>
                  <div className="card col-12">
                    <div className="card-header">
                      <h3>Properties</h3>
                      <ActionMenu actions={getActions()} />
                    </div>
                    <div className="card-body">
                      <p><strong>Section: </strong>{articleData.article.section.name}</p>
                      <p><strong>Visbility: </strong>{articleData.article.visibility}</p>
                      <p><strong>Author: </strong>{articleData.article.author.nickname}</p>
                      <p><strong>Last Updated: </strong>{articleData.article.lastUpdated}</p>
                    </div>
                  </div>

                  {articleData.article.hasDraft &&
                    <div className="card col-12">
                      <div className="card-header">
                        <h3>Drafts</h3>
                      </div>
                      <div className="card-body">
                        <div>
                          <p><strong>Draft #1</strong> by {articleData.article.draft.author.nickname} {(state.isAdmin || state.user?.permissions.publish_kb_content) && <Button type='tertiary' role='button' action={openConfirmPublishDraftModal} text='Publish' style={{ marginLeft: '16px' }} />}</p>
                          <p><em style={{ fontSize: '12px' }}>Last Updated {articleData.article.draft.lastUpdated}</em></p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </>
          }
        </div>
      </section>

      {showEditProperties &&
        <FormModal
          title='Edit Properties'
          submitLabel='Save'
          handleSubmit={handleEditProperties}
          handleCancel={closeEditPropertiesModal}
          loading={editPropertiesIsLoading}
          fields={[
            {
              fieldType: 'SELECT',
              name: 'section',
              id: 'section',
              size: 'LARGE',
              label: 'Section',
              defaultValue: articleData?.article.section.id,
              choices: sectionsData?.sections.map((section) => ({
                text: section.name,
                value: section.id,
              })) || [],
            },
            {
              fieldType: 'SELECT',
              name: 'visibility',
              id: 'visibility',
              size: 'LARGE',
              label: 'Visibility',
              defaultValue: articleData?.article.visibility,
              choices: [
                {
                  text: 'Admins Only',
                  value: 'Admins Only',
                },
                {
                  text: 'Evaluators Only',
                  value: 'Evaluators Only',
                },
                {
                  text: 'Public',
                  value: 'Public',
                }
              ],
            }
          ]}
          cols={4}
        />
      }

      {showConfirmPublishModal &&
        <ConfirmModal title="Publish draft?" confirmLabel="Publish" handleConfirm={handlePublishDraft} handleCancel={closeConfirmPublishDraftModal} loading={publishArticleIsLoading} >
          <p>Are you sure you want to publish this article draft?</p>
        </ConfirmModal>
      }

      {showConfirmDeleteArticleModal &&
        <ConfirmModal title="Delete article?" confirmLabel="Delete" handleConfirm={handleDeleteArticle} handleCancel={closeConfirmDeleteArticleModal} loading={deleteArticleIsLoading} destructive>
          <p>Are you sure you want to delete this article? This action cannot be undone.</p>
        </ConfirmModal>
      }

    </React.Fragment>
  );
}