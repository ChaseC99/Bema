import { useEffect, useState } from "react";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { fetchSections } from "./fetchData";
import SectionCard from "./SectionCard";

type Section = {
  section_description: string
  section_id: number
  section_name: string
  section_visibility: string
}

function KBHome() {
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
        </div>
        <div className="section-body" >
          {isLoading && <LoadingSpinner size="LARGE" />}

          {!isLoading &&
            sections.map((s) => {
              return (
                <SectionCard sectionId={s.section_id} sectionName={s.section_name} />
              );
            })
          }
        </div>
      </div>
    </section>
  );
}

export default KBHome;