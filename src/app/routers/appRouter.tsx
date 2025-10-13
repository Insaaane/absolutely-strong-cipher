import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { FirstTaskPage } from "../../pages/FirstTask";
import { SecondTaskPage } from "../../pages/SecondTask";
import { MainPage } from "../../pages/Main";
import { AppLayout } from "../layout";
import { NotFoundPage } from "../../pages/NotFound";
import { Loader } from "../../shared/ui";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: "1", element: <FirstTaskPage /> },
      { path: "2", element: <SecondTaskPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
