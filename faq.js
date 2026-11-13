/* 
 * UPDATED OCTOBER 2026
 * Updated to use Papa Parse instead of Google Sheets API V4
*/

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||""
}

mycategory = getURLParameter('category');
myaudience = getURLParameter('audience');

async function fetchCSVData(url) {
  /* Takes Google Sheets URL and returns an object.
     Object.data is an array of objects, 
     in which each object is a line on the spreadsheet. */
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), { header: true });
  } catch (error) {
    console.error(error);
	console.log("Error fetching CSV data. Please check the URL or your internet connection.");
    return { data: [] }; // Return empty object in case of error
  }
}

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

	async function main() { 
		const csvURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS8t8wP09DJRXBFuFrCT6XvbkXJtk1UoYQFvLtA1p96zHP2l4KLofCOas3Fr7IM3hSHYB8HRyd7Cu6p/pub?output=csv";
		const csvData = await fetchCSVData(csvURL);
		var tableData = csvData.data.map(function(n,i) {
			return {
				question: n.Question,
				category: n.Category,
				answer: n.Answer
			}
		})

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
			"data": tableData,
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
				/*
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
				*/

			} //end drawCallback
		
		}); //end Datatables
	} // end main()

	main(); // call the main function to initialize the table
				
}); // end $(document).ready()