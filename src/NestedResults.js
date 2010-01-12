/**
 * Holds results for a set of Jasmine spec. Allows for the results array to hold another jasmine.NestedResults
 *
 * @constructor
 */
jasmine.NestedResults = function() {
  /**
   * The total count of results
   */
  this.totalCount = 0;
  /**
   * Number of passed results
   */
  this.passedCount = 0;
  /**
   * Number of failed results
   */
  this.failedCount = 0;
  /**
   * Was this suite/spec skipped?
   */
  this.skipped = false;
  /**
   * @ignore
   */
  this.items_ = [];
};

/**
 * Roll up the result counts.
 *
 * @param result
 */
jasmine.NestedResults.prototype.rollupCounts = function(result) {
  this.totalCount += result.totalCount;
  this.passedCount += result.passedCount;
  this.failedCount += result.failedCount;
};

/**
 * Tracks a result's message.
 * @param message
 */
jasmine.NestedResults.prototype.log = function(message) {
  this.items_.push(new jasmine.MessageResult(message));
};

/**
 * Getter for the results: message & results.
 */
jasmine.NestedResults.prototype.getItems = function() {
  return this.items_;
};

/**
 * Adds a result, tracking counts (total, passed, & failed)
 * @param {jasmine.ExpectationResult|jasmine.NestedResults} result
 */
jasmine.NestedResults.prototype.addResult = function(result) {
  if (result.type != 'MessageResult') {
    if (result.items_) {
      this.rollupCounts(result);
    } else {
      this.totalCount++;
      if (result.passed()) {
        this.passedCount++;
      } else {
        this.failedCount++;
      }
    }
  }
  this.items_.push(result);
};

/**
 * @returns {Boolean} True if <b>everything</b> below passed
 */
jasmine.NestedResults.prototype.passed = function() {
  return this.passedCount === this.totalCount;
};

jasmine.NestedResults.prototype.block_start = function() {
  this.block_totalCount = this.totalCount;
  this.block_passedCount = this.passedCount;
  this.block_failedCount = this.failedCount;
  this.block_skipped = this.skipped;
  this.items_length = this.items_.length;
};

jasmine.NestedResults.prototype.block_finish = function() {
};

jasmine.NestedResults.prototype.block_abort = function() {
  this.totalCount = this.block_totalCount;
  this.passedCount = this.block_passedCount;
  this.failedCount = this.block_failedCount;
  this.skipped = this.block_skipped;
  this.items_ = this.items_.slice(0,this.items_length);
}
