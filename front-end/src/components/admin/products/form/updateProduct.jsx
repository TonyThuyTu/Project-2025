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
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [images, setImages] = useState([]);
  const [specs, setSpecs] = useState([]);
  const [status, setStatus] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValid, setFormValid] = useState(false);

  function getOptionCombinations(arr) {
    if (!arr.length) return [];
    if (arr.length === 1) return arr[0].map(v => [v]);

    const result = [];
    const restCombinations = getOptionCombinations(arr.slice(1));
    for (const value of arr[0]) {
      for (const combo of restCombinations) {
        result.push([value, ...combo]);
      }
    }
    return result;
  }
  useEffect(() => {
    if (!productData) return;

    const product = productData.product || productData;

    setProductName(product.products_name || "");
    setMarketPrice(product.products_market_price?.toString() || "");
    setSalePrice(product.products_sale_price?.toString() || "");
    setDescription(product.products_description || "");
    setStatus(
      typeof product.products_status === "number"
        ? product.products_status
        : product.products_status === true
          ? 2
          : 1
    );

    const { category } = productData;
    setSelectedChild(category?.category_id || null);
    setSelectedParent(category?.parent?.category_id || null);

    const normalizedSpecs = (productData.specs || []).map((spec) => ({
      name: spec.spec_name || "",
      value: spec.spec_value || "",
      id_spec: spec.id_spec || null,
    }));
    setSpecs(normalizedSpecs);

    // Chuẩn hóa options
    const normalizedAttributes = (productData.attributes || []).map((attr) => ({
      attribute_id: attr.attribute_id,
      name: attr.attribute_name || `Option ${attr.attribute_id}`,
      type: attr.type || "text",
      values: (attr.values || []).map((val) => ({
        value_id: val.value_id,
        label: val.value || "",
        value: val.value || "",
        extraPrice: val.extra_price || 0,
        quantity: val.quantity || 0,
        status: val.status ?? 2,
        color_code: val.color_code || "",
        images: (val.images || []).map((img) => ({
          url: img.Img_url?.startsWith("/uploads")
            ? `http://localhost:5000${img.Img_url}`
            : img.Img_url,
          isMain: img.is_main || 2,
          fromServer: true,
        })),
      })),
    }));
    setOptions(normalizedAttributes);

    // Helper sinh tổ hợp
    function getCombinations(matrix, prefix = []) {
      if (matrix.length === 0) return [prefix];
      const [first, ...rest] = matrix;
      return first.flatMap(val => getCombinations(rest, [...prefix, val]));
    }

    // Tạo tổ hợp giá trị từ attributes
    const valueMatrix = normalizedAttributes.map(opt => opt.values.map(v => v.value));
    const allCombos = getCombinations(valueMatrix);

    // Tạo map lookup từ option_combo
    const skuMap = new Map(
      (productData.skus || []).map(sku => {
        const key = JSON.stringify(sku.option_combo?.map(opt => opt.value) || []);
        return [key, sku];
      })
    );

    // Tạo SKU list hợp lệ
    const newSkuList = allCombos.map(comboValues => {
      const key = JSON.stringify(comboValues);
      const sku = skuMap.get(key);

      const combo = comboValues.map((val, index) => {
        const option = normalizedAttributes[index];
        const valueItem = option?.values?.find(v => v.value === val);
        return {
          value: val,
          label: valueItem?.label || val,
          optionName: option?.name || '',
        };
      });

      return {
        combo,
        price: sku?.price || 0,
        quantity: sku?.quantity || 0,
        status: sku?.status || 2,
        images: sku?.images || [],
      };
    });

    setSkuList(newSkuList);

    const imageList = (productData.images || []).map((img) => ({
      file: null,
      isMain: img.is_main || false,
      optionKey: img.option_key || "",
      optionValue: img.option_value || "",
      previewUrl: img.Img_url?.startsWith("/uploads")
        ? `http://localhost:5000${img.Img_url}`
        : img.Img_url,
      fromServer: true,
    }));
    setImages(imageList);
  }, [productData]);

  useEffect(() => {
    const categoryId = selectedChild ?? selectedParent;
    const valid =
      productName.trim() &&
      categoryId &&
      marketPrice && !isNaN(marketPrice) && Number(marketPrice) >= 0 &&
      salePrice && !isNaN(salePrice) && Number(salePrice) >= 0 &&
      images.length > 0;

    setFormValid(!!valid);
  }, [productName, selectedParent, selectedChild, marketPrice, salePrice, images]);

  const handleUpdate = async () => {
    if (!formValid) {
      alert('Vui lòng điền đầy đủ và chính xác thông tin.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();

      // Ưu tiên gửi danh mục con nếu có, nếu không thì danh mục cha
      const categoryId = selectedChild || selectedParent;
      if (!categoryId) {
        alert('Vui lòng chọn danh mục');
        setIsSubmitting(false);
        return;
      }

      formData.append('products_id', productData.product?.id_products || productData.products_id);
      formData.append('products_name', productName);
      formData.append('category_id', categoryId);
      formData.append('products_description', description);
      formData.append('products_market_price', marketPrice);
      formData.append('products_sale_price', salePrice);
      formData.append('specs', JSON.stringify(specs));
      formData.append('attributes', JSON.stringify(options));
      formData.append('variants', JSON.stringify(skuList));
      formData.append('products_status', status);

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
            <CategorySelector
              selectedParent={selectedParent}
              setSelectedParent={setSelectedParent}
              selectedChild={selectedChild}
              setSelectedChild={setSelectedChild}
            />
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
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Đóng</Button>
        <Button variant="primary" onClick={handleUpdate} disabled={!formValid || isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
