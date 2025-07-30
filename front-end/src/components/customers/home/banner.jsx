"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

export default function Banner() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/banner");
        setBanners(res.data);
      } catch (error) {
        console.error("Lỗi khi tải banner:", error);
      }
    };

    fetchBanners();
  }, []);

  if (banners.length === 0) {
    return <div className="text-center py-5">Đang tải banner...</div>;
  }

  return (
    <div className="bannerback">
      <div
        id="carouselExample"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        {/* Indicators */}
        <div className="carousel-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#carouselExample"
              data-bs-slide-to={index}
              className={index === 0 ? "active" : ""}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>

        {/* Slide ảnh */}
        <div className="carousel-inner">
          {banners.map((banner, index) => (
            <div
              key={banner.id_banner}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={`http://localhost:5000/uploads/${banner.banner_img}`}
                alt={`Banner ${banner.id_banner}`}
                className="d-block w-100 banner-img"
              />
            </div>
          ))}
        </div>

        {/* Nút điều hướng */}
        <button
          className="carousel-control-prev custom-nav"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next custom-nav"
          type="button"
          data-bs-target="#carouselExample"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
}
