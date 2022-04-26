import React from "react";
import TimeAgo from 'javascript-time-ago';
import ActionMenu from '../../shared/ActionMenu';
import "./AnnouncementCard.css";
import useAppState from "../../state/useAppState";

type AnnouncementCardProps = {
  author: string
  date: string
  id: number
  title: string
  isPublic: boolean
  children: React.ReactChild | React.ReactChild[]
  handleDelete: (id: number) => void
  handleEdit: (id: number) => void
  testId?: string
}

/**
 * Renders an announcement message in a card format. Requires an author (string), date (string), 
 * id (number), title (string), isPublic (boolean). The announcement body is passed as a child component.
 * @param props 
 * @returns 
 */
function AnnouncementCard(props: AnnouncementCardProps) {
  const { state } = useAppState();

  const timeAgo = new TimeAgo('en-US')
  const date = timeAgo.format(new Date(props.date));

  return (
    <React.Fragment>
      <article className="card announcement-card" data-testid={props.testId}>
        <div className="card-header">
          <h3>{props.title}</h3>
          {(state.is_admin || state.user?.permissions.manage_announcements) && <ActionMenu actions={[
            {
              role: "button",
              action: props.handleEdit,
              data: props.id,
              text: "Edit"
            },
            {
              role: "button",
              action: props.handleDelete,
              data: props.id,
              text: "Delete"
            }
          ]} />}
        </div>
        <div className="card-body">
          {props.children}
        </div>
        <div className="card-footer announcement-card-footer">
          <p><em>{props.author} posted <span title={props.date}>{date}</span>.</em></p>
        </div>
      </article>
    </React.Fragment>
  );
}

export default AnnouncementCard;