const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

const inquirer = require("inquirer");

connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
})

//Makes a query call to the database and logs the ID, product name, and prices for all entries
function displayProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            console.log(
                "ID: " + res[i].id +
                " | Name: " + res[i].product_name +
                " | Price: $" + res[i].price
            )
        }
        //res.length is the amount of products in the database, we are passing into the next function for validation purposes
        buyProducts(res.length);
    })
}

//Prompts the user which product they want to buy and how many. Checks the database to make sure there is enough product in stock for the user to buy and if successful, updates the database to the new stock.
function buyProducts(numProducts) {

    const questions = [
        {
            type: "input",
            name: "product_id",
            message: "What is the ID of the product you would like to buy?",
            validate: function (input) {
                //If the user input is not a number between the possible amount of product IDs they will be asksed to enter a correct number
                if (!isNaN(input)) {
                    if (input > 0 && input <= numProducts) {
                        return true;
                    }
                }
                return "Please enter a valid number"
            }
        },
        {
            type: "input",
            name: "units_purchased",
            message: "How many units of this product would you like to buy?",
            validate: function (input) {
                if (!isNaN(input) && input > 0) {
                    return true;
                }
                return "Please enter a valid number"
            }
        }
    ]

    inquirer.prompt(questions).then(answers => {

        connection.query("SELECT stock_quantity FROM products WHERE id = ?", [answers.product_id],
            function (err, res) {
                if (err) throw err;

                if (res[0].stock_quantity < 1) {

                    console.log("This item is currently sold out!");
                    connection.end();

                } else if (res[0].stock_quantity < answers.units_purchased) {

                    console.log("There are not enough units to fulfill your order!");
                    connection.end();

                } else {

                    connection.query("UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: res[0].stock_quantity - answers.units_purchased
                            },
                            {
                                id: answers.product_id
                            }
                        ],
                        function (err, res) {
                            if (err) throw err;

                            connection.query("SELECT price, stock_quantity FROM products WHERE id = ?", [answers.product_id],
                                function (err, res) {
                                    if (err) throw err;

                                    let total = (res[0].price * answers.units_purchased);
                                    addSales(answers.product_id, total);
                                    console.log("Your order has been placed! The total cost was $" + total);

                                    connection.end();
                                })
                        })
                }
            });



    })
}

// After each purchase the total price of the sale is stored as an all time total in the database
function addSales(product_id, total_price) {

    connection.query("UPDATE products SET product_sales = product_sales + ? WHERE id = ?",
        [total_price, product_id], function (err, res) {
            if (err) throw err
        })
}