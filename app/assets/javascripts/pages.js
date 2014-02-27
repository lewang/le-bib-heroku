// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

//= require handlebars
//= require jquery.blockUI

(function () {

  var booksUrl = "http://s3.amazonaws.com/bibliocommons-interview/books.json";

  Handlebars.registerHelper('availabilityClass', function (options) {
    if (this.availability.id == "AVAILABLE") {
      return "available";
    } else if (this.availability.id == "UNAVAILABLE") {
      return "unavailable";
    } else {
      return "unknown";
    };
  });

  function transformBook(book) {
    var res = {};
    res.title = book.title;
    res.sub_title = book.sub_title;
    res.format = book.format.name;
    res.publishDate = book.publishDate;
    res.details_url = book.details_url;

    // books.authors can be undefined
    var authors = book.authors || [];
    res.author = authors.map(function (author) {
      return author.name;
    }).join(", ");

    res.availability = book.availability;
    res.jacket = book.image;

    return res;
  }

  // block and unblock UI to show progress
  $(document).ajaxStart(function () {
    $.blockUI();
  });
  $(document).ajaxStop(function () {
    $.unblockUI();
  });
  $(document).ajaxError(function (foo) {
    alert("error!: " + foo);
  });

  var bookSource   = $("#book-handlebars").html();
  Handlebars.registerPartial("book", bookSource);


  var booksSource   = $("#books-handlebars").html();
  var booksTemplate = Handlebars.compile(booksSource);

  function sorterGenerator (sortField) {
    return function (a, b) {
      if (a[sortField] < b[sortField]) {
        return -1;
      } else if (a[sortField] > b[sortField]) {
        return 1;
      } else {
        if (sortField == "title") {
          return sorterGenerator("sub_title")(a, b);
        } else {
          return 0;
        };
      };
    };
  }

  function sortChangeHandler() {

    var $target = $(this);

    // get new json incase results changed
    $.getJSON(booksUrl, function (books) {
      var transformedBooks = books.map(function (book) {
        return transformBook(book);
      });

      // sort according to selected field
      var sortField = $target.val();
      if (sortField == "Availability") {
        sortField = 'availabilityClass';
      } else {
        sortField = sortField.toLowerCase();
      };

      transformedBooks = transformedBooks.sort(sorterGenerator(sortField));

      var html = booksTemplate({books: transformedBooks});
      $("#books-listings").empty().append(html);

    });

  }
  $("#sort").change(sortChangeHandler);

  $("#sort").trigger("change");

})();