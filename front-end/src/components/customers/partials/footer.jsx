"use client";
import Script from "next/script";

export default function FooterClient() {
  return (
    <>
      <footer className="bg-dark" id="tempaltemo_footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4 pt-5">
              <h2 className="h2 text-success border-bottom pb-3 border-light logo">Zay Shop</h2>
              <ul className="list-unstyled text-light footer-link-list">
                <li><i className="fas fa-map-marker-alt fa-fw"></i> 123 Consectetur at ligula 10660</li>
                <li>
                  <i className="fa fa-phone fa-fw"></i>
                  <a className="text-decoration-none" href="tel:010-020-0340">010-020-0340</a>
                </li>
                <li>
                  <i className="fa fa-envelope fa-fw"></i>
                  <a className="text-decoration-none" href="mailto:info@company.com">info@company.com</a>
                </li>
              </ul>
            </div>

            <div className="col-md-4 pt-5">
              <h2 className="h2 text-light border-bottom pb-3 border-light">Products</h2>
              <ul className="list-unstyled text-light footer-link-list">
                <li><a className="text-decoration-none" href="#">Luxury</a></li>
                <li><a className="text-decoration-none" href="#">Sport Wear</a></li>
                <li><a className="text-decoration-none" href="#">Men's Shoes</a></li>
                <li><a className="text-decoration-none" href="#">Women's Shoes</a></li>
                <li><a className="text-decoration-none" href="#">Popular Dress</a></li>
                <li><a className="text-decoration-none" href="#">Gym Accessories</a></li>
                <li><a className="text-decoration-none" href="#">Sport Shoes</a></li>
              </ul>
            </div>

            <div className="col-md-4 pt-5">
              <h2 className="h2 text-light border-bottom pb-3 border-light">Further Info</h2>
              <ul className="list-unstyled text-light footer-link-list">
                <li><a className="text-decoration-none" href="#">Home</a></li>
                <li><a className="text-decoration-none" href="#">About Us</a></li>
                <li><a className="text-decoration-none" href="#">Shop Locations</a></li>
                <li><a className="text-decoration-none" href="#">FAQs</a></li>
                <li><a className="text-decoration-none" href="#">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="row text-light mb-4">
            <div className="col-12 mb-3">
              <div className="w-100 my-3 border-top border-light"></div>
            </div>
            <div className="col-auto me-auto">
              <ul className="list-inline text-left footer-icons">
                <li className="list-inline-item border border-light rounded-circle text-center">
                  <a className="text-light text-decoration-none" href="http://facebook.com/" target="_blank">
                    <i className="fab fa-facebook-f fa-lg fa-fw"></i>
                  </a>
                </li>
                <li className="list-inline-item border border-light rounded-circle text-center">
                  <a className="text-light text-decoration-none" href="https://www.instagram.com/" target="_blank">
                    <i className="fab fa-instagram fa-lg fa-fw"></i>
                  </a>
                </li>
                <li className="list-inline-item border border-light rounded-circle text-center">
                  <a className="text-light text-decoration-none" href="https://twitter.com/" target="_blank">
                    <i className="fab fa-twitter fa-lg fa-fw"></i>
                  </a>
                </li>
                <li className="list-inline-item border border-light rounded-circle text-center">
                  <a className="text-light text-decoration-none" href="https://www.linkedin.com/" target="_blank">
                    <i className="fab fa-linkedin fa-lg fa-fw"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="w-100 bg-black py-3">
          <div className="container">
            <div className="row pt-2">
              <div className="col-12">
                <p className="text-left text-light">
                  Copyright &copy; 2025 TonyThuyTu | Designed by{" "}
                  <a rel="sponsored" href="#" target="_blank">Tonynguyen</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Import các script sau footer */}
      <Script src="/assets/js/jquery-1.11.0.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/jquery-migrate-1.2.1.min.js" strategy="beforeInteractive" />
      <Script src="/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/templatemo.js" strategy="afterInteractive" />
      <Script src="/assets/js/custom.js" strategy="afterInteractive" />
    </>
  );
}
