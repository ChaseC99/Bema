import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchSectionArticles } from "./fetchData";
import "./SectionCard.css";

type SectionCardProps = {
  sectionId: number
  sectionName: string
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
    fetchSectionArticles(props.sectionId)
      .then((data) => {
        setArticles(data.articles);
        setIsLoading(false);
      });
  }, []);

  return (
    <article className="card kb-section-card col-12" data-testid={props.testId}>
      <div className="card-header">
        <h3>{props.sectionName}</h3>
      </div>
      <div className="card-body">
        {articles.map((a) => {
          return (
            <Link to={"/kb/article/" + a.article_id} className="col-6">
              <div className="article-container col-12" key={a.article_id}>
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m18 20v-9h2v10c0 .5523-.4477 1-1 1h-14c-.55228 0-1-.4477-1-1v-18c0-.55228.44772-1 1-1h6v2h-5v16zm-4.5-11c-.2761 0-.5-.22386-.5-.5v-6.5l7 7z" fill="#21242c" fill-opacity=".5" /></svg>
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