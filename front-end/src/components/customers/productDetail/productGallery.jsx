export default function ProductGallery() {
  return (
    <div className="gallery">
      <div className="primary-media" id="primaryMedia">
        <img src="../img/ip1.jpg" alt="iPhone 16 Pro" id="mainImage" />
      </div>
      <div className="thumbs" id="thumbs">
        {/* Thumbnail buttons (có thể refactor dùng map sau) */}
      </div>
    </div>
  );
}
