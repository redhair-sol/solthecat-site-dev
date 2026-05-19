// Greek genitive forms of every episode's city, keyed by the city slug used
// in public/episodes.json (ep.city). The per-card quiz CTA in EL ("Παίξε το
// quiz της Αθήνας") needs the genitive case, but the title only carries
// nominative, so we keep a small lookup table here. Cities that don't
// inflect in Greek (foreign place names, e.g. Tallinn) map to their
// nominative form unchanged.
//
// Falls back gracefully in the consuming code if a slug is missing here:
// the page renders the city name from the title instead of producing a
// grammatically broken phrase.

export const cityGenitiveEl = {
  athens: "Αθήνας",
  rome: "Ρώμης",
  paris: "Παρισιού",
  barcelona: "Βαρκελώνης",
  london: "Λονδίνου",
  amsterdam: "Άμστερνταμ",
  berlin: "Βερολίνου",
  vienna: "Βιέννης",
  prague: "Πράγας",
  swiss: "Ελβετίας",
  ljubljana: "Λιουμπλιάνας",
  budapest: "Βουδαπέστης",
  krakow: "Κρακοβίας",
  tallinn: "Ταλίν",
  helsinki: "Ελσίνκι",
  stockholm: "Στοκχόλμης",
  copenhagen: "Κοπεγχάγης",
  bergen: "Μπέργκεν",
  edinburgh: "Εδιμβούργου",
  dublin: "Δουβλίνου",
  reykjavik: "Ρέικιαβικ",
  toronto: "Τορόντο",
  newyork: "Νέας Υόρκης",
  miami: "Μαϊάμι",
  sanfrancisco: "Σαν Φρανσίσκο",
  honolulu: "Χονολουλού",
  losangeles: "Λος Άντζελες",
  chichenitza: "Τσιτσέν Ιτζά",
  havana: "Αβάνας",
  lafortuna: "Λα Φορτούνα",
  panama: "Παναμά",
  cartagena: "Καρθαγένης",
  quito: "Κίτο",
  machupicchu: "Μάτσου Πίτσου",
  lapaz: "Λα Παζ",
  santiago: "Σαντιάγο",
  buenosaires: "Μπουένος Άιρες",
  montevideo: "Μοντεβιδέο",
  riodejaneiro: "Ρίο ντε Τζανέιρο",
  capetown: "Κέιπ Τάουν",
  victoriafalls: "Καταρρακτών Βικτώρια",
  zanzibar: "Ζανζιβάρης",
  nairobi: "Ναϊρόμπι",
  madagascar: "Μαδαγασκάρης",
  lalibela: "Λαλιμπέλας",
  "saint-louis": "Σεν Λουί",
  marrakech: "Μαρακές",
  lisbon: "Λισαβόνας",
  tunis: "Τύνιδας",
  cairo: "Καΐρου",
  paphos: "Πάφου",
  petra: "Πέτρας",
};
