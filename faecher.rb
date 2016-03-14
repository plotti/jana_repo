require 'nokogiri'
require 'open-uri'
require 'csv'

urls = ["http://www.degrees.uzh.ch/bachelor.php?lang=de", "http://www.degrees.uzh.ch/master.php?lang=de", "http://www.degrees.uzh.ch/phd.php?lang=de"]
urls.each do |url|
    puts "Working on URL #{url}"
    links = []
    doc = Nokogiri::HTML(open(url))
    doc.css(".content ul").each do |ul|
        ul.css("li a").each do |li|
            link = "{url}/#{li["href"]}"
            links << link
            puts "Working on #{link}"
        end
    end
    pages = []
    links.each do |link|
        doc = Nokogiri::HTML(open(url))
        doc.css(".content a").each do |a|
            page = "#{url}/#{a["href"]}"
            pages << page
            puts "  Working on page #{page}"
        end
    end 
    studienfaecher = []
    pages.each do |page|
        doc = Nokogiri::HTML(open(page))
        doc.css(".column a").each do |fach|
            studienfaecher << fach.text
            puts "    Studienfach #{fach.text}"
        end 
    end
end
CSV.open("studienfaecher.csv", "wb") do |csv|
    studienfaecher.each do |fach|
        csv << fach
    end
end