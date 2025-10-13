import { useState } from "react";
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Radio,
  Select,
  Flex,
} from "antd";
import {
  bytesToHex,
  cp1251Decode,
  cp1251Encode,
  generateRandomBytes,
  hexToBytes,
  makeVariantsFromKey,
  normalizeHex,
  variantToKeyBytes,
  xorBytes,
} from "../../../shared/lib";
import type { ResultState } from "../../../shared/model";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function SecondTaskPageAntD() {
  const [keyLen, setKeyLen] = useState<number>(16);
  const [keyHex, setKeyHex] = useState<string>("");
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const [plainText, setPlainText] = useState<string>("");
  const [cipherHex, setCipherHex] = useState<string>("");

  const [keySource, setKeySource] = useState<string>("original");
  const [decryptedKeyHex, setDecryptedKeyHex] = useState<string>("");

  const [variantCipherInput, setVariantCipherInput] = useState<string>("");
  const [variantDecryptMsg, setVariantDecryptMsg] = useState<{
    status: "idle" | "error";
    text?: string;
  }>({ status: "idle" });

  const [result, setResult] = useState<ResultState>({ status: "idle" });
  const [keyError, setKeyError] = useState<string | null>(null);

  const [groupCount, setGroupCount] = useState<number>(10);

  /* Actions */
  const handleGenerateKey = () => {
    setResult({ status: "idle" });
    setKeyError(null);
    if (!(keyLen > 0 && keyLen <= 1024)) {
      setKeyError("Длина должна быть от 1 до 1024 байт");
      return;
    }
    const keyBytes = generateRandomBytes(keyLen);
    const keyHex = bytesToHex(keyBytes);
    setKeyHex(keyHex);
    setVariants([]);
    setSelectedVariant(null);
    setDecryptedKeyHex("");
    setVariantCipherInput("");
    setVariantDecryptMsg({ status: "idle" });
  };

  const handleGenerateGroup = () => {
    try {
      if (!keyHex) {
        setResult({
          status: "error",
          heading: "Ошибка",
          content: "Сначала сгенерируйте или введите ключ.",
        });
        return;
      }

      let keyBytes: number[];
      try {
        keyBytes = hexToBytes(normalizeHex(keyHex));
      } catch (e) {
        setKeyError("Неверный hex");
        setResult({
          status: "error",
          heading: "Ошибка ключа",
          content: (e as Error).message,
        });
        return;
      }

      const count = Math.max(1, Math.min(1000, Math.floor(groupCount) || 10));
      const variants = makeVariantsFromKey(keyBytes, count);
      setVariants(variants);
      setSelectedVariant(null);
      setResult({
        status: "ok",
        heading: "Группа ключей сгенерирована",
        content: `Сгенерировано ${variants.length} вариантов`,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleDownloadGroup = () => {
    if (!variants.length) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: "Группа пуста",
      });
      return;
    }
    const payload = { createdAt: new Date().toISOString(), variants };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "key-group.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setResult({
      status: "ok",
      heading: "Скачивание",
      content: "Файл key-group.json подготовлен для скачивания",
    });
  };

  const handleDecryptVariant = () => {
    setVariantDecryptMsg({ status: "idle" });
    try {
      if (!variantCipherInput)
        throw new Error("Поле зашифрованного ключа пустое");
      const keyBytes = variantToKeyBytes(normalizeHex(variantCipherInput));
      const keyHex = bytesToHex(keyBytes);
      setDecryptedKeyHex(keyHex);
      setVariantDecryptMsg({ status: "idle" });
      setResult({ status: "idle" });
    } catch (e) {
      setVariantDecryptMsg({ status: "error", text: (e as Error).message });
    }
  };

  const handleClearAll = () => {
    setPlainText("");
    setCipherHex("");
    setKeyHex("");
    setVariants([]);
    setSelectedVariant(null);
    setDecryptedKeyHex("");
    setVariantCipherInput("");
    setVariantDecryptMsg({ status: "idle" });
    setResult({ status: "idle" });
    setKeyError(null);
  };

  function resolveKeyBytes(): number[] {
    if (keySource === "original") {
      if (!keyHex) throw new Error("Оригинальный ключ пуст");
      try {
        return hexToBytes(normalizeHex(keyHex));
      } catch {
        throw new Error("Неверный hex");
      }
    }
    if (keySource === "manual") {
      if (!decryptedKeyHex)
        throw new Error(
          "Поле «Расшифрованный ключ» пустое — расшифруйте вариант или вставьте ключ."
        );
      try {
        return hexToBytes(normalizeHex(decryptedKeyHex));
      } catch {
        throw new Error("Неверный hex в расшифрованном ключе");
      }
    }
    if (keySource === "variant") {
      if (selectedVariant === null)
        throw new Error("Не выбран вариант из группы");
      return variantToKeyBytes(variants[selectedVariant]);
    }
    if (keySource === "randomVariant") {
      if (variants.length === 0) throw new Error("Группа пустая");
      const idx = Math.floor(Math.random() * variants.length);
      return variantToKeyBytes(variants[idx]);
    }
    throw new Error("Неизвестный источник ключа");
  }

  const handleEncrypt = () => {
    setResult({ status: "idle" });
    setKeyError(null);
    try {
      const textBytes = cp1251Encode(plainText);
      const keyBytes = resolveKeyBytes();
      if (keyBytes.length !== textBytes.length) {
        setKeyError("Длина ключа (в байтах) должна совпадать с длиной текста");
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content: "Длина ключа (в байтах) должна совпадать с длиной текста",
        });
        return;
      }
      const cipherBytes = xorBytes(textBytes, keyBytes);
      const chex = bytesToHex(cipherBytes);
      setCipherHex(chex);
      setResult({
        status: "ok",
        heading: "Зашифрованный текст (hex)",
        content: chex,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleDecrypt = () => {
    setResult({ status: "idle" });
    setKeyError(null);
    try {
      const cipherBytes = hexToBytes(normalizeHex(cipherHex));
      const keyBytes = resolveKeyBytes();
      if (keyBytes.length !== cipherBytes.length) {
        setKeyError("Длина ключа должна совпадать с длиной шифротекста");
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content: "Длина ключа должна совпадать с длиной шифротекста",
        });
        return;
      }
      const textBytes = xorBytes(cipherBytes, keyBytes);
      const text = cp1251Decode(textBytes);
      setPlainText(text);
      setResult({
        status: "ok",
        heading: "Расшифрованный текст",
        content: text,
      });
    } catch (e) {
      setResult({
        status: "error",
        heading: "Ошибка",
        content: (e as Error).message,
      });
    }
  };

  const handleDeriveKey = () => {
    setResult({ status: "idle" });
    setKeyError(null);
    try {
      const cipherBytes = hexToBytes(normalizeHex(cipherHex));
      const textBytes = cp1251Encode(plainText);
      if (cipherBytes.length !== textBytes.length) {
        setResult({
          status: "error",
          heading: "Ошибка длины",
          content:
            "Длины шифротекста и открытого текста должны совпадать (в байтах)",
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

  return (
    <Card style={{ maxWidth: 1300, margin: "0 auto" }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4}>Генерация равнозначных ключей</Title>
          <Paragraph type="secondary">
            Сгенерируйте случайный ключ, создайте группу из вариантов, скачайте
            её и используйте варианты для шифрования/дешифровывания.
          </Paragraph>
        </Col>

        <Col xs={24} sm={4}>
          <label>
            <b>Длина ключа (байт)</b>
          </label>
          <Input
            value={keyLen}
            onChange={(e) => setKeyLen(Number(e.target.value))}
            type="number"
            min={1}
            max={1024}
          />
          <div style={{ marginTop: 8 }}>
            <Button onClick={handleGenerateKey}>Сгенерировать ключ</Button>
          </div>
        </Col>

        <Col xs={24} sm={4}>
          <Flex vertical>
            <label style={{ marginRight: 8 }}>
              <b>Кол-во вариантов</b>
            </label>
            <Input
              type="number"
              value={groupCount}
              onChange={(e) =>
                setGroupCount(
                  Math.max(1, Math.min(1000, Number(e.target.value)))
                )
              }
              min={1}
              max={1000}
            />
            <small style={{ color: "#888" }}>1–1000</small>
          </Flex>
        </Col>

        <Col xs={24} sm={16}>
          <label>
            <b>Оригинальный ключ (hex)</b>
          </label>
          <TextArea
            value={keyHex}
            onChange={(e) => {
              setKeyHex(e.target.value);
              setResult({ status: "idle" });
              setKeyError(null);
            }}
            rows={2}
            placeholder="(будет заполнен при генерации)"
            status={keyError ? "error" : undefined}
          />
          {keyError && (
            <div style={{ color: "#cf1322", marginTop: 8 }}>{keyError}</div>
          )}
          <div style={{ marginTop: 8 }}>
            <Flex gap={12} wrap>
              <Button onClick={handleGenerateGroup} disabled={!keyHex}>
                Сформировать группу ({groupCount})
              </Button>
              <Button
                onClick={handleDownloadGroup}
                disabled={variants.length === 0}
              >
                Скачать группу
              </Button>
              <Button
                onClick={() => {
                  setKeyHex(normalizeHex(keyHex));
                }}
              >
                Формат
              </Button>
            </Flex>
          </div>
        </Col>

        <Col span={24}>
          <Divider />
          <Row gutter={[24, 12]}>
            <Col xs={24} md={10}>
              <Flex vertical>
                <label style={{ marginBottom: 8 }}>
                  <b>Источник ключа</b>
                </label>
                <Radio.Group
                  value={keySource}
                  onChange={(e) => setKeySource(e.target.value)}
                >
                  <Space direction="vertical">
                    <Radio value={"original"}>Оригинальный ключ</Radio>
                    <Radio value={"variant"} disabled={variants.length === 0}>
                      Выбранный вариант из группы
                    </Radio>
                    <Radio
                      value={"randomVariant"}
                      disabled={variants.length === 0}
                    >
                      Случайный вариант из группы
                    </Radio>
                    <Radio value={"manual"}>Расшифрованный ключ</Radio>
                  </Space>
                </Radio.Group>
              </Flex>

              {keySource === "variant" && (
                <div style={{ marginTop: 8 }}>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Выберите вариант"
                    value={
                      selectedVariant === null ? undefined : selectedVariant
                    }
                    onChange={(variant: number) => setSelectedVariant(variant)}
                  >
                    {variants.map((vv, idx) => (
                      <Select.Option key={idx} value={idx}>
                        <b>Вариант #{idx + 1} —</b> {vv.slice(0, 23)}...
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <label>
                  <b>Зашифрованный ключ (hex)</b>
                </label>
                <TextArea
                  rows={2}
                  value={variantCipherInput}
                  onChange={(e) => {
                    setVariantCipherInput(e.target.value);
                    setVariantDecryptMsg({ status: "idle" });
                  }}
                  placeholder="Вставьте зашифрованный ключ"
                />
                <div style={{ marginTop: 8 }}>
                  <Flex justify="space-between">
                    <Button size="small" onClick={handleDecryptVariant}>
                      Расшифровать ключ
                    </Button>
                    <Button
                      size="small"
                      onClick={() =>
                        setVariantCipherInput(normalizeHex(variantCipherInput))
                      }
                    >
                      Формат
                    </Button>
                  </Flex>
                </div>
                {variantDecryptMsg.status === "error" && (
                  <div style={{ color: "#cf1322", marginTop: 8 }}>
                    {variantDecryptMsg.text}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16 }}>
                <label>
                  <b>Расшифрованный ключ (hex)</b>
                </label>
                <TextArea
                  rows={2}
                  value={decryptedKeyHex}
                  readOnly
                  placeholder="Здесь появится расшифрованный ключ"
                />
              </div>
            </Col>

            <Col xs={24} md={14}>
              <label>
                <b>Группа вариантов ({variants.length} шт.)</b>
              </label>
              <div
                style={{
                  maxHeight: 300,
                  overflow: "auto",
                  padding: 8,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  background: "#fafafa",
                }}
              >
                {variants.length === 0 && (
                  <div style={{ color: "#888" }}>
                    Пусто — сформируйте группу.
                  </div>
                )}
                {variants.map((variant, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: 6,
                      borderBottom: "1px dashed #eee",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontFamily: "monospace" }}>{variant}</div>
                    <div style={{ marginLeft: 12 }}>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedVariant(idx);
                          setKeySource("variant");
                          setResult({ status: "idle" });
                          setVariantCipherInput(variant);
                        }}
                      >
                        Выбрать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Divider />
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <label>
                <b>Открытый текст (ввод)</b>
              </label>
              <TextArea
                rows={4}
                value={plainText}
                onChange={(e) => {
                  setPlainText(e.target.value);
                  setResult({ status: "idle" });
                }}
                placeholder="Введите текст для шифрования"
              />
              <div style={{ marginTop: 8 }}>
                <small>Длина (байт): {cp1251Encode(plainText).length}</small>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <label>
                <b>Шифротекст (hex)</b>
              </label>
              <TextArea
                rows={4}
                value={cipherHex}
                onChange={(e) => {
                  setCipherHex(e.target.value);
                  setResult({ status: "idle" });
                }}
                placeholder="Введите/получите шифротекст"
              />
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <small>
                  Длина (байт):{" "}
                  {cipherHex ? hexToBytes(normalizeHex(cipherHex)).length : 0}
                </small>
                <div>
                  <Button
                    size="small"
                    onClick={() => setCipherHex(normalizeHex(cipherHex))}
                  >
                    Формат
                  </Button>
                </div>
              </div>
            </Col>

            <Col span={24}>
              <Flex gap={12} wrap>
                <Button onClick={handleEncrypt}>
                  Зашифровать (текст+ключ)
                </Button>
                <Button onClick={handleDeriveKey}>
                  Найти ключ (текст+шифр)
                </Button>
                <Button onClick={handleDecrypt}>
                  Расшифровать (ключ+шифр)
                </Button>
                <Button
                  danger
                  onClick={handleClearAll}
                  style={{ marginLeft: "auto" }}
                >
                  Очистить все поля
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
                <div style={{ color: "#8c8c8c" }}>
                  Результат появится здесь.
                </div>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}
