import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import pageViewApi from "../api/pageViewApi";
import { getVisitorId } from "../utils/visitorId";

export default function PageViewTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/admin")) return;
    if (lastTrackedPath.current === path) return;

    const visitorId = getVisitorId();
    if (!visitorId) return;

    lastTrackedPath.current = path;

    pageViewApi.record({ path, visitorId }).catch(() => {
      lastTrackedPath.current = null;
    });
  }, [location.pathname]);

  return null;
}
