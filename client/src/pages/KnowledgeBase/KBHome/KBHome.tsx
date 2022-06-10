import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import useAppState from "../../../state/useAppState";
import useAppError from "../../../util/errors";
import "./KBHome.css";

type Section = {
  id: string
  description: string
  name: string
  visibility: string | null
  articles: Article[]
}

type Article = {
  id: string
  title: string
}

type GetSectionsResponse = {
  sections: Section[]
}

const GET_SECTIONS = gql`
  query GetSections {
    sections {
      id
      description
      name
      visibility
      articles {
        id
        title
      }
    }
  }
`;

function KBHome() {
  const { state } = useAppState();
  const { handleGQLError } = useAppError();
  const { loading: sectionsIsLoading, data: sectionsData } = useQuery<GetSectionsResponse>(GET_SECTIONS, { onError: handleGQLError });

  return (
    <section className="container center col-12">
      <div className="col-6">
        <div className="section-header">
          <h2>Bema Resources</h2>

          <span className="section-actions" data-testid="announcement-section-actions">
            {(state.is_admin || state.user?.permissions.edit_kb_content || state.user?.permissions.delete_kb_content || state.user?.permissions.publish_kb_content) &&
              <Button type="tertiary" role="link" action={"/admin/kb"} text="Go to KB Admin" />
            }
          </span>
        </div>
        <div className="section-body" >
          {sectionsIsLoading && <LoadingSpinner size="LARGE" />}

          {!sectionsIsLoading &&
            sectionsData?.sections.map((s) => {
              return (
                <article className="card kb-section-card col-12">
                  <div className="card-header">
                    <h3>{s.name}</h3>
                  </div>
                  {s.description &&
                    <div className="kb-section-description">
                      <p className="col-12">{s.description}</p>
                    </div>
                  }
                  <div className="card-body">

                    {s.articles.map((a) => {
                      return (
                        <Link to={"/kb/article/" + a.id} className="col-6" key={a.id}>
                          <div className="article-container col-12">
                            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m18 20v-9h2v10c0 .5523-.4477 1-1 1h-14c-.55228 0-1-.4477-1-1v-18c0-.55228.44772-1 1-1h6v2h-5v16zm-4.5-11c-.2761 0-.5-.22386-.5-.5v-6.5l7 7z" fill="#21242c" fillOpacity=".5" /></svg>
                            <span>{a.title}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </article>
              );
            })
          }
        </div>
      </div>
    </section>
  );
}

export default KBHome;