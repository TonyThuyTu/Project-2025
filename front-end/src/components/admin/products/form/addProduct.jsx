import { Modal, Button, Form, Card } from "react-bootstrap";
import { useState } from "react";
import BasicInfo from "./addProductComponents/BasicInfo";
import CategorySelector from "./addProductComponents/CategorySelector";
import DescriptionEditor from "./addProductComponents/DescriptionEditor";
import SpecEditor from "./addProductComponents/SpecEditor";
import ImgUploaded from "./addProductComponents/ImgUploaded";
import OptionsManager from "./addProductComponents/OptionManager";
import SkuManager from "./addProductComponents/SkuManager";

export default function AddProductModal({ show, onClose, onAdd }) {
  const [description, setDescription] = useState('');

  const [options, setOptions] = useState([]); // ✅ THÊM DÒNG NÀY
  const [skuList, setSkuList] = useState([]);
  const [productName, setProductName] = useState('');

  const [selectedParent, setSelectedParent] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [images, setImages] = useState([]);

  //specs
  const [specs, setSpecs] = useState([
    { name: '', value: '' }, // dòng mặc định
  ]);

  return (
    <Modal show={show} onHide={onClose} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Thêm sản phẩm mới</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Card className="mb-3 p-3">
            <BasicInfo productName={productName} setProductName={setProductName} />
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
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button variant="primary" onClick={onAdd}>
          Lưu sản phẩm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
