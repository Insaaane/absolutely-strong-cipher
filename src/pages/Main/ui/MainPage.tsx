import { Card, Row, Col, Typography } from "antd";
import { Link } from "react-router-dom";
import { LockOutlined, KeyOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function MenuPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <Card>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={3} style={{ marginBottom: 0 }}>
              Выберите страницу
            </Title>
            <Paragraph type="secondary" style={{ marginTop: 6 }}>
              Нажмите на карточку задачи, чтобы перейти к её реализации.
            </Paragraph>
          </Col>

          <Col xs={24} sm={12}>
            <Link to="/1" style={{ textDecoration: "none" }}>
              <Card hoverable style={{ cursor: "pointer" }}>
                <Card.Meta
                  avatar={
                    <LockOutlined style={{ fontSize: 28, color: "#1890ff" }} />
                  }
                  title={
                    <Title level={5} style={{ margin: 0 }}>
                      Однократное гаммирование
                    </Title>
                  }
                  description={
                    <Paragraph style={{ marginTop: 8 }}>
                      Страница для шифрования/дешифровывания в режиме
                      одноразовой гаммы (CP1251 / hex).
                    </Paragraph>
                  }
                />
              </Card>
            </Link>
          </Col>

          <Col xs={24} sm={12}>
            <Link to="/2" style={{ textDecoration: "none" }}>
              <Card hoverable style={{ cursor: "pointer" }}>
                <Card.Meta
                  avatar={
                    <KeyOutlined style={{ fontSize: 28, color: "#52c41a" }} />
                  }
                  title={
                    <Title level={5} style={{ margin: 0 }}>
                      Равнозначные ключи
                    </Title>
                  }
                  description={
                    <Paragraph style={{ marginTop: 8 }}>
                      Интерфейс генерации группы равнозначных ключей, их
                      сохранения и использования для шифрования/дешифровывания.
                    </Paragraph>
                  }
                />
              </Card>
            </Link>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
