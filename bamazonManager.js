var inquirer = require("inquirer");
var mysql = require("mysql");
const {table} = require('table');
var data = [
    ['ItemID', 'Product', 'Department', 'Price', 'Inventory']
]

var connection = mysql.createConnection({
    host: "192.168.99.100",
  
    port: 3306,
  
    user: "root",
  
    password: "docker",

    database: "bamazon"
  });

  connection.connect(function(err) {

    if (err) throw err;
    console.log(`Connected as ID ${connection.threadId}`);

  });

function mainMenu() {
    
    inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'What would you like to do?',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product']
    }).then(function(answers) {

        switch (answers.command) {
            case 'View Products for Sale':
                
                console.log("Showing all products for sale:");
                viewProducts();
                break;

            case 'View Low Inventory':
                
                console.log("Showing products with low inventory (<5):")
                viewLowInv();
                break;

            case 'Add to Inventory':
            
                promptManager();
                break;

            case 'Add New Product':
                
                console.log("Adding new product:");
                getNewProdInfo();
                break;
        
            default:

                console.log("Something went wrong, please try again.");
                break;
        }

    })

}

function viewProducts() {

    connection.query("select * from products", function(err, res) {

        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            var newRow = [res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price.toFixed(2)}`, res[i].stock_quantity];
            data.push(newRow);
            
        }

        console.log(table(data));
        data = [
            ['ItemID', 'Product', 'Department', 'Price', 'Inventory']
        ]
        continueManaging();
    })
    
}

function viewLowInv() {

    connection.query("select * from products", function(err, res) {

        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            if (res[i].stock_quantity < 5) {

                var newRow = [res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price.toFixed(2)}`, res[i].stock_quantity];
                data.push(newRow);
                
            }
            
        }

        console.log(table(data));
        data = [
            ['ItemID', 'Product', 'Department', 'Price', 'Inventory']
        ]
        continueManaging();
    })
    
}

function promptManager() {

    connection.query("select * from products", function(err, res) {

        if (err) throw err;

        for (let i = 0; i < res.length; i++) {

            var newRow = [res[i].item_id, res[i].product_name, res[i].department_name, `$${res[i].price.toFixed(2)}`, res[i].stock_quantity];
            data.push(newRow);
            
        }

        console.log(table(data));
        data = [
            ['ItemID', 'Product', 'Department', 'Price', 'Inventory']
        ]

        inquirer.prompt([
            {
                type: 'number',
                name: 'itemToBuy',
                message: 'Please enter the ID of the item for which you would like to add inventory.'
            },
            {
                type: 'number',
                name: 'quantity',
                message: 'How many would you like to add?'
            }
        ]).then(function(answers){
    
            addToInv(answers.itemToBuy, answers.quantity);
    
        })
    })
    
}

function addToInv(id, quant) {

    connection.query(`Select * from products where item_id = ${id}`, function(err, res) {

        if (err) throw err;

        connection.query(`update products set stock_quantity = stock_quantity + ${quant} where item_id = ${id}`);
        console.log(`Added ${quant} ${res[0].product_name}(s) to inventory.`);

        continueManaging();

    })

}

function getNewProdInfo() {

    inquirer.prompt([{
        type: "input",
        name: "name",
        message: "Enter the name of the product."
    },
    {
        type: "input",
        name: "department",
        message: "Enter the department of the product."
    },
    {
        type: "number",
        name: "price",
        message: "Enter the price of the product."
    },
    {
        type: "number",
        name: "quantity",
        message: "Enter the initial stock quantity of the product."
    }
    ]).then(function(answers) {

        addToInv(answers.name, answers.department, answers.price, answers.quantity);

    })

}

function addToInv(name, dept, price, quant) {

    connection.query(`insert into products (product_name, department_name, price, stock_quantity) values ("${name}", "${dept}", ${price}, ${quant})`);
    console.log("Product added.");
    continueManaging();
    
}

function continueManaging() {

    inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to continue managing?',
        default: true
    }).then(function(answers) {
        if (answers.continue) {
            mainMenu();
        } else {
            console.log("Management session ended.");
            connection.end();
        }
    })
    
}

mainMenu();