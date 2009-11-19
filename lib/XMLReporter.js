(function(){

  var APOS = "'"; QUOTE = '"';
  var ESCAPED_QUOTE = {  };
  ESCAPED_QUOTE[QUOTE] = '&quot;';
  ESCAPED_QUOTE[APOS] = '&apos;';
   
  function formatAttributes(attributes) {
    var att_value;
    var apos_pos, quot_pos;
    var use_quote, escape, quote_to_escape;
    var att_str;
    var re;
    var result = '';
    
    for (var att in attributes) {
      att_value = attributes[att] || "";

      att_value = att_value.replace(/&/g, "&amp;");
      att_value = att_value.replace(/</g, "&lt;");
      att_value = att_value.replace(/>/g, "&gt;");

      // Find first quote marks if any
      apos_pos = att_value.indexOf(APOS);
      quot_pos = att_value.indexOf(QUOTE);
      
      // Determine which quote type to use around 
      // the attribute value
      if (apos_pos == -1 && quot_pos == -1) {
        att_str = ' ' + att + "='" + att_value +  "'";
        result += att_str;
        continue;
      }
      
      // Prefer the single quote unless forced to use double
      if (quot_pos != -1 && quot_pos < apos_pos) {
        use_quote = APOS;
      }
      else {
        use_quote = QUOTE;
      }
      
      // Figure out which kind of quote to escape
      // Use nice dictionary instead of yucky if-else nests
      escape = ESCAPED_QUOTE[use_quote];
      
      // Escape only the right kind of quote
      re = new RegExp(use_quote,'g');
      att_str = ' ' + att + '=' + use_quote + 
        att_value.replace(re, escape) + use_quote;
      result += att_str;
    }
    return result;
  };


  /** JavaScript API reporter.
 *
 * @constructor
 */
jasmine.XMLReporter = function() {
  this.started = false;
  this.finished = false;
  this.suites_ = [];
  this.results_ = {};
};

jasmine.XMLReporter.prototype.reportRunnerStarting = function(runner) {
  this.started = true;
  var suites = runner.suites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    this.suites_.push(this.summarize_(suite));
  }
  this.startedAt = new Date();
  puts("<testsuites>")
};

jasmine.XMLReporter.prototype.suites = function() {
  return this.suites_;
};

jasmine.XMLReporter.prototype.summarize_ = function(suiteOrSpec) {
  var isSuite = suiteOrSpec instanceof jasmine.Suite;
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

jasmine.XMLReporter.prototype.results = function() {
  return this.results_;
};

jasmine.XMLReporter.prototype.resultsForSpec = function(specId) {
  return this.results_[specId];
};

//noinspection JSUnusedLocalSymbols
jasmine.XMLReporter.prototype.reportRunnerResults = function(runner) {
  this.finished = true;
  var results = runner.results();
  var specs = runner.specs();
  var specCount = specs.length;
  if(jasmine.XMLReporter.current_spec){
    puts("  </testsuite>");
  }
  // puts("  <tests>"+specCount+"</tests>");
  // puts("  <errors>"+results.failedCount+"</errors>");
  // puts("  <skipped>0</skipped>");
  // puts("  <failures>0</failures>");
  // puts("  <time>"+((new Date().getTime() - this.startedAt.getTime()) / 1000)+"</time>");
  puts("</testsuites>");
};

//noinspection JSUnusedLocalSymbols
jasmine.XMLReporter.prototype.reportSuiteResults = function(suite) {
};

//noinspection JSUnusedLocalSymbols
jasmine.XMLReporter.prototype.reportSpecResults = function(spec) {
  var suite = spec.suite;
  if(jasmine.XMLReporter.current_spec){
    puts("  </testsuite>");
  }
  var name = [ spec.description ];
  while(suite){
    name.unshift( suite.description );
    suite = suite.parentSuite;
  }
  puts("  <testsuite"+formatAttributes({name:name.join(" : ")}) +">");
  jasmine.XMLReporter.current_spec = spec;
  this.results_[spec.id] = {
    spec: spec,
    messages: spec.results().getItems(),
    result: spec.results().failedCount > 0 ? "failed" : "passed"
  };
  var results = spec.results().getItems();
  for(var i in results) {
    var result = results[i];
    puts("    <testcase"+formatAttributes({name:(1+parseInt(i))+ ": " + result.matcherName})+">");
    if(!result.passed()){
      puts("     <failure"+formatAttributes({type:result.matcherName,
                                              message:result.message})+">");
      puts("<![CDATA[");
      puts(get_exception_trace(result.trace));
      puts("]]>");
      puts("     </failure>");
    }
    puts("    </testcase>");
  }
};

//noinspection JSUnusedLocalSymbols
jasmine.XMLReporter.prototype._reportSpecResults = function(spec) {
  var suite = spec.suite;
  if(jasmine.XMLReporter.current_suite != suite){
    if(jasmine.XMLReporter.current_suite){
      puts("  </testsuite>");
    }
    var name = [ spec.description ];
    while(suite){
      name.unshift( suite.description );
      suite = suite.parentSuite;
    }
    puts("  <testsuite"+formatAttributes({name:name.join(" : ")}) +">");
    jasmine.XMLReporter.current_suite = spec.suite;
  }
  this.results_[spec.id] = {
    spec: spec,
    messages: spec.results().getItems(),
    result: spec.results().failedCount > 0 ? "failed" : "passed"
  };
  var results = spec.results().getItems();
  for(var i in results) {
    var result = results[i];
    puts("    <testcase"+formatAttributes({name:(1+parseInt(i))+ ": " + result.matcherName})+">");
    if(!result.passed()){
      puts("     <failure"+formatAttributes({type:result.matcherName,
                                              message:result.message})+">");
      puts("<![CDATA[");
      puts(get_exception_trace(result.trace));
      puts("]]>");
      puts("     </failure>");
    }
    puts("    </testcase>");
  }
};

//noinspection JSUnusedLocalSymbols
jasmine.XMLReporter.prototype.log = function(str) {
// print(str);
};

jasmine.XMLReporter.prototype.resultsForSpecs = function(specIds){
  var results = {};
  for (var i = 0; i < specIds.length; i++) {
    var specId = specIds[i];
    results[specId] = this.summarizeResult_(this.results_[specId]);
  }
  return results;
};

jasmine.XMLReporter.prototype.summarizeResult_ = function(result){
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

})();
