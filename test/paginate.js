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
    var db = mongojs('mongodb://somehost', ['pagination']); // Should not hit db - wrong connection string is used here to blow things up!

    var countStub;
    var toArrayStub;

    afterEach(function() {
      toArrayStub.restore();
      countStub.restore();
    });

    it('should execute a query and return one page', function(done) {
      toArrayStub = sinon.stub(mongojs.Cursor.prototype, 'toArray', function(next) { next(null, [1,2,3])});
      countStub = sinon.stub(mongojs.Cursor.prototype, 'count', function(next) { next(null, 8)});

      paginate(db.pagination.find(), { page : 1, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;
        expect(paginatedCollection).to.exist;

        done();
      });
    });


    it('should pass items, item count, page and limit into paginatedCollection', function(done) {
      toArrayStub = sinon.stub(mongojs.Cursor.prototype, 'toArray', function(next) { next(null, [1,2,3])});
      countStub = sinon.stub(mongojs.Cursor.prototype, 'count', function(next) { next(null, 8)});

      paginate(db.pagination.find(), { page : 1, limit : 3}, function(err, paginatedCollection) {
        expect(err).to.not.exist;
        expect(paginatedCollection.items).to.deep.equal([1,2,3]);
        expect(paginatedCollection.itemCount).to.equal(8);
        expect(paginatedCollection.page).to.equal(1);
        expect(paginatedCollection.limit).to.equal(3);

        done();
      });
    });

    it('should calculate pageCount, next, hasNext, previous and hasPrevious', function(done) {
      toArrayStub = sinon.stub(mongojs.Cursor.prototype, 'toArray', function(next) { next(null, [1,2,3])});
      countStub = sinon.stub(mongojs.Cursor.prototype, 'count', function(next) { next(null, 8)});

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
  });
});
