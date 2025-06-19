"use client";
import { useEffect, useState } from "react";

function formatPrice(price) {
  if (!price) return "";
  const numberPrice = Number(price);
  if (isNaN(numberPrice)) return price;
  return numberPrice.toLocaleString("vi-VN") + " ₫";
}

const generateComboKey = (selectedOptions) =>
  Object.entries(selectedOptions)
    .map(([k, v]) => `${k}:${v}`)
    .sort()
    .join("|");

const makeComboKeyFromOptionCombo = (optionCombo) =>
  optionCombo
    .map(({ attribute, value }) => `${attribute}:${value}`)
    .sort()
    .join("|");

export default function BasicInfo({ name, price, originalPrice, attributes = [], variants = [], onColorChange  }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Debug khi attributes load
  useEffect(() => {
    console.log("🔹 Attributes:", attributes);
  }, [attributes]);

  // Debug selectedOptions mỗi khi thay đổi
  useEffect(() => {
    console.log("🔹 Selected Options:", selectedOptions);
  }, [selectedOptions]);

  // Debug selectedVariant mỗi khi thay đổi
  useEffect(() => {
    console.log("🔹 Selected Variant:", selectedVariant);
  }, [selectedVariant]);

  // Cập nhật SKU tương ứng với selectedOptions
  useEffect(() => {
    const comboKey = generateComboKey(selectedOptions);
    console.log("🔹 Generated comboKey:", comboKey);

    const variantMap = variants.reduce((acc, v) => {
      const key = makeComboKeyFromOptionCombo(v.option_combo);
      acc[key] = v;
      return acc;
    }, {});

    console.log("🔹 Variant Map keys:", Object.keys(variantMap));

    setSelectedVariant(variantMap[comboKey] || null);
  }, [selectedOptions, variants]);

  const handleOptionChange = (attributeName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
    
    // Nếu attribute là màu thì báo lên modal cha
    if (attributeName.toLowerCase() === "màu" && onColorChange) {
      onColorChange(value);
    }
  };


  // Tự chọn option đầu tiên mặc định khi attributes load hoặc đổi
  useEffect(() => {
    if (attributes.length && Object.keys(selectedOptions).length === 0) {
      const defaults = {};
      attributes.forEach(attr => {
        if (attr.values.length > 0) {
          defaults[attr.name] = attr.values[0].value;
        }
      });
      console.log("🔹 Setting default selectedOptions:", defaults);
      setSelectedOptions(defaults);
    }
  }, [attributes]);

  return (
    <div className="col-lg-7 mt-4 h-100">
      <div className="card h-100">
        <div className="card-body d-flex flex-column justify-content-between">
          <h1 className="h2">{name}</h1>

          {/* Hiển thị giá từ SKU hoặc mặc định */}
          <p className="h3 py-2 text-success">
            {selectedVariant ? formatPrice(selectedVariant.price) : formatPrice(price)}
          </p>
          {originalPrice && (
            <p className="text-muted text-decoration-line-through">
              {formatPrice(originalPrice)}
            </p>
          )}

          {/* Hiển thị các option */}
          {attributes.map((attr) => (
              <div className="mb-3" key={attr.name}>
                <h6 className="fw-bold">{attr.name}</h6>
                <div className="d-flex flex-wrap gap-2">
                  {attr.values.map((val) => {
                    const isSelected = selectedOptions[attr.name] === val.value;
                    const isColorOption = attr.name.toLowerCase() === "màu";
                    return (
                      <button
                        key={val.value}
                        className={`btn btn-sm p-0 ${
                          isSelected ? "border border-3 border-success" : "border border-1 border-secondary"
                        }`}
                        onClick={() => handleOptionChange(attr.name, val.value)}
                        style={{
                          backgroundColor: isColorOption ? val.value : undefined,
                          width: 40,
                          height: 40,
                          borderRadius: isColorOption ? "50%" : undefined,
                          cursor: "pointer",
                        }}
                        title={isColorOption ? val.value : ""}
                      >
                        {!isColorOption && val.value}
                      </button>
                    );
                  })}
                </div>
              </div>
          ))}

          {/* Số lượng */}
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
            {selectedVariant && (
              <div className="col-auto d-flex align-items-end">
                <span className="text-muted">(Còn {selectedVariant.quantity} sản phẩm)</span>
              </div>
            )}
          </div>

          {/* Nút hành động */}
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
