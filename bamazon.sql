
DROP DATABASE IF EXISTS Bamazon;
CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE Products (
    item_id INTEGER(10) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price_ctc FLOAT(7, 2) NOT NULL,
    stock_quantity INTEGER(7) NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Blender', 'Home', 84.95, 10);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Table', 'Home', 299.99, 5);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Towels', 'Home', 9.95, 100);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Computer Stand', 'Office', 148.00, 50);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Trash Can', 'Office', 14.95, 125);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Red Ruby Shoes', 'Shoes', 99.95, 65);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Blue Suede Shoes', 'Shoes', 119.95, 60);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('GG&L', 'Accessory', 84.95, 2);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Cool Jeans', 'Mens', 88.95, 12);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Sassy Shorts', 'Mens', 4.95, 105);
INSERT INTO Products (product_name, department_name, price_ctc, stock_quantity)
VALUES ('Skull Shirt', 'Womens', 33.99, 80);



select * from Products;

CREATE TABLE Department (
 department_id INTEGER(10) AUTO_INCREMENT NOT NULL,
 department_name VARCHAR(50) NOT NULL,
 total_sales FLOAT(7, 2) NOT NULL,
 PRIMARY KEY (department_id)
 );
 
 INSERT INTO Department (department_name, total_sales)
 VALUES('Mens', 0);
 INSERT INTO Department (department_name, total_sales)
 VALUES('Womens', 0);
 INSERT INTO Department (department_name, total_sales)
 VALUES('Accessory', 0);
 INSERT INTO Department (department_name, total_sales)
 VALUES('Shoes', 0);
 INSERT INTO Department (department_name, total_sales)
 VALUES('Office', 0);
 INSERT INTO Department (department_name, total_sales)
 VALUES('Home', 0);
 
 select * from Department;
 
 
 





