var mysql = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');
var Colors = require('colors');

// create connection for the database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "Bamazon"
});

//connect to mysql and show connection id//////////////////
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    managerBamazon();
});

function managerBamazon(){
    inquirer.prompt([
        {
        name: 'choice',
        type: 'list',
        message: 'Make a manager selection',
        choices: ['View Products for Sale', 'View Low Inventory', 'Add New Inventory', 'Add New Product', 'Exit']
        }
    ]).then(function(manager){
        switch(manager.choice) {
            case 'View Products for Sale':
                viewProducts();  // when user selects view producs go to viewProducts function
            break;

            case 'View Low Inventory': // user selects view low inv - go to low inv function
                viewLowInv();  
            break;
           
            case 'Add New Inventory':
                addInv();               // user selects add inv - go to addInv function
            break;

            case 'Add New Product':
                addProduct();           // user selects add product - go to add product function
            break;

            case 'Exit':
                connection.end();       // end connection to DB when user selects exit
            break
        }
    });
}

function viewProducts(){
    // prints table using cool cti program - same as customer Bamazon
    var table = new Table({
    head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity Available']
    });
    connection.query('SELECT * FROM Products', function(err, res){
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
        table.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price_ctc, res[i].stock_quantity]);
        }
    console.log(table.toString());
    managerBamazon();
    });
  }  /// end products function to print info to screen

function viewLowInv(){
    connection.query('SELECT * FROM Products WHERE stock_quantity < 10',
        function(err,res){
            if(err) throw err;
            if (res.length === 0){
                console.log("The inventory is good, nothing less than 10");
                products();
            } else {
                var table = new Table ({
                    head: ['Item ID', 'Product Name', 'Department', 'Price', 'Quantity Available']
                    }); 
                for (var i = 0; i < res.length; i++) {
                    table.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price_ctc, res[i].stock_quantity]);
                    }
                console.log(table.toString());
                console.log("The following items have a low inventory");
                managerBamazon();
                }
            });
}  // end function to view low inventory (less than 10) to screen

function addInv() {
    var items = [];
    connection.query('SELECT product_name FROM Products', function(err,res){
        if(err) throw err;
        for (var i = 0; i < res.length; i++){
            items.push(res[i].product_name)
        }
        // inquirer to ask manager what they want to update
        inquirer.prompt([
            {
            name: 'choices',
            type: 'checkbox',
            message: "Select a product to add inventory",
            choices: items
            }
            ]).then(function(manager){
                if(manager.choices.length === 0){
                    console.log("Please select something");
                    managerBamazon();
                } else {
                    console.log("in the add inv funciton");
                    //add a function to show inv
                }
            });
        });
}

function addProduct() {
    var departments = [];

    connection.query('SELECT department_name FROM Department', function(err,res){
        if(err) throw err;
        for(var i = 0; i < res.length; i++) {
            departments.push(res[i].department_name);
        }
    });  /// pushing new into departments now prompt user for more info
    inquirer.prompt([
        {
        name: 'item',
        type: 'text',
        message: 'Enter the name of the product you want to add'
        },
        {
        name: 'department',
        type: 'list',
        message: 'Enter the name of the department of the product',
        choices: departments
        },
        {
        name: 'price',
        type: 'text',
        message: 'Enter the item price'
        },
        {
        name: 'quantity',
        type: 'text',
        message: 'Enter the total stock quantity'
        }
        ]).then(function(manager){         // adding items to db
            var item = {
                product_name: manager.item,
                department_name: manager.department,
                price_ctc: manager.price,
                stock_quantity: manager.quantity
            }
            //console.log(item);
            connection.query('INSERT INTO Products SET ?', item,
                function(err){
                    if(err) throw err;
                    console.log(item.product_name + ' has been added');
                    managerBamazon();
                });
            });

}  ///end add products
