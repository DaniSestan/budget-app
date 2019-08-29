var budgetController = (function () {
  //  @5.d.i - used to create objects that will be passed returned by the addItem() method of this module to push the instance to an array contained in the data model, defined below, and to return that new instance.
  // constructors for expense and income items are defined
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100)
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };
  
  // @10.a - will be used to in (this mod) calculateBudget()
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  // @5.c.i - data is used in the addItem method of this module.
  // @6 - the data object aggregates all the data used to calculate values used for each new item in the budget app.
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  // @4.d.ii - addItem is called within the controller module ctrlAddItem method when the user submits input to add a new budget item
  // @5 - addItem is a method that creates a new item using the 'Expense' or 'Income' constructor, pushes the new instance of the item to the data array, and returns that new item instance.
  return {
  // @ 5.a - addItem() method takes in arguments passed in as the input for each field for the new item. these field values are then used to construct a new item object Expense/Income data model
    addItem: function(type, des, val) {
      // @5.b - vars declared, to be used for creating new item to push to data array with Expense/Income objects
      var newItem, ID;
      
     // @ 5.c. - a new index id value is assigned to the object, that prevents duplicate ids. if simply assigned the length of the array - 1, the id value would not account for any objects that were deleted in the array. The if else expression will determine whether the array is empty or not. if it contains other elements it will determine id property value of the last element in one of two arrays (the array reference is defined by the type arg), and it will increment its id by one, then assign that value to the var that will define the new item's id.
     // Create new ID
      if (data.allItems[type].length > 0) {
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
          ID = 0;
      }
      
      // @5.d - if/else statement will determine whether to create an instance of 'Expense' or 'Income', and pass the outer function args as args for the constructor, as well as the new id.
      // Create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
          newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
          newItem = new Income(ID, des, val);
      }
      
      // @5.e - new item pushed to array (either income or exp array, dep on type arg)
      // Push it into our data structure
      data.allItems[type].push(newItem);
      
      // @5.f - new item returned by the method
      // Return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var index;
      var ids;

      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },


    // @10
    calculateBudget: function() {
      // calc total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // calc the budget : income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      // calc the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
      
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);  
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    // @10.a
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

// create data struc for all exp/inc/total vals 

var UIcontroller = (function(){
  // here, all the DOM strings, representing attribute values of html elements in the index.html file. These refer to elements used in the script. If the attribute value is changed in the html file directly, the DOMstrings object allows for one place where the corresponding values in the script can all be reassigned their new value, rather than having to reassign the value in multiple place, were they to be hardcoded wherever referenced.
  // @3.a.ii - 'DOMstrings' is returned by the getDOMStrings() method which can be used by event listeners to reference html elements 
  // @4.c.ii - DOMstrings properties are referenced by getInput() method which initializes properties with the value of the html element identified by attribute values
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function(num, type) {
    var numSplit;
    var int;
    var dec;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substring(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
    }
  };
  
  // data privacy is ensured with the UIcontroller being an IIFE, here the only way to access the data is by calling the UIcontroller object's through the values in its return statement.
  // here its returning an object with functions assigned to properties, so its returning methods through closures that allow its data to be accessed outside the UIController's inner scope.
    return {
    getInput: function () {
      // @4.c.i - here, another object is returned with the 'value' of 'DOMstrings' object's properties.
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        // @4.e.iii - updateBudget() needs to use number vals to make calcs, so 'value' prop needs to be formatted from string val, parsed to float
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      }
    },

    // @4.d.v - will use the 'newItem' obj (controller module), created as instance of 'Expense'/'Income' obj (budgetController module),
    // @7 - used to define values that will render the item in the UI, reflecting user input for creating a new item.
    addListItem: function(obj, type) {
      var html;
      var newHtml;
      var element;

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    // @4.e.i - used in the controller module after enter in input for a new budget item
    // @8
    clearFields: function() {
        var fields;
        var fieldsArr;
        // @8.a - note that querySelectorAll takes mult string values which must be separated by a comma concatenated in the arg to separate the string values
        
        fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
        // @8.a.1 fields will return a list, rather than an array which would be easier to loop over. solution is to convert the list returned to an array. 'slice' method can be used to pass a list into it to return an array. (typically slice is used to return a copy of the array that its called on.)
        // @8.a.2 call method is used: https://www.w3schools.com/js/js_function_call.asp
        
        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current, index, array) {
          current.value = "";
        });
        // @ 8.b - returns focus back to the description field 
        fieldsArr[0].focus();
    },

    // @10
    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';

      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
      
      nodeListForEach(fields, function(current, index) {
          
          if (percentages[index] > 0) {
              current.textContent = percentages[index] + '%';
          } else {
              current.textContent = '---';
          }
      });
      
    },

    displayMonth: function() {
      var now;
      var month;
      var year;

      now = new Date();
      month = now.getMonth();

      var monthStrings = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      month = monthStrings[month];

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = month + " " + year;
      
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);
    
      nodeListForEach(fields, function(cur) {
       cur.classList.toggle('red-focus'); 
      });
    
      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    // @3.a.i - returns private object, 'DOMStrings', local to this UIController module
    getDOMStrings: function () {
      return DOMstrings;
    }
  };
})();

/* this module connects to the other two by taking in the modules as arguments
    in an IIFE. the parameters defined as budgetCtrl and UICtrl correspond to the modules passed in as arguments at the end of the IIFE. 
*/

var controller = (function(budgetCtrl, UICtrl){
  /* >here an event listener is set.
     >response from two actions: clicking the input button and pressing return key
     >ctrlAddItem is called in response to both events
     >when clicking the input button, ctrlAddItem is referenced as a callback function in the addEventListener() function.
     >meanwhile, ctrlAddItem is called within a function that is defined in the argument
  */

  // ***note: setupEventListeners does not account for tabbing over to submit button and hitting enter. hitting enter when the submit button is the 'active'/selected element will trigger input through both hitting the return key and pressing the button in this way. this causes the item to be added twice. can create a function to prevent this.
  // @3 - event handler for submitting user input for adding a budget item
  var setupEventListeners = function () {
    //3.a - create a DOM variable to assign private values, local to the UIController module (passed in through UICtrl param of this parent function/this controller module). The DOM variable is then used to reference strings in DOM that are passed to eventListener functions.
    var DOM = UICtrl.getDOMStrings(); 
    
    // @3.b - event listeners
    // @3.b.i - handles clicking button for submitting input to add new item
    // - click triggers callback function ctrlAddItem
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    // @3.b.ii - handles hitting return key for submitting input to add new item
    // - click triggers callback function ctrlAddItem
    document.addEventListener('keypress', function(event){
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });  

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector (DOM.inputType).addEventListener('change', UICtrl.changedType)

  };

  var updatePercentages = function () {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();
        
    // 2. Read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    
    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
  };

  // @4.e.iii - called by the ctrlAddItem() method after clearing fields, 
  // @9 - updates budget to new total
  var updateBudget = function() {
    // calc budget
    budgetCtrl.calculateBudget();
    // return budget
    var budget = budgetCtrl.getBudget();
    // display budget in UI - test o/p
    // console.log(budget);
    UICtrl.displayBudget(budget);
  }

  // @4 - stores input data for new budget item/serves as a kind of control center for routing data between the modules
  var ctrlAddItem = function () {
    // @4.a - declare input, will be used to create obj whose properties will be assigned to another variable, 'newItem'
    var input;
    // @4.b - declare newItem, 
    var newItem;

    // @4.c - input assigned method that returns an object with each of its properties assigned the value of an html element
    input = UICtrl.getInput();
    // @4.d - newItem calls addItem method, and passes in the properties of the 'input' object.
    // @4.d.i. - addItem will do two things, one of which is to create an instance of a new object from the Expense or Income constructor, to pass into the arrays for the budget data structure
    // @4.d.iii - addItem() method will return the instance of the exp/inc obj and it is assigned to 'newItem'. 'newItem' is then to be used as the 'obj' arg in the another method, addListItem(), in the UIController module. It is used to define values that will render the item in the UI, reflecting user input for creating a new item.

    // @4.f - added if statement to check for valid input, cannot leave a 'description' field empty or 'value' field NaN (empty) or less than or equal to 0
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      
      newItem = budgetCtrl.addItem (input.type, input.description, input.value);
      // @4.d.iv - call addListItem(), using 'newItem' and 'input.type', for obj and type args, respectively.
      UICtrl.addListItem(newItem, input.type);
      // @4.e - clearFields is called to empty fields after entering in input for most recent item
      UICtrl.clearFields();
  
    // @4.e.ii
      updateBudget();

      updatePercentages();
      
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID;
    var splitID;
    var type;
    var ID;
    
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
    }

    // delete item from data structure
    budgetCtrl.deleteItem(type, ID);

    // delete the item from user interface
    UICtrl.deleteListItem(itemID);

    // update and show new budget
    updateBudget();

    updatePercentages();

  };

  return {
    //  @1.1 called within the global context
    // @2 - initialize the application - 
    init: function () {
      console.log('App has started');
      UICtrl.displayMonth();
      // calls child function, setupEventListeners() of controller module
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIcontroller);

// @1 - app initialization function --> returned by controller module
controller.init();