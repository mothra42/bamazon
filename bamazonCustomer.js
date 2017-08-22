var inquirer = require("inquirer");
var Table = require("easy-table");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "bamazon"
});

//function used to choose between different types of service.
function userPath()
{
  inquirer.prompt([
      {
        type: "list",
        message: "Are you a customer, manager, or supervisor?",
        choices: ["Customer", "Manager", "Supervisor"],
        name: "userChoice"
      }
  ]).then(function(inqRes)
  {
    switch(inqRes.userChoice)
    {
      case "Customer":
        displayProducts();
        setTimeout(buyItem, 500);
        break;
      case "Manager":
        manager();
        break;
      case "Supervisor":
        supervisor();
        break;
    }
  });
}

//this function is to structure the data from the bamazon Database
//so that easy-table can read the data.
function DataTable(id, product, department, price, stock)
{
  this.id = id;
  this.product = product;
  this.department = department;
  this.price = price;
  this.stock = stock;
}

//This function displays the products so the user can view them.
function displayProducts()
{
  var rows = [];
  var t = new Table;
  connection.query("SELECT * FROM products", function(err, res)
  {
    for (var i = 0; i < res.length; i++)
    {
      var newRow = new DataTable(res[i].item_id, res[i].product_name, res[i].department_name,
                res[i].price, res[i].stock_quantity);
      rows.push(newRow);
    }

    rows.forEach(function(product)
    {
      t.cell("Product ID", product.id);
      t.cell("Product Name", product.product);
      t.cell("Department", product.department);
      t.cell("Price", product.price);
      t.cell("Stock", product.stock, Table.number(1));
      t.newRow();
    });
    console.log(t.toString());
  });
}

function buyItem()
{
  inquirer.prompt([
    {
      type: "input",
      message: "Please enter the ID of the product you would like to buy",
      name: "id",
      validate: function(str)
      {
        if(isNaN(str) === true) return false;
        else return true;
      }
    },
    {
      type: "input",
      message: "How many would you like to buy?",
      name: "quant",
      validate: function(str)
      {
        if(isNaN(str) === true) return false;
        else return true;
      }
    }
  ]).then(function(inqRes)
  {
    connection.query("SELECT stock_quantity FROM products WHERE ?",
    {
      item_id: parseInt(inqRes.id)
    },
    function(err, res)
    {
      if(parseInt(inqRes.quant) <= res[0].stock_quantity)
      {
        var diff = res[0].stock_quantity - inqRes.quant;
        totalPrice(inqRes.id, inqRes.quant);
        updatePurchase(inqRes.id, diff, false);
      }
      else
      {
        console.log("Insufficient Stock");
      }
    });
  });
}

function totalPrice(id, quant)
{
  connection.query("SELECT price FROM products WHERE ?",
  {
    item_id: id
  },
  function(err, res)
  {
    var total = (res[0].price * quant);
    console.log("total cost is $" + total);
    updateSales(id, total);
  });
}

function updateSales(id, total)
{
  connection.query("UPDATE products SET product_sales = product_sales+"+parseFloat(total)+" WHERE item_id ="+parseInt(id),
  function(err, res)
  {
    if (err) throw err;
  });
}

function updatePurchase(id, quant)
{
  connection.query("UPDATE products SET ? WHERE ?",
  [
    {
      stock_quantity: quant
    },
    {
      item_id: id
    }
  ], function(err, res)
  {
    displayProducts();
    setTimeout(buyItem,500);
  });
}

function manager()
{
  inquirer.prompt([
    {
      type: "list",
      message: "Choose your action",
      choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product"],
      name:"choice"
    },
  ]).then(function(inqRes)
  {
    switch(inqRes.choice)
    {
      case "View products for sale":
        displayProducts();
        setTimeout(manager, 500);
        break;
      case "View low inventory":
        viewLow()
        break;
      case "Add to inventory":
        displayProducts()
        setTimeout(addToInventory, 500);
        break;
      case "Add new product":
        addProduct();
        break;
    }
  });
}

function viewLow()
{
  var rows = [];
  var t = new Table;
  connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res)
  {
    for (var i = 0; i < res.length; i++)
    {
      var newRow = new DataTable(res[i].item_id, res[i].product_name, res[i].department_name,
                res[i].price, res[i].stock_quantity);
      rows.push(newRow);
    }

    rows.forEach(function(product)
    {
      t.cell("Product ID", product.id);
      t.cell("Product Name", product.product);
      t.cell("Department", product.department);
      t.cell("Price", product.price);
      t.cell("Stock", product.stock, Table.number(1));
      t.newRow();
    });
    console.log(t.toString());
    manager();
  });
}

function addToInventory()
{
  inquirer.prompt([
  {
    type: "input",
    message: "Please enter the ID of the product that you want to order",
    name: "id",
    validate: function(str)
    {
      if(isNaN(str) === true) return false;
      else return true;
    }
  },
  {
    type: "input",
    message: "How much stock do you want to buy?",
    name: "quant",
    validate: function(str)
    {
      if(isNaN(str) === true) return false;
      else return true;
    }
  }
  ]).then(function(inqRes)
  {
    connection.query("UPDATE products SET stock_quantity = stock_quantity + " +connection.escape(inqRes.quant)+ " WHERE ?",
      {
        item_id: parseInt(inqRes.id)
      },
    function(err, res)
    {
      displayProducts();
      setTimeout(manager, 500);
    });
  });
}

function addProduct()
{
  inquirer.prompt([
      {
        type: "input",
        message: "What is the name of the product?",
        name: "name"
      },
      {
        type: "input",
        message: "What department is the product for?",
        name: "dept"
      },
      {
        type: "input",
        message: "How much does the product cost?",
        name: "price",
        validate: function(str)
        {
          if(isNaN(str) === true) return false;
          else return true;
        }
      },
      {
        type: "input",
        message: "How many do you want to stock?",
        name: "stock",
        validate: function(str)
        {
          if(isNaN(str) === true) return false;
          else return true;
        }
      }
  ]).then(function(inqRes)
    {
      connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity)"
                +"VALUES("+connection.escape(inqRes.name)+", "+connection.escape(inqRes.dept)+", "
                +connection.escape(parseFloat(inqRes.price))+", "+connection.escape(parseInt(inqRes.stock))+")"
                ,function(err, res)
                {
                  displayProducts();
                  setTimeout(manager, 500);
                });
    });
}

function supervisor()
{
  inquirer.prompt([
    {
      type: "list",
      message: "Please choose your action",
      choices: ["View Product Sales by Department","Create New Department"],
      name: "choice"
    }
  ]).then(function(inqRes)
  {
    switch(inqRes.choice)
    {
      case "View Product Sales by Department":
        viewDepartmentSales();
        break;
      case "Create New Department":
        addDepartment();
        break;
    }
  });
}

function viewDepartmentSales()
{
  connection.query("SELECT department_id,  departments.department_name, departments.over_head_costs,SUM(products.product_sales) AS product_sales" + " FROM products" +" INNER JOIN departments ON products.department_name = departments.department_name "
  +"GROUP BY departments.department_id", function(err, res)
  {
    if(err) throw err;
    var rows = [];
    var t = new Table;
    console.log(res);
    for (var i = 0; i < res.length; i++)
    {
      var totalProfit = res[i].product_sales - res[i].over_head_costs;
      var newRow = new DataTable(res[i].department_id, res[i].department_name, res[i].over_head_costs,
                res[i].product_sales, totalProfit);
      rows.push(newRow);
    }
    rows.forEach(function(product)
    {
      console.log(product);
      t.cell("Department ID", product.id);
      t.cell("Department Name", product.product);
      t.cell("Overhead Costs", product.department);
      t.cell("Product Sales", product.price);
      t.cell("totalProfit", product.stock, Table.number(2
      ));
      t.newRow();
    });
    console.log(t.toString());
  });
}

function addDepartment()
{
  inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the department?",
      name: "name"
    },
    {
      type: "input",
      message: "How much are the overhead costs?",
      name: "overhead",
      validate: function(str)
      {
        if(isNaN(str) === true) return false;
        else return true;
      }
    }
  ]).then(function(inqRes)
  {
    connection.query("INSERT INTO departments(department_name, over_head_costs)"+
          " VALUES ("+connection.escape(inqRes.name)+", "+connection.escape(parseFloat(inqRes.overhead))+")")
  });
}
userPath();
