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
    load("src/version.json");
    load("src/WaitsBlock.js");
    load("src/WaitsForBlock.js");

    load("lib/TrivialReporter.js");
    load("src/EnvjsReporter.js");
  })();
}

(function () {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var _EnvjsReporter = new jasmine.EnvjsReporter();
  jasmineEnv.addReporter(_EnvjsReporter);
  
  window.onload = function() {
    jasmineEnv.execute();
  };
})();
