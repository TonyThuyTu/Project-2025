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
    if (!img) return "https://shopdunk.com/images/thumbs/0029111_xanh-mong-ket_550.jpeg";
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
    <section className="bg-light">
      <div className="container py-3">
        <div className="row">
          {products.map((product, i) => {
            const mainImg =
              product?.images?.find((img) => img.is_main)?.Img_url ||
              product?.images?.[0]?.Img_url ||
              null;

            const imgUrl = getImageUrl(mainImg);

            return (
              <div key={product.id_products || i} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <a href={`/san-pham/${product.slug || product.id_products}`}>
                    <img
                      src={imgUrl}
                      className="card-img-top p-3 rounded-4"
                      alt={product.products_name}
                      style={{ maxHeight: "220px", objectFit: "contain" }}
                    />
                  </a>
                  <div className="card-body text-center">
                    <h6 className="card-title mb-2">
                      <a
                        href={`/san-pham/${product.slug || product.id_products}`}
                        className="text-decoration-none text-dark fw-bold"
                      >
                        {product.products_name}
                      </a>
                    </h6>
                    <div className="mb-2">
                      <span className="text-danger fw-bold">
                        {formatVND(product.products_sale_price)}
                      </span>{" "}
                      {product.products_market_price && (
                        <span className="text-muted text-decoration-line-through small">
                          {formatVND(product.products_market_price)}
                        </span>
                      )}
                    </div>
                    <a
                      href={`/productDetail/${product.slug || product.id_products}`}
                      className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    >
                      Xem chi tiết
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
