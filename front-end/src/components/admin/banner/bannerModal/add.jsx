import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

export default function BannerModal  ({ show, onClose, onSubmit, initialImageUrl, isEdit })  {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl || null);

  useEffect(() => {
    // Khi mở modal reset file & preview (khi sửa thì preview là ảnh cũ)
    setSelectedFile(null);
    setPreview(initialImageUrl || null);
  }, [show, initialImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Vui lòng chọn ảnh để upload");
      return;
    }
    onSubmit(selectedFile);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Sửa Banner" : "Thêm Banner"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <div className="mt-3 text-center">
            <img
              src={preview}
              alt="preview"
              style={{ width: 300, height: 150, objectFit: "cover" }}
            />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


