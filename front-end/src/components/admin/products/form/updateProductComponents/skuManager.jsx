import { useEffect } from "react";
import { Table, Form, Button } from "react-bootstrap";

function isHexColor(value) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

export default function SkuManager({ options = [], skuList = [], setSkuList }) {
  
  useEffect(() => {
    if (options.length < 2) {
      if (skuList.length !== 0) {
        setSkuList([]);
      }
      return;
    }

    // Xây dựng tập hợp combo hợp lệ (giữ nguyên code của bạn)
    const valuesList = options.map(opt =>
      opt.values.map(v => ({
        label: v.label,
        value: v.value || v.label,
        optionName: opt.name,
      }))
    );

    const validComboSet = new Set(
      valuesList.length > 0
        ? valuesList.reduce((acc, curr) => {
            if (acc.length === 0) return curr.map(v => [v]);
            const result = [];
            acc.forEach(a => {
              curr.forEach(c => {
                result.push([...a, c]);
              });
            });
            return result;
          }, []).map(combo => JSON.stringify(combo.map(c => c.value)))
        : []
    );

    const filteredSkus = skuList.filter(sku => {
      if (!Array.isArray(sku.combo)) return false;
      const comboKey = JSON.stringify(sku.combo.map(c => c.value));
      return validComboSet.has(comboKey);
    });

    // So sánh sâu skuList và filteredSkus trước khi set
    const oldStr = JSON.stringify(skuList);
    const newStr = JSON.stringify(filteredSkus);
    if (oldStr !== newStr) {
      setSkuList(filteredSkus);
    }
  }, [options, skuList, setSkuList]);

  const handleChange = (index, field, value) => {
    const updated = [...skuList];
    updated[index][field] = value;
    setSkuList(updated);
  };

  if (options.length < 2) return null;

  return (
    <div className="mt-4">
      <h5>Quản lý SKU theo tổ hợp option</h5>
      <Table bordered size="sm" responsive>
        <thead>
          <tr>
            {options.map((opt, idx) => (
              <th key={idx}>{opt.name}</th>
            ))}
            <th>Giá cộng thêm</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Xoá</th>
          </tr>
        </thead>
        <tbody>
          {skuList.length > 0 ? (
            skuList.map((skuItem, index) => (
              <tr key={index}>
                {(Array.isArray(skuItem.combo) ? skuItem.combo : []).map((c, i) => (
                  <td key={i}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {isHexColor(c.value) && (
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: c.value,
                            border: "1px solid #ccc",
                            marginRight: 8,
                            borderRadius: 3,
                          }}
                          title={c.label}
                        />
                      )}
                      <span>{c.label}</span>
                    </div>
                  </td>
                ))}
                <td>
                  <Form.Control
                    type="number"
                    value={skuItem.price ?? ""}
                    onChange={(e) =>
                      handleChange(index, "price", parseInt(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <Form.Control
                    type="number"
                    value={skuItem.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", parseInt(e.target.value) || 0)
                    }
                  />
                </td>
                <td>
                  <Form.Select
                    value={skuItem.status}
                    onChange={(e) =>
                      handleChange(index, "status", parseInt(e.target.value))
                    }
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
                      const updated = [...skuList];
                      updated.splice(index, 1);
                      setSkuList(updated);
                    }}
                  >
                    <i className="bi bi-trash" />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={options.length + 4} className="text-center text-muted">
                Chưa có SKU nào
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
