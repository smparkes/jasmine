/**
 * Blocks are functions with executable code that make up a spec.
 *
 * @constructor
 * @param {jasmine.Env} env
 * @param {Function} func
 * @param {jasmine.Spec} spec
 */
jasmine.Block = function(env, func, spec) {
  this.env = env;
  this.func = func;
  this.spec = spec;
};

jasmine.Block.prototype.execute = function(onComplete) {  
  try {
    if(!this.spec.pending){
      this.func.apply(this.spec);
    }
  } catch (e) {
    if(e instanceof jasmine.pending_){
      this.spec.pending = true;
    } else {
      this.spec.fail(e);
    }
  }
  onComplete();
};