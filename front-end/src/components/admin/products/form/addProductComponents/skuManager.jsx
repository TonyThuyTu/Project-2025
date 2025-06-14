import { useEffect } from "react";
import { Table, Form, Button } from "react-bootstrap";


// Kiểm tra mã màu hex
function isHexColor(value) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(value);
}

// Tạo mã SKU từ tên sản phẩm và tổ hợp combo
function generateSKU(productName, combo) {
  if (!productName || !Array.isArray(combo)) return "";

  const namePart = productName.toUpperCase().replace(/\s+/g, "").slice(0, 5);
  const comboPart = combo
    .map((opt) => (opt.value ? opt.value.toString().toUpperCase().slice(0, 3) : "UNK"))
    .join("-");

  return `${namePart}-${comboPart}`;
}

// Lấy tổ hợp giá trị options
function getOptionCombinations(optionValues) {
  if (optionValues.length === 0) return [];
  return optionValues.reduce((acc, curr) => {
    const result = [];
    acc.forEach((a) => {
      curr.forEach((c) => {
        result.push([...a, c]);
      });
    });
    return result;
  }, [[]]);
}

function isSameSkuList(listA, listB) {
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    if (JSON.stringify(listA[i]) !== JSON.stringify(listB[i])) {
      return false;
    }
  }
  return true;
}

export default function SkuManager({ options = [], skuList, setSkuList, productName }) {
    
  useEffect(() => {
    if (options.length >= 2) {
      const valuesList = options.map(opt =>
        opt.values.map(v => ({
          label: v.label,
          value: v.value || v.label,
          optionName: opt.name,
        }))
      );

      const combinations = getOptionCombinations(valuesList);

      const newSkus = combinations.map(combo => {
        const existingSku = skuList.find(sku => {
          if (!sku.combo) return false;
          if (sku.combo.length !== combo.length) return false;
          return sku.combo.every((item, idx) => item.value === combo[idx].value);
        });

        return {
          combo,
          price: existingSku ? existingSku.price : 0,
          quantity: existingSku ? existingSku.quantity : 0,
          status: existingSku ? existingSku.status : 2,
          sku: existingSku ? existingSku.sku : generateSKU(productName, combo),
        };
      });

      if (!isSameSkuList(newSkus, skuList)) {
        setSkuList(newSkus);
      }
    } else {
      if (skuList.length !== 0) {
        setSkuList([]);
      }
    }
  }, [options, productName]);

  const handleChange = (i, field, value) => {
    const updated = [...skuList];
    updated[i][field] = value;
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
            <th>SKU</th>
            <th>Xoá</th>
          </tr>
        </thead>
        <tbody>
          {skuList.map((skuItem, index) => (
            <tr key={index}>
              {skuItem.combo.map((c, i) => (
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
                  value={skuItem.price}
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
                <Form.Control value={skuItem.sku} disabled readOnly />
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
          ))}
        </tbody>
      </Table>
    </div>
  );
}
