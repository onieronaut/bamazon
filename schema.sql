DROP DATABASE IF EXISTS bamazon;

CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
	id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales INT DEFAULT 0,
    PRIMARY KEY (id)
);
    
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Macbook", "Electronics", 1000, 20),
("3D Printer", "Electronics", 2000, 10),
("Leather Jacket", "Clothing", 50, 25),
("Ugly Christmas Sweater", "Clothing", 20, 100),
("Microwave", "Appliances", 100, 30),
("Dishwasher", "Appliances", 500, 5),
("Shovel", "Tools", 15, 200),
("Axe", "Tools", 25, 100),
("Coding For Dummies", "Books", 25, 300),
("The Art of War", "Books", 30, 125);

CREATE TABLE departments (
	department_id INT NOT NULL AUTO_INCREMENT,
    department_name VARCHAR(50) NOT NULL,
    over_head_costs INT NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES ("Electronics", 50000),
("Clothing", 30000),
("Appliances", 60000),
("Tools", 25000),
("Books", 12500);