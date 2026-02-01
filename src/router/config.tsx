import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import BrowsePage from "../pages/browse/page";
import JobDetailPage from "../pages/job-detail/page";
import RegisterPage from "../pages/register/page";
import DashboardPage from "../pages/dashboard/page";
import InterviewPage from "../pages/interview/page";
import ChatPage from "../pages/chat/page";
import BriefingPage from "../pages/briefing/page";
import OnboardingPage from "../pages/onboarding/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/browse",
    element: <BrowsePage />,
  },
  {
    path: "/job/:id",
    element: <JobDetailPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/interview",
    element: <InterviewPage />,
  },
  {
    path: "/chat",
    element: <ChatPage />,
  },
  {
    path: "/briefing",
    element: <BriefingPage />,
  },
  {
    path: "/onboarding",
    element: <OnboardingPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
