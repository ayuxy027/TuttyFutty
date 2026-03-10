import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const WorkspaceLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default WorkspaceLayout;
