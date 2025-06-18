"use client";
import { useState } from "react";

function formatPrice(price) {
  if (!price) return "";
  const numberPrice = Number(price);
  if (isNaN(numberPrice)) return price;
  return numberPrice.toLocaleString("vi-VN") + " ₫";
}

export default function BasicInfo({ name, price, originalPrice, sizes = [] }) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="col-lg-7 mt-5">
      <div className="card">
        <div className="card-body">
          <h1 className="h2">{name}</h1>
          <p className="h3 py-2 text-success">{formatPrice(price)}</p>
          {originalPrice && (
            <p className="text-muted text-decoration-line-through">
              {formatPrice(originalPrice)}
            </p>
          )}
          
          <div className="row mb-3">
            <div className="col-auto">
              <h6>Số lượng:</h6>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span className="badge bg-secondary">{quantity}</span>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="row pb-3">
            <div className="col d-grid">
              <button className="btn btn-success btn-lg">Mua ngay</button>
            </div>
            <div className="col d-grid">
              <button className="btn btn-outline-success btn-lg">Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
