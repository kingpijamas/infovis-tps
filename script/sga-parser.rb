#!/usr/bin/env ruby

require "json"
require "rubygems"
require "nokogiri"
require "pry"
require "pry-nav"

SGA_PATH = ARGV.shift
RESULTS_FILE = ARGV.shift

# regardless of month
MIDTERMS_DATES = 23..30

FIRST_SEMESTER_MONTHS  = %w[04 05 06]
SECOND_SEMESTER_MONTHS = %w[09 10 11]

GradeEvent = Struct.new("GradeEvent", :type, :date)

def format_date(year:, month:, day:)
  "#{year}-#{month}-#{day}"
end

def parse_final_grade(base_type, raw_grade, raw_date)
  grade = raw_grade.to_i

  day, month, year = raw_date.split("-")
  date = format_date(year: year, month: month, day: day)

  type = "sga-#{base_type}-final"

  GradeEvent.new(type, date)
end

def random_midterm_date
  Random.new.rand(MIDTERMS_DATES).to_s
end

def parse_midterms_grade(base_type, raw_grade, raw_date)
  type = "sga-#{base_type}-midterms"

  grade = raw_grade.to_i
  raw_semester, year = raw_date.split(" Cuat. ")

  day, month = if raw_semester == "Primer"
    [random_midterm_date, FIRST_SEMESTER_MONTHS.sample]
  else
    [random_midterm_date, SECOND_SEMESTER_MONTHS.sample]
  end

  date = format_date(year: year, month: month, day: day)

  GradeEvent.new(type, date)
end

def parse_grades(raw_grades, base_type)
  grades = []
  idx    = 0

  loop do
    if (lookahead = raw_grades[idx + 2]) && lookahead.include?("Acta")
      grades << parse_final_grade(base_type, raw_grades[idx], raw_grades[idx + 1])
      idx += 3
    elsif (lookahead = raw_grades[idx + 1]) && lookahead.include?("Cuat.")
      grades << parse_midterms_grade(base_type, raw_grades[idx], raw_grades[idx + 1])
      idx += 2
    else # in case there's garbage
      i += 1
    end

    break unless idx < raw_grades.size
  end

  grades
end

def parse_course(grades_html)
  raw_grades = grades_html.css("span").map(&:text)
  base_type = if grades_html.attr("style") == "color: green;"
    "good-grade"
  else
    "bad-grade"
  end
  parse_grades(raw_grades, base_type)
end

sga_html   = Nokogiri::HTML(open(SGA_PATH))
raw_grades = sga_html.css("div[style='color: green;'], div[style='color: red;']")

grades = raw_grades.each_with_object([]) do |grade_html, result|
  result.concat(parse_course(grade_html))
end

File.open(RESULTS_FILE, "w") do |file|
  file.puts(JSON.pretty_generate(grades.map(&:to_h)))
end
