var expect = require('chai').expect;
var sinon = require('sinon');
var mongojs = require('mongojs');

var paginate = require('../');

describe('paginate', function() {
  describe('collection', function() {
    it('should set values as passed in pagination object', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection).to.exist;
      expect(paginatedCollection.items).to.deep.equal([1, 2, 3]);
      expect(paginatedCollection.itemCount).to.equal(8);
      expect(paginatedCollection.page).to.equal(1);
      expect(paginatedCollection.limit).to.equal(3);
    });

    it('should calculate page count for non even dividable collections', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.pageCount).to.equal(3);
    });

    it('should calculate page count for even dividable collections', function() {
      var paginatedCollection = paginate.collection(6, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.pageCount).to.equal(2);
    });

    it('should set hasNext to true if a next page is available', function() {
      var paginatedCollection = paginate.collection(6, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.hasNext).to.equal(true);
    });

    it('should set hasNext to false if a next page is not available', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 3, limit : 3 });

      expect(paginatedCollection.hasNext).to.equal(false);
    });

    it('should set hasPrevious to true if a previous page is available', function() {
      var paginatedCollection = paginate.collection(6, [1, 2, 3], { page : 2, limit : 3 });

      expect(paginatedCollection.hasPrevious).to.equal(true);
    });

    it('should set hasPrevious to false if a previous page is not available', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.hasPrevious).to.equal(false);
    });

    it('should set previous to previous page index if a previous page is available', function() {
      var paginatedCollection = paginate.collection(6, [1, 2, 3], { page : 2, limit : 3 });

      expect(paginatedCollection.previous).to.equal(1);
    });

    it('should not set previous if a previous page is not available', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.previous).to.not.exist;
    });

    it('should set next to next page index if a next page is available', function() {
      var paginatedCollection = paginate.collection(6, [1, 2, 3], { page : 1, limit : 3 });

      expect(paginatedCollection.next).to.equal(2);
    });

    it('should not set next if a next page is not available', function() {
      var paginatedCollection = paginate.collection(8, [1, 2, 3], { page : 3, limit : 3 });

      expect(paginatedCollection.next).to.not.exist;
    });
  });

  describe('query', function() {
    var db = mongojs('mongodb://localhost/mongojs-paginate-tests', ['pagination']);

    beforeEach(function(done) {
      db.pagination.remove(function(err) {
        if (err) { return done(err); }

        db.pagination.insert([
          { i: 1 },
          { i: 2 },
          { i: 3 },
          { i: 4 },
          { i: 5 },
          { i: 6 },
          { i: 7 },
        ], done);
      });
    });

    it('should execute a query and return one page', function(done) {
      paginate(db.pagination.find(), { page : 1, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;
        expect(paginatedCollection).to.exist;
        expect(paginatedCollection.items.length).to.equal(3);

        done();
      });
    });


    it('should pass items, item count, page and limit into paginatedCollection', function(done) {
      paginate(db.pagination.find(), { page : 1, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;

        expect(paginatedCollection.items.map(function(item) {
          return item.i
        })).to.deep.equal([1,2,3]);

        expect(paginatedCollection.itemCount).to.equal(7);
        expect(paginatedCollection.page).to.equal(1);
        expect(paginatedCollection.limit).to.equal(3);

        done();
      });
    });

    it('should calculate pageCount, next, hasNext, previous and hasPrevious', function(done) {
      paginate(db.pagination.find(), { page : 1, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;
        expect(paginatedCollection.pageCount).to.equal(3);

        expect(paginatedCollection.next).to.equal(2);
        expect(paginatedCollection.hasNext).to.equal(true);
        expect(paginatedCollection.previous).to.not.exist;
        expect(paginatedCollection.hasPrevious).to.equal(false);

        done();
      });
    });

    it('should get last page with hasNext set to false', function(done) {
      paginate(db.pagination.find(), { page : 3, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;
        expect(paginatedCollection.pageCount).to.equal(3);

        expect(paginatedCollection.items.map(function(item) {
          return item.i
        })).to.deep.equal([7]);

        expect(paginatedCollection.next).to.not.exist;
        expect(paginatedCollection.hasNext).to.equal(false);
        expect(paginatedCollection.previous).to.equal(2);
        expect(paginatedCollection.hasPrevious).to.equal(true);

        done();
      });
    });
  });
});
