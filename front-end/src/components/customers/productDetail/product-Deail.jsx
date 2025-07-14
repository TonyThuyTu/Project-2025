"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicInfo from "./productDeatailInfo";
import ProductImg from "./productDeailImg";
import ProductDetailDescription from "./productDetailDescription";

const baseURL = "http://localhost:5000";

export default function ProductDeatail({ product, productId }) {
  const params = useParams();
  const [productData, setProductData] = useState(product || null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imagesForColor, setImagesForColor] = useState([]);
  const [idCustomer, setIdCustomer] = useState(null);

  // ✅ Hàm giải mã token và lấy id_customer
  const getCustomerIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id_customer || null;
    } catch (err) {
      console.error("Không giải mã được token:", err);
      return null;
    }
  };

  // ✅ Lấy id_customer từ token khi mounted
  useEffect(() => {
    const id = getCustomerIdFromToken();
    if (id) setIdCustomer(id);
  }, []);

  // ✅ Fetch sản phẩm nếu chưa có
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && params?.id) {
        try {
          const res = await fetch(`${baseURL}/api/products/${params.id}`);
          const data = await res.json();

          setProductData({
            ...data.product,
            attributes: data.attributes,
            skus: data.skus,
            product_imgs: data.images,
            specs: data.specs,
          });
        } catch (error) {
          console.error("Lỗi khi fetch sản phẩm:", error);
        }
      }
    };
    fetchProduct();
  }, [params?.id, product]);

  // ✅ Cập nhật ảnh theo màu
  useEffect(() => {
    if (!selectedColor || !productData?.attributes) {
      setImagesForColor([]);
      return;
    }

    const colorAttr = productData.attributes.find(
      (attr) => attr.name.toLowerCase() === "màu"
    );
    const colorValue = colorAttr?.values?.find((v) => v.value === selectedColor);

    if (!colorValue?.images?.length) {
      setImagesForColor([]);
      return;
    }

    const validImgs = colorValue.images.filter((img) => img.Img_url?.trim() !== "");
    const sortedImages = validImgs.map((img) =>
      img.Img_url.startsWith("http") ? img.Img_url : baseURL + img.Img_url
    );

    const mainImg = validImgs.find((img) => img.is_main)?.Img_url;
    const mainImgFull = mainImg
      ? mainImg.startsWith("http")
        ? mainImg
        : baseURL + mainImg
      : null;

    const sorted = mainImgFull
      ? [mainImgFull, ...sortedImages.filter((i) => i !== mainImgFull)]
      : sortedImages;

    setImagesForColor(sorted);
  }, [selectedColor, productData]);

  if (!productData) return <div>Đang tải dữ liệu sản phẩm...</div>;

  const allImages = (productData.product_imgs || []).map((img) => {
    const url = img.Img_url || img.image_path || img;
    return url.startsWith("http") ? url : baseURL + url;
  });

  const mainImage =
    imagesForColor.length > 0
      ? imagesForColor[0]
      : allImages.find((img) => img.includes("/uploads/")) || allImages[0] || null;

  return (
    <section className="bg-light">
      <div className="container pb-5">
        <div className="row">
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
            id_product={productData.id_products}
            id_customer={idCustomer}
          />
          <ProductDetailDescription
            products_description={productData.products_description}
            specs={productData.specs}
            faq=""
            id_products={productData.id_products}
          />
        </div>
      </div>
    </section>
  );
}
