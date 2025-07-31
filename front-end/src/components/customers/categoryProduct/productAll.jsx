import React from "react";


export default function ProductGrid({ products = [] }) {
  const formatVND = (number) => {
    const value = Number(number);
    if (isNaN(value)) return "0₫";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    });
  };

  const getImageUrl = (img) => {
    if (!img) return "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg";
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads/")) {
      return `http://localhost:5000${img}`;
    }
    return `http://localhost:5000/uploads/${img}`;
  };

  if (!products || products.length === 0) {
    return <div className="text-center py-5">Không có sản phẩm nào.</div>;
  }

  return (
    <section className={products}>
      <div className='grid'>
        {products.map((product, i) => {
          const mainImg =
            product?.images?.find((img) => img.is_main)?.Img_url ||
            product?.images?.[0]?.Img_url ||
            null;

          const imgUrl = getImageUrl(mainImg);

          return (
            <div key={product.id_products || i} className='product-card'>
              <a href={`/productDetail/${product.slug || product.id_products}`}>
                <img src={imgUrl} alt={product.products_name} />
              </a>
              <h3>{product.products_name}</h3>
              <p> Giá chỉ từ {formatVND(product.products_sale_price)}</p>
              <div className="buttons-buy">
                <a href={`/productDetail/${product.slug || product.id_products}`}>
                  Xem chi tiết
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
