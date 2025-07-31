'use client';
import { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProductReview({ id_products }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [idCustomer, setIdCustomer] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('id_customer');
    if (storedId) setIdCustomer(storedId);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const fetchReviews = async () => {
    if (!id_products) return;
    setLoadingReviews(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/reviews/product/${id_products}`);
      setReviews(res.data.reviews || []);
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id_products]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idCustomer = localStorage.getItem('id_customer', 'token');

    if (!idCustomer) {
      toast.error('Vui lòng đăng nhập để gửi đánh giá');
      return;
    }
    if (!title.trim() || !comment.trim() || rating === 0) {
      toast.error('Vui lòng điền đầy đủ tiêu đề, nội dung và chọn số sao.');
      return;
    }

    setLoadingSubmit(true);

    try {
      const res = await axios.post('http://localhost:5000/api/reviews/', {
        id_customer: idCustomer,
        id_products,
        rating,
        title,
        comment,
        approved: 'Pending',
      });

      if (res.status === 201) {
        toast.success('Gửi đánh giá thành công!');
        setTitle('');
        setComment('');
        setRating(0);
        setHover(0);
        fetchReviews();
      } else {
        toast.error('Gửi đánh giá thất bại');
      }
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      toast.error('Lỗi khi kết nối đến máy chủ.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <section className="container my-5" id="reviews">
      <h2 className="text-center mb-4">Đánh giá sản phẩm</h2>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="p-4 bg-white rounded-4 shadow-sm h-100">
            <h4 className="mb-3">Đánh giá của bạn</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <label key={starValue}>
                      <input
                        type="radio"
                        name="rating"
                        value={starValue}
                        onClick={() => setRating(starValue)}
                        className="d-none"
                      />
                      <FaStar
                        size={28}
                        className="me-1"
                        color={starValue <= (hover || rating) ? '#ffc107' : '#e4e5e9'}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                        style={{ cursor: 'pointer' }}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tiêu đề"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  placeholder="Viết đánh giá của bạn..."
                  style={{ minHeight: '200px' }}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
              <div className="text-end text-center">
                <button type="submit" disabled={loadingSubmit} className="btn btn-primary px-4 text-center">
                  {loadingSubmit ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <div
            className="h-100 p-3 bg-white border rounded-4 overflow-auto"
            style={{ maxHeight: '500px' }}
          >
            <h5 className="mb-3">Các đánh giá</h5>
            {loadingReviews && <p>Đang tải đánh giá...</p>}
            {!loadingReviews && reviews.length === 0 && <p>Chưa có đánh giá nào.</p>}
            {reviews.map((review, idx) => (
              <div key={review.id || idx} className="mb-4 p-3 rounded-3 shadow-sm border">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>{review.name || 'Khách hàng'}</strong>
                  <small className="text-muted">{formatDate(review.date)}</small>
                </div>
                <div className="text-warning mb-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} size={16} color={i < review.rating ? '#ffc107' : '#e4e5e9'} />
                  ))}
                </div>
                <h6 className="mb-1">{review.title}</h6>
                <p className="mb-0">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
