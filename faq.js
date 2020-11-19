/* 
 * UPDATED OCTOBER 2020
 * Tabletop (Google Sheets API V3) is going away Jan 2021
 * Code edited to remove Tabletop with Sheets API V4
*/

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
}

mycategory = getURLParameter('category');
myaudience = getURLParameter('audience');

//"data" refers to the column name with no spaces and no capitals
//punctuation or numbers in your column name
//"title" is the column name you want to appear in the published table
var columns = [{
  "data": "question",
  "title": "Question"
}, {
  "data": "category",
  "title": "Category"
}, {
  "data": "answer",
  "title": "Answer"
}];

//define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort['string-case-asc']  = function(x,y) {
	return ((x < y) ? -1 : ((x > y) ?  0 : 0));
};

jQuery.fn.dataTableExt.oSort['string-case-desc'] = function(x,y) {
	return ((x < y) ?  1 : ((x > y) ? -1 : 0));
};


$(document).ready(function() {

	//function Datatables calls on init - adds functionality to menu buttons
	function createMenu() {
		if (mycategory.length >0) {
			$("#top-list span").removeClass("selected");
			$ (".categorySearch:contains("+mycategory+")").addClass ("selected");
			faqTable.fnFilter(mycategory, 1);
		} 
		else {$("#all").addClass ("selected");}
		
		$("td.answer")
			.hide();
		
		$("td.preLoad")
			.prepend("<span class='answer-tab details-control'></span>")
			.removeClass("preLoad");
			
		$("td.question")
			.click(function(){
				$(this)
					.find("span.answer-tab")
					.toggleClass("open")
					.parent().parent()
					.find("td.answer")
					.slideToggle();
				return false;
			});
			
		$(".all-answers")
			.click(function(){
				$("td.answer")
					.slideDown();
				$(".answer-tab")
					.addClass("open");
				return false;
			});
	
		$(".no-answers")
			.click(function(){
				$("td.answer")
					.slideUp();
				$(".answer-tab")
					.removeClass("open");
				return false;
			});

	}; //end createMenu()


	// create the table container 
	$('#demo').html('<table cellpadding="0" cellspacing="0" border="0" class="display table table-bordered table-striped" id="data-table-container"></table>');
		
	// create the table object
	var faqTable = $('#data-table-container').dataTable({
		"dom": 'ftr',
		"autoWidth": false,
		"pageLength": 999,
		"ajax": { // pull data from google sheet via Sheets API V4
			url:"https://sheets.googleapis.com/v4/spreadsheets/1YSwUAVxuTToBAIsNGboAQY1aJnhBIzoESy355X7Q3Ck/values/A:C?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA",
			"dataSrc": function(json) {
				var myData = json['values']; //spreadsheet data lives in an array with the name values
				//rewrite data to an object with key-value pairs. This is also a chance to rename or ignore columns
				myData = myData.map(function( n, i ) {
					myObject = {
						question:n[0],
						category:n[2],
						answer:n[1]
					};
					return myObject;
				});
				myData.splice(0,1); //remove the first row, which contains the orginal column headers
				console.log(myData);
				return myData;
			}
		},
		"columns": columns,
		"order": [[ 1, "asc" ]],
		"columnDefs" : [
			{ "targets": [1], "visible": false},
			{ className: "question preLoad", "targets": [ 0 ]},
			{ className: "answer", "targets": [ 2 ]}
		],
		'initComplete' : function (settings) {
      createMenu();
    },
		"drawCallback": function ( settings ) {
			console.log('drawCallback');
			var api = this.api();
			var rows = api.rows( {page:'current'} ).nodes();
			var last=null;

			api.column(1, {page:'current'} ).data().each( function ( group, i ) {
				if ( last !== group ) {
					$(rows).eq( i ).before(
						'<tr class="group"><td colspan="2">'+group+'</td></tr>'
					);

					last = group;
				}
			} );
			
			var tables = $('.dataTable').DataTable(); 
			if ($('ul#top-list').is(':empty') && api.columns(0).data()[0].length > 0)	{
				var subjectList=
					api
					.columns( 1, {search:'applied'} )
					.data()
					.eq( 0 )      // Reduce the 2D array into a 1D array of data
					.sort()       // Sort data alphabetically
					.unique();     // Reduce to unique values
				var cList = $('ul#top-list');
				var liAll = $('<li/>')//Add link for all questions
					.appendTo(cList);
				var spanAll = $('<span/>')
					.addClass('btn btn-default btn-maroon selected')
					.attr('id','all')
					.text('All Questions')
					.appendTo(liAll);
				$.each(subjectList, function(i)//create subject menu
					{
					var li = $('<li/>')
						.appendTo(cList);
					var span = $('<span/>')
						.addClass('btn btn-default btn-maroon categorySearch')
						.text(subjectList[i])
						.appendTo(li);
				});
				$('span.categorySearch').click (function() { //add function to search buttons
				$("#top-list span").removeClass("selected");
				$(this).addClass("selected");	
				
				var search = $(this).text();
				console.log(search);
				//tables.column(1).search("");
				//tables.column(2).search("");
				tables.search("");
				tables.column(1).search( search, true, false ).draw();
			});
			
			$("span#all") //add function to All button
				.click(function(){
					console.log("test");
					$("#top-list span").removeClass("selected");
					$(this).addClass("selected");	
					tables.search("");
					tables.column(1).search( "", true, false ).draw();
					
				});
			
			
			};

		} //end drawCallback
	
	}); //end Datatables
				
}); // end $(document).ready()