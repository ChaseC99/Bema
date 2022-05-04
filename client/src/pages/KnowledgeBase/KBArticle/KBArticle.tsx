import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import parse from "html-react-parser";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { fetchArticleData } from "./fetchArticleData";
import "./KBArticle.css";
import useAppState from "../../../state/useAppState";
import Button from "../../../shared/Button";
import ReactTimeAgo from 'react-time-ago';


type Article = {
  article_author: number
  article_content: string
  article_id: number
  article_last_updated: string
  article_name: string
  article_visibility: string
  is_published: boolean
  last_updated: string
  section_id: number
}

const defaultArticle: Article = {
  article_author: 0,
  article_content: "",
  article_id: 0,
  article_last_updated: "",
  article_name: "",
  article_visibility: "",
  is_published: false,
  last_updated: "",
  section_id: 0
}

function KBArticle() {
  const { articleId } = useParams();
  const { state } = useAppState();
  const [article, setArticle] = useState<Article>(defaultArticle);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchArticleData(parseInt(articleId || ""))
      .then((data) => {
        setArticle(data.article);
        setIsLoading(false);
      });
  }, [articleId]);

  return (
    <section className="container center col-12">
      <div className="col-6">
        {isLoading && <LoadingSpinner size="LARGE" />}

        {!isLoading &&
          <React.Fragment>
            <div className="section-header">
              <h2>{article.article_name}</h2>

              <span className="section-actions" data-testid="announcement-section-actions">
                {(state.is_admin || state.user?.permissions.edit_kb_content || state.user?.permissions.delete_kb_content || state.user?.permissions.publish_kb_content) &&
                  <Button type="tertiary" role="link" action={"/admin/kb/article/" + article.article_id} text="View in KB admin" />
                }
              </span>
            </div>
            <div className="section-body" >
              <div className="card col-12">
                <div className="card-body article-content">
                  {parse(article.article_content.replaceAll("\n\n", "</p><p>").replaceAll("<p><br></p>", ""))}
                </div>
                <div className="card-footer article-footer">
                  <p><em>Last updated <span><ReactTimeAgo date={new Date(article.article_last_updated)} locale="en-US"/></span>.</em></p>
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