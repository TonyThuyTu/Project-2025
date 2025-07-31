"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import '../../../../public/assets/css/productDetail.css';
import ProductActions from "./productAction";
import ProductDescription from "./productDescription";
import ProductGallery from "./productGallery";
import ProductReview from "./productReview";
import ProductSpec from "./productSpec";
import ProductOptions from "./productOptions";
import ProductTitle from "./productTitle";

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
        <>
          <ProductTitle 
            name = {productData.products_name}
            title = {productData.products_shorts}
          />
            <section className="container split" id="buy">
              <ProductGallery />
              <aside className="purchase" aria-labelledby="configHeading">
                <ProductOptions />
                <ProductActions />
              </aside>
            </section>
          <ProductDescription 
            description = {productData.products_description}
          />
          <ProductSpec
            specs = {productData.specs} 
          />
          <ProductReview
            id_products={params.id}
            id_customer={idCustomer}
          />
        </>
       );
}
