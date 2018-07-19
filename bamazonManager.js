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
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
            name: 'choice'
        }
    ]).then(function(inquirerResponse) {
        var choice = inquirerResponse.choice;
        switch (choice) {
            case ('View Products for Sale'):
                viewProducts();
                connection.end();
                break;
            case ('View Low Inventory'):
                viewLowInv();
                connection.end();
                break;
            case ('Add to Inventory'):
                viewProducts();
                addInv();
                //connection.end();
                break;
            case ('Add New Product'):
                addProduct();
                break;
            default:
                console.log('Invalid command');
        }
        
    });
    //connection.end();
});
function viewProducts() {
    console.log('Displaying Products for Sale \n');
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        for(i = 0; i < res.length; i++) {
            console.log('Item ID: ' + res[i].item_id + ' Product Name: ' + res[i].product_name + ' Department Name: ' + 
            res[i].department_name + ' Price: ' + res[i].price + ' Stock Qty: ' + res[i].stock_quantity);
        }
        //connection.end();
    });
}
function viewLowInv() {
    console.log('Display Products with Low Inventory \n');
    connection.query('SELECT * FROM products WHERE stock_quantity <= 5', function (err,res) {
        if(err) throw err;
        for (i = 0; i < res.length; i++) {
            console.log('Item ID: ' + res[i].item_id + ' Product Name: ' + res[i].product_name + ' Department Name: ' + 
            res[i].department_name + ' Price: ' + res[i].price + ' Stock Qty: ' + res[i].stock_quantity);
        }
        //connection.end();
    });
}
function addInv() {
    console.log('Adding to Inventory');
    //viewProducts();
    inquirer.prompt([
        {
            type: 'input',
            message: 'What Item ID to add inventory to?',
            name: 'itemId'
        },{
            type: 'input',
            message: 'How many units would you like to add?',
            name: 'quantity'
        }
    ]).then(function(inquirerResponse) {
        var itemId = parseInt(inquirerResponse.itemId);
        var qty = parseInt(inquirerResponse.quantity);
        console.log('ItemID: ' + itemId);
        console.log('Qty: ' + qty);
        connection.query('SELECT * FROM products WHERE item_id = ?', [itemId], function(err,res) {
            if (err) throw err;
            var currentStock = parseInt(res[0].stock_quantity);
            qty = qty + currentStock;
            connection.query('UPDATE products SET ? WHERE ?',
                [{
                    stock_quantity: qty
                },{
                    item_id: itemId
                }]
            );
            console.log('Item ID ' + itemId + ' new quantity: ' + qty);
            connection.end();
        })
    });      
}
function addProduct() {
    console.log('Adding new products \n');
    inquirer.prompt([
        {
            type: 'input',
            message: 'Product Name: ',
            name: 'productName'
        },{
            type: 'input',
            message: 'Department Name: ',
            name: 'departmentName'
        },{
            type: 'input',
            message: 'Price: ',
            name: 'price'
        },{
            type: 'input',
            message: 'Quantity: ',
            name: 'qty'
        }
    ]).then(function(inquirerResponse) {
        connection.query('INSERT INTO products SET ?', 
            {
                product_name: inquirerResponse.productName,
                department_name: inquirerResponse.departmentName,
                price: parseInt(inquirerResponse.price),
                stock_quantity: parseInt(inquirerResponse.qty)
            }, function (err) {
                if (err) throw err;
                console.log('Success! Added ' + inquirerResponse.productName);
        });
        connection.end();
    })
}