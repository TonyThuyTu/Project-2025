
export default function AdminHeader () {

    return (

        <header className="d-flex justify-content-between align-items-center p-3 bg-white border-bottom shadow-sm">
            <div className="d-flex align-items-center gap-3">
                <div className="border rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                <i className="bi bi-bell fs-5 text-primary"></i>
                </div>
                <h1 className="h4 m-0">Bảng điều khiển</h1>
            </div>

            <div className="d-flex align-items-center gap-3">
                <span className="text-muted">Xin chào, <strong>Admin</strong></span>
                <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                        const confirmLogout = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
                        if (confirmLogout) {
                        window.location.href = "/"; // hoặc "/admin" tùy bạn muốn chuyển về đâu
                        }
                    }}
                    >
                    Đăng xuất
                </button>


            </div>
        </header>


    );


}