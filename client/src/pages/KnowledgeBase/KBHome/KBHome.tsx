import { useEffect, useState } from "react";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import useAppState from "../../../state/useAppState";
import { fetchSections } from "./fetchData";
import SectionCard from "./SectionCard";

type Section = {
  section_description: string
  section_id: number
  section_name: string
  section_visibility: string
}

function KBHome() {
  const { state } = useAppState();
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSections()
      .then((data) => {
        setSections(data.sections);
        setIsLoading(false);
      });
  }, []);

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
          {isLoading && <LoadingSpinner size="LARGE" />}

          {!isLoading &&
            sections.map((s) => {
              return (
                <SectionCard sectionId={s.section_id} sectionName={s.section_name} key={s.section_id} />
              );
            })
          }
        </div>
      </div>
    </section>
  );
}

export default KBHome;