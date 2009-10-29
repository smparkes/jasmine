$: << File.expand_path( File.join( File.dirname(__FILE__), "..") )

Autotest.add_discovery do
  "envjs" if File.directory?('spec') && !Dir["spec/**/*Spec.js"].empty?
end
