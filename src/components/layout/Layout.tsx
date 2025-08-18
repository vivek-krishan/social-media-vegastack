import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RightSidebar from "./RightSidebar";
interface LayoutProps {
  children: ReactNode;
}
const Layout = ({ children }: LayoutProps) => {
  return (
    <div className='flex h-screen overflow-hidden'>
      <Sidebar />
      <div className='flex flex-col flex-1'>
        <Header />
        <div className='flex flex-1 overflow-hidden'>
          <main className='flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#1A1B21]'>
            {children}
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};
export default Layout;
