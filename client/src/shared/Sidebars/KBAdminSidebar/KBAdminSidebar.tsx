import SidebarItem from "../../SidebarItem/SidebarItem";

export default function KBAdminSidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>Content</h3>
        <SidebarItem text="All Articles" to="/admin/kb" exact />
        <SidebarItem text="Draft Articles" to="/admin/kb/drafts" exact />
        <SidebarItem text="Sections" to="/admin/kb/sections" exact />
      </div>
    </div>
  );
}