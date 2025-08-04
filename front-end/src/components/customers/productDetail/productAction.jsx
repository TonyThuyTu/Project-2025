import { useState } from "react";

export default function ProductActions({ 
    onBuyNow, 
    onAddToCart, 
    quantity,
    setQuantity, 
    selectedSku
  }) {

  const isDisabled = !selectedSku || selectedSku.quantity <= 0;

  const handleDecrease = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  return (
    <>
      <div className="quantity-wrapper">
        <button 
        type="button" 
        className="btn-qty" 
        onClick={handleDecrease} 
        disabled={isDisabled}>
          –
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="input-qty"
          disabled={isDisabled}
        />
        <button 
        type="button" 
        className="btn-qty" 
        onClick={handleIncrease}
        disabled={isDisabled}
        >
          +
        </button>
      </div>

      <div className="cta d-flex gap-2">
        
        <button
          className="btn btn-primary flex-fill"
          onClick={() => onBuyNow && onBuyNow(quantity)}
          disabled={isDisabled}
        >
          Mua ngay
        </button>

        <button
          className="btn btn-secondary flex-fill"
          onClick={() => onAddToCart && onAddToCart()}
          disabled={isDisabled}
        >
          Thêm vào giỏ
        </button>

      </div>
    </>
  );
}
