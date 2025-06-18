import { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Spinner } from 'react-bootstrap';

export default function CategorySelector({
  selectedParent,
  setSelectedParent,
  selectedChild,
  setSelectedChild,
}) {
  const [parentCategories, setParentCategories] = useState([]);
  const [childCategories, setChildCategories] = useState([]);
  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);

  // Load danh mục cha
  useEffect(() => {
    const fetchParents = async () => {
      try {
        setLoadingParents(true);
        const res = await axios.get("http://localhost:5000/api/categories");
        const parents = res.data.filter(c => c.parent_id === null);
        setParentCategories(parents);
      } catch (err) {
        console.error("Lỗi load danh mục cha:", err);
      } finally {
        setLoadingParents(false);
      }
    };
    fetchParents();
  }, []);

  // Load danh mục con khi selectedParent thay đổi
  useEffect(() => {
    const fetchChildren = async () => {
      if (!selectedParent) {
        setChildCategories([]);
        setSelectedChild(null);
        return;
      }
      try {
        setLoadingChildren(true);
        const res = await axios.get(`http://localhost:5000/api/categories/parent/${selectedParent}`);
        setChildCategories(res.data || []);
      } catch (err) {
        console.error("Lỗi load danh mục con:", err);
      } finally {
        setLoadingChildren(false);
      }
    };
    fetchChildren();
  }, [selectedParent]);

  // Nếu mở modal edit mà có selectedChild nhưng chưa có selectedParent
  useEffect(() => {
    const fetchParentAndChildren = async () => {
      if (selectedChild && !selectedParent) {
        try {
          const res = await axios.get(`http://localhost:5000/api/categories/${selectedChild}`);
          const childCat = res.data;

          if (childCat?.parent_id && childCat.parent_id !== selectedParent) {
            const parentId = childCat.parent_id;
            setSelectedParent(parentId);

            const childRes = await axios.get(`http://localhost:5000/api/categories/parent/${parentId}`);
            setChildCategories(childRes.data || []);
          }
        } catch (err) {
          console.error("Lỗi lấy danh mục cha theo con:", err);
        }
      }
    };
    fetchParentAndChildren();
  }, [selectedChild]);
  
  return (
    <>
      <h5 className="mb-3">Chọn danh mục</h5>
      <Row>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Danh mục cha</Form.Label>
            <Form.Select
              value={selectedParent || ""}
              onChange={(e) => {
                const parentId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedParent(parentId);
                setSelectedChild(null); // reset danh mục con khi đổi cha
              }}
              disabled={loadingParents}
            >
              <option value="">-- Chọn danh mục cha --</option>
              {parentCategories.map(cat => (
                <option key={`parent-${cat.category_id}`} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Danh mục con</Form.Label>
            <Form.Select
              value={selectedChild || ""}
              onChange={(e) => {
                const childId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedChild(childId);
              }}
              disabled={!selectedParent || loadingChildren}
            >
              <option value="">-- Chọn danh mục con --</option>
              {childCategories.map(cat => (
                <option key={`child-${cat.category_id}`} value={cat.category_id}>
                  {cat.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {(loadingParents || loadingChildren) && (
        <div className="mt-2 text-muted d-flex align-items-center gap-2">
          <Spinner size="sm" animation="border" />
          Đang tải danh mục...
        </div>
      )}
    </>
  );
}
