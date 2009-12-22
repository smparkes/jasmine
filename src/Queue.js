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
  var self = this;
  this._stopped--;
  if(this._stopped == 0){
    setTimeout(function(){self.next_();},0);
  }
  if(this._timeout){
    clearTimeout(this._timeout);
    this._timeout = jasmine.undefined;
  }
};

jasmine.Queue.prototype._stop = function(delay) {
  var self = this;
  delay = delay || 2000;
  if(this._timeout){
    clearTimeout(this._timeout);
  };
  this._timeout = setTimeout(function test_timeout(){
    self.blocks[0].spec.runs(function(){
      self.blocks[0].spec.expect("test").toComplete();
    });
    self._start();
  },delay);
  this._stopped++;
};

jasmine.Queue.prototype.isRunning = function() {
  return this.running;
};

jasmine.Queue.LOOP_DONT_RECURSE = true;

jasmine.Queue.prototype.next_ = function() {
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

        if( self.blocks[self.index]._anticipate !== jasmine.undefined ) {
        }

        self.offset = 0;
        self.index++;

        var now = new Date().getTime();
        if (self.env.updateInterval && now - self.env.lastUpdate > self.env.updateInterval) {
          self.env.lastUpdate = now;
          self.env.setTimeout(function() {
            self.next_();
          }, 0);
        } else {
          if (jasmine.Queue.LOOP_DONT_RECURSE && completedSynchronously) {
            goAgain = true;
          } else {
            self.next_();
          }
        }
      };
      self.blocks[self.index].execute(onComplete);

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


