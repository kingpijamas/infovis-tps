#!/usr/bin/env ruby

require "date"
require "net/http"
require "uri"
require "json"
require "rubygems"
require "nokogiri"
require "pry"
require "pry-nav"

GITHUB_API_URI = "https://api.github.com"

USER         = ARGV.shift
PASSWORD     = ARGV.shift
RESULTS_FILE = ARGV.shift

GithubEvent = Struct.new("GithubEvent", :type, :date)

def get(uri_str)
  print "Querying #{uri_str}..."
  uri          = URI.parse(uri_str)
  http         = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  http.read_timeout = 500
  request      = Net::HTTP::Get.new(uri.request_uri)
  request.basic_auth(USER, PASSWORD)
  http.request(request)
end

def event_format(str)
  str.gsub(/::/, '/').
  gsub(/([A-Z]+)([A-Z][a-z])/,'\1-\2').
  gsub(/([a-z\d])([A-Z])/,'\1-\2').
  downcase
end

def as_date(raw_date)
  Date.parse(raw_date).strftime("%Y-%m-%d")
end

def parse_commits(raw_events)
  raw_events.map do |raw_event|
    type = "github-commit"

    date = as_date(raw_event["commit"]["author"]["date"])
    GithubEvent.new(type, date)
  end
end

def parse_push_events(raw_events)
  raw_events.map do |raw_event|
    type = "github-#{event_format(raw_event['type'])}"
    GithubEvent.new(type, as_date(raw_event["created_at"]))
  end
end

def gh_api_query(resource, params: "", page_limit: nil)
  results = []
  params += "&" unless params.empty?

  curr_page = 1
  prev_results_size = -1
  loop do
    begin
      response = get("#{GITHUB_API_URI}/#{resource}?#{params}per_page=100&page=#{curr_page}")
      raise response.status unless response.body

      response_body = JSON.parse(response.body)
      puts " #{response_body.size} results"
      break if response_body.empty?

      curr_results = yield [response_body, curr_page] if block_given?
      results += curr_results
      break if curr_results.size < prev_results_size
      break if page_limit && curr_page >= page_limit

      prev_results_size = curr_results.size
      curr_page += 1
    rescue => exc
      break
    end
  end

  results
end

user_repos = gh_api_query("user/repos") do |raw_repos, _|
  raw_repos.map do |repo|
    { name: repo["name"],
      owner: repo["owner"]["login"] }
  end
end

gh_events = []

gh_events += user_repos.each_with_object([]) do |repo, results|
  repo_resource = "repos/#{repo[:owner]}/#{repo[:name]}/commits"
  result = gh_api_query(repo_resource, params: "author=#{USER}") do |raw_commits, _|
    parse_commits(raw_commits)
  end
  results.concat(result)
end

gh_events += gh_api_query("users/#{USER}/events") do |raw_events, _|
  parse_push_events(raw_events)
end

File.open(RESULTS_FILE, "w") do |file|
  file.puts(JSON.pretty_generate(gh_events.map(&:to_h)))
end
