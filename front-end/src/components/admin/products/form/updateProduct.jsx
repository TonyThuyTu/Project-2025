import { Modal, Button, Form, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import BasicInfo from "./updateProductComponents/BasicInfo";
import CategorySelector from "./updateProductComponents/CategorySelector";
import DescriptionEditor from "./updateProductComponents/DescriptionEditor";
import SpecEditor from "./updateProductComponents/SpecEditor";
import ImgUploaded from "./updateProductComponents/ImgUploaded";
import OptionsManager from "./updateProductComponents/OptionManager";
import SkuManager from "./updateProductComponents/SkuManager";
import axios from "axios";

export default function EditProductModal({ show, onClose, onUpdate, productData }) {
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [productName, setProductName] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);
  const [status, setStatus] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (productData) {
      setProductName(productData.products_name || '');
      setMarketPrice(productData.products_market_price || '');
      setSalePrice(productData.products_sale_price || '');
      setDescription(productData.products_description || '');
      setSelectedParent(productData.parent_category_id || '');
      setSelectedChild(productData.category_id || '');
      setStatus(productData.products_status || 1);

      try {
        setSpecs(JSON.parse(productData.specs || '[]'));
        setOptions(JSON.parse(productData.attributes || '[]'));
        setSkuList(JSON.parse(productData.variants || '[]'));
      } catch (err) {
        console.warn('Lỗi parse dữ liệu:', err);
      }

      const imageList = (productData.images || []).map(img => ({
        file: null,
        isMain: img.is_main,
        optionKey: img.option_key || '',
        optionValue: img.option_value || '',
        previewUrl: `http://localhost:5000/api/products/uploads/${img.Img_url}`,
        fromServer: true,
      }));
      setImages(imageList);
    }
  }, [productData]);

  const validateForm = () => {
    const categoryId = selectedChild || selectedParent;
    const valid =
      productName.trim() &&
      categoryId &&
      marketPrice && !isNaN(marketPrice) && Number(marketPrice) >= 0 &&
      salePrice && !isNaN(salePrice) && Number(salePrice) >= 0 &&
      images.length > 0;
    setFormValid(!!valid);
    return !!valid;
  };

  useEffect(() => {
    validateForm();
  }, [productName, selectedParent, selectedChild, marketPrice, salePrice, images]);

  const handleUpdate = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      const categoryId = selectedChild || selectedParent;
      const fields = [
        ['products_id', productData.products_id],
        ['products_name', productName],
        ['category_id', categoryId],
        ['products_description', description],
        ['products_market_price', marketPrice],
        ['products_sale_price', salePrice],
        ['specs', JSON.stringify(specs)],
        ['attributes', JSON.stringify(options)],
        ['variants', JSON.stringify(skuList)],
        ['products_status', status],
      ];

      fields.forEach(([key, value]) => formData.append(key, value));

      images.forEach(img => {
        if (!img.fromServer && img.file) {
          formData.append('images', img.file);
          formData.append('isMainFlags', img.isMain);
          formData.append('imageOptionKeys', img.optionKey || '');
          formData.append('imageOptionValues', img.optionValue || '');
        }
      });

      await axios.put('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Cập nhật sản phẩm thành công');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Lỗi cập nhật sản phẩm:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Sửa sản phẩm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Card className="mb-3 p-3">
            <BasicInfo {...{ productName, setProductName, marketPrice, setMarketPrice, salePrice, setSalePrice }} />
          </Card>

          <Card className="mb-3 p-3">
            <DescriptionEditor {...{ description, setDescription }} />
          </Card>

          <Card className="mb-3 p-3">
            <CategorySelector {...{ selectedParent, setSelectedParent, selectedChild, setSelectedChild }} />
          </Card>

          <Card className="mb-3 p-3">
            <SpecEditor {...{ specs, setSpecs }} />
          </Card>

          <Card className="mb-3 p-3">
            <OptionsManager {...{ options, setOptions }} />
          </Card>

          {options.length >= 2 && (
            <Card className="mb-3 p-3">
              <SkuManager {...{ options, skuList, setSkuList }} />
            </Card>
          )}

          <Card className="mb-3 p-3">
            <ImgUploaded {...{ images, setImages }} />
          </Card>

          <div className="mt-3">
            <label className="form-label">Trạng thái sản phẩm</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(Number(e.target.value))}>
              <option value={1}>Đang chờ duyệt</option>
              <option value={2}>Hiển thị</option>
              <option value={3}>Đã ẩn</option>
            </select>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Đóng
        </Button>
        <Button variant="primary" onClick={handleUpdate} disabled={!formValid || isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}