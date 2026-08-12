(function () {
    'use strict';

    // English -> German translations for the header .lang-switcher buttons.
    var DICTIONARY = {
    "Caferio | Restaurant Cafe HTML Template": "Caferio | Restaurant Café HTML-Vorlage",
    "Home": "Startseite",
    "About Us": "Über uns",
    "Food Menu": "Speisekarte",
    "Help & Faq's": "Hilfe & FAQ",
    "Contact Us": "Kontakt",
    "Reservation": "Jetzt bestellen",
    "Oops! Where are we?": "Hoppla! Wo sind wir?",
    "404 Page Not Found!": "404 Seite nicht gefunden!",
    "Page not Found! The page you are looking for was moved,": "Seite nicht gefunden! Die gesuchte Seite wurde verschoben,",
    "removed, renamed or might never existed.": "gelöscht, umbenannt oder hat nie existiert.",
    "Back to Homepage": "Zurück zur Startseite",
    "Pizzada Luigi – Authentic Italian Pizzeria in Bad Münder am Deister. Enjoy fresh handcrafted pizzas, traditional Italian recipes and warm hospitality – the best pizza experience in the region!": "Pizzada Luigi – Authentische italienische Pizzeria in Bad Münder am Deister. Genießen Sie frische handgemachte Pizzen, traditionelle Rezepte und herzliche Gastfreundschaft – das beste Pizzaerlebnis in der Region!",
    "Contact Info": "Kontaktinfo",
    "Opening Hours": "Öffnungszeiten",
    "Monday-Friday: 08:00-22:00": "Montag-Freitag: 08:00-22:00",
    "Tuesday4PM:  Till Mid Night": "Dienstag 16 Uhr: Bis Mitternacht",
    "Tuesday4PM: Till Mid Night": "Dienstag 16 Uhr: Bis Mitternacht",
    "Saturday: 10:00-16:00": "Samstag: 10:00-16:00",
    "ThemeEaster All Rights Reserved.": "ThemeEaster Alle Rechte vorbehalten.",
    "Type keywords here...": "Suchbegriffe hier eingeben...",
    "Logo": "Logo",
    "img": "Bild",
    "Experience The Taste": "Erleben Sie den Geschmack",
    "of Italian Food.": "italienischer Küche.",
    "Food is any substance consumed to provide nutritional": "Nahrung ist jede Substanz, die konsumiert wird, um",
    "support for an organism.": "einen Organismus zu ernähren.",
    "Caferio, Burgers, And": "Caferio, Burger und",
    "Best Pizzas": "Beste Pizzen",
    "in Town!": "in der Stadt!",
    "The restaurants in Hangzhou also catered to many northern Chinese who had fled south from Kaifeng during the Jurchen invasion of the 1120s, while it is also known that many restaurants were run by families.": "Die Restaurants in Hangzhou versorgten auch viele Nordchinesen, die während der Jurchen-Invasion der 1120er Jahre aus Kaifeng nach Süden geflohen waren; zudem ist bekannt, dass viele Restaurants von Familien geführt wurden.",
    "Food is any substance consumed to provide nutritional support for an organism. Everyone just loves italian foods, because its delicious.": "Nahrung ist jede Substanz, die konsumiert wird, um einen Organismus zu ernähren. Jeder liebt einfach italienisches Essen, weil es köstlich ist.",
    "Order Now": "Jetzt bestellen",
    "Caferio History": "Caferio Geschichte",
    "Restaurant is Like a Theater": "Ein Restaurant ist wie ein Theater",
    "Our Task is To": "Unsere Aufgabe ist es,",
    "Amaze You!": "Sie zu begeistern!",
    "Team Mebmers": "Teammitglieder",
    "They Will": "Sie werden",
    "Cook": "Kochen",
    "For You": "Für Sie",
    "Executive Chef": "Chefkoch",
    "Head Chef": "Küchenchef",
    "Junior Chef": "Jungkoch",
    "Kitchen Porter": "Küchenhilfe",
    "Testimonials": "Kundenstimmen",
    "Our Customers": "Unsere Kunden",
    "Reviews": "Bewertungen",
    "\"I would be lost without restaurant. I would like to personally thank you for your outstanding product.\"": "„Ich wäre ohne das Restaurant aufgeschmissen. Ich möchte Ihnen persönlich für Ihr hervorragendes Produkt danken.“",
    "A Moments Of Delivered": "Ein Moment der Lieferung",
    "On": "Zur",
    "Right Time": "richtigen Zeit",
    "& Place": "& am richtigen Ort",
    "Order Number": "Bestellnummer",
    "-50% Off Now!": "Jetzt -50%!",
    "Discount For Delicious": "Rabatt auf köstliche",
    "Tasty Burgers!": "Leckere Burger!",
    "Sale off 50% only this week": "50% Rabatt nur diese Woche",
    "Delicious": "Köstliche",
    "Pizza": "Pizza",
    "50% off Now": "Jetzt 50% Rabatt",
    "American": "Amerikanische",
    "Burgers": "Burger",
    "Tasty Buzzed": "Lecker & Angesagt",
    "Latest Blog Posts": "Neueste Blogbeiträge",
    "This Is All About": "Hier dreht sich alles um",
    "Foods": "Essen",
    "Jan 01 2021": "01. Jan 2021",
    "What Do You Think About Cheese Pizza Recipes?": "Was halten Sie von Käse-Pizza-Rezepten?",
    "Financial experts support or help you to to find out which way you can raise your funds more...": "Finanzexperten unterstützen Sie dabei herauszufinden, wie Sie Ihre Mittel besser aufstocken können...",
    "Read More": "Weiterlesen",
    "Burger": "Burger",
    "Making Chicken Strips With New Delicious Ingridents.": "Hähnchenstreifen mit neuen köstlichen Zutaten zubereiten.",
    "Chicken": "Hähnchen",
    "Innovative Hot Chessyraw Pasta Make Creator Fact.": "Innovative heiße Käse-Pasta vom Kreativkoch.",
    "Book a Table": "Tisch reservieren",
    "Person": "Person",
    "2 Person": "2 Personen",
    "3 Person": "3 Personen",
    "4 Person": "4 Personen",
    "5 Person": "5 Personen",
    "Your Name": "Ihr Name",
    "Email": "E-Mail",
    "Message": "Nachricht",
    "sign": "Schild",
    "team": "Team",
    "banner": "Banner",
    "Recent Posts": "Neueste Beiträge",
    "Book of Recipes and": "Rezeptbuch und",
    "Cooking Tips!": "Kochtipps!",
    "Design": "Design",
    "5 Comments": "5 Kommentare",
    "Incredible Vegan Mac and Cheese.": "Unglaubliches veganes Mac and Cheese.",
    "Financial experts support or help you to to find out which way you can raise your funds more. Arkit a trusted name for providing assistants. Initially their main objective was to ensure the service they provide these people are loyal to their industry.": "Finanzexperten unterstützen Sie dabei herauszufinden, wie Sie Ihre Mittel besser aufstocken können. Arkit ist ein vertrauenswürdiger Name für Assistenzdienste. Ursprünglich bestand ihr Hauptziel darin sicherzustellen, dass die von ihnen betreuten Personen ihrer Branche treu bleiben.",
    "Business": "Wirtschaft",
    "Beet and Burrata Salad with Fried.": "Rote-Bete-Burrata-Salat mit Gebratenem.",
    "Categories": "Kategorien",
    "Burger Strips": "Burger-Streifen",
    "Catalonian Salad": "Katalanischer Salat",
    "Nicoise Salad": "Salat Niçoise",
    "Fried Chicjken": "Brathähnchen",
    "Spacial Cawmin": "Spezial Kreation",
    "Follow Us": "Folgen Sie uns",
    "Facebook": "Facebook",
    "Twitter": "Twitter",
    "Instagram": "Instagram",
    "Pinterest": "Pinterest",
    "Dribbble": "Dribbble",
    "Linkedin": "Linkedin",
    "Recent Articles": "Neueste Artikel",
    "How to go about initiating an startup in few days.": "Wie man in wenigen Tagen ein Startup gründet.",
    "Financial experts support or help you to to find way.": "Finanzexperten helfen Ihnen, den richtigen Weg zu finden.",
    "Innovative helping your business all over the world.": "Innovative Hilfe für Ihr Unternehmen auf der ganzen Welt.",
    "Tags": "Schlagwörter",
    "business": "Wirtschaft",
    "marketing": "Marketing",
    "startup": "Startup",
    "design": "Design",
    "consulting": "Beratung",
    "development": "Entwicklung",
    "tips": "Tipps",
    "strategy": "Strategie",
    "Seo": "SEO",
    "Search": "Suche",
    "thumb": "Vorschau",
    "Blog Details": "Blog-Details",
    "Beet and Tasty Burrata": "Rote Bete und leckere Burrata",
    "Salad with Fried.": "Salat mit Gebratenem.",
    "Salad": "Salat",
    "Jan 01 2022": "01. Jan 2022",
    "Financial experts support or help you to to find out which way you can raise your funds more. Arkit a trusted name for providing assistants. Initially their main objective was to ensure the service they provide these people are loyal to their industry, experienced and professional.": "Finanzexperten unterstützen Sie dabei herauszufinden, wie Sie Ihre Mittel besser aufstocken können. Arkit ist ein vertrauenswürdiger Name für Assistenzdienste. Ursprünglich bestand ihr Hauptziel darin sicherzustellen, dass die von ihnen betreuten Personen ihrer Branche treu, erfahren und professionell bleiben.",
    "Unless you are the one who really cares about this, it is not terribly important. What all matters are how your hybrid mobile application development is going to work in the long run as no one will care about how it was built.": "Wenn es Ihnen nicht wirklich wichtig ist, spielt es kaum eine Rolle. Entscheidend ist, wie Ihre hybride mobile Anwendungsentwicklung langfristig funktioniert, denn niemand wird sich später dafür interessieren, wie sie gebaut wurde.",
    "Method of cooking:": "Zubereitungsart:",
    "The new functions coming to construction for equipment mathematics.": "Die neuen Funktionen für die Baumaschinen-Mathematik.",
    "Initially their main objective was to ensure the service.": "Ursprünglich bestand ihr Hauptziel darin, den Service sicherzustellen.",
    "transformation on the horizon is one where advanced streams": "Der bevorstehende Wandel ist einer, bei dem fortschrittliche Datenströme",
    "What all matters are how your hybrid mobile application.": "Entscheidend ist einzig, wie Ihre hybride mobile Anwendung funktioniert.",
    "There are some big shifts taking place in the field of construction.": "Im Bereich Bauwesen finden derzeit große Veränderungen statt.",
    "There are some big shifts taking place in the field of construction equipment mathematics. Starting with the integration of mathematics devices in vehicles right from the manufacturers, to the standardization and integration of mathematics data across various business functions, the future of mathematics has never seemed so full of potential for fleet-based businesses.": "Im Bereich der Baumaschinen-Mathematik finden derzeit große Veränderungen statt. Angefangen bei der werksseitigen Integration mathematischer Geräte in Fahrzeuge bis hin zur Standardisierung und Integration mathematischer Daten über verschiedene Geschäftsbereiche hinweg – die Zukunft der Mathematik war für flottenbasierte Unternehmen noch nie so vielversprechend.",
    "There are no secrets to success. It is the result preparation, hard work and learning from failure.": "Es gibt keine Geheimnisse für Erfolg. Er ist das Ergebnis von Vorbereitung, harter Arbeit und dem Lernen aus Fehlern.",
    "- Winston Churchill.": "- Winston Churchill.",
    "Another speaker, John Meuse, senior director of heavy equipment at Waste Management Inc., echoed this, citing a cost-saving of $17,000 for the company when it cut idling time of a single Caterpillar 966 wheel loader.": "Ein weiterer Redner, John Meuse, leitender Direktor für Schwermaschinen bei Waste Management Inc., bestätigte dies und nannte eine Kostenersparnis von 17.000 $ für das Unternehmen durch die reduzierte Leerlaufzeit eines einzelnen Caterpillar 966 Radladers.",
    "Wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart. I am alone, and feel the charm of existence in this spot.": "Eine wunderbare Heiterkeit hat von meiner ganzen Seele Besitz ergriffen, wie diese süßen Frühlingsmorgen, die ich mit meinem ganzen Herzen geniesse. Ich bin allein und spüre den Zauber des Daseins an diesem Ort.",
    "Previous": "Zurück",
    "Next": "Weiter",
    "Posts Comments": "Kommentare zum Beitrag",
    "Home renovations, especially those involving plentiful of demolition can be a very dusty affair. This nasty dust can easily free flow through your house.": "Hausrenovierungen, insbesondere solche mit viel Abriss, können eine sehr staubige Angelegenheit sein. Dieser lästige Staub kann sich leicht im ganzen Haus verteilen.",
    "Reply": "Antworten",
    "Write a Comment": "Kommentar schreiben",
    "Small river named Duden flows by their place and supplies it with the necessary regelialia.": "Ein kleiner Fluss namens Duden fließt an ihrem Ort vorbei und versorgt sie mit der nötigen Regelialia.",
    "Archives": "Archiv",
    "January": "Januar",
    "February": "Februar",
    "March": "März",
    "April": "April",
    "September": "September",
    "Write Your Comments...": "Schreiben Sie Ihren Kommentar...",
    "Website": "Webseite",
    "Name": "Name",
    "Post Comment": "Kommentar senden",
    "Desert": "Dessert",
    "Incredible Mac and Cheese.": "Unglaubliches Mac and Cheese.",
    "Fish": "Fisch",
    "Burrata Salad with Fried.": "Burrata-Salat mit Gebratenem.",
    "Chicken Tinga cahos.": "Chicken Tinga Chaos.",
    "Quinoa Sweet Potato Salad.": "Quinoa-Süßkartoffel-Salat.",
    "Hot Chessyraw Pasta.": "Heiße Käse-Pasta.",
    "Tasty Cheese Pizza.": "Leckere Käse-Pizza.",
    "Cart Page": "Warenkorb",
    "Your Order Page": "Ihre Bestellseite",
    "Product": "Produkt",
    "Quantity": "Menge",
    "Price": "Preis",
    "Total": "Gesamt",
    "Fried Chicken Unlimited": "Brathähnchen Unlimited",
    "Food is any substance consumed to provide nutritional support for an organism.": "Nahrung ist jede Substanz, die konsumiert wird, um einen Organismus zu ernähren.",
    "Subtotal:": "Zwischensumme:",
    "Estimated shipping:": "Geschätzter Versand:",
    "Total:": "Gesamt:",
    "Continue Shopping": "Einkauf fortsetzen",
    "Checkout": "Zur Kasse",
    "food": "Essen",
    "Billing Details": "Rechnungsdetails",
    "Additional Information": "Zusätzliche Informationen",
    "Payment Method": "Zahlungsmethode",
    "Direct Bank Transfer": "Direkte Bankuüberweisung",
    "Check Payments": "Zahlung per Scheck",
    "Cash On Delivery": "Barzahlung bei Lieferung",
    "Place Order": "Bestellung aufgeben",
    "First Name": "Vorname",
    "Last Name": "Nachname",
    "Company Name": "Firmenname",
    "Country": "Land",
    "City": "Stadt",
    "State / Province": "Bundesland / Provinz",
    "Street": "Straße",
    "Post Code": "Postleitzahl",
    "Phone": "Telefon",
    "Order Note": "Bestellhinweis",
    "Do You Have Any Questions?": "Haben Sie Fragen?",
    "Get in touch to discuss your employee wellbeing needs today. Please give us a call, drop us an email or fill out the contact form.": "Kontaktieren Sie uns, um über Ihre Anliegen zu sprechen. Rufen Sie uns an, schreiben Sie uns eine E-Mail oder füllen Sie das Kontaktformular aus.",
    "Drop Us A Line": "Schreiben Sie uns",
    "Send Massage": "Nachricht senden",
    "Sydney (Head Office)": "Sydney (Hauptsitz)",
    "North Ryde, NSW 2113": "North Ryde, NSW 2113",
    "Brisbane": "Brisbane",
    "Hobart": "Hobart",
    "Melbourne": "Melbourne",
    "Phone Number": "Telefonnummer",
    "Help and Faq's": "Hilfe & FAQ",
    "Frequently Asked Question": "Häufig gestellte Fragen",
    "How to Order Fried Chicken Online?": "Wie bestellt man Brathähnchen online?",
    "The restaurants in Hangzhou also catered to many northern Chinese who had fled south from Kaifeng during the Jurchen invasion of the 1120s, while it is also known that many restaurants were run by families. The restaurants in Hangzhou also catered to many northern Chinese who had fled south from Kaifeng during the Jurchen invasion.": "Die Restaurants in Hangzhou versorgten auch viele Nordchinesen, die während der Jurchen-Invasion der 1120er Jahre aus Kaifeng nach Süden geflohen waren; zudem ist bekannt, dass viele Restaurants von Familien geführt wurden. Die Restaurants in Hangzhou versorgten auch viele Nordchinesen, die während der Jurchen-Invasion aus Kaifeng geflohen waren.",
    "How To Payment Caferio Restaurant Online?": "Wie bezahlt man online im Caferio Restaurant?",
    "How to Go Caferio Restaurnt by Road?": "Wie erreicht man das Caferio Restaurant mit dem Auto?",
    "What Should I be Asking For Fast Food?": "Wonach sollte ich beim Fast Food fragen?",
    "How Many Food Items Cafrerio Have?": "Wie viele Gerichte bietet Caferio an?",
    "Our Food Menu": "Unsere Speisekarte",
    "Price:": "Preis:",
    "Noddles": "Nudeln",
    "Pizzas": "Pizzen",
    "Burrito": "Burrito",
    "Bell Burrito Supreme": "Bell Burrito Supreme",
    "Nuggets": "Nuggets",
    "Kung Pao Chicken BBQ": "Kung Pao Chicken BBQ",
    "Wendy's Chicken Nuggets": "Wendy's Chicken Nuggets",
    "Food Gallery": "Essensgalerie",
    "Load More": "Mehr laden",
    "Get Up To": "Erhalten Sie bis zu",
    "Off Now": "Rabatt jetzt",
    "Free Home Delivery 24 Hours": "Kostenlose Lieferung rund um die Uhr",
    "Best Italian": "Beste italienische",
    "Pizza In": "Pizza in der",
    "Town!": "Stadt!",
    "Hot & Spicy": "Heiß & Würzig",
    "100% Fresh": "100% Frisch",
    "Fast Delivery": "Schnelle Lieferung",
    "Popular Dishes": "Beliebte Gerichte",
    "Our Delicious": "Unsere köstliche",
    "Full Menu": "Komplette Speisekarte",
    "Our Expart": "Unsere erfahrenen",
    "Chefs": "Köche",
    "pizza": "Pizza",
    "Eat Sleep And": "Essen, Schlafen und",
    "Supper delicious": "köstlich Abendessen",
    "Burger in town!": "Burger in der Stadt!",
    "Book A Table": "Jetzt bestellen",
    "Tasty Pizza": "Leckere Pizza",
    "Fried masala": "Gebratenes Masala",
    "in town!": "in der Stadt!",
    "Maxican Pizza": "Mexikanische Pizza",
    "Soft Drinks": "Softdrinks",
    "French Fry": "Pommes Frites",
    "Burger Kingo": "Burger Kingo",
    "Chicken Masala": "Chicken Masala",
    "Caferio, Burgers, and": "Caferio, Burger und",
    "Delicious & Healthy Foods": "Köstliche & gesunde Speisen",
    "Spacific Family And Kids Zone": "Spezielle Familien- und Kinderzone",
    "Music & Other Facilities": "Musik & weitere Annehmlichkeiten",
    "Fastest Food Home Delivery": "Schnellster Essenslieferservice",
    "All": "Alle",
    "Drinks": "Getränke",
    "Sandwich": "Sandwich",
    "Wendy's Chicken": "Wendy's Chicken",
    "The Caferio Have Excellent": "Caferio bietet exzellente",
    "Of": "an",
    "Quality Burgers!": "Qualitätsburgern!",
    "Book Your Table": "Reservieren Sie Ihren Tisch",
    "Enjoy Our Tasty Food": "Genießen Sie unser leckeres Essen",
    "Reserve": "Reservieren",
    "Your Table": "Ihren Tisch",
    "Food Reviews": "Essensbewertungen",
    "Shop": "Shop",
    "Online Food Shop": "Online-Lebensmittelshop",
    "(In Stock)": "(Auf Lager)",
    "Designed for simplicity and made from high quality materials. Its sleek geometry and material combinations creates a modern look.": "Entwickelt für Einfachheit und aus hochwertigen Materialien gefertigt. Seine schlichte Geometrie und Materialkombinationen schaffen einen modernen Look.",
    "Add To Cart": "In den Warenkorb",
    "SKU:": "Art.-Nr.:",
    "Categories:": "Kategorien:",
    "Bag": "Tasche",
    "Womens": "Damen",
    "Tags:": "Schlagwörter:",
    "Dress": "Kleid",
    "Pants": "Hose",
    "Share:": "Teilen:",
    "Ingredients": "Zutaten",
    "Additional information": "Zusätzliche Informationen",
    "Reviews (2)": "Bewertungen (2)",
    "Lower temperature washes and delicate spin cycles are gentler on garment, helping to maintain the color, shape and structure of the fabric. At the same time it reduces energy consumption that is used in care processes.": "Waschgänge bei niedrigerer Temperatur und schonende Schleuderprogramme sind sanfter zum Stoff und helfen, Farbe, Form und Struktur des Materials zu erhalten. Gleichzeitig wird der Energieverbrauch bei der Pflege reduziert.",
    "Model wears:": "Model trägt:",
    "Occasion:": "Anlass:",
    "Lifestyle, Sport": "Lifestyle, Sport",
    "Country:": "Land:",
    "Italy": "Italien",
    "Outer:": "Außenmaterial:",
    "Leather 100%, Polyamide 100%": "Leder 100%, Polyamid 100%",
    "Lining:": "Futter:",
    "Polyester 100%": "Polyester 100%",
    "CounSoletry:": "Sohle:",
    "Rubber 100%": "Gummi 100%",
    "Size": "Größe",
    "Bust": "Brustumfang",
    "Waist": "Taille",
    "Hip": "Hüfte",
    "January 5, 2022": "5. Januar 2022",
    "Our versatile team is built of designers, developers and digital marketers.": "Unser vielseitiges Team besteht aus Designern, Entwicklern und digitalen Marketern.",
    "Our Popular": "Unsere beliebten",
    "Dishes": "Gerichte",
    "Our Bestselling": "Unsere meistverkauften",
    "Our Team": "Unser Team",
    "Experience Chefs Will": "Erfahrene Köche werden",
    "Cook For You.": "für Sie kochen.",
    "jan 05, 2022 at 8:00": "05. Jan 2022 um 8:00",
    "jan 15, 2022 at 8:00": "15. Jan 2022 um 8:00",
    "jan 02, 2022 at 8:00": "02. Jan 2022 um 8:00",

    // order.html - online ordering (menu, cart, checkout)
    "Order Online – Pizza Da Luigi – Bad Münder am Deister": "Online Bestellen – Pizza Da Luigi – Bad Münder am Deister",
    "Order Online": "Online Bestellen",
    "Fresh Pizza, Ready for Pickup": "Frische Pizza, bereit zur Abholung",
    "or Delivered to You": "oder zu Ihnen geliefert",
    "Build your order below – it goes straight to our kitchen.": "Stellen Sie unten Ihre Bestellung zusammen – sie geht direkt in unsere Küche.",
    "Loading menu…": "Speisekarte wird geladen…",
    "Online ordering isn’t available right now.": "Online-Bestellungen sind momentan nicht verfügbar.",
    "Please call us directly:": "Bitte rufen Sie uns direkt an:",
    "The menu isn’t set up yet. Please check back soon.": "Die Speisekarte ist noch nicht eingerichtet. Bitte schauen Sie später wieder vorbei.",
    "Your Order": "Ihre Bestellung",
    "Your cart is empty. Add something delicious!": "Ihr Warenkorb ist leer. Fügen Sie etwas Leckeres hinzu!",
    "Subtotal": "Zwischensumme",
    "Delivery fee": "Liefergebühr",
    "Phone, e.g. +49 176 1234567": "Telefon, z. B. +49 176 1234567",
    "Delivery Address": "Lieferadresse",
    "Notes (optional)": "Anmerkungen (optional)",
    "Pickup": "Abholung",
    "Delivery": "Lieferung",
    "Place Order": "Bestellung aufgeben",
    "Placing order…": "Bestellung wird aufgegeben…",
    "Thank you! Your order number is": "Vielen Dank! Ihre Bestellnummer ist",
    "We’re preparing it now.": "Wir bereiten sie jetzt zu.",
    "View Cart": "Warenkorb ansehen"
};

    var STORAGE_KEY = 'site-lang';
    var originalText = new WeakMap();
    var originalAttrs = new WeakMap();

    function cacheText(node) {
        if (!originalText.has(node)) {
            originalText.set(node, node.nodeValue);
        }
        return originalText.get(node);
    }

    function translateTextNodes(lang) {
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                var parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                var tag = parent.nodeName;
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        var nodes = [];
        var n;
        while ((n = walker.nextNode())) {
            nodes.push(n);
        }

        nodes.forEach(function (node) {
            var original = cacheText(node);
            var trimmed = original.trim();
            if (lang === 'de' && DICTIONARY.hasOwnProperty(trimmed)) {
                var leading = original.match(/^\s*/)[0];
                var trailing = original.match(/\s*$/)[0];
                node.nodeValue = leading + DICTIONARY[trimmed] + trailing;
            } else {
                node.nodeValue = original;
            }
        });

        // <title> lives outside document.body, handle it separately.
        var titleNode = document.querySelector('title');
        if (titleNode && titleNode.firstChild) {
            var titleOriginal = cacheText(titleNode.firstChild);
            var titleTrimmed = titleOriginal.trim();
            if (lang === 'de' && DICTIONARY.hasOwnProperty(titleTrimmed)) {
                titleNode.firstChild.nodeValue = DICTIONARY[titleTrimmed];
            } else {
                titleNode.firstChild.nodeValue = titleOriginal;
            }
        }
    }

    function translateAttributes(lang) {
        var ATTR_NAMES = ['placeholder', 'title', 'alt'];
        var selector = ATTR_NAMES.map(function (a) { return '[' + a + ']'; }).join(',') + ', input[type="submit"]';

        document.querySelectorAll(selector).forEach(function (el) {
            if (!originalAttrs.has(el)) {
                originalAttrs.set(el, {});
            }
            var store = originalAttrs.get(el);

            ATTR_NAMES.forEach(function (attr) {
                if (!el.hasAttribute(attr)) return;
                if (!(attr in store)) {
                    store[attr] = el.getAttribute(attr);
                }
                var original = store[attr];
                var trimmed = original.trim();
                if (lang === 'de' && DICTIONARY.hasOwnProperty(trimmed)) {
                    el.setAttribute(attr, DICTIONARY[trimmed]);
                } else {
                    el.setAttribute(attr, original);
                }
            });

            if (el.tagName === 'INPUT' && el.type === 'submit') {
                if (!('value' in store)) {
                    store.value = el.value;
                }
                var trimmedVal = store.value.trim();
                if (lang === 'de' && DICTIONARY.hasOwnProperty(trimmedVal)) {
                    el.value = DICTIONARY[trimmedVal];
                } else {
                    el.value = store.value;
                }
            }
        });
    }

    function applyLanguage(lang) {
        translateTextNodes(lang);
        translateAttributes(lang);
        document.documentElement.setAttribute('lang', lang);
    }

    // Content injected after page load (e.g. the online-order menu/cart, fetched
    // asynchronously) isn't on the page yet when the initial applyLanguage() runs,
    // so pages that render dynamic content call this afterwards to translate it too.
    window.applySiteLanguage = function () {
        applyLanguage(localStorage.getItem(STORAGE_KEY) || 'de');
    };

    document.addEventListener('DOMContentLoaded', function () {
        // main.js already toggles the .active class on .lang-switcher .lang-btn
        // and persists the choice under localStorage['site-lang']; we just add
        // the actual translation behaviour on top of that existing UI.
        document.querySelectorAll('.lang-switcher .lang-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                applyLanguage(btn.getAttribute('data-lang'));
            });
        });

        var savedLang = localStorage.getItem(STORAGE_KEY) || 'de';
        applyLanguage(savedLang);
    });
})();
