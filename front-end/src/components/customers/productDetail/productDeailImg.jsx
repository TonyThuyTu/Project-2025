// components/ProductDetail/ProductImg.jsx
'use client';
import { useState } from "react";

export default function ProductImg({ images = [], mainImage = "" }) {
  const [selectedImage, setSelectedImage] = useState(mainImage || images[0]);

  return (
    <div className="col-lg-5 mt-5">
      <div className="card mb-3">
        <img
          className="card-img img-fluid"
          src={selectedImage}
          alt="Main Product"
        />
      </div>

      <div className="row">
        <div className="col-1 align-self-center">
          <i className="text-dark fas fa-chevron-left"></i>
        </div>

        <div className="col-10">
          <div className="row">
            {images.map((img, index) => (
              <div className="col-4" key={index}>
                <img
                  src={img}
                  className="card-img img-fluid"
                  alt={`Preview ${index}`}
                  onClick={() => setSelectedImage(img)}
                  style={{ cursor: "pointer", border: selectedImage === img ? '2px solid #28a745' : 'none' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="col-1 align-self-center">
          <i className="text-dark fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  );
}
