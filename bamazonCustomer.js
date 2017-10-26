var mysql = require('mysql');
var Table = require('cli-table');
var inquirer = require('inquirer');
var Colors = require('colors');

// create connection for the database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    database: "bamazonDB"
});

//connect to mysql and show connection id//////////////////
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    printItems(function(){
    selectItem();  // calls to function select item to ask user to select item
    });
});


var shoppingCart = [];
var totalCost = 0;

//function to prirnt product table items to console /////////////////////
function printItems(showtable){
  var table = new Table({
    head: ['id', 'product', 'department', 'price', 'quantity']
  });
  connection.query('SELECT * FROM Products', function(err, res){
    if (err) throw err;
    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product, res[i].department, '$' + res[i].price, res[i].quantity]);
    }
    console.log(table.toString());
    showtable();
    });
  }
////// end function printItems//////////////////////////////////////
//////// function select Item that asks user to select items for shopping cart//////////////

function selectItem(){
   var items = [];
                        //going to sqltable to get info from products table
   connection.query('SELECT product FROM Products', function(err, res){
       if (err) throw err;
        for (var i = 0; i < res.length; i++) {   // populate array
        items.push(res[i].product);
        }
// inquirer prompt in selectItem function to add items to cart //
     inquirer.prompt([
      {
      name: 'choices',
      type: 'checkbox',
      message: 'Press the space key to select each Product and enter when you are finished shopping.',
      choices: items
      }
      ]).then(function(customer){
       if (customer.choices.length === 0) {        // if choices empty - run
         console.log('Please select an item');
         inquirer.prompt([
           {
           name: 'choice',
           type: 'list',
           message: 'Your cart is empty. Would you like to keep shopping or exit?',
           choices: ['Continue Shopping', 'Exit']
           }
      ]).then(function(customer){
        if (customer.choice === 'Continue Shopping') {
            printItems(function(){    // calls back to print items for display
            selectItem();             // calls back to current function to run again
            });
            } else {
              console.log('Exiting');
              connection.end();  // drops database connection
             }
          });
        } else {
          numberOfItems(customer.choices);
        }
    });
    });
  } 

// end function select items//////////////////////// 
///// begin function to aske and calculate items in cart by user////

function numberOfItems(itemNames){

  var item = itemNames.shift();
  // shift method removes the first item of an array and returns that item//
  var itemStock;  // declares a new variable to hold stock quantity
  var itemCost;  // declares a new variable to hold items cost
  var department;  // declares a new variable to hold department info

    connection.query('SELECT quantity, price, department FROM Products WHERE ?', {
    product_name: item
    }, function(err, res){
     if(err) throw err;
     itemStock = res[0].stock_quantity;
     itemCost = res[0].price_ctc;
     department = res[0].department_name;
     });
    //prompt the user to ask how many of the item they would like
   inquirer.prompt([
     {
    name: 'amount',
    type: 'text',
    message: 'Select how many ' + item + ' you would like to purchase',
    //validate that we have the correct amount of the item in stock
     validate: function(instock){
         if (parseInt(instock) <= itemStock) {
           return true
         } else {
           //checks stock for enough items and lets user know if there is not enough
           console.log('Insufficient quantity ' + itemStock + ' of those in stock.');
           return false;
         }
       }
     }
   ]).then(function(user){
     var amount = user.amount;
     //create an object for valid items in shoppingcart
     shoppingCart.push({
       item: item,
       amount: amount,
       itemCost: itemCost,
       itemStock: itemStock,
       department: department,
       total: itemCost * amount
     });
      //loop until there are no more items left
     if (itemNames.length != 0) {
       numberOfItems(itemNames);
     } else {
      //go to check out function when ready
      checkout(); 
     }
     });
 }

/////////// end function number of items that calls checkout ////////////

/////////// begin function checkout to put items in cart before updating database//
function checkout(){
   if (shoppingCart.length != 0) {  //start process if items are in cart
    var fTotal = 0;        // sets final total to zero
    console.log("Are you ready to checkout with the following items?");
      for (var i = 0; i < shoppingCart.length; i++) {
        var item = shoppingCart[i].item;
        var amount = shoppingCart[i].amount;
        var cost = shoppingCart[i].itemCost;
        var total = shoppingCart[i].total;
        var itemCost = cost * amount;
        fTotal += itemCost;    // adds 
        console.log(amount + ' ' + item + ' ' + '$' + total);
      }  // end for loop
      console.log("Total: $" + fTotal);  // show total
      //ask user if they are ready to checkout/edit
      inquirer.prompt([
       {
         name: 'checkout',
         type: 'list',
         message: 'Are You Ready To Checkout?',
         choices: ['Checkout', 'Edit Cart']
       }
     ]).then(function(res){
          //if the user checks out, use updatedatabase function to update SQL
         if (res.checkout === 'Checkout') {
             updateDatabase(fTotal);
            } else {
           //user can edit cart via editCart function
           editCart();
            }
          });
          } else {
          //test to make sure cart is empty or full and prompt user
        inquirer.prompt([
        {
          name: 'choice',
          type: 'list',
          message: 'The cart is empty, do you want to keep shopping or exit?',
          choices: ['Continue Shopping', 'Exit']
        }
        ]).then(function(user){
         //options to continue or stop
         if (user.choice === 'Continue Shopping') {
            printItems(function(){
            selectItem();
           });
          } else {
           console.log('Exiting Bamazon');
           connection.end();
         }
     });  // end function user
   }
 } /// end function checkout
//////// end function check which calculates cart info and continues to update SQL

// function updateDatabase

function updateDatabase(fTotal){
   var item = shoppingCart.shift();  //use shift to get first item in the array similar to numberofitems function
   var itemName = item.item;
   var itemCost = item.itemCost
   var userPurchase = item.amount;
   var department = item.department;
   var departmentTransaction = itemCost * userPurchase;
   connection.query('SELECT total_sales FROM Department WHERE ? ' , {
    department_name: department

   }, function(err, res){
    //console.log("res" + JSON.stringify(res));
      var departmentTotalSale = res[0]["total_sales"];

      connection.query('UPDATE Department SET ? WHERE ?', [
    {
      total_sales: departmentTotalSale += departmentTransaction
    },
    {
      department_name: department
    }], function(err){
      if(err) throw err;
    });
   });

//query mysql to get the current StockQuantity of the item in case it has changed since the user has added the item to shoppingCart
    connection.query('SELECT stock_quantity FROM Products WHERE ?', {
    product_name: itemName

    }, function(err, res){
     var currentStock = res[0].stock_quantity;
     console.log("Current Stock " + currentStock);
     //update the quantity in the database
     connection.query('UPDATE Products SET ? WHERE ?', [
     {
      stock_quantity: currentStock -= userPurchase
     },
     {
       product_name: itemName
     }], function(err){
       if(err) throw err;
       //if there are still items in the shoppingCart run the function again
       if (shoppingCart.length != 0) {
         updateDatabase(fTotal);
       } else {
         //if no items remain in the shoppingCart alert the user of the total and exit
         fTotal = fTotal.toFixed(2);
         console.log('Thank you for using Bamazon!');
         console.log('Your total is $' + fTotal);
         connection.end();
              }  // closes else statement
        });
      });
  }  // close ftotal


////////////////function to edit the user shopping cart //////

function editCart(){
  //push all product names of the items in the shoppingCart to an array
   var items = [];
   for (var i = 0; i < shoppingCart.length; i++) {
     var item = shoppingCart[i].item;
     items.push(item);
   }
   //prompt the user to select items to edit
   inquirer.prompt([
     {
     name: 'choices',
     type: 'checkbox',
     message: 'Select which item(s) you want to edit.',
     choices: items
     }
   ]).then(function(user){
       if (user.choices.length === 0) {
         console.log('Select something to edit from your cart');
         checkout();
       } else {
         var itemsToEdit = user.choices;
         editItem(itemsToEdit);
       }
   });
 }

 // end edit cart function//

// //function to edit items in cart //
 function editItem(itemsToEdit){
   if (itemsToEdit.length != 0) {
     var item = itemsToEdit.shift();  // use the shift to pick item from array
     inquirer.prompt([
       {
       name: 'choice',
       type: 'list',
       message: 'Do you want to remove ' + item + ' from your cart change the quantity?',
       choices: ['Remove Item From My Cart', 'Change Quanity']
       }
     ]).then(function(user){
         //if remove from cart is selected remove the item from the shoppingCart array
         if (user.choice === 'Remove Item From My Cart') {
           for (var i = 0; i < shoppingCart.length; i++) {
             if (shoppingCart[i].item === item) {
                shoppingCart.splice(i, 1);
                console.log('Your cart is now updated');
             }
          }  // end for loop
           editItem(itemsToEdit);  // function again to see if there are items left in cart
         } else {
          //inquiere to ask about quantity to
           inquirer.prompt([
             {
             name: 'amount',
             type: 'text',
             message: 'How many ' + item + ' would you like to purchase?',
             }
           ]).then(function(user){    //update the shoppingCart with new amount
             for (var i = 0; i < shoppingCart.length; i++) {
               if (shoppingCart[i].item === item) {
                 shoppingCart[i].amount = user.amount;
                 shoppingCart[i].total = shoppingCart[i].itemCost * user.amount;
                 console.log('Your cart is now updated');
               }  // end if loop
             }  // end for loop
             editItem(itemsToEdit);  // call edititem again for check
           });
         }
       });
   } else {
     checkout();  // call checkout function
   }
 }

