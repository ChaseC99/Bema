import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Button from "../../shared/Button/Button";
import LoadingSpinner from "../../shared/LoadingSpinner/LoadingSpinner";
import useAppState from "../../state/useAppState";
import AnnouncementCard from "./AnnouncementCard";
import { fetchAnnouncements } from "./fetchAnnouncements";

type Announcement = {
  message_author: string
  message_content: string
  message_date: string
  message_id: number
  message_title: string
  public: boolean
}

function Announcements() {
  const { state } = useAppState();
  const [messages, setMessages] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnnouncements()
      .then((m: Announcement[]) => {
        setMessages(m);
        setIsLoading(false);
      });
  }, []);

  return (
    <section id="announcement-section" className="container center">
      <div className="col-6">
        <div className="section-header">
          <h2 data-testid="announcement-header">Announcements</h2>

          <span className="section-actions" data-testid="announcement-section-actions">
            {(state.user?.permissions.manage_announcements || state.is_admin) && <Button style="tertiary" role="link" action="/announcements/new" text="New Announcement" />}
          </span>
        </div>
        <div className="section-body" data-testid="announcement-section-body">
          {isLoading && <LoadingSpinner size="MEDIUM" testId="announcements-spinner" />}

          {!isLoading && messages.map((m) => {
            return (
              <AnnouncementCard author={m.message_author} date={m.message_date} id={m.message_id} title={m.message_title} isPublic={m.public} key={"announcement-" + m.message_id} >
                {parse(m.message_content.replaceAll("\n\n", "</p><p>"))}
              </AnnouncementCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Announcements;