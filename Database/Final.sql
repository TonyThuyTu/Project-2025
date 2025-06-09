CREATE TABLE `categories` (
  `category_id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) UNIQUE,
  `img` varchar(225),
  `is_active` boolean,
  `is_primary` boolean,
  `parent_id` int
);

CREATE TABLE `products` (
  `id_products` int PRIMARY KEY AUTO_INCREMENT,
  `category_id` int,
  `products_name` varchar(255),
  `products_market_price` decimal(10,2),
  `products_sale_price` decimal(10,2),
  `products_description` text,
  `products_status` boolean
);

CREATE TABLE `product_spec` (
  `id_spec` int PRIMARY KEY AUTO_INCREMENT,
  `id_products` int,
  `spec_name` varchar(100),
  `spec_value` varchar(255)
);

CREATE TABLE `attributes` (
  `id_attribute` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100)
);

CREATE TABLE `attribute_values` (
  `id_value` int PRIMARY KEY AUTO_INCREMENT,
  `id_attribute` int,
  `value` varchar(255),
  `extra_price` decimal(10,2),
  `status` boolean
);

CREATE TABLE `product_attributes` (
  `id_product_attribute` int PRIMARY KEY AUTO_INCREMENT,
  `id_product` int,
  `id_attribute` int
);

CREATE TABLE `product_variants` (
  `id_variant` int PRIMARY KEY AUTO_INCREMENT,
  `id_products` int,
  `sku` varchar(100),
  `price` decimal(10,2),
  `quantity` int,
  `status` boolean
);

CREATE TABLE `variant_values` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_variant` int,
  `id_value` int
);

CREATE TABLE `product_img` (
  `id_product_img` int PRIMARY KEY AUTO_INCREMENT,
  `id_products` int,
  `id_variant` int,
  `id_value` int,
  `Img_url` varchar(255),
  `is_main` boolean
);

CREATE TABLE `vouchers` (
  `id_voucher` int PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(50) UNIQUE NOT NULL,
  `discount_type` enum(percent,fixed) NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(10,2),
  `user_limit` int,
  `usage_count` int DEFAULT 0,
  `usage_limit` int,
  `start_date` datetime,
  `end_date` datetime,
  `status` boolean DEFAULT true
);

CREATE TABLE `voucher_products` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_voucher` int,
  `id_product` int
);

CREATE TABLE `Customers` (
  `id_customer` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100),
  `phone` varchar(20),
  `email` varchar(100) UNIQUE,
  `password` varchar(255),
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP),
  `status` boolean DEFAULT false,
  `block_reason` text
);

CREATE TABLE `customer_address` (
  `id_address` int PRIMARY KEY AUTO_INCREMENT,
  `id_customer` int,
  `address_label` VARCHAR(50),
  `name_city` varchar(255),
  `name_district` varchar(255),
  `name_ward` varchar(255),
  `name_address` varchar(255),
  `is_primary` boolean DEFAULT false
);

CREATE TABLE `product_reviews` (
  `id_review` int PRIMARY KEY AUTO_INCREMENT,
  `id_customer` int,
  `id_products` int,
  `rating` int COMMENT 'Từ 1 đến 5',
  `title` varchar(255),
  `comment` text,
  `date` datetime DEFAULT (CURRENT_TIMESTAMP),
  `approved` enum(Pending,Approved,Rejected) DEFAULT 'Pending'
);

CREATE TABLE `Employees` (
  `id_employee` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100),
  `gender` int,
  `phone` varchar(20),
  `email` varchar(100) UNIQUE,
  `password` varchar(255),
  `position` varchar(100),
  `status` enum,
  `role` int,
  `block` boolean DEFAULT false,
  `block_reason` text,
  `created_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `orders` (
  `id_order` int PRIMARY KEY AUTO_INCREMENT,
  `id_customer` int,
  `total_amount` decimal(10,2),
  `shipping_fee` decimal(10,2),
  `payment_method` enum(cod,vnpay),
  `payment_status` enum(unpaid,paid) DEFAULT 'unpaid',
  `order_status` enum(pending,processing,shipping,delivered,cancelled) DEFAULT 'pending',
  `Order_date` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `order_details` (
  `id_order_detail` int PRIMARY KEY AUTO_INCREMENT,
  `id_order` int,
  `id_product` int,
  `product_name` varchar(255),
  `quantity` int
);

CREATE TABLE `order_item_attribute_values` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_order_detail` int,
  `id_value` int
);

CREATE TABLE `shipping_info` (
  `id_shipping` int PRIMARY KEY AUTO_INCREMENT,
  `id_order` int,
  `shipping_code` varchar(100),
  `shipping_status` varchar(100),
  `expected_delivery` datetime,
  `shipped_at` datetime,
  `delivered_at` datetime
);

CREATE TABLE `payments` (
  `id_payment` int PRIMARY KEY AUTO_INCREMENT,
  `id_order` int,
  `vnp_transaction_no` varchar(255),
  `payment_status` enum(success,failed,pending) DEFAULT 'pending',
  `payment_time` datetime
);

CREATE TABLE `returns` (
  `id_return` int PRIMARY KEY AUTO_INCREMENT,
  `id_order` int,
  `return_reason` text,
  `return_status` enum(pending,approved,rejected,completed) DEFAULT 'pending',
  `refund_amount` decimal(10,2),
  `Date_return` datetime DEFAULT (CURRENT_TIMESTAMP),
  `approved_at` datetime
);

CREATE TABLE `Carts` (
  `id_cart` int PRIMARY KEY AUTO_INCREMENT,
  `id_customer` int
);

CREATE TABLE `Cart_items` (
  `id_cart_items` int PRIMARY KEY AUTO_INCREMENT,
  `id_cart` int,
  `id_product` int,
  `quantity` int,
  `updated_at` datetime DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `Cart_item_attribute_values` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `id_cart_items` int,
  `id_value` int
);

CREATE TABLE `Banner` (
  `id_banner` int PRIMARY KEY AUTO_INCREMENT,
  `banner_img` varchar(255)
);

CREATE TABLE `Contact` (
  `id_contact` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100),
  `phone` number(225),
  `email` varchar(225),
  `note` text
);

ALTER TABLE `categories` ADD FOREIGN KEY (`parent_id`) REFERENCES `categories` (`category_id`);

ALTER TABLE `products` ADD FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

ALTER TABLE `product_spec` ADD FOREIGN KEY (`id_products`) REFERENCES `products` (`id_products`);

ALTER TABLE `attribute_values` ADD FOREIGN KEY (`id_attribute`) REFERENCES `attributes` (`id_attribute`);

ALTER TABLE `product_attributes` ADD FOREIGN KEY (`id_product`) REFERENCES `products` (`id_products`);

ALTER TABLE `product_attributes` ADD FOREIGN KEY (`id_attribute`) REFERENCES `attributes` (`id_attribute`);

ALTER TABLE `product_variants` ADD FOREIGN KEY (`id_products`) REFERENCES `products` (`id_products`);

ALTER TABLE `variant_values` ADD FOREIGN KEY (`id_variant`) REFERENCES `product_variants` (`id_variant`);

ALTER TABLE `variant_values` ADD FOREIGN KEY (`id_value`) REFERENCES `attribute_values` (`id_value`);

ALTER TABLE `product_img` ADD FOREIGN KEY (`id_products`) REFERENCES `products` (`id_products`);

ALTER TABLE `product_img` ADD FOREIGN KEY (`id_variant`) REFERENCES `product_variants` (`id_variant`);

ALTER TABLE `product_img` ADD FOREIGN KEY (`id_value`) REFERENCES `attribute_values` (`id_value`);

ALTER TABLE `voucher_products` ADD FOREIGN KEY (`id_voucher`) REFERENCES `vouchers` (`id_voucher`);

ALTER TABLE `voucher_products` ADD FOREIGN KEY (`id_product`) REFERENCES `products` (`id_products`);

ALTER TABLE `customer_address` ADD FOREIGN KEY (`id_customer`) REFERENCES `Customers` (`id_customer`);

ALTER TABLE `product_reviews` ADD FOREIGN KEY (`id_customer`) REFERENCES `Customers` (`id_customer`);

ALTER TABLE `product_reviews` ADD FOREIGN KEY (`id_products`) REFERENCES `products` (`id_products`);

ALTER TABLE `orders` ADD FOREIGN KEY (`id_customer`) REFERENCES `Customers` (`id_customer`);

ALTER TABLE `order_details` ADD FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);

ALTER TABLE `order_details` ADD FOREIGN KEY (`id_product`) REFERENCES `products` (`id_products`);

ALTER TABLE `order_item_attribute_values` ADD FOREIGN KEY (`id_order_detail`) REFERENCES `order_details` (`id_order_detail`);

ALTER TABLE `order_item_attribute_values` ADD FOREIGN KEY (`id_value`) REFERENCES `attribute_values` (`id_value`);

ALTER TABLE `shipping_info` ADD FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);

ALTER TABLE `payments` ADD FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);

ALTER TABLE `returns` ADD FOREIGN KEY (`id_order`) REFERENCES `orders` (`id_order`);

ALTER TABLE `Carts` ADD FOREIGN KEY (`id_customer`) REFERENCES `Customers` (`id_customer`);

ALTER TABLE `Cart_items` ADD FOREIGN KEY (`id_cart`) REFERENCES `Carts` (`id_cart`);

ALTER TABLE `Cart_items` ADD FOREIGN KEY (`id_product`) REFERENCES `products` (`id_products`);

ALTER TABLE `Cart_item_attribute_values` ADD FOREIGN KEY (`id_cart_items`) REFERENCES `Cart_items` (`id_cart_items`);

ALTER TABLE `Cart_item_attribute_values` ADD FOREIGN KEY (`id_value`) REFERENCES `attribute_values` (`id_value`);
