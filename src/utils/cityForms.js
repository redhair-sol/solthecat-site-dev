// Greek genitive form WITH the matching definite article, keyed by the
// city slug in public/episodes.json (ep.city). The per-card quiz CTA in EL
// reads "Παίξε το quiz <thisValue> →", so we have to keep the article in
// here — feminine cities take "της" (της Αθήνας), neuter take "του" (του
// Καΐρου), and plural-form ones like the Victoria Falls take "των". A
// hardcoded article in the template only works for one gender, so the
// article rides along with the case form here.
//
// Cities that don't inflect in Greek (foreign indeclinable names, e.g.
// Τορόντο, Άμστερνταμ) still get a matching article based on the gender
// the noun is conventionally assigned in Greek usage.
//
// Falls back gracefully in the consuming code if a slug is missing here:
// the page renders the city name from the title (without an article)
// instead of producing a grammatically broken phrase.

export const cityArticleGenEl = {
  athens: "της Αθήνας",
  rome: "της Ρώμης",
  paris: "του Παρισιού",
  barcelona: "της Βαρκελώνης",
  london: "του Λονδίνου",
  amsterdam: "του Άμστερνταμ",
  berlin: "του Βερολίνου",
  vienna: "της Βιέννης",
  prague: "της Πράγας",
  swiss: "της Ελβετίας",
  ljubljana: "της Λιουμπλιάνας",
  budapest: "της Βουδαπέστης",
  krakow: "της Κρακοβίας",
  tallinn: "του Ταλίν",
  helsinki: "του Ελσίνκι",
  stockholm: "της Στοκχόλμης",
  copenhagen: "της Κοπεγχάγης",
  bergen: "του Μπέργκεν",
  edinburgh: "του Εδιμβούργου",
  dublin: "του Δουβλίνου",
  reykjavik: "του Ρέικιαβικ",
  toronto: "του Τορόντο",
  newyork: "της Νέας Υόρκης",
  miami: "του Μαϊάμι",
  sanfrancisco: "του Σαν Φρανσίσκο",
  honolulu: "της Χονολουλού",
  losangeles: "του Λος Άντζελες",
  chichenitza: "του Τσιτσέν Ιτζά",
  havana: "της Αβάνας",
  lafortuna: "της Λα Φορτούνα",
  panama: "του Παναμά",
  cartagena: "της Καρθαγένης",
  quito: "του Κίτο",
  machupicchu: "του Μάτσου Πίτσου",
  lapaz: "της Λα Παζ",
  santiago: "του Σαντιάγο",
  buenosaires: "του Μπουένος Άιρες",
  montevideo: "του Μοντεβιδέο",
  riodejaneiro: "του Ρίο ντε Τζανέιρο",
  capetown: "του Κέιπ Τάουν",
  victoriafalls: "των Καταρρακτών",
  zanzibar: "της Ζανζιβάρης",
  nairobi: "του Ναϊρόμπι",
  madagascar: "της Μαδαγασκάρης",
  lalibela: "της Λαλιμπέλας",
  "saint-louis": "του Σεν Λουί",
  marrakech: "του Μαρακές",
  lisbon: "της Λισαβόνας",
  tunis: "της Τύνιδας",
  cairo: "του Καΐρου",
  paphos: "της Πάφου",
  petra: "της Πέτρας",
};
