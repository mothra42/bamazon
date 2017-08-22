CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
item_id INTEGER AUTO_INCREMENT NOT NULL,
product_name VARCHAR(150) NOT NULL,
department_name VARCHAR(100) NOT NULL,
price FLOAT NOT NULL,
stock_quantity INTEGER NOT NULL,
PRIMARY KEY(item_id)
);

CREATE TABLE departments (
department_id INTEGER AUTO_INCREMENT NOT NULL,
department_name VARCHAR(100),
over_head_costs FLOAT NOT NULL,
PRIMARY KEY(department_id)
);

UPDATE products SET product_sales = 0;

ALTER TABLE products ADD product_sales FLOAT; 

UPDATE products SET stock_quantity = 30 WHERE product_name = 'Catan';

SELECT * FROM products;

SELECT * FROM departments;

SELECT * FROM products WHERE stock_quantity <= 5;

UPDATE products SET stock_quantity = 10 WHERE item_id = 10;

UPDATE products SET stock_quantity = stock_quantity +  10  WHERE item_id = 10;

UPDATE products SET product_sales = product_sales + 1000 WHERE item_id = 1;

SELECT department_id,  departments.department_name, departments.over_head_costs,
SUM(products.product_sales) 
FROM products 
INNER JOIN departments 
ON products.department_name = departments.department_name GROUP BY departments.department_id; 

SELECT departments.department_id, products.product_sales, departments.department_name
FROM products
INNER JOIN departments
ON products.department_name = departments.department_name;

SELECT products.department_name, SUM(products.product_sales)
FROM products
GROUP BY products.department_name ASC;


SET sql_mode = "";
