function query(queryDefinition, pagination, next) {
  var page = parseInt(pagination.page, 10);
  var limit = parseInt(pagination.limit, 10);

  var pagedQuery = queryDefinition
    .skip((page - 1) * limit)
    .limit(limit);

  pagedQuery.count(function (err, count) {
    if (err) { return next(err); }

    pagedQuery.toArray(function (err, items) {
      if (err) { return next(err); }

      next(null, collection(count, items, pagination));
    });
  });
}

function collection(count, items, pagination) {
  var pageCount = Math.floor(count / pagination.limit) + ((count % pagination.limit) > 0?1:0);
  var hasNext = pagination.page < pageCount;
  var hasPrevious= pagination.page > 1;

  return {
    items : items,
    itemCount : count,
    page : pagination.page,
    pageCount : pageCount,
    limit : pagination.limit,

    hasNext : hasNext,
    next : hasNext?pagination.page+1:undefined,

    hasPrevious : hasPrevious,
    previous : hasPrevious?pagination.page-1:undefined
  }
}

module.exports = query;
module.exports.collection = collection;