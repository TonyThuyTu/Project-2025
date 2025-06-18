"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import BannerCategory from "./bannerCategory";
import CategoryChildren from "./categoryChildren";
import ProductFilter from "./productFilter";
import ProductGrid from "./productAll";

export default function ProductList() {
  const params = useParams();
  const categoryName = params?.categoryName; // lấy đúng param theo route

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryName) return;

    const fetchCategoryDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/categories/category-product/${categoryName}`
        );
        setCategoryData(res.data);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setCategoryData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetail();
  }, [categoryName]);

  if (loading) return <div>Đang tải dữ liệu...</div>;
  if (!categoryData) return <div>Không tìm thấy danh mục</div>;

  return (
    <div>
      {/* Banner danh mục cha */}
      <BannerCategory bannerImg={categoryData.img} title={categoryData.name} />

      {/* Danh mục con */}
      <CategoryChildren childrenCategories={categoryData.children} />

      {/* Hiển thị sản phẩm */}
      <ProductFilter name ={categoryData.name}/>
      <ProductGrid products={categoryData.products} />
    </div>
  );
}
