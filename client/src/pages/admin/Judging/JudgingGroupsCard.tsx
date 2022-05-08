import { useEffect, useState } from "react";
import ActionMenu from "../../../shared/ActionMenu";
import Button from "../../../shared/Button";
import LoadingSpinner from "../../../shared/LoadingSpinner";
import { Cell, Row, Table, TableBody, TableHead } from "../../../shared/Table";
import useAppState from "../../../state/useAppState";
import { fetchJudgingGroups } from "./fetchData";

type Group = {
  group_id: number
  group_name: string
  is_active: boolean
}

const openCreateGroupModal = () => {

}

const closeCreateGroupModal = () => {

}

const handleCreateGroup = () => {

}

const openEditGroupModal = (id: number) => {

}

const closeEditGroupModal = () => {

}

const handleEditGroup = () => {

}

const openDeleteGroupModal = () => {

}

const closeDeleteGroupModal = () => {

}

const handleDeleteGroup = () => {

}

function JudgingGroupsCard() {
  const { state } = useAppState();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchJudgingGroups()
    .then((data) => {
      setGroups(data.groups);
      setIsLoading(false);
    });
  }, []);

  return (
    <article className="card col-12" style={{paddingBottom: "16px"}}>
      <div className="card-header">
        <h3>Judging Groups</h3>
        {(state.is_admin || state.user?.permissions.manage_judging_groups) &&
          <Button type="tertiary" role="button" action={openCreateGroupModal} text="Create Group" />
        }
      </div>
      <div className="card-body">
        {isLoading && <LoadingSpinner size="MEDIUM" />}

        {!isLoading &&
          <Table noCard>
            <TableHead>
              <Row>
                <Cell header>ID</Cell>
                <Cell header>Name</Cell>
                <Cell header>Status</Cell>
                <Cell header permissions={["manage_judging_groups"]} width="12px"></Cell>
              </Row>
            </TableHead>
            <TableBody>
              {groups.map((g) => {
                return (
                  <Row key={g.group_id}>
                    <Cell>{g.group_id}</Cell>
                    <Cell>{g.group_name}</Cell>
                    <Cell>{g.is_active ? "Active" : "Inactive"}</Cell>
                    {(state.is_admin || state.user?.permissions.manage_judging_groups) ? (
                      <Cell>
                        <ActionMenu
                          actions={[
                            {
                              role: "button",
                              action: openEditGroupModal,
                              text: "Edit",
                              data: g.group_id
                            },
                            {
                              role: "button",
                              action: openDeleteGroupModal,
                              text: "Delete",
                              data: g.group_id
                            }
                          ]}
                        />
                      </Cell>
                    ) : ""}
                  </Row>
                );
              })}
            </TableBody>
          </Table>
        }
      </div>
    </article>
  );
}

export default JudgingGroupsCard;