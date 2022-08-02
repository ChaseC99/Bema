import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Badge from "../../../shared/Badge";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { FormModal } from "../../../shared/Modals";
import KBAdminSidebar from "../../../shared/Sidebars/KBAdminSidebar";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppError from "../../../util/errors";

type Article = {
  id: string
  section: {
    id: string
    name: string
  }
  title: string
  author: {
    id: string
    nickname: string
  }
  lastUpdated: string
  visibility: string
  isPublished: boolean
  hasDraft: boolean
}

type GetArticlesResponse = {
  articles: Article[]
}

const GET_ALL_ARTICLES = gql`
  query GetArticles {
    articles {
      id
      section {
        id
        name
      }
      title
      author {
        id
        nickname
      }
      lastUpdated
      visibility
      isPublished
      hasDraft
    }
  }
`;

const GET_ARTICLE_DRAFTS = gql`
  query GetArticles {
    articles(filter: "DRAFTS") {
      id
      section {
        id
        name
      }
      title
      author {
        id
        nickname
      }
      lastUpdated
      visibility
      isPublished
      hasDraft
    }
  }
`;

type CreateArticleResponse = {
  article: {
    id: string
  }
}

const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: KBArticleInput!) {
    article: createArticle(input: $input) {
      id
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

type Filter = 'ALL' | 'DRAFTS';

type KBAdminHomeProps = {
  filter: Filter
}

function getQuery(filter: Filter) {
  switch (filter) {
    case 'DRAFTS': {
      return GET_ARTICLE_DRAFTS;
    }
    default: {
      return GET_ALL_ARTICLES;
    }
  }
}

export default function KBAdminHome(props: KBAdminHomeProps) {
  const { handleGQLError } = useAppError();
  const [showCreateArticleForm, setShowCreateArticleForm] = useState<boolean>(false);
  const [navigateTo, setNavigateTo] = useState<string | null>(null);
  const { loading: articlesIsLoading, data: articlesData } = useQuery<GetArticlesResponse>(getQuery(props.filter), { onError: handleGQLError });
  const { loading: sectionsIsLoading, data: sectionsData } = useQuery<GetSectionsResponse>(GET_SECTIONS, { onError: handleGQLError });
  const [createArticle, { loading: createArticleIsLoading }] = useMutation<CreateArticleResponse>(CREATE_ARTICLE, { onError: handleGQLError });

  const openCreateArticleModal = () => {
    setShowCreateArticleForm(true);
  }

  const closeCreateArticleModal = () => {
    setShowCreateArticleForm(false);
  }

  const handleCreateArticle = async (values: { [name: string]: any }) => {
    const { data } = await createArticle({
      variables: {
        input: {
          section: values.section,
          title: values.title,
          content: "",
          visibility: values.visibility,
        }
      },
    });

    closeCreateArticleModal();
    setNavigateTo(data?.article.id || null);
  }

  if (navigateTo !== null) {
    return <Navigate to={"/admin/kb/article/" + navigateTo} />
  }

  return (
    <React.Fragment>
      <KBAdminSidebar />

      <section id="kb-admin-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>All Articles</h2>
            <Button type="primary" role="button" action={openCreateArticleModal} text="Create Article" />
          </div>
          <div className="section-body container col-12">
            {articlesIsLoading && <LoadingSpinner size='LARGE' />}

            {(!articlesIsLoading && articlesData) && 
              <Table>
                <TableHead>
                  <Row>
                    <Cell header>Title</Cell>
                    <Cell header>Section</Cell>
                    <Cell header>Author</Cell>
                    <Cell header>Last Updated</Cell>
                    <Cell header>Visibility</Cell>
                  </Row>
                </TableHead>
                <TableBody>
                  {articlesData.articles.map((article) => {
                    return (
                      <Row>
                        <Cell>
                          <Link to={'/admin/kb/article/' + article.id}>{article.title}</Link>
                          {!article.isPublished ? <Badge text='Not Published' color='#1865f2' type='primary' /> : ''}
                        </Cell>
                        <Cell>{article.section.name}</Cell>
                        <Cell>{article.author.nickname}</Cell>
                        <Cell>{article.lastUpdated}</Cell>
                        <Cell>{article.visibility}</Cell>
                      </Row>
                    );
                  })}
                </TableBody>
              </Table>
            }
          </div>
        </div>
      </section>

      {showCreateArticleForm &&
        <FormModal 
          title="Create Article"
          submitLabel="Create"
          handleSubmit={handleCreateArticle}
          handleCancel={closeCreateArticleModal}
          cols={4}
          loading={createArticleIsLoading}
          fields={[
            {
              fieldType: "INPUT",
              type: "text",
              name: "title",
              id: "title",
              defaultValue: "",
              size: "LARGE",
              label: "Title",
              required: true,
            },
            {
              fieldType: 'SELECT',
              name: 'section',
              id: 'section',
              size: 'LARGE',
              label: 'Section',
              defaultValue: null,
              choices: sectionsData?.sections.map((section) => ({
                text: section.name,
                value: section.id,
              })) || [],
              required: true,
            },
            {
              fieldType: 'SELECT',
              name: 'visibility',
              id: 'visibility',
              size: 'LARGE',
              label: 'Visibility',
              defaultValue: null,
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
              required: true,
            }
          ]}
        />
      }

    </React.Fragment>
  );
}