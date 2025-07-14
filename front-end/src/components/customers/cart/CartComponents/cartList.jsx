import React from "react";
import { Table, Image, Form, Button } from "react-bootstrap";

// Hàm định dạng tiền VND
const formatVND = (value) =>
  Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });

export default function CartList({ items, onUpdateQuantity, onDeleteItem }) {
  return (
    <Table bordered hover responsive className="mt-3">
      <thead>
        <tr className="text-center">
          <th>Sản phẩm</th>
          <th>Phân loại</th>
          <th>Đơn giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const image =
            item.attribute_values?.find(
              (val) => val.attribute_value?.images?.length > 0
            )?.attribute_value.images[0]?.img_url || "/no-image.png";

          const productName = item.product?.products_name || "Không rõ";

          return (
            <tr key={item.id_cart_items} className="text-center align-middle">
              <td>
                <Image
                  src={image}
                  width={80}
                  height={80}
                  rounded
                  className="mb-2"
                />
                <div>{productName}</div>
              </td>

              <td>
                {item.attribute_values?.map((attr, idx) => (
                  <div key={idx}>
                    <strong>{attr.attribute_value?.attribute?.name}:</strong>{" "}
                    {attr.attribute_value?.value}
                  </div>
                ))}
              </td>

              <td>{formatVND(item.price)}</td>

              <td style={{ maxWidth: 80 }}>
                <Form.Control
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(item.id_cart_items, Number(e.target.value))
                  }
                />
              </td>

              <td>{formatVND(item.price * item.quantity)}</td>

              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteItem(item.id_cart_items)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
