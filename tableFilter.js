$( document ).ready(function() {
	var amountOfAddFilter = 0; 	// Count up for identification
	var filterCounter = 0;		// Counting up for Filter ID
	
	// Filter Table Object - all Tables are pushed into an object
	function filterTableObject(tableId, tableHeads, tableRows ) {
		this.tableId = 0;					// HTML Id of Table (<table id="">
		this.tableHeads = [];				// Heads of Table content
		this.tableRows = [];				// Table Content
		this.popUpId = 0;					// Div ID of tables popUp Div
		this.popUpVisible = 0;				// Is the div visible right now? 0 -> invisible | 1 -> visible
		this.rowsFilter = [];				// Which filter is assigned to which row	
		this.filters = [];					// Every Filterobject for that table is pushed into this array		
		filterCounter = filterCounter +1;
		return this;
	}
	// Every Tableobject is pushed into this array
	var tables = [];
	
	// Filter Object - Every Filter Object represents 1 Filter
	function filterObject(tableId, opr, teIn, attr){
		this.filterId = filterCounter;			// ID of the filter
		this.tableId = tableId;					// ID of the Table the filter is for
		this.operator = opr;					// Operator of Filter
		this.textInput = teIn;					// TextInput Value of Filter
		this.attribut = attr;					// Attribut of Filter	
		filterCounter = filterCounter+1;		
		return this;
	}
	
	// Iterate every filterTable and get Content
	$('.filterTable').each(function(i, obj) {
		dummyTable = new filterTableObject();		
		dummyTable.tableId = obj.id;				// Save table ID to Object
		
		// Iterate for TH (every Head)
		var tableHeads = [];
		$(this).find('th').each(function(index, object){
			// Get Table Head
			tableHead = $(this).html();
			tableHeads.push(tableHead);
		});
		
		dummyTable.tableHeads = tableHeads;		// Save TableHeads to Object

		// Iterate all Rows
		var rowCells = [];
		var allRows = [];
		var rowCount = 0;
		$(this).find('tr').each(function (){	
			// Find Cells and add them to array
			$(this).find('td').each(function(){
				rowCell = $(this).html();
				rowCells.push(rowCell);
			});
			
			// Add ID for this Row
			rowCells.push(rowCount);
			// Save to Array if not empty
			if(rowCells.length > 0){
				allRows.push(rowCells);
				rowCells = [];
			}			
			rowCount = rowCount +1;
		});
		
		// Add Array to Object
		dummyTable.tableRows = allRows;
		tables.push(dummyTable);		
	});		
	// End of iterate filterTable and getting content
	

	// If the page is loaded with FilterParameter - append these Filter first
	var param = getUrlVars();
	
	// IF parameters are given
	if(Object.keys(param).length > 0){
		param.forEach(function(paramKey){			
			paramTableId = getTableIdContainedInString(paramKey[0], tables);	// Get Table ID out of Parameter Key
			paramValue = decodeURI(paramKey[1]);
			paramAttribut = paramValue.split("<>")[0];				// Get Attribut from URL
			paramOpr = paramValue.split("<>")[1];					// Get Operator from URL
			paramTextInput = paramValue.split("<>")[2];				// Get TextInput Value from URL			
												
			// Append Parameter-Filter to Table Content
			// Get table object by table id
			table = getTableObjectByTableId(paramTableId, tables);
			
			// Create Parameter-Filter and append to Filter Object
			filter = new filterObject(table.tableId, paramOpr, paramTextInput, paramAttribut);
			table.filters.push(filter);
			
			createTable(table, filter);
		});
	}	
	
	// Now lets prepare the Filter Div
	tables.forEach(function(table) {
		var newFilterSpan = document.createElement('div');
		newFilterSpan.id = table.tableId + '_' + amountOfAddFilter;
		newFilterSpan.className = 'filterDiv addNewFilter filterIcon';
		newFilterSpan.setAttribute('data-tableId', table.tableId);
		newFilterSpan.innerHTML = ('Add Filter <span class="addFilter"><span class="addFilterPlus">+</span></span>');
		
		// And append it to the Filter Area
		document.getElementById(table.tableId + '_filter').appendChild(newFilterSpan);
	});

	// Remove Filter
	$( document ).on( 'click', '.removeFilter', function(e) {
		filterId = $( this ).attr('id').split("_")[2];					// What is the ID of the filter that has to be removed
		var removeTheseFilter = [];
		var removeTheseFilterRows = [];
		
		tables.forEach(function(table){					
			// Remove the filter from filter Array in Table Object
			table.filters.forEach(function (filter, index) {
				if (filterId == filter.filterId){	
					removeTheseFilter.push(index);
					// Get Filter Operator, Attribut and InputText for removing the URL Parameter
					urlParameter = "tf-" + decodeURI(filter.tableId) + "=" + decodeURI(filter.attribut) + "<>" + decodeURI(filter.operator) + "<>" + decodeURI(filter.textInput);
				}
			});			
			
			// Remove all rows from rowsFilter where Filter ID is set
			table.rowsFilter.forEach(function (rowFilter, index) {
				if (rowFilter[0] == filterId) {
					removeTheseFilterRows.push(index);
				}
			});
		});	
		
		// Finally remove the Filter in table.filters
		removeTheseFilter.forEach(function (index) {
			table.filters.splice(index, 1);
		});
		
		// Finally remove the FilterRows in table.rowsFilter
		removeTheseFilterRows.forEach(function (index) {
			table.rowsFilter.splice(index, 1);
		});
		
		// URL decoding
		var url = decodeURI(window.location.href); 

		// Find the place where the URL Parameter is in the url and if there is a ? in front of it, keep it - if its a &, remove it
		var position = url.search(urlParameter);
		
		switch (url.substring(position-1, position)){
			case "?":
				removeInitiator = "";			
				break;
			case "&":
				removeInitiator = "&";
				break;
			default:
				break;
		}
		url = url.replace((removeInitiator+urlParameter), "");
				
		// Reload
		window.location.href = url;
	});
	
	// OnClick for defining a filter
	$( document ).on( 'click', '.filterDiv', function(e) {
		divId = $( this ).attr('id');
		
		// herausfinden, um welche table es geht
		table = getTableFromFilterDivId(divId, tables);
		
		// PopUp is not visible -> So make it visible
		if(table.popUpVisible == 0){										
			// Get coordinates of div
			divPosition = getPos(this);
			
			// If there is no hidden popupdiv
			if(document.getElementById(divId+"_popup")){
				// Make hidden div visible
				popUpDiv = document.getElementById(divId+"_popup");
				popUpDiv.style.visibility = 'visible'; 
			}else{
				// Create new
				// Show new Div at that position
				// Div COntent
				divContent = '<div id="'+divId+'_popup" class="triangle-border filterPopUp" style="position:absolute; left: '+divPosition.x+'; top: '+((divPosition.y)-85) + '"><select class="filterSelect" id="select_attr_'+ table.tableId  +'">';

				table.tableHeads.forEach( function (head) {
					divContent = divContent + '<option value="'+ head +'">'+ head +'</option>';
				});
		
				// Comparison Operators
				divContent = divContent + '</select>\
					<select id="select_opr_'+ table.tableId  +'">\
					<option value="eq">equal to</option>\
					<option value="ne">not equal to</option>\
					<option value="gT">greater than</option>\
					<option value="lT">less than</option>\
					<option value="ct">contains</option>\
					<option value="ctN">contains not</option>\
					</select>\
					<input type="text" name="textInput_'+ table.tableId  +'" id="textInput_'+ table.tableId  +'">\
					<span class="addFilterButton" id="'+divId+'_addFilter" data-tableId="'+table.tableId+'">Add Filter</span>\
					</div>';
				
				document.body.innerHTML += divContent;
			}
			table.popUpVisible = 1;
			
		}else{
			// PopUp is visible -> Make it invisible
			popUpDiv = document.getElementById(divId+"_popup");
			popUpDiv.style.visibility = 'hidden'; 
			table.popUpVisible = 0;
		}
		
	});
	
	// "Add Filter" got clicked -> append new Filter
	$( document ).on( 'click', '.addFilterButton', function(e) {
		tableId = $( this ).attr("data-tableId");
		// How should the filter look alike? Which parameter will be passed
		var attributElement = document.getElementById("select_attr_" + tableId);
		var attribut = attributElement.options[attributElement.selectedIndex].value;		
		var operatorElement = document.getElementById("select_opr_" + tableId);
		var operator = operatorElement.options[operatorElement.selectedIndex].value;
		var inputValue = document.getElementById("textInput_" + tableId).value;
		
		// Combine URL Parameter 
		var filterUrlValue = attribut + '<>' + operator + '<>' + inputValue;
		
		// URL modifing
		var url = window.location.href;    
		if (url.indexOf('?') > -1){
		   url += '&tf-'+tableId+'=' + filterUrlValue
		}else{
		   url += '?tf-'+tableId+'=' + filterUrlValue
 		}
		
		// Reload
		window.location.href = url;	
	});

	// Create the table based on table and filter
	function createTable(table,filter){
		// Get index of row title
		columnIndex = getColumnIndexByTitle(filter.attribut, table);
						
		var rowLength;
		
		// iterate rows
		table.tableRows.forEach(function(row){
			rowLength = row.length;				// Get Amount of Columns of the row for adding alert Row
			// Depending on the operator- different actions are performed
			switch (filter.operator){
				case "eq":
					operatorSymbol= "\=";
					if  (isFinite(filter.textInput)) {											// Is the Value a number? If it is so - compare numeric values
						if (parseInt(row[columnIndex]) != parseInt(filter.textInput)){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);	
						}
					}else{																		// Value is not numeric
						if (row[columnIndex] != filter.textInput){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}					
					}
					break;
					
				case "ne":	
					operatorSymbol= "\!\=";
					if  (isFinite(filter.textInput)) {											// Is the Value a number? If it is so - compare numeric values
						if (parseInt(row[columnIndex]) == parseInt(filter.textInput)){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);					
						}
					}else{																		// Value is not numeric
						if (row[columnIndex] == filter.textInput){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}					
					}
					break;
						
				case "gT":
					operatorSymbol= "\>";
					if  (isFinite(filter.textInput)) {											// Is the Value a number? If it is so - compare numeric values
						if (parseInt(row[columnIndex]) <= parseInt(filter.textInput)){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);	
						}
					}else{																		// Value is not numeric
						if (row[columnIndex] <= filter.textInput){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}					
					}
					break;
						
				case "lT":
					operatorSymbol= "<";
					if  (isFinite(filter.textInput)) {											// Is the Value a number? If it is so - compare numeric values
						if (parseInt(row[columnIndex]) >= parseInt(filter.textInput)){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}
					}else{																		// Value is not numeric
						if (row[columnIndex] >= filter.textInput){
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}					
					}
					break;

				case "ct":
					operatorSymbol= "contains";
					if(String(row[columnIndex]) != 'undefined'){								// Error prevention				
						if(String(row[columnIndex]).search(String(filter.textInput))<0){		// Value found in Row
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}
					}
					break;
					
				case "ctN":
					operatorSymbol= "contains not";
					if(String(row[columnIndex]) != 'undefined'){								// Error prevention				
						if(String(row[columnIndex]).search(String(filter.textInput))>=0){		// Value found in Row
							table.rowsFilter.push([filter.filterId, row[row.length-1]]);
						}
					}
					break;

					
				default:
					operatorSymbol = "";
			}		
		});

		
		// Delete the Table Rows and add the resultingTableRows (Except the thead area)
		$("#"+table.tableId+" tbody tr").remove();	
		
		// Find out, which rows are filtered and add them to the dontShowRows Array			
		var dontShowRows = []
		table.tableRows.forEach(function(row){
			table.rowsFilter.forEach(function(rowFilter){				
				if (row[row.length-1] == rowFilter[1]){
					dontShowRows.push(row[row.length-1]);
				}
			});
		});
			
		var htmlTableBody = document.getElementById(table.tableId).getElementsByTagName('tbody')[0];
		// Push new Rows into the tableBody

		// Insert Alert Row!
		var newRow = htmlTableBody.insertRow(0);		//Create new Alert Row
		var newCell = newRow.insertCell(0);				// Create new Cell in Row
		newRow.cells[0].innerHTML= "cell 1";
		newRow.cells[0].colSpan = rowLength;
		newRow.cells[0].style.background = "#dd0a2b";
		newRow.cells[0].style.textAlign = "center";
		newRow.cells[0].style.color = "white";
		newRow.cells[0].style.fontWeight = "bold";
		newRow.cells[0].style.fontSize = "12px";
		if (dontShowRows.length > 1){
			newCell.innerHTML = dontShowRows.length + " rows are filtered";
		}else{
			newCell.innerHTML = "1 row is filtered";
			
		}
	
		table.tableRows.forEach(function (row) {				
			// Determine which row will be shown
			if ($.inArray( row[row.length-1], dontShowRows) == -1){
				// And Insert Row
				var newRow = htmlTableBody.insertRow(htmlTableBody.rows.length);		//Create row at last position in tbody
				row.forEach(function (value, index){
					if( index < row.length-1) {											// Dont Display the ID of the Row
						var newCell = newRow.insertCell(newRow.cells.length);			// Create new Cell in Row
						newCell.innerHTML = value;
					}
				});
			}				
		});			
			
		// Create Filter Icon			
		// Create new filter Span
		var filterIcon = document.createElement('span');
		filterIcon.id = "filter_" + filter.filterId;
		filterIcon.className = 'filterIcon';
		filterIcon.innerHTML = ( filter.attribut + ' ' + operatorSymbol + ' ' + filter.textInput  + ' <span id="remove_filter_' + filter.filterId + '" class="removeFilter"><div class="removeFilterX">x</div></span>');
		
		// And append it to the Filter Area
		document.getElementById(table.tableId + '_filter').appendChild(filterIcon);			
	
	}
	
	// If a given String containts a tableID - The tableID will be returned
	function getTableIdContainedInString(value,tables){
		returnTableId = "-1";
		tables.forEach(function (table){
			if(value.indexOf(table.tableId)>0){
				returnTableId = table.tableId;
			}
		});
		return returnTableId;
	}
	
	// Return index for attribut (if attr is "Name" - the function will return the right array index for "name")
	function getColumnIndexByTitle(attr, table){
		var index;
		index = table.tableHeads.indexOf(decodeURIComponent(attr));
		return index;
	}
	
	// Return the table for the given tableId
	function getTableObjectByTableId (tableId, tables){
		var returnTable;
		
		tables.forEach(function (table) {
			if (table.tableId == tableId){
				returnTable = table;
				return false;
			}			
		});
		
		return returnTable;
	}
	
	// Returns an Array of all URL Parameters
	function getUrlVars() {
		var vars = [];
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
		function(m,key,value) {
			//vars[key] = value;
			vars.push([key,value]);
		});
		return vars;
	}
  	
	// Get table Object from filter div id 
	function getTableFromFilterDivId(divId, tables) {	// Parameter is filterDiv ID
		var returnTable;
		
		tables.forEach(function (table) {
			if (table.tableId == divId.slice(0, -2)){
				returnTable = table;
				return false;
			}			
		});	
		return returnTable;
	}
	
	// Get the position of Element
	function getPos(el) {
    for (var lx=0, ly=0;
         el != null;
         lx += el.offsetLeft, ly += el.offsetTop, el = el.offsetParent);
    return {x: lx,y: ly};
	}
});
