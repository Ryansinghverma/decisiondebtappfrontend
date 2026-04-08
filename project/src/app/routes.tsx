import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { AddDecision } from "./pages/AddDecision";
import { ReviewDecision } from "./pages/ReviewDecision";
import { Insights } from "./pages/Insights";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "decisions/new", Component: AddDecision },
      { path: "decisions/:id/review", Component: ReviewDecision },
      { path: "insights", Component: Insights },
      { path: "profile", Component: Profile },
    ],
  },
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
]);
