import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

export default function BannerModal({ show, onClose, onSubmit, initialImageUrl, isEdit }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(initialImageUrl || null);
  const [isVideo, setIsVideo] = useState(false);

  useEffect(() => {
    setSelectedFile(null);
    setPreview(initialImageUrl || null);
    setIsVideo(initialImageUrl?.match(/\.(mp4|webm|ogg)$/i) ? true : false);
  }, [show, initialImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setIsVideo(file.type.startsWith("video"));
    }
  };

  const handleSubmit = () => {
    if (!selectedFile && !isEdit) {
      alert("Vui lòng chọn file để upload");
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
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} />
        {preview && (
          <div className="mt-3 text-center">
            {isVideo ? (
              <video
                src={preview}
                controls
                style={{ width: 300, height: 150, objectFit: "cover" }}
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                style={{ width: 300, height: 150, objectFit: "cover" }}
              />
            )}
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
}
