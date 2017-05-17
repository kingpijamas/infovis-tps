#!/usr/bin/env ruby

require "date"
require "json"
require "rubygems"
require "nokogiri"
require "pry"
require "pry-nav"

DUMP_PATH       = ARGV.shift
USER_NAME       = ARGV.shift.downcase
RESULTS_FILE    = ARGV.shift
HTMLS_DUMP_PATH = "#{DUMP_PATH}/html"
TIMELINE_PATH   = "#{HTMLS_DUMP_PATH}/timeline.htm"
MESSAGES_PATH   = "#{HTMLS_DUMP_PATH}/messages.htm"

FacebookEvent = Struct.new("FacebookEvent", :type, :date)

def parse_html(path)
  Nokogiri::HTML(open(path))
end

def include_any?(text, *words)
  words.any? { |word| text.include?(word) }
end

def parse_timeline(timeline_page)
  metadata_tags = timeline_page.css("div.meta")

  metadata_tags.map do |metadata_tag|
    date = Date.parse(metadata_tag.text).strftime("%Y-%m-%d")

    next_tag = metadata_tag.next
    event_type =
      if next_tag.attr("class") == "comment"
        "comment"
      elsif include_any?(next_tag.text, "feeling")
        "comment"
      elsif include_any?(next_tag.text, "shared")
        "share"
      elsif include_any?(next_tag.text, "phone number to")
        "phone-change"
      elsif include_any?(next_tag.text, "played")
        "game-played"
      elsif include_any?(next_tag.text, "reviewed")
        "review"
      elsif include_any?(next_tag.text, "went to")
        "event"
      elsif include_any?(next_tag.text, "added") &&
        include_any?(next_tag.text, "photo")
        "photo"
      elsif include_any?(next_tag.text, "updated") &&
        include_any?(next_tag.text, "picture", "photo")
        "photo"
      elsif include_any?(next_tag.text, "are now friends")
        "new-friend"
      else
        "deleted"
      end

    FacebookEvent.new("facebook-" + event_type, date)
  end
end

def parse_messages(messages_page)
  message_headers = messages_page.css("div.message_header")

  message_headers.each_with_object([]) do |message_tag, result|
    user_name = message_tag.css(".user").text
    next unless user_name.downcase == USER_NAME

    metadata_tag = message_tag.css(".meta")
    date         = Date.parse(metadata_tag.text).strftime("%Y-%m-%d")

    result << FacebookEvent.new("facebook-message", date)
  end
end

fb_events = []
fb_events += parse_timeline(parse_html(TIMELINE_PATH))
fb_events += parse_messages(parse_html(MESSAGES_PATH))

File.open(RESULTS_FILE, "w") do |file|
  file.puts(JSON.pretty_generate(fb_events.map(&:to_h)))
end
