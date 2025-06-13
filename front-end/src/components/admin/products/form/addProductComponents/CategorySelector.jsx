import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col } from 'react-bootstrap';

export default function CategorySelector ({ selectedParent, setSelectedParent, selectedChild, setSelectedChild }) {
    const [categories, setCategories] = useState([]);
    const [childCategories, setChildCategories] = useState([]);

    //gọi api lấy danh mục
    useEffect(() => {
    axios.get('http://localhost:5000/api/categories') // chỉnh đúng route bạn dùng
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => console.error('Lỗi khi gọi API danh mục:', err));
    }, []);

    // Khi chọn danh mục cha => lọc ra danh mục con
    const handleParentChange = (e) => {
        const parentId = e.target.value;
        setSelectedParent(parentId);
        setSelectedChild(''); // reset con

        const children = categories.filter((cat) => cat.parent_id == parentId);
        setChildCategories(children);
    };

    return (

        <div className="mb-4">
        <Row>
            <Col md={6}>
            <Form.Group controlId="parentCategory" className="mb-3">
                <Form.Label>Danh mục cha</Form.Label>
                <Form.Select value={selectedParent} onChange={handleParentChange}>
                <option value="">-- Chọn danh mục cha --</option>
                {categories
                    .filter((cat) => cat.parent_id === null)
                    .map((parent) => (
                    <option key={parent.category_id} value={parent.category_id}>
                        {parent.name}
                    </option>
                    ))}
                </Form.Select>
            </Form.Group>
            </Col>

            <Col md={6}>
            <Form.Group controlId="childCategory" className="mb-3">
                <Form.Label>Danh mục con</Form.Label>
                <Form.Select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                disabled={!childCategories.length}
                >
                <option value="">-- Chọn danh mục con --</option>
                {childCategories.map((child) => (
                    <option key={child.category_id} value={child.category_id}>
                    {child.name}
                    </option>
                ))}
                </Form.Select>
            </Form.Group>
            </Col>
        </Row>
        </div>
    );

};