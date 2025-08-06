"use client";
import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import CheckoutInfo from "./modal/checkoutInfo";
import CheckoutCart from "./modal/checkoutCart";
import { toast } from "react-toastify";
import axios from "axios";

export default function CheckoutPage({ idCustomer }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);

  // Fetch giỏ hàng
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const customerId = idCustomer || localStorage.getItem("id_customer");

    if (!token || !customerId) {
      toast.error("Bạn cần đăng nhập để tiếp tục!");
      setLoadingCart(false);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const cartRes = await axios.get(
          `http://localhost:5000/api/cart/customer/${customerId}`,
          { headers }
        );
        const raw = cartRes.data;
        const cartData = Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.items)
          ? raw.items
          : Array.isArray(raw)
          ? raw
          : [];
        setCartItems(cartData);
      } catch (err) {
        console.error("Lỗi khi fetch giỏ hàng:", err);
        toast.error("Có lỗi khi tải giỏ hàng");
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartItems();
  }, [idCustomer]);

  // Fetch địa chỉ
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const customerId = idCustomer || localStorage.getItem("id_customer");

    if (!token || !customerId) {
      setLoadingAddress(false);
      return;
    }

    const fetchAddresses = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const addrRes = await axios.get(
          `http://localhost:5000/api/address/customer/${customerId}`,
          { headers }
        );
        const addressesData = Array.isArray(addrRes.data.data)
          ? addrRes.data.data
          : [];
        setAddresses(addressesData);
        setSelectedAddress(addressesData.find((a) => a.is_primary) || null);
      } catch (err) {
        console.error("Lỗi khi fetch địa chỉ:", err);
        toast.error("Có lỗi khi tải địa chỉ");
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [idCustomer]);

  if (loadingCart || loadingAddress) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={7}>
          <Card className="p-3 mb-3 shadow-sm border-0">
            <CheckoutInfo
              addresses={addresses}
              selectedAddress={selectedAddress}
              setSelectedAddress={setSelectedAddress}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </Card>
        </Col>
        <Col md={5}>
          <Card className="p-3 mb-3 shadow-sm border-0">
            <CheckoutCart cartItems={cartItems} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
