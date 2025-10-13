import { useState } from "react";
import { Card, Row, Col, Input, Button, Typography, Divider, Flex } from "antd";
import {
  bytesToHex,
  cp1251Decode,
  cp1251Encode,
  hexToBytes,
  normalizeHex,
  xorBytes,
} from "../../../shared/lib";
import type { ResultState } from "../../../shared/model";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function FirstTaskPageCP1251() {
  const [openText, setOpenText] = useState("");
  const [keyHex, setKeyHex] = useState("");
  const [cipherHex, setCipherHex] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });
  const [keyError, setKeyError] = useState<string | null>(null);
  const [cipherError, setCipherError] = useState<string | null>(null);

  const bytesLenFromText = (s: string) => cp1251Encode(s).length;
  const bytesLenFromHex = (h: string) => {
    try {
      return hexToBytes(normalizeHex(h)).length;
    } catch {
      return 0;
    }
  };

  const clearErrors = () => {
    setKeyError(null);
    setCipherError(null);
  };

  const handleEncrypt = () => {
    clearErrors();
    try {
      const textBytes = cp1251Encode(openText);
      const keyBytes = hexToBytes(normalizeHex(keyHex));
      if (keyBytes.length !== textBytes.length) {
        setKeyError(
          "Длина ключа в байтах должна совпадать с длиной открытого текста."
        );
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content:
            "Длина ключа в байтах должна совпадать с длиной открытого текста.",
        });
        return;
      }
      const cipherBytes = xorBytes(textBytes, keyBytes);
      const cipherHex = bytesToHex(cipherBytes);
      setCipherHex(cipherHex);
      setResult({
        status: "ok",
        heading: "Зашифрованный текст (hex)",
        content: cipherHex,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleFindKey = () => {
    clearErrors();
    try {
      const textBytes = cp1251Encode(openText);
      const cipherBytes = hexToBytes(normalizeHex(cipherHex));
      if (cipherBytes.length !== textBytes.length) {
        setCipherError(
          "Длины шифротекста и открытого текста должны совпадать (в байтах)."
        );
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content:
            "Длины шифротекста и открытого текста должны совпадать (в байтах).",
        });
        return;
      }
      const keyBytes = xorBytes(cipherBytes, textBytes);
      const keyHex = bytesToHex(keyBytes);
      setKeyHex(keyHex);
      setResult({
        status: "ok",
        heading: "Найденный ключ (hex)",
        content: keyHex,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleDecode = () => {
    clearErrors();
    try {
      const cipherBytes = hexToBytes(normalizeHex(cipherHex));
      const keyBytes = hexToBytes(normalizeHex(keyHex));
      if (cipherBytes.length !== keyBytes.length) {
        setKeyError("Длина ключа должна совпадать с длиной шифротекста.");
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content: "Длина ключа должна совпадать с длиной шифротекста.",
        });
        return;
      }
      const textBytes = xorBytes(cipherBytes, keyBytes);
      const decoded = cp1251Decode(textBytes);
      setOpenText(decoded);
      setResult({
        status: "ok",
        heading: "Расшифрованный текст",
        content: decoded,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleSolveMuller = () => {
    clearErrors();
    const mullerCipher =
      "DD FE FF 8F E5 A6 C1 F2 B9 30 CB D5 02 94 1A 38 E5 5B 51 75";
    const target = "СНовымГодом, друзья!";
    setCipherHex(mullerCipher);
    setOpenText(target);
    setKeyHex("");
    setResult({ status: "idle" });
  };

  const handleClearAll = () => {
    clearErrors();
    setCipherHex("");
    setOpenText("");
    setKeyHex("");
    setResult({ status: "idle" });
  };

  const formatKey = () => setKeyHex((k) => normalizeHex(k));
  const formatCipher = () => setCipherHex((c) => normalizeHex(c));

  return (
    <Card style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4}>Режим однократного гаммирования</Title>
          <Paragraph type="secondary">
            Кодировка текста — CP1251 (Windows-1251)
          </Paragraph>
        </Col>

        <Col xs={24} sm={8}>
          <label>
            <b>Открытый текст</b>
          </label>
          <TextArea
            value={openText}
            onChange={(e) => {
              setOpenText(e.target.value);
              setResult({ status: "idle" });
              clearErrors();
            }}
            rows={4}
            placeholder="Введите открытый текст"
          />
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div>
              <small>Длина (байт): {bytesLenFromText(openText)}</small>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <label>
            <b>Ключ (hex)</b>
          </label>
          <TextArea
            value={keyHex}
            onChange={(e) => {
              setKeyHex(e.target.value);
              setKeyError(null);
              setResult({ status: "idle" });
            }}
            rows={4}
            placeholder="AB CD EF ..."
            status={keyError ? "error" : undefined}
          />
          {keyError && (
            <div style={{ color: "#cf1322", marginTop: 8 }}>{keyError}</div>
          )}
          <Flex justify="space-between" style={{ marginTop: 8 }}>
            <small>Длина (байт): {bytesLenFromHex(keyHex)}</small>
            <Button size="small" onClick={formatKey}>
              Формат
            </Button>
          </Flex>
        </Col>

        <Col xs={24} sm={8}>
          <label>
            <b>Шифротекст (hex)</b>
          </label>
          <TextArea
            value={cipherHex}
            onChange={(e) => {
              setCipherHex(e.target.value);
              setCipherError(null);
              setResult({ status: "idle" });
            }}
            rows={4}
            placeholder="AB CD EF ..."
            status={cipherError ? "error" : undefined}
          />
          {cipherError && (
            <div style={{ color: "#cf1322", marginTop: 8 }}>{cipherError}</div>
          )}
          <Flex justify="space-between" style={{ marginTop: 8 }}>
            <small>Длина (байт): {bytesLenFromHex(cipherHex)}</small>
            <Button size="small" onClick={formatCipher}>
              Формат
            </Button>
          </Flex>
        </Col>

        <Col span={24}>
          <Flex gap={16} wrap>
            <Button onClick={handleEncrypt}>Зашифровать (текст+ключ)</Button>
            <Button onClick={handleFindKey}>Найти ключ (текст+шифр)</Button>
            <Button onClick={handleDecode}>Расшифровать (ключ+шифр)</Button>
          </Flex>
          <Flex gap={16} wrap style={{ marginTop: 16 }}>
            <Button type="primary" onClick={handleSolveMuller}>
              Задача Мюллера
            </Button>
            <Button danger onClick={handleClearAll}>
              Очистить поля
            </Button>
          </Flex>
        </Col>

        <Col span={24}>
          <Divider />
          <Title level={5}>Результат</Title>

          {result.status === "error" && (
            <div
              style={{
                background: "#fff1f0",
                border: "1px solid #ffa39e",
                padding: 12,
                borderRadius: 6,
              }}
            >
              <strong style={{ color: "#cf1322" }}>{result.heading}</strong>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {result.content}
              </div>
            </div>
          )}

          {result.status === "ok" && (
            <div>
              <div style={{ color: "#595959", marginBottom: 8 }}>
                {result.heading}
              </div>
              <div
                style={{
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  padding: 12,
                  borderRadius: 6,
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                }}
              >
                {result.content}
              </div>
            </div>
          )}

          {result.status === "idle" && (
            <div style={{ color: "#8c8c8c" }}>Результат появится здесь.</div>
          )}
        </Col>

        <Col span={24}>
          <Divider />
          <Title level={5}>Пояснение</Title>
          <ul>
            <li>
              <b>Зашифровать:</b> текст (CP1251) ⊕ ключ (hex) → шифротекст
              (hex).
            </li>
            <li>
              <b>Найти ключ:</b> шифр (hex) ⊕ текст (CP1251) → ключ (hex).
            </li>
            <li>
              <b>Расшифровать:</b> шифр (hex) ⊕ ключ (hex) → текст (CP1251).
            </li>
          </ul>
        </Col>
      </Row>
    </Card>
  );
}
