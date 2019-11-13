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

function showProducts() {

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
        promptCustomer();
    })

}

function promptCustomer() {

    inquirer.prompt([
        {
            type: 'number',
            name: 'itemToBuy',
            message: 'Please enter the ID of the item you would like to purchase.'
        },
        {
            type: 'number',
            name: 'quantity',
            message: 'How many would you like to purchase?'
        }
    ]).then(function(answers){

        placeOrder(answers.itemToBuy, answers.quantity);

    })

}

function placeOrder(id, quant) {

    connection.query(`Select * from products where item_id = ${id}`, function(err, res) {

        if (err) throw err;

        if (quant <= res[0].stock_quantity) {
            var totalCost = res[0].price * quant;
            console.log("Your order has been placed!");
            console.log(`Your total comes to $${totalCost.toFixed(2)} for ${quant} ${res[0].product_name}(s).`);

            connection.query(`update products set stock_quantity = stock_quantity - ${quant} where item_id = ${id}`);
        } else {
            console.log(`Sorry! We don't have enough ${res[0].product_name} in stock to fulfill your order.`)
        };

        continueShopping();

    })

}

function continueShopping() {

    inquirer.prompt({
        type: 'confirm',
        name: 'continue',
        message: 'Would you like to continue shopping?',
        default: true
    }).then(function(answers) {
        if (answers.continue) {
            showProducts();
        } else {
            console.log("Thanks for shopping at Bamazon! See you soon!");
            connection.end();
        }
    })

}

showProducts();