import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import WebinarAnnouncementModal from "../WebinarAnnouncementModal";

const BasicLayout = () => {
  return (
    <>
      <WebinarAnnouncementModal />
      <Header />
      <div className="flex-grow mt-16" >
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default BasicLayout;