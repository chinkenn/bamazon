var mysql = require('mysql');
var inquirer = require('inquirer');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bamazon'
});
connection.connect(function(err) {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId + '\n');
    viewProduct();
    //takeOrder();
});
function viewProduct() {
    console.log('Selecting from the following products \n');
    connection.query('SELECT * FROM products', function(err,res) {
        if (err) throw err;
        //console.log(res);
        for(i = 0; i < res.length; i++) {
            console.log('Item ID: ' + res[i].item_id + ' Product Name: ' + res[i].product_name + ' Department Name: ' + 
            res[i].department_name + ' Price: ' + res[i].price + ' Stock Qty: ' + res[i].stock_quantity);
        }
        // connection.end();
        takeOrder();
    });
}
function takeOrder() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What Item ID would you like to buy?',
            name: 'product'
        },
        {
            type: 'input',
            message: 'How many would you like to buy?',
            name: 'quantity'
        }
    ]).then(function(inquirerResponse) {
        var orderId = parseInt(inquirerResponse.product);
        var orderQty = parseInt(inquirerResponse.quantity);
        connection.query('SELECT * FROM products WHERE item_id = ?', [orderId], function(err, res) {
            var currentStock = parseInt(res[0].stock_quantity);
            var currentPrice = parseFloat(res[0].price);
            if (orderQty <= currentStock) {
                currentStock = currentStock - orderQty;
                connection.query('UPDATE products SET ? WHERE ?', 
                [{
                    stock_quantity: currentStock
                },
                {
                    item_id: orderId
                }
                ]);
                var cost = orderQty * currentPrice;
                console.log('Your price is ' + cost);
                connection.end();
            } else {
                console.log('Insufficient stock!');
                connection.end();
            }
        });
    });
}