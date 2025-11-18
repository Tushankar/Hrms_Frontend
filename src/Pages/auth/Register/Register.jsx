import React, { useState } from "react";
import { RightSection } from "../../../Components/Common/UI/AuthPage/RightSection";
import { OtpVerifyModal } from "../../../Components/Common/UI/OtpVerifyModal/OtpVerifyModal";
import { Link, useNavigate } from "react-router-dom";
import * as EmailValidator from "email-validator";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";
import CircularProgress from "@mui/material/CircularProgress";

// Format phone number as +1 (XXX) XXX-XXXX
const formatPhone = (value) => {
  // Remove +1 prefix if it exists, then remove all non-digit characters
  const withoutPrefix = value.replace(/^\+1\s*/, "");
  const cleaned = withoutPrefix.replace(/\D/g, "");

  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);

  // Format as +1 (XXX) XXX-XXXX
  if (limited.length === 0) {
    return "";
  } else if (limited.length <= 3) {
    return `+1 (${limited}`;
  } else if (limited.length <= 6) {
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`;
  } else {
    return `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(
      6
    )}`;
  }
};

// Hardcoded US States and major cities data
const US_STATES = [
  { name: "Alabama", code: "AL" },
  { name: "Alaska", code: "AK" },
  { name: "Arizona", code: "AZ" },
  { name: "Arkansas", code: "AR" },
  { name: "California", code: "CA" },
  { name: "Colorado", code: "CO" },
  { name: "Connecticut", code: "CT" },
  { name: "Delaware", code: "DE" },
  { name: "Florida", code: "FL" },
  { name: "Georgia", code: "GA" },
  { name: "Hawaii", code: "HI" },
  { name: "Idaho", code: "ID" },
  { name: "Illinois", code: "IL" },
  { name: "Indiana", code: "IN" },
  { name: "Iowa", code: "IA" },
  { name: "Kansas", code: "KS" },
  { name: "Kentucky", code: "KY" },
  { name: "Louisiana", code: "LA" },
  { name: "Maine", code: "ME" },
  { name: "Maryland", code: "MD" },
  { name: "Massachusetts", code: "MA" },
  { name: "Michigan", code: "MI" },
  { name: "Minnesota", code: "MN" },
  { name: "Mississippi", code: "MS" },
  { name: "Missouri", code: "MO" },
  { name: "Montana", code: "MT" },
  { name: "Nebraska", code: "NE" },
  { name: "Nevada", code: "NV" },
  { name: "New Hampshire", code: "NH" },
  { name: "New Jersey", code: "NJ" },
  { name: "New Mexico", code: "NM" },
  { name: "New York", code: "NY" },
  { name: "North Carolina", code: "NC" },
  { name: "North Dakota", code: "ND" },
  { name: "Ohio", code: "OH" },
  { name: "Oklahoma", code: "OK" },
  { name: "Oregon", code: "OR" },
  { name: "Pennsylvania", code: "PA" },
  { name: "Rhode Island", code: "RI" },
  { name: "South Carolina", code: "SC" },
  { name: "South Dakota", code: "SD" },
  { name: "Tennessee", code: "TN" },
  { name: "Texas", code: "TX" },
  { name: "Utah", code: "UT" },
  { name: "Vermont", code: "VT" },
  { name: "Virginia", code: "VA" },
  { name: "Washington", code: "WA" },
  { name: "West Virginia", code: "WV" },
  { name: "Wisconsin", code: "WI" },
  { name: "Wyoming", code: "WY" },
];

const US_CITIES_BY_STATE = {
  AL: [
    "Birmingham",
    "Montgomery",
    "Mobile",
    "Huntsville",
    "Tuscaloosa",
    "Dothan",
    "Auburn",
    "Gadsden",
    "Bessemer",
    "Florence",
  ],
  AK: [
    "Anchorage",
    "Juneau",
    "Fairbanks",
    "Ketchikan",
    "Sitka",
    "Kenai",
    "Wasilla",
    "Valdez",
    "Barrow",
    "Palmer",
  ],
  AZ: [
    "Phoenix",
    "Mesa",
    "Chandler",
    "Scottsdale",
    "Glendale",
    "Gilbert",
    "Tempe",
    "Peoria",
    "Surprise",
    "Avondale",
  ],
  AR: [
    "Little Rock",
    "Fort Smith",
    "Fayetteville",
    "Springdale",
    "Jonesboro",
    "North Little Rock",
    "Conway",
    "Rogers",
    "Bentonville",
    "Hot Springs",
  ],
  CA: [
    "Los Angeles",
    "San Diego",
    "San Jose",
    "San Francisco",
    "Fresno",
    "Sacramento",
    "Long Beach",
    "Oakland",
    "Bakersfield",
    "Anaheim",
  ],
  CO: [
    "Denver",
    "Colorado Springs",
    "Aurora",
    "Fort Collins",
    "Lakewood",
    "Pueblo",
    "Boulder",
    "Greeley",
    "Longmont",
    "Thornton",
  ],
  CT: [
    "Bridgeport",
    "New Haven",
    "Hartford",
    "Stamford",
    "Waterbury",
    "Norwalk",
    "Danbury",
    "New Britain",
    "Meriden",
    "Bristol",
  ],
  DE: [
    "Wilmington",
    "Dover",
    "Newark",
    "Middletown",
    "Smyrna",
    "Rehoboth Beach",
    "Georgetown",
    "Milford",
    "Seaford",
    "Laurel",
  ],
  FL: [
    "Jacksonville",
    "Miami",
    "Tampa",
    "Orlando",
    "St. Petersburg",
    "Hialeah",
    "Fort Lauderdale",
    "Tallahassee",
    "Fortaleza",
    "Cape Coral",
  ],
  GA: [
    "Atlanta",
    "Augusta",
    "Columbus",
    "Savannah",
    "Athens",
    "Macon",
    "Roswell",
    "Alpharetta",
    "Sandy Springs",
    "Marietta",
  ],
  HI: [
    "Honolulu",
    "Pearl City",
    "Hilo",
    "Kailua",
    "Kaneohe",
    "Waipahu",
    "Mililani",
    "Kapolei",
    "Wailuku",
    "Lahaina",
  ],
  ID: [
    "Boise",
    "Meridian",
    "Nampa",
    "Idaho Falls",
    "Pocatello",
    "Caldwell",
    "Coeur d'Alene",
    "Lewiston",
    "Twin Falls",
    "Rexburg",
  ],
  IL: [
    "Chicago",
    "Aurora",
    "Rockford",
    "Joliet",
    "Naperville",
    "Springfield",
    "Peoria",
    "Elgin",
    "Waukegan",
    "Evanston",
  ],
  IN: [
    "Indianapolis",
    "Fort Wayne",
    "Evansville",
    "South Bend",
    "Bloomington",
    "Hammond",
    "Gary",
    "Carmel",
    "Fishers",
    "Lafayette",
  ],
  IA: [
    "Des Moines",
    "Cedar Rapids",
    "Davenport",
    "Sioux City",
    "Iowa City",
    "Waterloo",
    "Dubuque",
    "Ames",
    "Council Bluffs",
    "Bettendorf",
  ],
  KS: [
    "Kansas City",
    "Wichita",
    "Overland Park",
    "Topeka",
    "Olathe",
    "Lawrence",
    "Shawnee",
    "Lenexa",
    "Salina",
    "Hutchinson",
  ],
  KY: [
    "Louisville",
    "Lexington",
    "Bowling Green",
    "Owensboro",
    "Covington",
    "Hopkinsville",
    "Richmond",
    "Paducah",
    "Nicholasville",
    "Elizabethtown",
  ],
  LA: [
    "New Orleans",
    "Baton Rouge",
    "Shreveport",
    "Lafayette",
    "Lake Charles",
    "Metairie",
    "Kenner",
    "Alexandria",
    "Monroe",
    "Houma",
  ],
  ME: [
    "Portland",
    "Lewiston",
    "Bangor",
    "South Portland",
    "Auburn",
    "Biddeford",
    "Waterville",
    "Augusta",
    "Westbrook",
    "Windham",
  ],
  MD: [
    "Baltimore",
    "Frederick",
    "Rockville",
    "Gaithersburg",
    "Bowie",
    "Silver Spring",
    "College Park",
    "Salisbury",
    "Germantown",
    "Dundalk",
  ],
  MA: [
    "Boston",
    "Worcester",
    "Springfield",
    "Lowell",
    "Cambridge",
    "Brockton",
    "Lynn",
    "Framingham",
    "New Bedford",
    "Malden",
  ],
  MI: [
    "Detroit",
    "Grand Rapids",
    "Warren",
    "Sterling Heights",
    "Ann Arbor",
    "Dearborn",
    "Livonia",
    "Westland",
    "Lansing",
    "Flint",
  ],
  MN: [
    "Minneapolis",
    "St. Paul",
    "Rochester",
    "Duluth",
    "Bloomington",
    "Brooklyn Center",
    "Plymouth",
    "St. Cloud",
    "Maplewood",
    "Minnetonka",
  ],
  MS: [
    "Jackson",
    "Gulfport",
    "Biloxi",
    "Hattiesburg",
    "Meridian",
    "Tupelo",
    "Greenville",
    "Vicksburg",
    "Madison",
    "Starkville",
  ],
  MO: [
    "Kansas City",
    "St. Louis",
    "Springfield",
    "Independence",
    "Columbia",
    "Lee's Summit",
    "St. Joseph",
    "Jefferson City",
    "Joplin",
    "St. Charles",
  ],
  MT: [
    "Billings",
    "Missoula",
    "Great Falls",
    "Bozeman",
    "Butte",
    "Helena",
    "Kalispell",
    "Havre",
    "Miles City",
    "Lewistown",
  ],
  NE: [
    "Omaha",
    "Lincoln",
    "Bellevue",
    "Grand Island",
    "Kearney",
    "Fremont",
    "North Platte",
    "Columbus",
    "Hastings",
    "Norfolk",
  ],
  NV: [
    "Las Vegas",
    "Henderson",
    "Reno",
    "North Las Vegas",
    "Sparks",
    "Elko",
    "Pahrump",
    "Carson City",
    "Winnemucca",
    "Battle Mountain",
  ],
  NH: [
    "Manchester",
    "Nashua",
    "Concord",
    "Derry",
    "Rochester",
    "Salem",
    "Merrimack",
    "Stratham",
    "Portsmouth",
    "Claremont",
  ],
  NJ: [
    "Newark",
    "Jersey City",
    "Paterson",
    "Elizabeth",
    "Trenton",
    "Atlantic City",
    "Clifton",
    "Camden",
    "Morristown",
    "New Brunswick",
  ],
  NM: [
    "Albuquerque",
    "Las Cruces",
    "Santa Fe",
    "Rio Rancho",
    "Roswell",
    "Farmington",
    "Clovis",
    "Hobbs",
    "Gallup",
    "Lovington",
  ],
  NY: [
    "New York City",
    "Buffalo",
    "Rochester",
    "Yonkers",
    "Syracuse",
    "Albany",
    "New Rochelle",
    "Schenectady",
    "Troy",
    "Niagara Falls",
  ],
  NC: [
    "Charlotte",
    "Raleigh",
    "Greensboro",
    "Durham",
    "Winston-Salem",
    "Cary",
    "Fayetteville",
    "Chapel Hill",
    "Asheville",
    "Garner",
  ],
  ND: [
    "Bismarck",
    "Fargo",
    "Grand Forks",
    "Minot",
    "Williston",
    "Dickinson",
    "Mandan",
    "Jamestown",
    "Watford City",
    "Devils Lake",
  ],
  OH: [
    "Columbus",
    "Cleveland",
    "Cincinnati",
    "Toledo",
    "Akron",
    "Dayton",
    "Parma",
    "Canton",
    "Youngstown",
    "Lorain",
  ],
  OK: [
    "Oklahoma City",
    "Tulsa",
    "Norman",
    "Broken Arrow",
    "Edmond",
    "Moore",
    "Lawton",
    "Enid",
    "Ardmore",
    "Shawnee",
  ],
  OR: [
    "Portland",
    "Eugene",
    "Salem",
    "Gresham",
    "Hillsboro",
    "Beaverton",
    "Medford",
    "Springfield",
    "Corvallis",
    "Bend",
  ],
  PA: [
    "Philadelphia",
    "Pittsburgh",
    "Allentown",
    "Erie",
    "Reading",
    "Scranton",
    "Bethlehem",
    "Lancaster",
    "Altoona",
    "Johnstown",
  ],
  RI: [
    "Providence",
    "Warwick",
    "Cranston",
    "Pawtucket",
    "East Providence",
    "Woonsocket",
    "Newport",
    "Central Falls",
    "West Warwick",
    "Coventry",
  ],
  SC: [
    "Charleston",
    "Columbia",
    "Greenville",
    "Spartanburg",
    "Myrtle Beach",
    "Sumter",
    "Rock Hill",
    "Beaufort",
    "Goose Creek",
    "Hilton Head Island",
  ],
  SD: [
    "Sioux Falls",
    "Rapid City",
    "Aberdeen",
    "Brookings",
    "Watertown",
    "Mitchell",
    "Yankton",
    "Pierre",
    "Huron",
    "Canton",
  ],
  TN: [
    "Memphis",
    "Nashville",
    "Knoxville",
    "Chattanooga",
    "Clarksville",
    "Murfreesboro",
    "Franklin",
    "Jackson",
    "Hendersonville",
    "Smyrna",
  ],
  TX: [
    "Houston",
    "Dallas",
    "Austin",
    "San Antonio",
    "Fort Worth",
    "El Paso",
    "Arlington",
    "Corpus Christi",
    "Plano",
    "Garland",
  ],
  UT: [
    "Salt Lake City",
    "West Jordan",
    "Provo",
    "West Valley City",
    "Orem",
    "Ogden",
    "Sandy",
    "Layton",
    "St. George",
    "Lehi",
  ],
  VT: [
    "Burlington",
    "South Burlington",
    "Rutland",
    "Montpelier",
    "Barre",
    "Brattleboro",
    "Winooski",
    "Newport",
    "Saint Johnsbury",
    "Middlebury",
  ],
  VA: [
    "Virginia Beach",
    "Norfolk",
    "Richmond",
    "Alexandria",
    "Arlington",
    "Blacksburg",
    "Charlottesville",
    "Harrisonburg",
    "Leesburg",
    "Roanoke",
  ],
  WA: [
    "Seattle",
    "Spokane",
    "Tacoma",
    "Vancouver",
    "Kent",
    "Everett",
    "Renton",
    "Bellevue",
    "Sammamish",
    "Kirkland",
  ],
  WV: [
    "Charleston",
    "Huntington",
    "Parkersburg",
    "Morgantown",
    "Wheeling",
    "Beckley",
    "Fairmont",
    "Martinsburg",
    "Dunbar",
    "Weirton",
  ],
  WI: [
    "Milwaukee",
    "Madison",
    "Green Bay",
    "Kenosha",
    "Racine",
    "Appleton",
    "Waukesha",
    "Eau Claire",
    "Sheboygan",
    "Oshkosh",
  ],
  WY: [
    "Cheyenne",
    "Casper",
    "Laramie",
    "Gillette",
    "Rock Springs",
    "Sheridan",
    "Green River",
    "Evanston",
    "Cody",
    "Lander",
  ],
};

// Canada Provinces and Territories
const CANADA_PROVINCES = [
  { name: "Alberta", code: "AB" },
  { name: "British Columbia", code: "BC" },
  { name: "Manitoba", code: "MB" },
  { name: "New Brunswick", code: "NB" },
  { name: "Newfoundland and Labrador", code: "NL" },
  { name: "Northwest Territories", code: "NT" },
  { name: "Nova Scotia", code: "NS" },
  { name: "Nunavut", code: "NU" },
  { name: "Ontario", code: "ON" },
  { name: "Prince Edward Island", code: "PE" },
  { name: "Quebec", code: "QC" },
  { name: "Saskatchewan", code: "SK" },
  { name: "Yukon", code: "YT" },
];

const CANADA_CITIES_BY_PROVINCE = {
  AB: [
    "Calgary",
    "Edmonton",
    "Red Deer",
    "Lethbridge",
    "Medicine Hat",
    "Grande Prairie",
    "Airdrie",
    "Spruce Grove",
    "St. Albert",
    "Lloydminster",
  ],
  BC: [
    "Vancouver",
    "Victoria",
    "Surrey",
    "Burnaby",
    "Richmond",
    "Abbotsford",
    "Coquitlam",
    "Kelowna",
    "Saanich",
    "Langley",
  ],
  MB: [
    "Winnipeg",
    "Brandon",
    "Steinbach",
    "Thompson",
    "Portage la Prairie",
    "Winkler",
    "Selkirk",
    "Dauphin",
    "Morden",
    "The Pas",
  ],
  NB: [
    "Moncton",
    "Saint John",
    "Fredericton",
    "Dieppe",
    "Riverview",
    "Quispamsis",
    "Rothesay",
    "Miramichi",
    "Bathurst",
    "Campbellton",
  ],
  NL: [
    "St. John's",
    "Mount Pearl",
    "Corner Brook",
    "Conception Bay South",
    "Bay Roberts",
    "Grand Falls-Windsor",
    "Gander",
    "Happy Valley-Goose Bay",
    "Labrador City",
    "Marystown",
  ],
  NT: [
    "Yellowknife",
    "Hay River",
    "Inuvik",
    "Fort Smith",
    "Behchoko",
    "Norman Wells",
    "Tuktoyaktuk",
    "Aklavik",
    "Fort Simpson",
    "Paulatuk",
  ],
  NS: [
    "Halifax",
    "Dartmouth",
    "Sydney",
    "Glace Bay",
    "Truro",
    "New Glasgow",
    "Kentville",
    "Amherst",
    "Bridgewater",
    "Yarmouth",
  ],
  NU: [
    "Iqaluit",
    "Rankin Inlet",
    "Arviat",
    "Baker Lake",
    "Cambridge Bay",
    "Cape Dorset",
    "Chesterfield Inlet",
    "Clyde River",
    "Coral Harbour",
    "Gjoa Haven",
  ],
  ON: [
    "Toronto",
    "Ottawa",
    "Mississauga",
    "Brampton",
    "Hamilton",
    "London",
    "Markham",
    "Vaughan",
    "Kitchener",
    "Windsor",
  ],
  PE: [
    "Charlottetown",
    "Summerside",
    "Stratford",
    "Cornwall",
    "Montague",
    "Kensington",
    "Souris",
    "Alberton",
    "Tignish",
    "Georgetown",
  ],
  QC: [
    "Montreal",
    "Quebec City",
    "Laval",
    "Gatineau",
    "Longueuil",
    "Sherbrooke",
    "Saguenay",
    "Levis",
    "Trois-Rivieres",
    "Terrebonne",
  ],
  SK: [
    "Saskatoon",
    "Regina",
    "Prince Albert",
    "Moose Jaw",
    "Yorkton",
    "Swift Current",
    "North Battleford",
    "Weyburn",
    "Estevan",
    "Cumberland House",
  ],
  YT: [
    "Whitehorse",
    "Dawson City",
    "Watson Lake",
    "Haines Junction",
    "Mayo",
    "Carcross",
    "Faro",
    "Ross River",
    "Tagish",
    "Teslin",
  ],
};

// United Kingdom Countries
const UK_COUNTRIES = [
  { name: "England" },
  { name: "Scotland" },
  { name: "Wales" },
  { name: "Northern Ireland" },
];

const UK_CITIES_BY_COUNTRY = {
  England: [
    "London",
    "Birmingham",
    "Manchester",
    "Liverpool",
    "Leeds",
    "Sheffield",
    "Bristol",
    "Newcastle upon Tyne",
    "Sunderland",
    "Brighton",
  ],
  Scotland: [
    "Edinburgh",
    "Glasgow",
    "Aberdeen",
    "Dundee",
    "Inverness",
    "Stirling",
    "Perth",
    "Dumbarton",
    "Falkirk",
    "Ayr",
  ],
  Wales: [
    "Cardiff",
    "Swansea",
    "Newport",
    "Wrexham",
    "Barry",
    "Neath",
    "Cwmbran",
    "Bridgend",
    "Merthyr Tydfil",
    "Caerphilly",
  ],
  "Northern Ireland": [
    "Belfast",
    "Derry",
    "Lisburn",
    "Newtownabbey",
    "Bangor",
    "Antrim",
    "Craigavon",
    "Newry",
    "Armagh",
    "Larne",
  ],
};

// Australia States and Territories
const AUSTRALIA_STATES = [
  { name: "New South Wales", code: "NSW" },
  { name: "Queensland", code: "QLD" },
  { name: "South Australia", code: "SA" },
  { name: "Tasmania", code: "TAS" },
  { name: "Victoria", code: "VIC" },
  { name: "Western Australia", code: "WA" },
  { name: "Northern Territory", code: "NT" },
  { name: "Australian Capital Territory", code: "ACT" },
];

const AUSTRALIA_CITIES_BY_STATE = {
  NSW: [
    "Sydney",
    "Newcastle",
    "Central Coast",
    "Wollongong",
    "Albury",
    "Dubbo",
    "Cobar",
    "Coonabarabran",
    "Coonamble",
    "Cobar",
  ],
  QLD: [
    "Brisbane",
    "Gold Coast",
    "Townsville",
    "Cairns",
    "Toowoomba",
    "Mount Isa",
    "Mackay",
    "Rockhampton",
    "Bundaberg",
    "Hervey Bay",
  ],
  SA: [
    "Adelaide",
    "Mount Gambier",
    "Whyalla",
    "Murray Bridge",
    "Port Augusta",
    "Port Lincoln",
    "Kimba",
    "Kimba",
    "Renmark",
    "Peterborough",
  ],
  TAS: [
    "Hobart",
    "Launceston",
    "Devonport",
    "Burnie",
    "Ulverstone",
    "New Norfolk",
    "George Town",
    "Scottsdale",
    "Smithton",
    "Rosebery",
  ],
  VIC: [
    "Melbourne",
    "Geelong",
    "Ballarat",
    "Bendigo",
    "Shepparton",
    "Latrobe City",
    "Warrnambool",
    "Wangaratta",
    "Mildura",
    "Swan Hill",
  ],
  WA: [
    "Perth",
    "Mandurah",
    "Bunbury",
    "Kalgoorlie",
    "Geraldton",
    "Albany",
    "Karratha",
    "Broome",
    "Derby",
    "Halls Creek",
  ],
  NT: [
    "Darwin",
    "Palmerston",
    "Alice Springs",
    "Katherine",
    "Tennant Creek",
    "Nhulunbuy",
    "Jabiru",
    "Maningrida",
    "Oenpelli",
    "Ramingining",
  ],
  ACT: [
    "Canberra",
    "Queanbeyan",
    "Tuggeranong",
    "Gungahlin",
    "Belconnen",
    "Woden Valley",
    "Weston Creek",
    "Molonglo Valley",
    "Majura",
    "Jerrabomberra",
  ],
};

// India States/Union Territories
const INDIA_STATES = [
  { name: "Andhra Pradesh" },
  { name: "Arunachal Pradesh" },
  { name: "Assam" },
  { name: "Bihar" },
  { name: "Chhattisgarh" },
  { name: "Goa" },
  { name: "Gujarat" },
  { name: "Haryana" },
  { name: "Himachal Pradesh" },
  { name: "Jharkhand" },
  { name: "Karnataka" },
  { name: "Kerala" },
  { name: "Madhya Pradesh" },
  { name: "Maharashtra" },
  { name: "Manipur" },
  { name: "Meghalaya" },
  { name: "Mizoram" },
  { name: "Nagaland" },
  { name: "Odisha" },
  { name: "Punjab" },
  { name: "Rajasthan" },
  { name: "Sikkim" },
  { name: "Tamil Nadu" },
  { name: "Telangana" },
  { name: "Tripura" },
  { name: "Uttar Pradesh" },
  { name: "Uttarakhand" },
  { name: "West Bengal" },
  { name: "Andaman and Nicobar Islands" },
  { name: "Chandigarh" },
  { name: "Dadra and Nagar Haveli and Daman and Diu" },
  { name: "Lakshadweep" },
  { name: "Delhi" },
  { name: "Puducherry" },
];

const INDIA_CITIES_BY_STATE = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Tirupati",
    "Nellore",
    "Rajahmundry",
    "Anantapur",
    "Kurnool",
    "Kadapa",
    "Kakinada",
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Papum Pare",
    "Pasighat",
    "Bomdila",
    "Ziro",
    "Tezu",
    "Changlang",
    "Tawang",
    "Roing",
  ],
  Assam: [
    "Guwahati",
    "Silchar",
    "Dibrugarh",
    "Nagaon",
    "Jorhat",
    "Barpeta",
    "Kamrup",
    "Sonitpur",
    "Golaghat",
    "Tinsukia",
  ],
  Bihar: [
    "Patna",
    "Gaya",
    "Bhagalpur",
    "Madhubani",
    "Motihari",
    "Arrah",
    "Darbhanga",
    "Munger",
    "Muzaffarpur",
    "Purnea",
  ],
  Chhattisgarh: [
    "Raipur",
    "Durg",
    "Bilaspur",
    "Rajnandgaon",
    "Jagdalpur",
    "Korba",
    "Raigarh",
    "Dantewada",
    "Naya Raipur",
    "Mandir Hasaud",
  ],
  Goa: [
    "Panaji",
    "Margao",
    "Vasco da Gama",
    "Mormugao",
    "Bicholim",
    "Pernem",
    "Sattari",
    "Sanguem",
    "Quepem",
    "Canacona",
  ],
  Gujarat: [
    "Ahmedabad",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Jamnagar",
    "Junagadh",
    "Bhavnagar",
    "Anand",
    "Gandhinagar",
    "Mehsana",
  ],
  Haryana: [
    "Faridabad",
    "Gurgaon",
    "Hisar",
    "Rohtak",
    "Panipat",
    "Ambala",
    "Yamunanagar",
    "Karnal",
    "Sonepat",
    "Panchkula",
  ],
  "Himachal Pradesh": [
    "Shimla",
    "Mandi",
    "Solan",
    "Kangra",
    "Kullu",
    "Bilaspur",
    "Palampur",
    "Rampur",
    "Kinnaur",
    "Chamba",
  ],
  Jharkhand: [
    "Ranchi",
    "Dhanbad",
    "Giridih",
    "Deoghar",
    "Hazaribagh",
    "Bokaro",
    "Daltonganj",
    "Ramgarh",
    "Dumka",
    "Koderma",
  ],
  Karnataka: [
    "Bangalore",
    "Mysore",
    "Belagavi",
    "Mangalore",
    "Hubli",
    "Kolar",
    "Chikmagalur",
    "Belgaum",
    "Davanagere",
    "Shimoga",
  ],
  Kerala: [
    "Kochi",
    "Thiruvananthapuram",
    "Kozhikode",
    "Kottayam",
    "Thrissur",
    "Kannur",
    "Ernakulam",
    "Idukki",
    "Pathanamthitta",
    "Wayanad",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Bhopal",
    "Jabalpur",
    "Gwalior",
    "Ujjain",
    "Sagar",
    "Chhindwara",
    "Ratlam",
    "Katni",
    "Mandsaur",
  ],
  Maharashtra: [
    "Mumbai",
    "Pune",
    "Nagpur",
    "Thane",
    "Nashik",
    "Aurangabad",
    "Solapur",
    "Amravati",
    "Kolhapur",
    "Latur",
  ],
  Manipur: [
    "Imphal",
    "Bishnupur",
    "Kakching",
    "Thoubal",
    "Ukhrul",
    "Senapati",
    "Churachandpur",
    "Tamenglong",
    "Jiribam",
    "Noney",
  ],
  Meghalaya: [
    "Shillong",
    "Tura",
    "Jowai",
    "Nongstoin",
    "Resubelpara",
    "Williamnagar",
    "Baghmara",
    "Ranikor",
    "Mairang",
    "Mawkyrwat",
  ],
  Mizoram: [
    "Aizawl",
    "Lunglei",
    "Saiha",
    "Champhai",
    "Kolasib",
    "Lawngtlai",
    "Serchhip",
    "Mamit",
    "Hnahthial",
    "Saitual",
  ],
  Nagaland: [
    "Kohima",
    "Dimapur",
    "Mokokchung",
    "Tuensang",
    "Zunheboto",
    "Wokha",
    "Kiphire",
    "Mon",
    "Longleng",
    "Phek",
  ],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Sambalpur",
    "Berhampur",
    "Balasore",
    "Puri",
    "Dhenkanal",
    "Bolangir",
    "Bargarh",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Firozpur",
    "Sangrur",
    "Ferozepur",
    "Mohali",
    "Pathankot",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bikaner",
    "Ajmer",
    "Udaipur",
    "Alwar",
    "Bhilwara",
    "Pali",
    "Sikar",
  ],
  Sikkim: [
    "Gangtok",
    "Lachung",
    "Namchi",
    "Mangan",
    "Geyzing",
    "Rabangla",
    "Soreng",
    "Ravangla",
    "Singtam",
    "Rhenock",
  ],
  "Tamil Nadu": [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Salem",
    "Tirupur",
    "Erode",
    "Tirunelveli",
    "Thanjavur",
    "Vellore",
    "Nagapattinam",
  ],
  Telangana: [
    "Hyderabad",
    "Secunderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Ramagundam",
    "Mahbubnagar",
    "Khammam",
    "Medak",
    "Adilabad",
  ],
  Tripura: [
    "Agartala",
    "Udaipur",
    "Dharmanagar",
    "Ambassa",
    "Kailasahar",
    "Kumarghat",
    "Teliamura",
    "Karimganj",
    "Sonamura",
    "Melaghar",
  ],
  "Uttar Pradesh": [
    "Lucknow",
    "Kanpur",
    "Agra",
    "Ghaziabad",
    "Varanasi",
    "Meerut",
    "Mathura",
    "Aligarh",
    "Saharanpur",
    "Jhansi",
  ],
  Uttarakhand: [
    "Dehradun",
    "Haridwar",
    "Nainital",
    "Almora",
    "Pithoragarh",
    "Rudraprayag",
    "Chamoli",
    "Uttarkashi",
    "Pauri",
    "Bageshwar",
  ],
  "West Bengal": [
    "Kolkata",
    "Howrah",
    "Durgapur",
    "Asansol",
    "Siliguri",
    "Darjeeling",
    "Jalpaiguri",
    "Cooch Behar",
    "Malda",
    "Murshidabad",
  ],
  "Andaman and Nicobar Islands": [
    "Port Blair",
    "Diglipur",
    "Rangat",
    "Mayabunder",
    "Car Nicobar",
    "Bamboo Flat",
    "Neil Island",
    "Havelock Island",
  ],
  Chandigarh: ["Chandigarh", "Panchkula", "Mohali"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Silvassa",
    "Daman",
    "Diu",
    "Khanpur",
    "Nani Daman",
  ],
  Lakshadweep: ["Kavaratti", "Agatti", "Amini", "Androth", "Minicoy"],
  Delhi: [
    "New Delhi",
    "Delhi",
    "Noida",
    "Gurgaon",
    "Rohini",
    "Dwarka",
    "Chandni Chowk",
    "Lajpat Nagar",
    "Connaught Place",
  ],
  Puducherry: [
    "Puducherry",
    "Yanam",
    "Mahe",
    "Karaikal",
    "Auroville",
    "Villianur",
    "Bahour",
    "Kalapet",
    "Oulgaret",
  ],
};

export const Register = () => {
  const [registerInfo, setRegisterInfo] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const router = useNavigate();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    // Format phone number if it's the phone field
    let formattedValue = value;
    if (name === "phoneNumber") {
      formattedValue = formatPhone(value);
    }

    // Handle cascading dropdowns
    if (name === "country") {
      // Update country and reset state and city when country changes
      setRegisterInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
        state: "",
        city: "",
      }));
      setStates([]);
      setCities([]);
    } else if (name === "state") {
      // Update state and reset city when state changes
      setRegisterInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
        city: "",
      }));
      setCities([]);
    } else {
      // For all other fields, just update the value
      setRegisterInfo((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    }
  };

  const createNewAccount = async () => {
    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsLoading(false);
        return toast.error("Internal Error, please try again later !");
      }
      if (!EmailValidator.validate(registerInfo.email)) {
        setIsLoading(false);
        return toast.error("Please enter a correct email !!");
      }

      if (registerInfo.password !== registerInfo.confirmPassword) {
        setIsLoading(false);
        return toast.error("Incorrect confirm-password !!");
      }

      // Extract only digits from formatted phone number (removes +, (, ), spaces, dashes)
      let phoneDigitsOnly = registerInfo.phoneNumber.replace(/\D/g, "");

      // Remove leading 1 if present (country code)
      if (phoneDigitsOnly.startsWith("1") && phoneDigitsOnly.length === 11) {
        phoneDigitsOnly = phoneDigitsOnly.slice(1);
      }

      // Validate phone has exactly 10 digits (without country code)
      if (phoneDigitsOnly.length !== 10) {
        setIsLoading(false);
        return toast.error(
          "Phone number must be exactly 10 digits (format: +1 (XXX) XXX-XXXX)"
        );
      }

      const reqToSendOTP = await axios.post(
        `${baseUrl}/auth/register`,
        {
          fullName: registerInfo?.fullName,
          email: registerInfo?.email,
          phoneNumber: phoneDigitsOnly,
          addressLine1: registerInfo?.addressLine1,
          country: registerInfo?.country,
          state: registerInfo?.state,
          city: registerInfo?.city,
          zip: registerInfo?.zip,
          dateOfBirth: registerInfo?.dateOfBirth,
          password: registerInfo?.password,
          userRole: "employee",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      toast.success(reqToSendOTP?.data.message);
      setShowOtpInput(true);
    } catch (error) {
      setIsLoading(false);
      console.error(error?.response.data);
      toast.error(error?.response.data.message);
    }
  };

  const verifyOTP = async () => {
    if (!otp.trim()) {
      return toast.error("Please enter the OTP");
    }

    setIsLoading(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsLoading(false);
        return toast.error("Internal Error, please try again later !");
      }

      const reqToVerify = await axios.post(
        `${baseUrl}/auth/verify-otp`,
        {
          email: registerInfo.email,
          otp: otp.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setIsLoading(false);
      toast.success(reqToVerify?.data.message);

      // After successful OTP verification, automatically log the user in
      try {
        const loginResponse = await axios.post(
          `${baseUrl}/auth/log-in`,
          {
            email: registerInfo.email,
            password: registerInfo.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Login response:", loginResponse);
        const session = loginResponse?.headers["authorization"];

        if (!session) {
          console.error("No session token in response headers");
          toast.error(
            "Login failed after registration. Please try logging in manually."
          );
          router("/auth/log-in");
          return;
        }

        if (loginResponse?.data.userInfo.accountStatus === "inactive") {
          toast.error("Your Account is Restricted, Please Contact Admin");
          return;
        }

        // Set session cookie
        Cookies.set("session", session, {
          path: "/",
          expires: 2, // 2 days
        });

        // Set user data cookie
        Cookies.set("user", JSON.stringify(loginResponse.data.userInfo), {
          path: "/",
          expires: 2, // 2 days
        });

        // Redirect based on user role
        const userRole = loginResponse.data.userInfo.userRole;
        console.log("User role:", userRole);

        switch (userRole) {
          case "employee":
            router("/employee/dashboard");
            break;
          case "admin":
            router("/admin/dashboard");
            break;
          case "hr":
            router("/");
            break;
          default:
            router("/employee/dashboard");
            break;
        }

        toast.success("Account created and logged in successfully!");
      } catch (loginError) {
        console.error("Auto-login failed:", loginError);
        console.error("Error response:", loginError.response?.data);
        toast.error("Account created successfully! Please log in manually.");
        router("/auth/log-in");
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error?.response.data);
      toast.error(error?.response.data.message);
    }
  };

  const resendOTP = async () => {
    setIsResendingOtp(true);
    try {
      const baseUrl = import.meta.env.VITE__BASEURL;
      if (!baseUrl) {
        setIsResendingOtp(false);
        return toast.error("Internal Error, please try again later!");
      }

      // Extract only digits from formatted phone number
      const phoneDigitsOnly = registerInfo.phoneNumber.replace(/\D/g, "");

      const reqToResend = await axios.post(
        `${baseUrl}/auth/register`,
        {
          fullName: registerInfo?.fullName,
          email: registerInfo?.email,
          phoneNumber: phoneDigitsOnly,
          addressLine1: registerInfo?.addressLine1,
          country: registerInfo?.country,
          state: registerInfo?.state,
          city: registerInfo?.city,
          zip: registerInfo?.zip,
          dateOfBirth: registerInfo?.dateOfBirth,
          password: registerInfo?.password,
          userRole: "employee",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(reqToResend?.data.message || "OTP resent to your email");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Fetch countries from local data
  const fetchCountries = async () => {
    setLoadingCountries(true);
    try {
      // Simulating async call - using local data
      await new Promise((resolve) => setTimeout(resolve, 100));

      const countryList = [
        { value: "United States", label: "United States" },
        { value: "Canada", label: "Canada" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "Australia", label: "Australia" },
        { value: "India", label: "India" },
      ];

      setCountries(countryList);

      // Set United States as default if no country is selected
      if (!registerInfo.country) {
        setRegisterInfo((prev) => ({
          ...prev,
          country: "United States",
        }));
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      setCountries([
        { value: "United States", label: "United States" },
        { value: "Canada", label: "Canada" },
        { value: "United Kingdom", label: "United Kingdom" },
        { value: "Australia", label: "Australia" },
        { value: "India", label: "India" },
      ]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // Fetch states based on selected country (using local data for US, Canada, UK, Australia, and India)
  const fetchStates = async (countryName) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    setLoadingStates(true);
    try {
      if (countryName === "United States") {
        // Use hardcoded US states
        const stateList = US_STATES.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        console.log(`Loaded ${stateList.length} US states`);
        setStates(stateList);
      } else if (countryName === "Canada") {
        // Use hardcoded Canada provinces
        const stateList = CANADA_PROVINCES.map((province) => ({
          value: province.name,
          label: province.name,
        }));
        console.log(`Loaded ${stateList.length} Canada provinces`);
        setStates(stateList);
      } else if (countryName === "United Kingdom") {
        // Use hardcoded UK countries
        const stateList = UK_COUNTRIES.map((country) => ({
          value: country.name,
          label: country.name,
        }));
        console.log(`Loaded ${stateList.length} UK countries`);
        setStates(stateList);
      } else if (countryName === "Australia") {
        // Use hardcoded Australia states
        const stateList = AUSTRALIA_STATES.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        console.log(`Loaded ${stateList.length} Australia states`);
        setStates(stateList);
      } else if (countryName === "India") {
        // Use hardcoded India states
        const stateList = INDIA_STATES.map((state) => ({
          value: state.name,
          label: state.name,
        }));
        console.log(`Loaded ${stateList.length} India states`);
        setStates(stateList);
      } else {
        // For other countries, show a simplified list
        console.log(
          `Country ${countryName} not fully supported, showing basic state list`
        );
        setStates([
          { value: "State 1", label: "State 1" },
          { value: "State 2", label: "State 2" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching states:", error.message);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  // Fetch cities based on selected state (using local data for US, Canada, UK, Australia, and India)
  const fetchCities = async (countryName, stateName) => {
    if (!countryName || !stateName) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    try {
      if (countryName === "United States") {
        // Find the state code
        const state = US_STATES.find((s) => s.name === stateName);
        if (state && US_CITIES_BY_STATE[state.code]) {
          const cityList = US_CITIES_BY_STATE[state.code].map((city) => ({
            value: city,
            label: city,
          }));
          console.log(`Loaded ${cityList.length} cities for ${stateName}`);
          setCities(cityList);
        } else {
          console.warn(`No cities found for ${stateName}`);
          setCities([]);
        }
      } else if (countryName === "Canada") {
        // Find the province code
        const province = CANADA_PROVINCES.find((p) => p.name === stateName);
        if (province && CANADA_CITIES_BY_PROVINCE[province.code]) {
          const cityList = CANADA_CITIES_BY_PROVINCE[province.code].map(
            (city) => ({
              value: city,
              label: city,
            })
          );
          console.log(`Loaded ${cityList.length} cities for ${stateName}`);
          setCities(cityList);
        } else {
          console.warn(`No cities found for ${stateName}`);
          setCities([]);
        }
      } else if (countryName === "United Kingdom") {
        // Find cities for UK country
        if (UK_CITIES_BY_COUNTRY[stateName]) {
          const cityList = UK_CITIES_BY_COUNTRY[stateName].map((city) => ({
            value: city,
            label: city,
          }));
          console.log(`Loaded ${cityList.length} cities for ${stateName}`);
          setCities(cityList);
        } else {
          console.warn(`No cities found for ${stateName}`);
          setCities([]);
        }
      } else if (countryName === "Australia") {
        // Find the state code
        const state = AUSTRALIA_STATES.find((s) => s.name === stateName);
        if (state && AUSTRALIA_CITIES_BY_STATE[state.code]) {
          const cityList = AUSTRALIA_CITIES_BY_STATE[state.code].map(
            (city) => ({
              value: city,
              label: city,
            })
          );
          console.log(`Loaded ${cityList.length} cities for ${stateName}`);
          setCities(cityList);
        } else {
          console.warn(`No cities found for ${stateName}`);
          setCities([]);
        }
      } else if (countryName === "India") {
        // Find cities for Indian state
        if (INDIA_CITIES_BY_STATE[stateName]) {
          const cityList = INDIA_CITIES_BY_STATE[stateName].map((city) => ({
            value: city,
            label: city,
          }));
          console.log(`Loaded ${cityList.length} cities for ${stateName}`);
          setCities(cityList);
        } else {
          console.warn(`No cities found for ${stateName}`);
          setCities([]);
        }
      } else {
        // For other countries, show simplified city list
        setCities([
          { value: "City 1", label: "City 1" },
          { value: "City 2", label: "City 2" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching cities:", error.message);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // Load countries on component mount
  React.useEffect(() => {
    fetchCountries();
  }, []);

  // Load states when country changes
  React.useEffect(() => {
    if (registerInfo.country) {
      fetchStates(registerInfo.country);
    }
  }, [registerInfo.country]);

  // Load cities when state changes
  React.useEffect(() => {
    if (registerInfo.country && registerInfo.state) {
      fetchCities(registerInfo.country, registerInfo.state);
    }
  }, [registerInfo.state, registerInfo.country]);

  return (
    <>
      <div className="p-3 sm:p-5 min-h-[100dvh] flex justify-center items-center">
        <div className="flex flex-col lg:flex-row justify-center items-center gap-5 w-full max-w-7xl mx-auto">
          <div className="hidden lg:block">
            <RightSection />
          </div>
          <div className="w-full lg:flex-1 px-2 sm:px-4 max-w-2xl">
            <div className="flex flex-col gap-2">
              <h3 className="text-[#34495E] font-[800] text-2xl sm:text-3xl lg:text-4xl">
                Create an account
              </h3>
              <p className="text-[#505050] font-[Poppins] font-[400] text-xs sm:text-sm lg:text-base">
                Join HRMS and unlock your employee portal. Create your account
                to access onboarding, benefits management, and more.
              </p>
            </div>
            <div className="mt-3 sm:mt-5">
              <h3 className="text-[#505050] font-[Poppins] font-[700] text-base sm:text-lg lg:text-xl">
                Enter details
              </h3>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={registerInfo.fullName}
                      onChange={handleOnChange}
                      name="fullName"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Email
                    </label>
                    <input
                      type="email"
                      id="lastName"
                      onChange={handleOnChange}
                      name="email"
                      value={registerInfo.email}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={registerInfo.phoneNumber}
                      onChange={handleOnChange}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Address Line 1"
                      name="addressLine1"
                      value={registerInfo.addressLine1}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:w-1/3 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={registerInfo.country}
                      onChange={handleOnChange}
                      disabled={loadingCountries}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Country</option>
                      {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={registerInfo.state}
                      onChange={handleOnChange}
                      disabled={!registerInfo.country || loadingStates}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!registerInfo.country
                          ? "Select Country First"
                          : loadingStates
                          ? "Loading States..."
                          : "Select State"}
                      </option>
                      {states.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      City
                    </label>
                    <select
                      id="city"
                      name="city"
                      value={registerInfo.city}
                      onChange={handleOnChange}
                      disabled={!registerInfo.state || loadingCities}
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!registerInfo.state
                          ? "Select State First"
                          : loadingCities
                          ? "Loading Cities..."
                          : "Select City"}
                      </option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Zip Code"
                      name="zip"
                      value={registerInfo.zip}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      className="border border-[#95A5A6] placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] rounded-lg outline-none py-2 px-2"
                      placeholder="Date of Birth"
                      name="dateOfBirth"
                      onChange={handleOnChange}
                      value={registerInfo.dateOfBirth}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center items-stretch gap-3 mt-3">
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Password
                    </label>

                    <div className="w-full flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        onChange={handleOnChange}
                        value={registerInfo.password}
                        className="placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] outline-none py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col w-full sm:flex-1 gap-2">
                    <label className="text-[#505050] font-[600] font-[Poppins] text-sm md:text-base">
                      Confirm Password
                    </label>
                    <div className="w-full flex justify-center items-center border border-[#95A5A6] rounded-lg p-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={registerInfo.confirmPassword}
                        onChange={handleOnChange}
                        className="placeholder:text-[#95A5A6] font-[Poppins] text-sm md:text-base font-[400] outline-none py-1 px-2 flex-1 border-none focus:border-none focus:outline-none"
                        placeholder="*********"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-1 text-gray-500 hover:text-gray-700 transition"
                      >
                        {showConfirmPassword ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    disabled={
                      !Object.keys(registerInfo).every((key) => {
                        return Boolean(registerInfo[key]);
                      })
                    }
                    type="button"
                    onClick={createNewAccount}
                    className="w-full sm:w-auto bg-[#34495E] flex justify-center items-center gap-5 text-white hover:text-[#34495E] hover:bg-white transition-all duration-200 ease-linear border border-[#34495E] font-[Poppins] font-[600] px-8 sm:px-16 py-2 sm:py-2.5 rounded-full disabled:cursor-not-allowed disabled:opacity-70 disabled:pointer-events-none text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        Sending OTP
                        <CircularProgress size={20} color="#7EC2F3" />
                      </>
                    ) : (
                      "Create an account"
                    )}
                  </button>
                  <p className="font-[Poppins] font-[400] text-sm md:text-base mt-3">
                    Already have an account?{" "}
                    <Link className="text-[#7EC2F3] ml-1" to="/auth/log-in">
                      Login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OtpVerifyModal
        isOpen={showOtpInput}
        onClose={() => {
          setShowOtpInput(false);
          setOtp("");
        }}
        email={registerInfo.email}
        otp={otp}
        setOtp={setOtp}
        onVerify={verifyOTP}
        isLoading={isLoading}
        onResend={resendOTP}
        isResending={isResendingOtp}
      />
    </>
  );
};
