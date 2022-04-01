import { MouseEvent } from "react";
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
        <article className="card announcement-card" data-testid={props.testId}>
            <div className="announcement-card-header">
                <h3>{props.title}</h3>
                {(state.is_admin || state.user?.permissions.manage_announcements) && <ActionMenu actions={[
                    {
                        role: "link",
                        action: "/announcements/edit/" + props.id,
                        text: "Edit"
                    },
                    {
                        role: "button",
                        action: deleteAnnouncement,
                        text: "Delete"
                    }
                ]} /> }
            </div>
            <div className="announcement-card-body">
                {props.children}
            </div>
            <div className="announcement-card-footer">
                <p><em>{props.author} posted <span title={props.date}>{date}</span>.</em></p>
            </div>
        </article>
    );
}

function deleteAnnouncement(e: MouseEvent<HTMLSpanElement>) {
    e.preventDefault();

    window.alert("Not yet impleted");
}

export default AnnouncementCard;