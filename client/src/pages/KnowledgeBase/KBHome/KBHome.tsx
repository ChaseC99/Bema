import { gql, useQuery } from "@apollo/client";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import useAppState from "../../../state/useAppState";
import SectionCard from "./SectionCard";

type Section = {
  id: string
  description: string
  name: string
  visibility: string | null
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
    }
  }
`;

function KBHome() {
  const { state } = useAppState();
  const { loading: sectionsIsLoading, data: sectionsData } = useQuery<GetSectionsResponse>(GET_SECTIONS);

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
                <SectionCard id={s.id} name={s.name} description={s.description} key={s.id} />
              );
            })
          }
        </div>
      </div>
    </section>
  );
}

export default KBHome;