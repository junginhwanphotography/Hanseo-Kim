const path = require("path");

const SITE = path.resolve(__dirname, "..");
const PROJECT = path.resolve(SITE, "..");
const WEB = path.join(SITE, "web");
const MENU_DIR = path.join(PROJECT, "photos");
const COLLECTIONS_DIR = MENU_DIR;
const CONTACT_RTF = path.join(PROJECT, "contact.rtf");
const CONTACT_TXT = path.join(PROJECT, "contact.txt");
const COLLECTIONS_URL = "collections";
const SITE_OUT = path.join(SITE, "_site");

module.exports = {
  PROJECT,
  SITE,
  WEB,
  MENU_DIR,
  COLLECTIONS_DIR,
  CONTACT_RTF,
  CONTACT_TXT,
  COLLECTIONS_URL,
  SITE_OUT,
};
