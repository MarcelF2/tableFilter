# .tableFilter
Using this JavaScript extension, you can add filter functionality to your given HTML tables.

![Example-Table](http://lon.gr/blog/wp-content/uploads/2015/12/img1.png)

Configured filters are automatically assigned to the table and refresh the tables rows.
By adding the .tableFilter script to your HTML files, the following dialogue for defining filter operations is implemented:

![Filter Usage](http://lon.gr/blog/wp-content/uploads/2015/12/img2.png)

*Please keep in mind, that this project is still under construction. It works, but there SHOULD and WILL be improvements in performance, usability and design. Feel free to contribute!*

## Usage
### 1. Insert the tableFilter.js and the style.css to your HTML file
```
<script src="tableFilter.js"></script>
<link rel="stylesheet" href="style.css">
```
Dont forget to adjust the path to the files and also include jQuery.

### 2. Give your table an ID and add the filterTable class
```
<table id="table1" class="filterTable">
```

### 3. Add a div for displaying the filter icons to your page
```
<div id="table1_filter"></div>
```
Please note, that this div must get an ID in the following scheme: tableID_filter

**Thats it!**


## Requirements

### jQuery
Download jQuery and implement it above the reference to the tableFilter.js file in your sourcecode.

### HTML5 Table
For making this script work, you will have to provide a HTML table. The script requires a table, that contains a declared <thead> and <tbody> area that separates the table headers of the table content.
Example:
```
<table id="table1" class="filterTable">
  <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Admin</td>
    </tr>
  </tbody>
</table>
```
