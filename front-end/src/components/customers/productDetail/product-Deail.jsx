"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicInfo from "./productDeatailInfo";
import ProductImg from "./productDeailImg";
import ProductDetailDescription from "./productDetailDescription";

export default function ProductDeatail({ product, productId }) {
  const [productData, setProductData] = useState(product || null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imagesForColor, setImagesForColor] = useState([]);
  const params = useParams();

  const baseURL = "http://localhost:5000";

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (!product && params?.id) {
          const res = await fetch(`http://localhost:5000/api/products/${params.id}`);
          const data = await res.json();

          setProductData({
            ...data.product,
            attributes: data.attributes,
            skus: data.skus,
            product_imgs: data.images,
            specs:data.specs
          });
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    }
    fetchProduct();
  }, [params?.id, product]);

  useEffect(() => {
    if (!selectedColor || !productData?.attributes) {
      setImagesForColor([]);
      return;
    }

    const colorAttr = productData.attributes.find(
      (attr) => attr.name.toLowerCase() === "màu"
    );
    if (!colorAttr) {
      setImagesForColor([]);
      return;
    }

    const colorValue = colorAttr.values.find((v) => v.value === selectedColor);
    if (!colorValue || !colorValue.images || colorValue.images.length === 0) {
      setImagesForColor([]);
      return;
    }

    // 👉 Lọc ảnh có Img_url hợp lệ
    const validImgs = colorValue.images.filter(img => img.Img_url && img.Img_url.trim() !== "");

    const sortedImages = validImgs.map(img =>
      img.Img_url.startsWith("http") ? img.Img_url : baseURL + img.Img_url
    );

    const mainImg = validImgs.find(img => img.is_main)?.Img_url;
    const mainImgFull = mainImg
      ? (mainImg.startsWith("http") ? mainImg : baseURL + mainImg)
      : null;

    const sorted = mainImgFull
      ? [mainImgFull, ...sortedImages.filter(i => i !== mainImgFull)]
      : sortedImages;

    setImagesForColor(sorted);
  }, [selectedColor, productData]);

  if (!productData) return <div>Đang tải dữ liệu sản phẩm...</div>;

  const allImages = (productData.product_imgs || []).map(img => {
    const url = img.Img_url || img.image_path || img;
    return url.startsWith("http") ? url : baseURL + url;
  });

  const mainImage =
    imagesForColor.length > 0
      ? imagesForColor[0]
      : allImages.find(img => img.includes("/uploads/")) || allImages[0] || null;

  return (
    <section className="bg-light">
      <div className="container pb-5">
        <div className="row ">
          <ProductImg
            images={imagesForColor.length > 0 ? imagesForColor : allImages}
            mainImage={mainImage}
            attributes={productData.attributes || []}
            selectedColor={selectedColor}
          />
          <BasicInfo
            name={productData.products_name}
            price={productData.products_sale_price}
            originalPrice={productData.products_market_price}
            attributes={productData.attributes || []}
            variants={productData.skus || []}
            onColorChange={setSelectedColor}
          />
          <ProductDetailDescription 
          products_description = {productData.products_description}
          specs={productData.specs}
          faq=""
          id_products={productData.id_products}
          />
        </div>
      </div>
    </section>
  );
}
