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
        buyProducts(res.length);
    })
}

function buyProducts(numProducts) {

    const questions = [
        {
            type: "input",
            name: "product_id",
            message: "What is the ID of the product you would like to buy?",
            validate: function (input) {
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
                if (!isNaN(input)) {
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
                                    console.log("Your order has been placed! The total cost was $" + total);

                                })
                            connection.end();
                        })
                }
            });



    })
}