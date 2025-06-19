'use client';
import { useState } from "react";

export default function ProductDetailDescription({
  descriptionHTML = "<p>iPhone 15 Pro</p>",
  specs = [
    { id_spec: 1, spec_name: "ram", spec_value: "8GB" },
    { id_spec: 2, spec_name: "bộ nhớ", spec_value: "256GB" },
  ],
  faq = "<p>Hỏi đáp mẫu</p>"
}) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="tab-container mt-3">
      <div className="tab-buttons" style={{ textAlign: "center", marginBottom: 20 }}>
        <button
          className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
          onClick={() => setActiveTab("description")}
          type="button"
        >
          Mô tả sản phẩm
        </button>
        <button
          className={`tab-btn ${activeTab === "specs" ? "active" : ""}`}
          onClick={() => setActiveTab("specs")}
          type="button"
        >
          Thông số kỹ thuật
        </button>
        <button
          className={`tab-btn ${activeTab === "faq" ? "active" : ""}`}
          onClick={() => setActiveTab("faq")}
          type="button"
        >
          Hỏi đáp
        </button>
      </div>

      <div
        className={`tab-content ${activeTab === "description" ? "active" : ""}`}
        id="description"
      >
        <div dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
      </div>

      <div
        className={`tab-content ${activeTab === "specs" ? "active" : ""}`}
        id="specs"
        style={{ display: activeTab === "specs" ? "block" : "none" }}
        >
        {specs.length === 0 ? (
            <p>Chưa có thông số kỹ thuật</p>
        ) : (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 15px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: "0 auto" }}>
                <tbody>
                {specs.map(({ id_spec, spec_name, spec_value }) => (
                    <tr key={id_spec} style={{ borderBottom: "1px solid #ddd" }}>
                    <td
                        style={{
                        padding: "8px",
                        fontWeight: "600",
                        width: "40%",
                        textTransform: "capitalize",
                        textAlign: "left",
                        }}
                    >
                        {spec_name}
                    </td>
                    <td style={{ padding: "8px", textAlign: "left" }}>{spec_value}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        )}
        </div>
      <div
        className={`tab-content ${activeTab === "faq" ? "active" : ""}`}
        id="faq"
        style={{ display: activeTab === "faq" ? "block" : "none" }}
      >
        <div dangerouslySetInnerHTML={{ __html: faq || "<p>Chưa có câu hỏi nào.</p>" }} />
      </div>
    </div>
  );
}
