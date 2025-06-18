import Image from "next/image";
import "../../../../public/assets/css/BannerCategory.css"; // Đúng đuôi .css

export default function BannerCategory({ bannerImg, title, subText }) {
  const imageSrc = bannerImg
    ? `http://localhost:5000/uploads/${bannerImg}`
    : "/default-banner.jpg";

  return (
    <div className="banner position-relative mb-4">
      <Image
        src={imageSrc}
        alt={title || "Banner iPhone"}
        width={1200}
        height={400}
        className="banner-image"
        unoptimized
      />
    </div>
  );
}
