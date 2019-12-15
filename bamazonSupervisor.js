const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "bamazon"
});

const inquirer = require("inquirer");

const {table} = require('table');

connection.connect(function (err) {
    if (err) throw err;
    menuPrompt();
})


// On startup this function is called to prompt the user as to what they'd like to do and proceeds with an action via the switch statement
function menuPrompt() {

    const questions =
    {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
            "View Product Sales by Department",
            "Create New Department",
            "Exit"
        ]
    }

    inquirer.prompt(questions).then(answers => {

        switch (answers.action) {

            case questions.choices[0]:
                viewDepartmentSales();
                break;

            case questions.choices[1]:
                createDepartment();
                break;

            case questions.choices[2]:
                connection.end();
                break;

        }
    })

}

// Joins the products and departments tables by their shared department name heading. Adds up all of the product sales based on their departments and displays the data back to the user in a table.
function viewDepartmentSales() {

    const query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.department_name, SUM(products.product_sales) AS product_sales FROM departments INNER JOIN products ON (departments.department_name = products.department_name) GROUP BY departments.department_name"

    connection.query(query, function (err, res) {
        if (err) throw err;

        // Setting up our data to be parsed by the NPM table package
        let data, output;

        data = [
            ["Department ID", "Department Name", "Overhead Cost", "Product Sales", "Total Profit"],
        ];

        for (let i = 0; i < res.length; i++) {
            data.push([res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, (res[i].product_sales - res[i].over_head_costs)])
        }

        // Using the NPM table package we can output our data into a clean formatted table
        output = table(data);
        console.log(output);
        menuPrompt();
    })
}

// Creates a new department by inserting a new entry into the table after retrieving user input
function createDepartment() {

    const questions = [
        {
            type: "input",
            name: "department_name",
            message: "What is the name of the new department?"
        },
        {
            type: "input",
            name: "overhead_costs",
            message: "What are the overhead costs for the department?",
            validate: function (input) {
                if (!isNaN(input) && input > 0) {
                    return true;
                }
                return "Please enter a valid number"
            }
        }
    ]

    inquirer.prompt(questions).then(answers => {

        connection.query("INSERT INTO departments SET ?",
            {
                department_name: answers.department_name,
                over_head_costs: answers.overhead_costs
            }, function (err, res) {
                if (err) throw err;
                console.log("New department successfully added!\n")
                menuPrompt();
            })
    })
}