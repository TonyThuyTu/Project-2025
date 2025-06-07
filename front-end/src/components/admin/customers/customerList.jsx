"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import BlockModal from "./customerModal/BlockModal";
import UnblockModal from "./customerModal/UnblockModal";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/customers");
      setCustomers(res.data.customers);
    } catch (err) {
      console.error("Lỗi khi tải khách hàng:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Mở modal block và reset lý do
  const handleBlock = (customer) => {
    setSelectedCustomer(customer);
    setBlockReason("");
    setShowBlockModal(true);
  };

  // Mở modal unblock
  const handleUnblock = (customer) => {
    setSelectedCustomer(customer);
    setShowUnblockModal(true);
  };

  // Gửi yêu cầu block khách hàng với lý do
  // Khi block thì status = true (1)
// Khi unblock thì status = false (0)

    const confirmBlock = async () => {
    try {
        await axios.put(
        `http://localhost:5000/api/customers/status/${selectedCustomer.id_customer}`,
        {
            status: true,            // 1 = chặn
            block_reason: blockReason.trim() || "Không rõ lý do",
        }
        );
        setShowBlockModal(false);
        fetchCustomers();
    } catch (err) {
        console.error("Lỗi khi chặn:", err);
    }
    };

    const confirmUnblock = async () => {
        try {
                await axios.put(
                `http://localhost:5000/api/customers/status/${selectedCustomer.id_customer}`,
                { status: false } // false = bỏ chặn, backend xóa lý do chặn
                );
                setShowUnblockModal(false);
                fetchCustomers();
            } catch (err) {
                console.error("Lỗi khi bỏ chặn:", err);
        }
    };



  return (
    <div className="container p-3">
      <h2>Danh sách khách hàng</h2>
      <table className="table table-bordered table-hover mt-3">
        <thead className="table-secondary">
          <tr>
            <th>Tên</th>
            <th>SĐT</th>
            <th>Email</th>
            <th>Lý do chặn</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                Không có khách hàng.
              </td>
            </tr>
          ) : (
            customers.map((customer) => (
              <tr key={customer.id_customer}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>
                  {customer.status === false && customer.block_reason ? (
                    <span title={customer.block_reason}>
                      ⚠ {customer.block_reason}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                    {customer.status === false ? (
                        // status = false (0) -> chưa chặn, hiển thị nút "Chặn"
                        <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleBlock(customer)}
                        >
                        Chặn
                        </button>
                    ) : (
                        // status = true (1) -> đã chặn, hiển thị nút "Mở chặn"
                        <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleUnblock(customer)}
                        >
                        Mở chặn
                        </button>
                    )}
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modals */}
      <BlockModal
        show={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={confirmBlock}
        customer={selectedCustomer}
        reason={blockReason}
        setReason={setBlockReason}
      />
      <UnblockModal
        show={showUnblockModal}
        onClose={() => setShowUnblockModal(false)}
        onConfirm={confirmUnblock}
        customer={selectedCustomer}
      />
    </div>
  );
}
