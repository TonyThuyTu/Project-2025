// ProductGallery.jsx
"use client";
import { useEffect } from "react";

export default function ProductGallery({ images = [], mainImage, setMainImage }) {
  useEffect(() => {
    // Khi prop mainImage thay đổi, có thể scroll hoặc làm gì đó nếu cần
  }, [mainImage]);

  if (!images || images.length === 0) {
    return <div className="text-muted">Không có ảnh sản phẩm</div>;
  }

  return (
    <div className="container">
      {/* Ảnh chính */}
      <div className="text-center mb-3">
        <img
          src={mainImage}
          alt="Ảnh sản phẩm chính"
          className="img-fluid rounded border shadow-sm"
          style={{ maxHeight: "500px", objectFit: "contain" }}
        />
      </div>

      {/* Ảnh thumbnail */}
      <div className="row gx-2 justify-content-start">
        {images.map((img, index) => (
          <div className="col-auto" key={index}>
            <img
              src={img}
              alt={`Ảnh nhỏ ${index}`}
              onClick={() => setMainImage(img)}
              className={`img-thumbnail rounded ${img === mainImage ? "border-primary" : "border-secondary"}`}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
