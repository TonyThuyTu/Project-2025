import { useState } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';

export default function SpecEditor({ specs, setSpecs }) {
  // specs là array các cặp { name: '', value: '' }

  const handleAddSpec = () => {
    setSpecs([...specs, { name: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs);
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  return (
    <div className="mb-4">
      <h5 className="mb-3">Thông số kỹ thuật</h5>
      <Table bordered responsive>
        <thead>
          <tr className="text-center">
            <th style={{ width: '40%' }}>Tên thông số</th>
            <th style={{ width: '50%' }}>Giá trị</th>
            <th style={{ width: '10%' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {specs.map((spec, index) => (
            <tr key={index}>
              <td>
                <Form.Control
                  type="text"
                  placeholder="VD: Kích thước màn hình"
                  value={spec.name}
                  onChange={(e) => handleSpecChange(index, 'name', e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  placeholder="VD: 6.1 inch"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                />
              </td>
              <td className="text-center">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveSpec(index)}
                >
                  <Trash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row>
        <Col>
          <Button variant="primary" size="sm" onClick={handleAddSpec}>
            + Thêm dòng
          </Button>
        </Col>
      </Row>
    </div>
  );
}
