"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import UserDetailForm from "@/components/customers/accounts/UserDetailForm";

export default function UserDetailPage() {
  const [idCustomer, setIdCustomer] = useState(null);
  

  useEffect(() => {
    const token = localStorage.getItem("token"); // hoặc cookie tùy bạn lưu ở đâu
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIdCustomer(decoded.id_customer || decoded.id || decoded.userId); // tùy payload token của bạn có key gì
      } catch (error) {
        console.error("Lỗi decode token:", error);
      }
    }
  }, []);

  if (!idCustomer) return <p>Đang tải thông tin người dùng...</p>;

  return (
    <>
      <h4>Thông tin tài khoản</h4>
      <UserDetailForm idCustomer={idCustomer} />
    </>
  );
}
