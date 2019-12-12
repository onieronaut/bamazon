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
    menuPrompt();
})


// Inquirer prompt to ask user what they would like to do followed by a switch statement to take action based on their decision.
function menuPrompt() {

    const questions =
{
    type: "list",
    name: "action",
    message: "What would you like to do?",
    choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Exit"
    ]
}

    inquirer.prompt(questions).then(answers => {

        switch (answers.action) {

            case questions.choices[0]:
                displayProducts();
                break;

            case questions.choices[1]:
                displayLowInventory();
                break;

            case questions.choices[2]:
                addInventory();
                break;

            case questions.choices[3]:
                addNewProduct();
                break;

            case questions.choices[4]:
                connection.end();
                break;

        }
    })

}


// Makes a query to the database and logs all information on all products
function displayProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            console.log(
                "ID: " + res[i].id +
                " | Name: " + res[i].product_name +
                " | Price: $" + res[i].price +
                " | Stock: " + res[i].stock_quantity
            )
        }
        menuPrompt();
    })
}

// Makes a query to the database and logs the products with a stock value of less than 5
function displayLowInventory() {

    connection.query("SELECT id, product_name, stock_quantity FROM products WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            console.log(
                "Low Inventory List\n" +
                "ID: " + res[i].id +
                " | Name: " + res[i].product_name +
                " | Stock: " + res[i].stock_quantity
            )
        }
        menuPrompt();
    })
}

// Displays all products and then prompts the user as to which product they want to add inventory to, followed by the amount of units they'd like to add
function addInventory() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        let numProducts = res.length;

        for (let i = 0; i < res.length; i++) {

            console.log(
                "ID: " + res[i].id +
                " | Name: " + res[i].product_name +
                " | Stock: " + res[i].stock_quantity
            )
        }

        const questions = [
            {
                type: "input",
                name: "product_id",
                message: "What is the ID of the product you would like to add inventory to?",
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
                name: "units_added",
                message: "How many units of this product would you like to add?",
                validate: function (input) {
                    if (!isNaN(input) && input > 0) {
                        return true;
                    }
                    return "Please enter a valid number"
                }
            }
        ]

        inquirer.prompt(questions).then(answers => {

            connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?", [answers.units_added, answers.product_id],
                function (err, res) {
                    if (err) throw err;
                    console.log("Units successfully added to inventory");
                    menuPrompt();

                })
        })
    })

}

// Prompts the user parameters to add a new product and then inserts it into the database 
function addNewProduct() {

    const questions = [
        {
            type: "input",
            name: "product_name",
            message: "What is the name of the product?"
        },
        {
            type: "input",
            name: "department_name",
            message: "What department does this product belong in?"
        },
        {
            type: "input",
            name: "price",
            message: "What is the price of the product?",
            validate: function (input) {
                if (!isNaN(input) && input > 0) {
                    return true;
                }
                return "Please enter a valid price"
            }
        },
        {
            type: "input",
            name: "stock",
            message: "What is the starting stock of this product?",
            validate: function (input) {
                if (!isNaN(input) && input > 0) {
                    return true;
                }
                return "Please enter a valid number"
            }
        }
    ]

    inquirer.prompt(questions).then(answers => {

        connection.query("INSERT INTO products SET ?",
        {
            product_name: answers.product_name,
            department_name: answers.department_name,
            price: answers.price,
            stock_quantity: answers.stock
        }, function (err, res) {
            if (err) throw err;
            console.log("New product successfully added!\n")
            menuPrompt();
        }
        )
    })
}