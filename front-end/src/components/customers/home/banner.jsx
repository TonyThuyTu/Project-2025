"use client";
import Image from "next/image";

export default function Banner() {
  return (
    <div className="bannerback">
      <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        {/* Chấm nhỏ điều hướng ảnh */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide-to="0"
            className="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselExample"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
        </div>

        {/* Slide ảnh */}
        <div className="carousel-inner text-center">
          <div className="carousel-item active">
            <Image
              src="/assets/image/thumb iPhone 16 - 2.png"
              className="banner-img"
              alt="Banner 1"
              width={1200}
              height={600}
            />
          </div>
          <div className="carousel-item">
            <Image
              src="/assets/image/Apple-iPhone-16-Pro-Max-Bakal-Ri.png"
              className="banner-img"
              alt="Banner 2"
              width={1200}
              height={600}
            />
          </div>
          <div className="carousel-item">
            <Image
              src="/assets/image/thumb iPhone 16 - 2.png"
              className="banner-img"
              alt="Banner 3"
              width={1200}
              height={600}
            />
          </div>
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
