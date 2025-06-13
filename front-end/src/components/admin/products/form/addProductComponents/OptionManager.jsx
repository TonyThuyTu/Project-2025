import { useState } from 'react';
import { Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { Trash, Image, StarFill } from 'react-bootstrap-icons';

export default function OptionsManager({ options = [], setOptions }) {
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionType, setNewOptionType] = useState("text"); // 'text' hoặc 'color'

    const handleAddOption = () => {
    if (!newOptionName.trim()) return;

        const newOption = {
            name: newOptionName,
            type: newOptionType,
            values: [],
            images: [],
        };

        setOptions([...options, newOption]);
        setNewOptionName("");
        setNewOptionType("text");
    };

    const handleAddValue = (index) => {
        const updated = [...options];
        updated[index].values.push({
        label: '',
        extraPrice: 0,
        quantity: 0,
        status: 2,
        image: null,
        isMain: false,
        color: '#000000',
        });
        setOptions(updated);
    };

    const handleImageSelect = (optionIndex, valueIndex, file) => {
        const updated = [...options];
        updated[optionIndex].values[valueIndex].image = file;
        setOptions(updated);
    };

    const handleToggleImageMain = (optionIndex, imgIndex) => {
        const updated = [...options];
        const images = updated[optionIndex].images;

        const isPinned = images[imgIndex].isMain === 1;

        // Nếu đang ghim → bỏ ghim
        if (isPinned) {
            images[imgIndex].isMain = 2;
        } else {
            // Bỏ ghim các ảnh khác
            images.forEach(img => img.isMain = 2);
            images[imgIndex].isMain = 1;
        }

        setOptions(updated);
    };


    const handleRemoveImage = (optionIndex, imgIndex) => {
        const updated = [...options];
        updated[optionIndex].images.splice(imgIndex, 1);
        setOptions(updated);
    };


    const handleImageUpload = (e, optionIndex) => {
        const files = Array.from(e.target.files);

        const imageObjs = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            isMain: 2, // 2 là mặc định chưa ghim
        }));

        const updated = [...options];
        updated[optionIndex].images = [...(updated[optionIndex].images || []), ...imageObjs];
        setOptions(updated);
    };



  return (
    <div className="mb-3">
        <h5>Quản lý Option</h5>

        {/* Thêm option mới */}
        <Row className="mb-3">
            <Col sm={4}>
            <Form.Control
                value={newOptionName}
                onChange={(e) => setNewOptionName(e.target.value)}
                placeholder="Tên option (VD: Màu sắc, Dung lượng)"
            />
            </Col>
            <Col sm={3}>
            <Form.Select
                value={newOptionType}
                onChange={(e) => setNewOptionType(e.target.value)}
            >
                <option value="text">Kiểu chữ/số</option>
                <option value="color">Kiểu màu sắc</option>
            </Form.Select>
            </Col>
            <Col sm="auto">
            <Button onClick={handleAddOption}>Thêm Option</Button>
            </Col>
        </Row>

        {/* Danh sách option */}
        {options.map((option, i) => (
            <div key={i} className="mb-4 p-3 border rounded">
            <Row className="align-items-center mb-2">
                <Col>
                <Form.Control
                    value={option.name}
                    onChange={(e) => {
                    const updated = [...options];
                    updated[i].name = e.target.value;
                    setOptions(updated);
                    }}
                    placeholder="Tên option"
                />
                </Col>
                {options.length > 1 && (
                <Col sm="auto">
                    <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                        const updated = [...options];
                        updated.splice(i, 1);
                        setOptions(updated);
                    }}
                    >
                    Xoá Option
                    </Button>
                </Col>
                )}
            </Row>

            {/* Upload nhiều ảnh */}
            <Form.Group controlId={`images-${i}`} className="mb-3">
                <Form.Label>Thêm ảnh cho option</Form.Label>
                <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(e, i)}
                />
            </Form.Group>

            {/* Hiển thị danh sách ảnh */}
            <Row>
                {option.images?.map((img, imgIndex) => (
                <Col key={imgIndex} xs={3} className="position-relative mb-3">
                    <img
                    src={img.url}
                    alt=""
                    className="img-fluid border"
                    style={{ height: 100, objectFit: "cover" }}
                    />
                    <Button
                    variant={img.isMain === 1 ? "success" : "outline-secondary"}
                    size="sm"
                    className="mt-1 w-100"
                    onClick={() => handleToggleImageMain(i, imgIndex)}
                    >
                    {img.isMain === 1 ? "Bỏ ghim" : "Ghim ảnh"}
                    </Button>
                    <Button
                    variant="danger"
                    size="sm"
                    className="mt-1 w-100"
                    onClick={() => handleRemoveImage(i, imgIndex)}
                    >
                    Xoá ảnh
                    </Button>
                </Col>
                ))}
            </Row>

            {/* Bảng giá trị */}
            <Table size="sm" bordered responsive>
                <thead>
                <tr>
                    <th>Giá trị</th>
                    <th>Giá cộng thêm</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                    <th>Xoá</th>
                </tr>
                </thead>
                <tbody>
                {option.values.map((value, j) => (
                    <tr key={j}>
                    <td>
                        {option.type === "color" ? (
                        <Form.Control
                            type="color"
                            value={value.label || "#000000"}
                            onChange={(e) => {
                            const updated = [...options];
                            updated[i].values[j].label = e.target.value;
                            setOptions(updated);
                            }}
                        />
                        ) : (
                        <Form.Control
                            value={value.label}
                            onChange={(e) => {
                            const updated = [...options];
                            updated[i].values[j].label = e.target.value;
                            setOptions(updated);
                            }}
                        />
                        )}
                    </td>
                    <td>
                        <Form.Control
                        type="number"
                        value={value.extraPrice ?? 0}
                        onChange={(e) => {
                            const updated = [...options];
                            updated[i].values[j].extraPrice = Number(e.target.value);
                            setOptions(updated);
                        }}
                        />
                    </td>
                    <td>
                        <Form.Control
                        type="number"
                        value={value.quantity ?? 0}
                        onChange={(e) => {
                            const updated = [...options];
                            updated[i].values[j].quantity = Number(e.target.value);
                            setOptions(updated);
                        }}
                        />
                    </td>
                    <td>
                        <Form.Select
                        value={value.status ?? 2}
                        onChange={(e) => {
                            const updated = [...options];
                            updated[i].values[j].status = Number(e.target.value);
                            setOptions(updated);
                        }}
                        >
                        <option value={2}>Hiển thị</option>
                        <option value={1}>Ẩn</option>
                        </Form.Select>
                    </td>
                    <td>
                        <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                            const updated = [...options];
                            updated[i].values.splice(j, 1);
                            setOptions(updated);
                        }}
                        >
                        <Trash />
                        </Button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleAddValue(i)}
            >
                Thêm giá trị
            </Button>
            </div>
        ))}
        </div>

  );
}
