"use client";

import Link from "next/link";

export default function CategoryChildren({ childrenCategories = [] }) {
  if (childrenCategories.length === 0) return null;

  return (
    <div className="container mt-4">
    <div className="row justify-content-start g-3">
      {childrenCategories.map((child) => (
        <div className="col-auto" key={child.category_id}>
          <Link href={`/category/${child.category_id}`} className="text-decoration-none">
            <div className="border rounded px-3 py-2 text-center category-child-item hover-shadow" style={{ whiteSpace: "nowrap" }}>
              <span className="fw-bold small">{child.name}</span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  </div>
  );
}
