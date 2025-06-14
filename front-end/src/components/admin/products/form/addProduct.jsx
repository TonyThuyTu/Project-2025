import { Modal, Button, Form, Card } from "react-bootstrap";
import { useState, useEffect } from "react";
import BasicInfo from "./addProductComponents/BasicInfo";
import CategorySelector from "./addProductComponents/CategorySelector";
import DescriptionEditor from "./addProductComponents/DescriptionEditor";
import SpecEditor from "./addProductComponents/SpecEditor";
import ImgUploaded from "./addProductComponents/ImgUploaded";
import OptionsManager from "./addProductComponents/OptionManager";
import SkuManager from "./addProductComponents/SkuManager";
import axios from "axios";

export default function AddProductModal({ show, onClose, onAdd }) {
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [productName, setProductName] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [images, setImages] = useState([]); // [{ file, isMain, optionKey?, optionValue? }]
  const [specs, setSpecs] = useState([{ name: '', value: '' }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Validate form inputs
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

  // Auto-check valid form on every relevant change
  useEffect(() => {
    validateForm();
  }, [productName, selectedParent, selectedChild, marketPrice, salePrice, images]);

  const handleAdd = async () => {
    if (!validateForm()) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      const categoryId = selectedChild || selectedParent;

      const fields = [
        ['products_name', productName],
        ['category_id', categoryId],
        ['products_description', description],
        ['products_market_price', marketPrice],
        ['products_sale_price', salePrice],
        ['specs', JSON.stringify(specs)],
        ['attributes', JSON.stringify(options)],
        ['variants', JSON.stringify(skuList)],
      ];

      fields.forEach(([key, value]) => formData.append(key, value));

      images.forEach(img => {
        formData.append('images', img.file);
        formData.append('isMainFlags', img.isMain);
        formData.append('imageOptionKeys', img.optionKey || '');
        formData.append('imageOptionValues', img.optionValue || '');
      });
      console.log('Dữ liệu SKU gửi lên:', skuList);
      
      const res = await axios.post('http://localhost:5000/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Thêm sản phẩm thành công');
      onAdd?.();
      onClose();

    } catch (error) {
      console.error('Lỗi thêm sản phẩm:', error);
      alert(`Lỗi: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Thêm sản phẩm mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Card className="mb-3 p-3">
            <BasicInfo
              productName={productName}
              setProductName={setProductName}
              marketPrice={marketPrice}
              setMarketPrice={setMarketPrice}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
            />
          </Card>

          <Card className="mb-3 p-3">
            <DescriptionEditor 
              description={description} 
              setDescription={setDescription} 
            />
          </Card>

          <Card className="mb-3 p-3">
            <CategorySelector
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
            />
          </Card>

          <Card className="mb-3 p-3">
            <SpecEditor specs={specs} setSpecs={setSpecs} />
          </Card>

          <Card className="mb-3 p-3">
            <OptionsManager options={options} setOptions={setOptions} />
          </Card>

          {options.length >= 2 && (
            <Card className="mb-3 p-3">
              <SkuManager
                options={options}
                skuList={skuList}
                setSkuList={setSkuList}
              />
            </Card>
          )}

          <Card className="mb-3 p-3">
            <ImgUploaded images={images} setImages={setImages} />
          </Card>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={!formValid || isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
