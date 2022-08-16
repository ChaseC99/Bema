import { gql, useQuery } from "@apollo/client";
import React from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../../../shared/Breadcrumbs";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import useAppError from "../../../util/errors";

type Article = {
  id: string
  title: string
}

type Section = {
  id: string
  name: string
  description: string
  articles: Article[]
}

type GetSectionResponse = {
  section: Section
}

const GET_SECTION = gql`
  query GetKBSection($id: ID!) {
    section(id: $id) {
      id
      name
      description
      articles {
        id
        title
      }
    }
  }
`;

export default function KBSection() {
  const { handleGQLError } = useAppError();
  const { sectionId } = useParams();
  const { loading: sectionIsLoading, data: sectionData } = useQuery<GetSectionResponse>(GET_SECTION, { onError: handleGQLError, variables: { id: sectionId } });

  return (
    <React.Fragment>
      <section className="container center col-12">
        <div className="col-6">
          {sectionIsLoading && <LoadingSpinner size='LARGE' />}
          {!sectionIsLoading &&
            <>
              <div className="section-header" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Breadcrumbs>
                  <Link to='/kb'>Knowledge Base</Link>
                  <span>{sectionData?.section.name}</span>
                </Breadcrumbs>
                <p></p>
                <h2>{sectionData?.section.name}</h2>
                <p>{sectionData?.section.description}</p>
              </div>
              <div className="section-body">
                <article className="card kb-section-card col-12">
                  <div className="card-body">
                    {sectionData?.section.articles.map((a) => {
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
              </div>
            </>
          }
        </div>
      </section>
    </React.Fragment>
  );
}