"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicInfo from "./productDeatailInfo";
import ProductImg from "./productDeailImg";
import RelatedProducts from "./productDetailSameProduct";

export default function ProductDeatail({ product, productId }) {
  const [productData, setProductData] = useState(product || null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const params = useParams();

  // Fetch sản phẩm chi tiết nếu không truyền từ props
  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!product && params?.id) {
          const res = await fetch(`http://localhost:5000/api/products/${params.id}`);
          const data = await res.json();
          setProductData(data.product);
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }
    fetchProduct();
  }, [params?.id, product]);

  // Fetch sản phẩm cùng loại
  useEffect(() => {
    if (productData?.id_products && productData?.category?.category_id) {
      fetch(`http://localhost:5000/api/products/same-products/${productData.id_products}/same`)
        .then((res) => res.json())
        .then((data) => setRelatedProducts(data))
        .catch((err) => console.error("Lỗi khi fetch sản phẩm cùng loại:", err));
    } else {
      console.log("❌ Không có category để tìm sản phẩm cùng loại.");
      setRelatedProducts([]);
    }
  }, [productData]);

  if (!productData) return <div>Đang tải dữ liệu sản phẩm...</div>;

  return (
    <section className="bg-light">
      <div className="container pb-5">
        <div className="row">
          <ProductImg
            images={productData.product_imgs || []}
            mainImage={
              productData.product_imgs?.find((img) => img.is_main === 1)?.image_path || ""
            }
          />
          <BasicInfo
            name={productData.products_name}
            price={productData.products_sale_price}
            originalPrice={productData.products_market_price}
          />
          <RelatedProducts products={relatedProducts || []} />
        </div>
      </div>
    </section>
  );
}
