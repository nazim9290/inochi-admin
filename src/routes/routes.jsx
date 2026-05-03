// routes.jsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import App from "../App";
import HomePage from "../pages/HomePage";
import AdminDashboard from "../pages/AdminDashboard";
import CreateBlogPage from "../pages/CreateBlogPage";
import BlogsManage from "../pages/BlogsManage";
import LoginComponent from "../components/LoginComponent";
import StudentList from "../pages/StudentList";
import Documen from "../pages/Documen";
import TeamCreate from "../pages/TeamCreate";
import Cert from "../pages/Cert";
import Account from "../pages/Account";
import Branch from "../pages/Branch";
import Certificate from "../pages/Cretificate";
import CreateBrand from "../pages/CreateBrand";
import CertificateSecend from "../pages/CertificateSecend";
import BookingPage from "../pages/BookingPage";
import ContactList from "../pages/ContactList";
import Subscriber from "../pages/Subscriber";
import SiteSettingsEdit from "../pages/SiteSettingsEdit";
import HowItWorksManage from "../pages/HowItWorksManage";
import JlptCoursesManage from "../pages/JlptCoursesManage";
import SuccessStoriesManage from "../pages/SuccessStoriesManage";
import FaqsManage from "../pages/FaqsManage";
import AchievementsManage from "../pages/AchievementsManage";
import Applications from "../pages/Applications";
import Reviews from "../pages/Reviews";
import Newsletter from "../pages/Newsletter";
import Users from "../pages/Users";
import AuditLog from "../pages/AuditLog";

// EN: Removed orphan admin routes 2026-05-03 — pages with no public consumer
//     on the rebuilt site: /create-crusel, /create-video, /create-question,
//     /create-service, /update-session. Source files retained for reference;
//     can be permanently deleted in a follow-up cleanup.
// BN: Public site-এ যেগুলোর কোনো consumer নাই সেগুলো 2026-05-03 সরানো হলো —
//     /create-crusel, /create-video, /create-question, /create-service,
//     /update-session। Source file রেখে দেয়া হয়েছে; পরে চাইলে delete করা যাবে।

const PrivateRoute = ({ element }) => {
  const { state } = useAuth();
  return state.isAuthenticated ? element : <Navigate to="/login" replace />;
};

const routesConfig = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <PrivateRoute element={<AdminDashboard />} /> },
      { path: "/branch-account", element: <PrivateRoute element={<HomePage />} /> },
      { path: "/team-create", element: <PrivateRoute element={<TeamCreate />} /> },
      { path: "/branch", element: <PrivateRoute element={<Branch />} /> },
      { path: "/accounts", element: <PrivateRoute element={<Account />} /> },
      { path: "/create-certificate", element: <PrivateRoute element={<Certificate />} /> },
      { path: "/create-brand", element: <PrivateRoute element={<CreateBrand />} /> },
      { path: "/students", element: <PrivateRoute element={<StudentList />} /> },
      { path: "/create-blog", element: <PrivateRoute element={<CreateBlogPage />} /> },
      { path: "/blogs-manage", element: <PrivateRoute element={<BlogsManage />} /> },
      { path: "/documentation", element: <PrivateRoute element={<Documen />} /> },
      { path: "/semmenr-booklist", element: <PrivateRoute element={<BookingPage />} /> },
      { path: "/contact-list", element: <PrivateRoute element={<ContactList />} /> },
      { path: "/applications", element: <PrivateRoute element={<Applications />} /> },
      { path: "/reviews", element: <PrivateRoute element={<Reviews />} /> },
      { path: "/newsletter", element: <PrivateRoute element={<Newsletter />} /> },
      { path: "/users", element: <PrivateRoute element={<Users />} /> },
      { path: "/audit-log", element: <PrivateRoute element={<AuditLog />} /> },
      { path: "/subscriber-list", element: <PrivateRoute element={<Subscriber />} /> },
      { path: "/certsec", element: <PrivateRoute element={<CertificateSecend />} /> },
      { path: "/site-settings", element: <PrivateRoute element={<SiteSettingsEdit />} /> },
      { path: "/how-it-works", element: <PrivateRoute element={<HowItWorksManage />} /> },
      { path: "/jlpt-courses", element: <PrivateRoute element={<JlptCoursesManage />} /> },
      { path: "/success-stories", element: <PrivateRoute element={<SuccessStoriesManage />} /> },
      { path: "/faqs", element: <PrivateRoute element={<FaqsManage />} /> },
      { path: "/achievements", element: <PrivateRoute element={<AchievementsManage />} /> },
    ],
  },
  { path: "/login", element: <LoginComponent /> },
];

const routes = createBrowserRouter(routesConfig);

export default routes;
