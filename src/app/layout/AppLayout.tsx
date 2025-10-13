import { Layout, Breadcrumb, theme } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import { HomeOutlined, LockOutlined, KeyOutlined } from "@ant-design/icons";

const { Content, Footer } = Layout;

export default function AppLayout() {
  const location = useLocation();

  const breadcrumbMap: Record<
    string,
    { label: string; icon?: React.ReactNode }
  > = {
    "/": { label: "Меню", icon: <HomeOutlined /> },
    "/1": { label: "Однократное гаммирование", icon: <LockOutlined /> },
    "/2": { label: "Равнозначные ключи", icon: <KeyOutlined /> },
  };

  const crumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .map((_, i, arr) => {
      const path = "/" + arr.slice(0, i + 1).join("/");
      return { path, ...breadcrumbMap[path] };
    });

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "16px 16px" }}>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item key="home">
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>

          {crumbs.map(
            (crumb) =>
              crumb.label && (
                <Breadcrumb.Item key={crumb.path}>
                  {crumb.icon}
                  <span style={{ marginLeft: 6 }}>{crumb.label}</span>
                </Breadcrumb.Item>
              )
          )}
        </Breadcrumb>

        <div
          style={{
            padding: "24px 0",
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: "calc(100vh - 180px)",
          }}
        >
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: "center", color: "#888" }}>
        © {new Date().getFullYear()} — Insaneee
      </Footer>
    </Layout>
  );
}
