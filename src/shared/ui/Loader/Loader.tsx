import { Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function Loader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        gap: 16,
      }}
    >
      <Spin
        indicator={
          <LoadingOutlined style={{ fontSize: 40, color: "#1677ff" }} spin />
        }
      />
      <Text type="secondary">Загрузка...</Text>
    </div>
  );
}
