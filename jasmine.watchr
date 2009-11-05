#!/usr/bin/env watchr

begin; require 'watchr/event_handlers/em'; rescue LoadError; end

# p "reload"

watch( %r(.*), :modified, lambda { |md| File.directory? md[0] } ) do |md|
  raise Watchr::Refresh
end

watch( %r(jasmine.watchr), :modified ) do |md|
  raise Watchr::Refresh
end

map_to_test = lambda do |file, event|
  case file
  when %r(spec/(.*)([Ss]pec)\.js$)
    # Run JS spec's using parallel HTML file if it exists
    prefix = $~[1];
    prefix.sub! %r(_$), ""
    files = Dir[prefix+".*htm*"]
    if html = files.detect { |f| f =~ %r(\.x?html?) }
      event == :load ? nil : html
    else 
      file
    end
  else; file
  end
end

jazrb = lambda do |*args|
  files = []
  # boy, clean this up, but call/splat are subtle
  if Array === args[0]
    args = args[0][0]
    files = args.map { |pair| map_to_test.call( pair[0][0], pair[1] ) }
    files.compact!
    files.uniq!
  else
    (file, event) = *args
    file = map_to_test.call file, event
    if file
      files = [ file ]
    end
  end
  if !files.empty?
    cmd = "jazrb #{files.join(" ")}"
    puts cmd
    system cmd
    # puts "exit status: #{$?.exitstatus}" if $?.exited? && $?.exitstatus != 0
    if  $?.signaled? && $?.termsig == 2
      Process.kill 2, 0
    end
  end
end

watch( %r((^spec/.*[Ss]pec)\.js$), [ :load, :created, :modified ], nil, :batch => :js ) do |events|
  jazrb.call events
end

Signal.trap('QUIT') do
  EM.stop
end

# Local Variables:
# mode:ruby
# End:
