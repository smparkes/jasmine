require 'autotest'

Autotest.add_hook :initialize do |at|
  # at.clear_mappings
  at.add_mapping(%r%^spec/.*Spec.js$%) { |filename, _|
    filename
  }
  at.add_mapping(%r%^lib/(.*)\.js$%) { |_, m|
    ["spec/#{m[1]}Spec.js"]
  }
  at.add_mapping(%r%^spec/(spec_helper|shared/.*)\.js$%) {
    at.files_matching %r%^spec/.*Spec\.js$%
  }
end

class Autotest::Envjs < Autotest

  def initialize
    super
    self.failed_results_re = /^\d+\)\n(?:\e\[\d*m)?(?:.*?in )?'([^\n]*)'(?: FAILED)?(?:\e\[\d*m)?\n\n?(.*?(\n\n\(.*?)?)\n\n/m
    self.completed_re = /\n(?:\e\[\d*m)?\d* examples?/m
  end

  def consolidate_failures(failed)
    filters = new_hash_of_arrays
    failed.each do |spec, trace|
      if trace =~ /\n(\.\/)?(.*spec\.js):[\d]+:/
        filters[$2] << spec
      end
    end
    return filters
  end

  def runner
    runner = File.expand_path( File.join( "lib", "envjs", "runner.js" ) )
    File.exists?(runner) || runner = File.expand_path( File.join( File.dirname(__FILE__), "runner.js" ) )
    runner
  end

  def onload
    onload = File.expand_path( File.join( "lib", "envjs", "onload.js" ) )
    File.exists?(onload) || onload = File.expand_path( File.join( File.dirname(__FILE__), "onload.js" ) )
    onload
  end

  def make_test_cmd(files_to_test)
    return '' if files_to_test.empty?
    spec_program = "envjsrb"
    return "#{spec_program} #{runner} #{files_to_test.keys.flatten.join(' ')} #{onload}"
  end

end
