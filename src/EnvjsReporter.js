/** JavaScript API reporter.
 *
 * @constructor
 */
jasmine.EnvjsReporter = function() {
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};
};

jasmine.EnvjsReporter.prototype.reportRunnerStarting = function(runner) {
  this.started = true;
  var suites = runner.suites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    this.suites_.push(this.summarize_(suite));
  }
  this.startedAt = new Date();
};

jasmine.EnvjsReporter.prototype.suites = function() {
  return this.suites_;
};

jasmine.EnvjsReporter.prototype.summarize_ = function(suiteOrSpec) {
  var isSuite = suiteOrSpec instanceof jasmine.Suite
  var summary = {
    id: suiteOrSpec.id,
    name: suiteOrSpec.description,
    type: isSuite ? 'suite' : 'spec',
    children: []
  };
  if (isSuite) {
    var specs = suiteOrSpec.specs();
    for (var i = 0; i < specs.length; i++) {
      summary.children.push(this.summarize_(specs[i]));
    }
  }
  return summary;
};

jasmine.EnvjsReporter.prototype.results = function() {
  return this.results_;
};

jasmine.EnvjsReporter.prototype.resultsForSpec = function(specId) {
  return this.results_[specId];
};

//noinspection JSUnusedLocalSymbols
jasmine.EnvjsReporter.prototype.reportRunnerResults = function(runner) {
  this.finished = true;
  var results = runner.results();
  var specs = runner.specs();
  var specCount = specs.length;
  print();
  var count = 1;
  var red = "\x1b[31m";
  var normal = "\x1b[0m";
  var green = "\x1b[32m";
  for(var i in this.results_) {
    var result = this.results_[i];
    if( result.result ==  "failed" ) {
      var messages = result.messages;
      for(var j in messages) {
        var expectation = messages[j];
        if( !expectation.passed() ) {
          print();
          print(count++ + ")");
          print(red+result.spec.description+normal);
          var message;
          message = expectation.message.replace(/(<br \/>)+/g, " ");
          print(red+message+normal);
          print_exception(expectation.trace);
        }
      }
    }
  }
  var message = "\nFinished in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s";
  print(message);
  message = "\n" + specCount + " spec" + (specCount == 1 ? "" : "s" ) + ", " + results.failedCount + " failure" + ((results.failedCount == 1) ? "" : "s");
  if(results.failedCount > 0){
    message = red + message;
  } else {
    message = green + message;
  }
  print(message+normal);
};

//noinspection JSUnusedLocalSymbols
jasmine.EnvjsReporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.EnvjsReporter.prototype.reportSpecResults = function(spec) {
  puts(spec.results().failedCount > 0 ? "\x1b[31mF\x1b[0m" : "\x1b[32m.\x1b[0m");
  this.results_[spec.id] = {
    spec: spec,
    messages: spec.results().getItems(),
    result: spec.results().failedCount > 0 ? "failed" : "passed"
  };
};

//noinspection JSUnusedLocalSymbols
jasmine.EnvjsReporter.prototype.log = function(str) {
// print(str);
};

jasmine.EnvjsReporter.prototype.resultsForSpecs = function(specIds){
  var results = {};
  for (var i = 0; i < specIds.length; i++) {
    var specId = specIds[i];
    results[specId] = this.summarizeResult_(this.results_[specId]);
  }
  return results;
};

jasmine.EnvjsReporter.prototype.summarizeResult_ = function(result){
  var summaryMessages = [];
  for (var messageIndex in result.messages) {
    var resultMessage = result.messages[messageIndex];
    summaryMessages.push({
      text: resultMessage.text,
      passed: resultMessage.passed ? resultMessage.passed() : true,
      type: resultMessage.type,
      message: resultMessage.message,
      trace: {
        stack: resultMessage.passed && !resultMessage.passed() ? resultMessage.trace.stack : undefined
      }
    });
  };

  var summaryResult = {
    result : result.result,
    messages : summaryMessages
  };

  return summaryResult;
};

