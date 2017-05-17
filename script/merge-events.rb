#!/usr/bin/env ruby

require "date"
require "net/http"
require "uri"
require "json"
require "rubygems"
require "nokogiri"
require "pry"
require "pry-nav"

MERGED_PATH = ARGV.shift
PATHS       = ARGV

events = PATHS.each_with_object([]) do |path, result|
  json_events = JSON.parse(File.read(path))
  result.concat(json_events)
end

File.open(MERGED_PATH, "w") do |file|
  file.puts(JSON.pretty_generate(events.map(&:to_h)))
end
