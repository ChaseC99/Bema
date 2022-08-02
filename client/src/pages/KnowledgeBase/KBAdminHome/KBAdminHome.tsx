import { gql, useQuery } from "@apollo/client";
import React from "react";
import { Link } from "react-router-dom";
import Badge from "../../../shared/Badge";
import LoadingSpinner from "../../../shared/LoadingSpinner";
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
  const { loading: articlesIsLoading, data: articlesData } = useQuery<GetArticlesResponse>(getQuery(props.filter), { onError: handleGQLError });

  return (
    <React.Fragment>
      <KBAdminSidebar />

      <section id="kb-admin-section" className="container col-12">
        <div className="col-12">
          <div className="section-header">
            <h2>All Articles</h2>
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

    </React.Fragment>
  );
}