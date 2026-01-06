"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, TextArea, Grid, Card, Space, Divider } from "antd-mobile";
import { TextCursorInput, Gift } from "lucide-react";
import html2canvas from "html2canvas";
import "./index.css";
import { safeParseMixedFormat } from "@/utils/callQwenApi";

interface FortuneData {
  title: string;
  content: string;
  copyContent: string;
  luckyColor: {
    name: string;
    hex: string;
  };
  luckyNumber: number;
  luckyDirection: string;
  advice: string;
  areas: Array<{
    name: string;
    stars: string;
  }>;
  requestId?: string;
  generatedAt?: string;
}

export default function HomePage() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [fortuneResult, setFortuneResult] = useState<FortuneData | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hit, setHit] = useState([]);

  const screenshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    thoughtHeart();
  }, []);

  const thoughtHeart = async () => {
    const response = await fetch("/api/thoughtHeart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const rep = await response.json();
    const data = safeParseMixedFormat(rep.message);
    setHit(data.thoughtsInTheHeart);
  };

  const handleHintClick = (text: string) => {
    setInputText(text);
  };

  const fetchFortune = async () => {
    if (!inputText.trim()) {
      return;
    }
    try {
      setIsGenerating(true);
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputText,
          currentYear,
        }),
      });

      const rep = await response.json();
      console.log(rep.message);
      const data = safeParseMixedFormat(rep.message);
      setFortuneResult(data);
      setShowResult(true);
      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }
    } catch (err) {
      console.error("获取运势失败:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateFortune = () => {
    setShowResult(false);
    setInputText("");
  };

  const saveCopyContent = async () => {
    if (!fortuneResult?.copyContent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(fortuneResult.copyContent);

      alert("新年寄语已复制到剪贴板");
    } catch (err) {
      console.error("复制失败:", err);
      alert("复制失败，请手动复制文本");
    }
  };

  const saveFortuneAsImage = async () => {
    if (!screenshotRef.current) {
      return;
    }

    try {
      const canvas = await html2canvas(screenshotRef.current, {
        backgroundColor: "#fff",
        scale: 2,
        useCORS: true,
        logging: false,
        foreignObjectRendering: false,
      });

      const imageUrl = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${currentYear}年新年签.png`;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("保存图片失败:", error);
    }
  };

  const shareFortune = async () => {
    try {
      const currentUrl = window.location.href;

      await navigator.clipboard.writeText(currentUrl);
    } catch (err) {
      console.error("复制链接失败:", err);

      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
        } else {
        }
      } catch (backupErr) {}
    }
  };

  return (
    <div className="new-year-fortune-wrapper">
      {/* 装饰元素 */}
      <div className="background-decorations">
        <div className="lantern left-lantern">
          <div className="lantern-body"></div>
          <div className="lantern-tassel"></div>
        </div>
        <div className="lantern right-lantern">
          <div className="lantern-body"></div>
          <div className="lantern-tassel"></div>
        </div>
        <div className="firework firework-1">
          <TextCursorInput size={40} color="#ff6b6b" />
        </div>
        <div className="firework firework-2">
          <TextCursorInput size={40} color="#4ecdc4" />
        </div>
      </div>

      {/* 将要截图的内容包装在一个 ref 中 */}
      <div className="screenshot-area">
        <div className="content">
          {/* 对联部分 */}
          <div className="couplets-section">
            <div className="couplet left-couplet">
              <div className="couplet-border">
                <div className="couplet-title">辞旧</div>
                <div className="couplet-content">挥别{previousYear}遗憾</div>
                <div className="couplet-content">往事皆清零</div>
              </div>
            </div>

            <div className="couplet-center">
              <div className="main-title">AI新年签</div>
              <div className="year-text">{currentYear}</div>
              <div className="sub-title">预见你的新年运势</div>
            </div>

            <div className="couplet right-couplet">
              <div className="couplet-border">
                <div className="couplet-title">迎新</div>
                <div className="couplet-content">喜迎{currentYear}期待</div>
                <div className="couplet-content">未来皆可期</div>
              </div>
            </div>
          </div>

          {!showResult ? (
            <div className="input-section">
              <Card className="input-container">
                <div className="section-title">写下你的新年愿望</div>
                <TextArea
                  className="wish-input"
                  placeholder={`例如：我希望${currentYear}年事业进步，家人健康，学习新技能...`}
                  value={inputText}
                  onChange={setInputText}
                  maxLength={200}
                  rows={4}
                  autoSize
                />

                <div className="quick-hints">
                  <div className="hints-title">输入你的心中寄语：</div>
                  <Grid columns={1} gap={8}>
                    {hit.map((item, index) => (
                      <Grid.Item key={index}>
                        <div
                          className="hint-tag"
                          onClick={() => handleHintClick(item)}
                        >
                          {item}
                        </div>
                      </Grid.Item>
                    ))}
                  </Grid>
                </div>
              </Card>

              <div className="button-wrapper">
                <Button
                  className="generate-btn"
                  color="primary"
                  loading={isGenerating}
                  onClick={fetchFortune}
                  size="large"
                  block
                >
                  <div>
                    {isGenerating
                      ? "生成中..."
                      : `生成我的${currentYear}新年签`}
                    <Gift style={{ marginLeft: 8 }} />
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="result-section" ref={screenshotRef}>
              <Card className="fortune-card">
                <div className="fortune-header">
                  <div className="fortune-title">{fortuneResult?.title}</div>
                  <div className="fortune-date">{currentYear}年专属运势</div>
                </div>

                <Divider />

                <div className="fortune-content">
                  <div className="fortune-text">{fortuneResult?.content}</div>

                  <Space wrap className="fortune-details">
                    <div className="detail-item">
                      <div className="detail-label">幸运色</div>
                      <div className="detail-value">
                        <div
                          className="color-box"
                          style={{
                            backgroundColor: fortuneResult?.luckyColor.hex,
                          }}
                        />
                        <span>{fortuneResult?.luckyColor.name}</span>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">幸运数字</div>
                      <div className="detail-number">
                        {fortuneResult?.luckyNumber}
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">吉利方位</div>
                      <div className="detail-value">
                        {fortuneResult?.luckyDirection}
                      </div>
                    </div>
                  </Space>

                  <div className="fortune-areas">
                    {fortuneResult?.areas.map((area, index) => (
                      <div key={index} className="area-item">
                        <div className="area-name">{area.name}</div>
                        <div className="area-stars">
                          <span>{area.stars}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="advice-section">
                    <div className="advice-label">新年建议：</div>
                    <div className="advice-text">{fortuneResult?.advice}</div>
                  </div>
                </div>

                <Divider />

                <Grid columns={1} gap={8} className="action-buttons">
                  <Grid.Item>
                    <Button
                      className="action-btn share-btn"
                      color="primary"
                      onClick={shareFortune}
                    >
                      复制链接
                    </Button>
                  </Grid.Item>
                  <Grid.Item>
                    <Button
                      className="action-btn save-btn"
                      onClick={saveCopyContent}
                    >
                      复制新年寄语
                    </Button>
                  </Grid.Item>
                  {/* <Grid.Item>
                    <Button
                      className="action-btn save-btn"
                      onClick={saveFortuneAsImage}
                    >
                      保存为图片
                    </Button>
                  </Grid.Item> */}
                  <Grid.Item>
                    <Button
                      className="action-btn regenerate-btn"
                      onClick={regenerateFortune}
                    >
                      重新生成
                    </Button>
                  </Grid.Item>
                </Grid>
              </Card>

              <div className="fortune-note">
                <div>本结果由AI生成，仅供娱乐参考</div>
                <div>愿您{currentYear}年心想事成，万事如意！</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
