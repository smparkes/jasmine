if(!this.jasmine){
  (function(){
    this.Envjs && this.Envjs.$env && ( this.Envjs.$env.logLevel = this.Envjs.$env.WARNING );
    load("src/base.js");
    load("src/base.js");
    load("src/util.js");
    load("src/Env.js");
    load("src/Reporter.js");
    load("src/Block.js");

    load("src/JsApiReporter.js");
    load("src/Matchers.js");
    load("src/mock-timeout.js");
    load("src/MultiReporter.js");
    load("src/NestedResults.js");
    load("src/PrettyPrinter.js");
    load("src/Queue.js");
    load("src/Reporters.js");
    load("src/Runner.js");
    load("src/Spec.js");
    load("src/Suite.js");
    load("src/WaitsBlock.js");
    load("src/WaitsForBlock.js");

    load("lib/TrivialReporter.js");
  })();
}

if(this.Envjs && !jasmine.EnvjsReporter){
  load("lib/EnvjsReporter.js");
}

(function () {
  var suites = [
    'suites/EnvSpec.js',
    'suites/ExceptionsSpec.js',
    'suites/JsApiReporterSpec.js',
    'suites/MatchersSpec.js',
    'suites/MultiReporterSpec.js',
    'suites/NestedResultsSpec.js',
    'suites/PrettyPrintSpec.js',
    'suites/ReporterSpec.js',
    'suites/RunnerSpec.js',
    'suites/QueueSpec.js',
    'suites/SpecSpec.js',
    'suites/SpecRunningSpec.js',
    'suites/SpySpec.js',
    'suites/SuiteSpec.js',
    'suites/TrivialReporterSpec.js'
  ];

  var embedded = window.location != "about:blank";

  for (var i = 0; i < suites.length; i++) {
    var path = embedded ? suites[i] : "spec/" + suites[i];
    jasmine.include(path,embedded);
  }

  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  if(embedded) {
    var trivialReporter = new jasmine.TrivialReporter();
    jasmineEnv.addReporter(trivialReporter);
    jasmineEnv.specFilter = function(spec) {
      return trivialReporter.specFilter(spec);
    };
  }

  if(embedded && window.Envjs && jasmine.EnvjsReporter){
    jasmineEnv.addReporter(new jasmine.EnvjsReporter());
  }

  window.onload = function() {
    jasmineEnv.execute();
  };
})();