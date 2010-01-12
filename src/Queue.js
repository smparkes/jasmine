jasmine.Queue = function(env) {
  this.env = env;
  this.blocks = [];
  this.running = false;
  this.index = 0;
  this.offset = 0;
  this._stopped = 0;
};

jasmine.Queue.prototype.addBefore = function(block) {
  this.blocks.unshift(block);
};

jasmine.Queue.prototype.add = function(block) {
  this.blocks.push(block);
};

jasmine.Queue.prototype.insertNext = function(block) {
  this.blocks.splice((this.index + this.offset + 1), 0, block);
  this.offset++;
};

jasmine.Queue.prototype.start = function(onComplete) {
  this.running = true;
  this.onComplete = onComplete;
  this.next_();
};

jasmine.Queue.prototype._start = function() {
  var debug = window.console && window.console.debug || window.debug;
  var self = this;
  this._stopped--;
  // debug("start " + this._stopped);
  if(this._stopped == 0){
    // debug("next_ !!");
    setTimeout(function(){self.next_();},0);
  }
  if(this._timeout){
    clearTimeout(this._timeout);
    this._timeout = jasmine.undefined;
  }
};

jasmine.Queue.prototype._stop = function(delay) {
  var debug = window.console && window.console.debug || window.debug;
  this._stopped++;
  // debug("stop " + this._stopped);
  if(this._stopped>0){
    var self = this;
    delay = delay || 10000;
    if(this._timeout){
      clearTimeout(this._timeout);
    };
    this._timeout = setTimeout(function test_timeout(){
      // debug("failed");
      self.blocks[0].spec.runs(function(){
        self.blocks[0].spec.expect("test").toComplete();
      });
      self._start();
    },delay);
  }
};

jasmine.Queue.prototype._wait_for = function(condition, fn) {
  var debug = window.console && window.console.debug || window.debug;
  var self = this;
  // debug(self.index,self.blocks[self.index],self.blocks[self.index].is_after);
  self.blocks[0].spec.runs(function(){
    // debug("queue " , self.blocks[0].spec.description,condition+"");
    var timeout = function timeout() {
      if(self._timeout) {
        // debug("check " , self.blocks[0].spec.description,condition+"");
        if(condition()){
          // debug("okay " + self.blocks[0].spec.description);
          fn && fn();
          self._start();
        } else {
          // debug("retry");
          setTimeout(timeout,50);
        }
      } else {
        debug("not going " + condition);
        debug("not going " + fn);
        debug("not going " + self.blocks[0].spec.description);
      }
    };
    setTimeout(timeout,0);
    // debug("?",self._stopped,condition+"");
    self._stop();
  });
  self.blocks[self.index+1].is_after = self.blocks[self.index].is_after;
};

jasmine.Queue.prototype.isRunning = function() {
  return this.running;
};

jasmine.Queue.LOOP_DONT_RECURSE = true;

jasmine.Queue.prototype.next_ = function() {
  var debug = window.console && window.console.debug || window.debug;
  // debug("next");
  var self = this;
  var goAgain = true;

  // debug("stopped",this._stopped,self.index,self.blocks.length);
  while (goAgain && this._stopped <= 0) {
    goAgain = false;
    
    if (self.index < self.blocks.length) {
      var calledSynchronously = true;
      var completedSynchronously = false;

      var onComplete = function () {
        if (jasmine.Queue.LOOP_DONT_RECURSE && calledSynchronously) {
          completedSynchronously = true;
          return;
        }

        /*
        if( self.blocks[self.index]._anticipate !== jasmine.undefined ) {
        }
        */

        self.offset = 0;
        self.index++;

        var now = new Date().getTime();
        if (self.env.updateInterval && now - self.env.lastUpdate > self.env.updateInterval) {
          self.env.lastUpdate = now;
          // debug("next_ 00");
          self.env.setTimeout(function() {
            self.next_();
          }, 0);
        } else {
          if (jasmine.Queue.LOOP_DONT_RECURSE && completedSynchronously) {
            goAgain = true;
          } else {
            // debug("next_ 01");
            self.next_();
          }
        }
      };

      var block = self.blocks[self.index];
      var spec = block.spec;
      var before = new Date().getTime();
      var delay = 5000;
      var runner = function runner() {
        var saved = spec && spec.is_eventual;
        try {
          var now = new Date().getTime();
          if(spec) {
            if(now - before < delay){ 
              spec.is_eventual = block.is_eventual;
              spec.block_start();
            }
          }
          block.execute(onComplete);
          spec && spec.is_eventual&& spec.block_finish();
        } catch(e) {
          if(block.is_eventual){
            spec && spec.block_abort();
            setTimeout(function(){
              runner();
            },50);
          } else {
            throw e;
          }
        } finally {
          spec && (spec.is_eventual = saved);
        }
      };
      runner();

      calledSynchronously = false;
      if (completedSynchronously) {
        onComplete();
      }
      
    } else {
      self.running = false;
      if (self.onComplete) {
        self.onComplete();
      }
    }
  }
};

jasmine.Queue.prototype.results = function() {
  var results = new jasmine.NestedResults();
  for (var i = 0; i < this.blocks.length; i++) {
    if (this.blocks[i].results) {
      results.addResult(this.blocks[i].results());
    }
  }
  return results;
};


