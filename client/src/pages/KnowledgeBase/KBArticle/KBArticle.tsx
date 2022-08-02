import React from "react";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import "./KBArticle.css";
import useAppState from "../../../state/useAppState";
import Button from "../../../shared/Button";
import ReactTimeAgo from 'react-time-ago';
import { gql, useQuery } from "@apollo/client";
import useAppError from "../../../util/errors";

type Article = {
  id: string
  section: {
    id: string
    name: string
  }
  title: string
  content: string
  lastUpdated: string
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
    }
  }
`;

function KBArticle() {
  const { articleId } = useParams();
  const { state } = useAppState();
  const { handleGQLError } = useAppError();

  const { loading: articleIsLoading, data: articleData } = useQuery<GetArticleResponse>(GET_ARTICLE, {
    variables: {
      articleId: articleId
    },
    onError: handleGQLError
  });

  return (
    <section className="container center col-12">
      <div className="col-6">
        {articleIsLoading && <LoadingSpinner size="LARGE" />}

        {(!articleIsLoading && articleData) &&
          <React.Fragment>
            <div className="section-header">
              <h2>{articleData.article.title}</h2>

              <span className="section-actions" data-testid="announcement-section-actions">
                {(state.is_admin || state.user?.permissions.edit_kb_content || state.user?.permissions.delete_kb_content || state.user?.permissions.publish_kb_content) &&
                  <Button type="tertiary" role="link" action={"/admin/kb/article/" + articleData?.article.id} text="View in KB admin" />
                }
              </span>
            </div>
            <div className="section-body" >
              <div className="card col-12">
                <div className="card-body article-content">
                  {parse(articleData.article.content.replaceAll("\n\n", "</p><p>").replaceAll("<p><br></p>", ""))}
                </div>
                <div className="card-footer article-footer">
                  <p><em>Last updated <span><ReactTimeAgo date={new Date(articleData.article.lastUpdated)} locale="en-US" /></span>.</em></p>
                </div>
              </div>
            </div>
          </React.Fragment>
        }
      </div>
    </section>
  );
}

export default KBArticle;