import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { fetchSectionArticles } from "./fetchData";
import "./SectionCard.css";

type SectionCardProps = {
  id: string
  name: string
  description?: string
  testId?: string
}

type Article = {
  article_author: number
  article_content: string
  article_id: number
  article_last_updated: string
  article_name: string
  article_visibility: string
  is_published: boolean
  section_id: number
}

function SectionCard(props: SectionCardProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSectionArticles(parseInt(props.id))
      .then((data) => {
        setArticles(data.articles);
        setIsLoading(false);
      });
  }, [props.id]);

  return (
    <article className="card kb-section-card col-12" data-testid={props.testId}>
      <div className="card-header">
        <h3>{props.name}</h3>
      </div>
      {props.description &&
        <div className="kb-section-description">
          <p className="col-12">{props.description}</p>
        </div>
      }
      <div className="card-body">
        {isLoading && <LoadingSpinner size="MEDIUM" />}

        {!isLoading && articles.map((a) => {
          return (
            <Link to={"/kb/article/" + a.article_id} className="col-6" key={a.article_id}>
              <div className="article-container col-12">
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m18 20v-9h2v10c0 .5523-.4477 1-1 1h-14c-.55228 0-1-.4477-1-1v-18c0-.55228.44772-1 1-1h6v2h-5v16zm-4.5-11c-.2761 0-.5-.22386-.5-.5v-6.5l7 7z" fill="#21242c" fillOpacity=".5" /></svg>
                <span>{a.article_name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </article>
  );
}

export default SectionCard;