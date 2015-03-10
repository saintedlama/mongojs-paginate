# mongojs-paginate

Query pagination helper for mongojs.

## Installation

    npm install mongojs-paginate

## Usage

    var paginate = require('mongojs-paginate');

    // Create a mongojs query
    var query = db.commits
      .find(res.locals.filter)
      .sort({ index : -1 });

    // Feed the query into paginate query function. Paging object with page and limit fields is required!
    paginate.query(query, { limit : 3, page : 1 }, function(err, result) {
      // Result:
      // items: containing items of the desired page
      // itemCount: non paged count of items returned by query
      // page: current page
      // pageCount: Number of pages
      // limit: Number of items returned by page
      // next: index of the next page or undefined if no next page exists
      // hasNext: true if next page exists otherwise false
      // previous: index of the previous page or undefined if no previous page exists
      // hasPrevious: true if previous page exists otherwise false
    });
