(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalDeepLibrary=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const contrasts=[
    ["A1","sein vs haben","sein برای هویت/وضعیت؛ haben برای مالکیت و برخی حالت‌ها.","Ich bin müde. / Ich habe Hunger.","سن با sein می‌آید: Ich bin 20 Jahre alt."],
    ["A1","nicht vs kein","kein اسم بدون Artikel معین را منفی می‌کند؛ nicht بقیه اجزای جمله را.","Ich habe kein Auto. / Ich komme heute nicht.","Ich habe nicht Auto غلط است."],
    ["A1","Wo vs Wohin","Wo مکان ثابت؛ Wohin جهت حرکت.","Wo bist du? / Wohin gehst du?","حرکت را با مکان ثابت قاطی نکن."],
    ["A1","du vs Sie","du صمیمی؛ Sie رسمی/محترمانه.","Wie heißt du? / Wie heißen Sie?","صرف فعل با Sie مانند sie جمع است."],
    ["A1","möchten vs wollen","möchten مؤدبانه‌تر؛ wollen مستقیم‌تر.","Ich möchte einen Kaffee. / Ich will gehen.","در خدمات/رستوران möchten طبیعی‌تر است."],
    ["A1","um vs am","um برای ساعت؛ am برای روز/تاریخ‌های خاص.","um 10 Uhr / am Montag","am 10 Uhr غلط است."],

    ["A2","Perfekt mit haben vs sein","حرکت/تغییر حالت غالباً sein؛ بیشتر افعال دیگر haben.","Ich bin gefahren. / Ich habe gearbeitet.","هر فعل حرکتی الزاماً sein نیست؛ کاربرد را یاد بگیر."],
    ["A2","weil vs deshalb","weil جمله وابسته با فعل آخر؛ deshalb جمله اصلی با فعل دوم.","Ich bleibe, weil ich krank bin. / Ich bin krank, deshalb bleibe ich.","deshalb فعل را به آخر نمی‌برد."],
    ["A2","wenn vs als","wenn برای تکرار/حال/آینده؛ als برای یک رویداد گذشته.","Wenn ich Zeit habe … / Als ich in Berlin war …","برای اتفاق یکتای گذشته als."],
    ["A2","seit vs vor","seit شروع وضعیتی که ادامه دارد؛ vor یک نقطه در گذشته.","Ich wohne seit 2024 hier. / Ich kam vor zwei Jahren.","seit + Präsens رایج است."],
    ["A2","Dativ vs Akkusativ nach Wechselpräposition","Wo? Dativ؛ Wohin? Akkusativ.","auf dem Tisch / auf den Tisch","معنا تعیین‌کننده Kasus است."],
    ["A2","kennen vs wissen","kennen برای آشنایی با شخص/چیز؛ wissen برای دانستن واقعیت.","Ich kenne Berlin. / Ich weiß die Antwort.","Ich weiß Berlin غلط است."],

    ["B1","obwohl vs trotzdem","obwohl جمله وابسته؛ trotzdem جمله اصلی.","Obwohl es regnet, gehe ich raus. / Es regnet; trotzdem gehe ich raus.","جای فعل متفاوت است."],
    ["B1","würde vs hätte/wäre","würde + Infinitiv عمومی؛ hätte/wäre فرم‌های مستقل و طبیعی‌تر.","Ich würde kommen. / Ich wäre gern dort.","*würde sein ممکن است ولی غالباً wäre طبیعی‌تر است."],
    ["B1","Passiv vs Aktiv","Passiv عمل/نتیجه را برجسته می‌کند؛ Aktiv عامل را.","Der Antrag wird geprüft. / Die Behörde prüft den Antrag.","وقتی عامل مهم است Aktiv روشن‌تر است."],
    ["B1","deshalb vs daher vs deswegen","معنای نزدیک؛ تفاوت بیشتر سبکی است.","Deshalb bleibe ich. / Daher ergibt sich …","daher در متن رسمی‌تر رایج‌تر است."],
    ["B1","sollen vs müssen","müssen الزام قوی؛ sollen الزام/توصیه از منبع بیرونی.","Ich muss gehen. / Ich soll den Arzt anrufen.","sollen می‌تواند نقل دستور دیگری باشد."],
    ["B1","Präteritum vs Perfekt","Perfekt در گفتار روزمره؛ Präteritum در نوشتار و با sein/haben/modalها رایج.","Ich habe gearbeitet. / Ich war krank.","سبک و فعل تعیین‌کننده‌اند."],

    ["B2","Konjunktiv I vs II","I برای نقل قول غیرمستقیم؛ II برای فرض/ادب یا جایگزین در نقل قول.","Er sagt, er sei krank. / Wenn er Zeit hätte …","کارکردها را یکی نکن."],
    ["B2","Vorgangspassiv vs Zustandspassiv","werden + Partizip برای فرایند؛ sein + Partizip برای وضعیت.","Die Tür wird geschlossen. / Die Tür ist geschlossen.","یکی عمل، یکی نتیجه/وضعیت."],
    ["B2","während vs dagegen","während می‌تواند جمله وابسته بسازد؛ dagegen قید مقایسه/تضاد.","Während A steigt, sinkt B. / A steigt; B dagegen sinkt.","ساخت نحوی متفاوت است."],
    ["B2","scheinbar vs anscheinend","scheinbar = ظاهری اما خلاف واقع؛ anscheinend = ظاهراً/به نظر می‌رسد.","Er ist scheinbar ruhig. / Anscheinend kommt er später.","این دو را دقیق تفکیک کن."],
    ["B2","behaupten vs feststellen","behaupten ادعا؛ feststellen نتیجه مشاهده/بررسی.","Er behauptet … / Die Studie stellt fest …","شدت اعتبار ضمنی متفاوت است."],
    ["B2","fordern vs bitten","fordern درخواست قوی/مطالبه؛ bitten مؤدبانه‌تر.","Wir fordern eine Erstattung. / Wir bitten um Prüfung.","Register و رابطه قدرت مهم است."],

    ["C1","zeigen vs darauf hindeuten","zeigen ادعای قوی‌تر؛ hindeuten محتاطانه‌تر.","Die Daten zeigen … / Die Daten deuten darauf hin …","در متن علمی درجه قطعیت مهم است."],
    ["C1","obgleich vs obwohl","معنای مشابه؛ obgleich رسمی‌تر/نوشتاری‌تر.","Obgleich die Daten begrenzt sind …","Register متفاوت است."],
    ["C1","insofern vs daher","insofern رابطه محدود/از این جهت؛ daher نتیجه مستقیم‌تر.","Insofern ist die Kritik berechtigt. / Daher folgt …","insofern اغلب نیازمند توضیح محدوده است."],
    ["C1","belegen vs beweisen","belegen مستند کردن؛ beweisen اثبات قوی‌تر.","Die Studie belegt einen Zusammenhang. / Der Satz ist mathematisch bewiesen.","در پژوهش تجربی beweisen اغلب بیش از حد قوی است."],
    ["C1","einschränken vs relativieren","einschränken دامنه را محدود؛ relativieren شدت/اطلاق ادعا را تعدیل.","Die Aussage gilt nur eingeschränkt. / Das Ergebnis muss relativiert werden.","اثر گفتمانی متفاوت است."],
    ["C1","sachlich vs neutral","sachlich مبتنی بر موضوع/بدون هیجان؛ neutral بی‌طرف میان مواضع.","ein sachlicher Bericht / eine neutrale Moderation","هم‌پوشانی دارند اما یکی نیستند."],

    ["C2","implizieren vs suggerieren","implizieren نتیجه ضمنی منطقی/معنایی؛ suggerieren القای ذهنی.","Die Formulierung impliziert … / Der Titel suggeriert …","suggerieren بار گفتمانی قوی‌تری دارد."],
    ["C2","gleichwohl vs dennoch","هر دو تضاد رسمی؛ gleichwohl اغلب ادبی/رسمی‌تر.","Gleichwohl bleibt … / Dennoch gilt …","Register و ریتم متن فرق دارد."],
    ["C2","pauschal vs generalisierend","pauschal معمولاً نقدِ بیش‌ازحد کلی؛ generalisierend توصیفِ تعمیم.","eine pauschale Aussage / eine generalisierende Tendenz","pauschal اغلب ارزشی‌تر است."],
    ["C2","präzise vs differenziert","präzise دقیق؛ differenziert چندوجهی و دارای تمایز.","präzise Definition / differenzierte Analyse","دقت و چندجانبه‌نگری جدا هستند."],
    ["C2","einräumen vs zugestehen","هر دو پذیرفتن؛ zugestehen می‌تواند امتیاز/حق هم باشد.","Man muss einräumen, dass … / Ich gestehe ihm zu, dass …","کاربردهای حقوقی/بین‌فردی zugestehen بیشتر است."],
    ["C2","vorbehaltlich vs sofern","vorbehaltlich ساخت رسمی اسمی؛ sofern جمله شرطی.","Vorbehaltlich der Prüfung … / Sofern die Prüfung positiv ausfällt …","یکی Nominalstil، یکی Nebensatz."]
  ].map((x,i)=>({id:"contrast-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],explanation:x[2],example:x[3],trap:x[4]}));

  const reading=[
    ["A1","Im Supermarkt","Der Supermarkt schließt heute um 20 Uhr. Brot und Milch finden Sie im Erdgeschoss. Die Kasse ist neben dem Eingang.",["فروشگاه چه ساعتی می‌بندد؟","شیر و نان کجاست؟"]],
    ["A1","Kursplan","Der Deutschkurs ist montags und mittwochs von 17:00 bis 18:30 Uhr. Am Freitag gibt es keinen Unterricht.",["کلاس چه روزهایی است؟","جمعه کلاس هست؟"]],
    ["A1","Hotelinfo","Das Frühstück ist von 7 bis 10 Uhr. WLAN ist kostenlos. Bitte geben Sie den Schlüssel beim Auschecken ab.",["صبحانه چه ساعتی است؟","برای WLAN باید پول داد؟"]],
    ["A2","Paketbenachrichtigung","Wir konnten Ihr Paket heute nicht zustellen. Sie können es ab morgen in der Filiale am Markt abholen. Bitte bringen Sie einen Ausweis mit.",["بسته چه شد؟","برای تحویل چه چیزی لازم است؟"]],
    ["A2","Wohnungsanzeige","Zwei-Zimmer-Wohnung, 58 Quadratmeter, warm 920 Euro. Die Wohnung liegt im dritten Stock und ist ab November frei. Haustiere nach Absprache.",["اجاره گرم چقدر است؟","خانه از چه زمانی آزاد است؟"]],
    ["A2","Arztinformation","Bitte kommen Sie zehn Minuten vor Ihrem Termin. Für die Blutuntersuchung müssen Sie nüchtern sein. Medikamente nehmen Sie nur nach Rücksprache ein.",["چقدر زودتر باید رسید؟","برای آزمایش خون چه شرطی هست؟"]],
    ["B1","Kündigung Mobilfunk","Wenn Sie Ihren Vertrag kündigen möchten, muss die Kündigung spätestens vier Wochen vor Vertragsende bei uns eingehen. Nach Eingang erhalten Sie eine schriftliche Bestätigung.",["مهلت فسخ چیست؟","بعد از دریافت فسخ چه اتفاقی می‌افتد؟"]],
    ["B1","Weiterbildung","Der Kurs richtet sich an Berufstätige und findet zweimal pro Woche abends statt. Voraussetzung sind Deutschkenntnisse auf B1-Niveau. Nach erfolgreicher Prüfung erhalten die Teilnehmenden ein Zertifikat.",["دوره برای چه کسانی است؟","پیش‌شرط زبانی چیست؟"]],
    ["B1","Hausordnung","Zwischen 22 und 7 Uhr gilt Nachtruhe. Fahrräder dürfen nicht im Treppenhaus abgestellt werden. Schäden im Gebäude sind der Hausverwaltung unverzüglich zu melden.",["زمان سکوت چیست؟","خرابی ساختمان به چه کسی گزارش می‌شود؟"]],
    ["B2","Homeoffice-Regelung","Die neue Regelung erlaubt zwei Homeoffice-Tage pro Woche. Teams müssen jedoch sicherstellen, dass an jedem Arbeitstag mindestens die Hälfte der Mitarbeitenden im Büro erreichbar ist. Ausnahmen sind mit der Führungskraft abzustimmen.",["قانون اصلی چیست؟","چه محدودیتی وجود دارد؟"]],
    ["B2","Versicherungsschreiben","Die eingereichten Unterlagen reichen für eine abschließende Prüfung des Schadens noch nicht aus. Bitte senden Sie uns zusätzlich die Rechnung sowie Fotos des beschädigten Gegenstands bis zum 15. Oktober.",["چرا پرونده کامل نیست؟","چه مدارکی باید اضافه شود؟"]],
    ["B2","Universitätsmail","Aufgrund der hohen Teilnehmerzahl wird das Seminar in einen größeren Raum verlegt. Inhalt und Uhrzeit bleiben unverändert. Die aktualisierte Raumangabe finden Sie im Campusportal.",["چه چیزی تغییر کرده؟","چه چیزهایی ثابت مانده؟"]],
    ["C1","Forschung und Kausalität","Dass zwei Entwicklungen zeitgleich auftreten, reicht nicht aus, um einen kausalen Zusammenhang anzunehmen. Eine belastbare Erklärung muss alternative Ursachen berücksichtigen und zeigen, durch welchen Mechanismus die beobachtete Wirkung zustande kommt.",["شرط کافی برای علیت چیست؟","چه چیزی باید علاوه بر همزمانی بررسی شود؟"]],
    ["C1","Stadtentwicklung","Verdichtung kann Wohnraum schaffen und Wege verkürzen, erhöht jedoch zugleich den Druck auf Grünflächen und soziale Infrastruktur. Eine nachhaltige Planung muss daher nicht nur die Zahl neuer Wohnungen, sondern auch die Qualität des öffentlichen Raums berücksichtigen.",["دو اثر مثبت/منفی چیست؟","برنامه‌ریزی پایدار چه چیز دیگری را باید بسنجد؟"]],
    ["C1","Arbeitsmarkt","Automatisierung verändert Tätigkeitsprofile meist schrittweise statt ganze Berufe sofort zu ersetzen. Entscheidend ist deshalb, welche Aufgaben automatisierbar sind und wie schnell Beschäftigte neue Kompetenzen erwerben können.",["ادعای اصلی چیست؟","چه دو عامل تعیین‌کننده‌اند؟"]],
    ["C2","Expertise und Unsicherheit","Fachliche Expertise ist besonders dort wertvoll, wo Unsicherheit groß ist. Gerade dann besteht jedoch die Gefahr, vorläufige Einschätzungen als gesichertes Wissen zu behandeln. Gute Expertenkommunikation macht deshalb nicht nur Ergebnisse, sondern auch deren Unsicherheitsgrad sichtbar.",["تناقض اصلی چیست؟","ارتباط خوب متخصص چه چیزی را باید نشان دهد؟"]],
    ["C2","Institutionen und Regeln","Regeln entfalten ihre Wirkung nicht unabhängig von den Institutionen, in denen sie angewendet werden. Identische Vorgaben können daher in verschiedenen Organisationen unterschiedliche Ergebnisse erzeugen, wenn Anreizstrukturen, Ressourcen oder informelle Normen voneinander abweichen.",["چرا قانون یکسان نتیجه یکسان نمی‌دهد؟","چه عوامل نهادی نام برده شده‌اند؟"]],
    ["C2","Sprache und Macht","Sprachliche Höflichkeit ist nicht bloß eine Frage freundlicher Formulierungen. Sie steuert auch, wie direkt Ansprüche formuliert werden dürfen, ohne soziale Beziehungen unnötig zu belasten. Was als angemessen gilt, hängt deshalb stark von Rolle, Kontext und Machtverhältnis ab.",["هسته استدلال چیست؟","مناسب بودن لحن به چه عواملی بستگی دارد؟"]]
  ].map((x,i)=>({id:"deep-read-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],text:x[2],questions:x[3]}));

  const listening=[
    ["A1","Ansage im Bus","Nächste Haltestelle: Rathaus. Bitte steigen Sie für die Linie 5 hier um.",["Haltestelle","umsteigen"]],
    ["A1","Café","Guten Tag. Heute haben wir Apfelkuchen und Käsekuchen. Kaffee kostet drei Euro.",["Angebot","Preis"]],
    ["A1","Termin","Ihr Termin ist morgen um neun Uhr. Bitte seien Sie zehn Minuten früher da.",["Tag","Uhrzeit"]],
    ["A2","Wohnungsbesichtigung","Die Besichtigung ist am Samstag um 14 Uhr. Bitte klingeln Sie bei Müller im zweiten Stock.",["Tag","Uhrzeit","Ort"]],
    ["A2","Apotheke","Nehmen Sie morgens und abends jeweils eine Tablette nach dem Essen. Wenn die Beschwerden stärker werden, gehen Sie bitte zum Arzt.",["Dosierung","Bedingung"]],
    ["A2","Lieferung","Ihre Bestellung kommt voraussichtlich am Dienstag. Falls niemand zu Hause ist, wird das Paket in eine Filiale gebracht.",["Lieferdatum","Alternative"]],
    ["B1","Krankmeldung","Guten Morgen. Ich bin heute leider krank und kann nicht zur Arbeit kommen. Die ärztliche Bescheinigung schicke ich Ihnen am Nachmittag per E-Mail.",["Grund","Dokument","Zeit"]],
    ["B1","Behörde","Ihr Antrag ist eingegangen. Für die weitere Bearbeitung fehlt uns noch eine Kopie Ihres Passes. Sie können das Dokument online oder per Post nachreichen.",["Status","fehlendes Dokument","Optionen"]],
    ["B1","Kursberatung","Der Intensivkurs dauert acht Wochen und umfasst zwanzig Unterrichtsstunden pro Woche. Wenn Sie berufstätig sind, wäre unser Abendkurs wahrscheinlich geeigneter.",["Dauer","Umfang","Empfehlung"]],
    ["B2","Projektstatus","Der technische Teil ist abgeschlossen. Offen sind noch die Sicherheitstests und die Dokumentation. Wenn beide Punkte bis Mittwoch fertig sind, bleibt der geplante Starttermin realistisch.",["fertig","offen","Bedingung"]],
    ["B2","Vortrag","Zunächst werde ich die Ausgangslage darstellen. Anschließend vergleiche ich zwei Lösungsansätze, bevor ich am Ende eine Empfehlung formuliere.",["Struktur","Reihenfolge"]],
    ["B2","Beschwerde","Ich verstehe, dass es zu Verzögerungen kommen kann. Allerdings wurde mir bereits zweimal ein Liefertermin zugesagt. Ich erwarte deshalb jetzt eine verbindliche Auskunft.",["Haltung","Problem","Forderung"]],
    ["C1","Seminar","Die Studie zeigt zwar einen statistisch signifikanten Effekt, allerdings ist die Stichprobe relativ klein. Die Ergebnisse sollten deshalb nicht ohne Weiteres auf andere Populationen übertragen werden.",["Befund","Einschränkung","Folgerung"]],
    ["C1","Vorlesung","Ein Modell ist keine vollständige Abbildung der Realität, sondern eine gezielte Vereinfachung. Seine Qualität hängt deshalb nicht davon ab, ob es jedes Detail enthält, sondern ob es für die jeweilige Fragestellung die relevanten Zusammenhänge erfasst.",["Definition","Qualitätskriterium"]],
    ["C1","Meeting","Wir sollten die Entscheidung nicht ausschließlich anhand der Kosten treffen. Zusätzlich müssen wir die Umsetzungsrisiken und die langfristigen Auswirkungen auf den Betrieb berücksichtigen.",["Kritik","weitere Kriterien"]],
    ["C2","Podiumsdiskussion","Ich halte den Einwand für berechtigt, würde daraus aber nicht schließen, dass die gesamte Strategie verworfen werden muss. Plausibler wäre es, die betroffenen Annahmen gezielt zu überprüfen und den Ansatz entsprechend anzupassen.",["Zugeständnis","Abgrenzung","Alternative"]],
    ["C2","Fachvortrag","Die beobachtete Stabilität des Effekts ist bemerkenswert, sollte aber nicht mit Allgemeingültigkeit verwechselt werden. Robustheit gegenüber bestimmten Modellvarianten sagt noch nichts darüber aus, ob die Ergebnisse in völlig anderen institutionellen Kontexten Bestand haben.",["Warnung","Unterscheidung"]],
    ["C2","Verhandlung","Vorbehaltlich einer klareren Regelung zur Haftung könnten wir dem Entwurf grundsätzlich zustimmen. Offen bleibt allerdings die Frage, wie mit nachträglichen Änderungen des Leistungsumfangs verfahren wird.",["Bedingung","offene Frage"]]
  ].map((x,i)=>({id:"deep-listen-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],script:x[2],focus:x[3]}));

  const exams=[
    ["Goethe","A1","Sprechen","Sich vorstellen","نام، محل زندگی، زبان و یک سرگرمی را در 45 ثانیه معرفی کن.",45],
    ["Goethe","A2","Schreiben","Kurze E-Mail","برای لغو یک قرار، دلیل و پیشنهاد زمان جدید بنویس.",15],
    ["Goethe","B1","Sprechen","Gemeinsam planen","با شریک فرضی برای یک برنامه آخرهفته تصمیم بگیر: زمان، مکان، هزینه.",5],
    ["Goethe","B2","Schreiben","Meinungsbeitrag","درباره مزایا و معایب Homeoffice یک متن ساختاریافته بنویس.",30],
    ["Goethe","C1","Sprechen","Präsentation","درباره نقش Weiterbildung در بازار کار ارائه و سپس جمع‌بندی کن.",8],
    ["Goethe","C2","Schreiben","Stilistische Analyse","یک متن پیچیده را از نظر استدلال، Register و ضمنیات تحلیل کن.",45],

    ["telc","A1","Sprechen","Kontaktaufnahme","در یک موقعیت روزمره سؤال بپرس و پاسخ کوتاه بده.",3],
    ["telc","A2","Schreiben","Nachricht","برای یک همکلاسی درباره تغییر کلاس پیام بنویس.",15],
    ["telc","B1","Sprechen","Problemlösung","برای یک مشکل مشترک دو راه‌حل پیشنهاد و یکی را انتخاب کن.",6],
    ["telc","B2","Schreiben","Formelle Beschwerde","شکایت رسمی درباره یک خدمات نامطلوب بنویس.",30],
    ["telc","C1","Sprechen","Diskussion","یک موضع را با دلیل، مثال و پاسخ به مخالفت دفاع کن.",10],
    ["telc","C2","Lesen","Implizite Bedeutung","لحن، موضع و معنای ضمنی یک متن پیچیده را استخراج کن.",25],

    ["TestDaF","B2","Schreiben","Grafikbeschreibung","روند یک نمودار فرضی را بدون تفسیر اضافی توصیف کن.",20],
    ["TestDaF","B2","Sprechen","Hochschulsituation","برای یک مشکل دانشگاهی تلفنی درخواست راه‌حل کن.",3],
    ["TestDaF","C1","Schreiben","Stellungnahme","یک مسئله دانشگاهی را با دو دیدگاه و موضع نهایی بررسی کن.",30],
    ["TestDaF","C1","Sprechen","Argumentation","در 2 دقیقه موضع خود را با مثال و جمع‌بندی بیان کن.",2],
    ["TestDaF","C1","Hören","Vorlesung","یادداشت بردار و سه نکته اصلی یک سخنرانی را بازگو کن.",8],
    ["TestDaF","C1","Lesen","Wissenschaftlicher Text","ساختار استدلال، شواهد و محدودیت‌ها را مشخص کن.",25],

    ["ÖSD","A2","Sprechen","Alltag","برای یک قرار روزمره زمان و مکان توافق کن.",4],
    ["ÖSD","B1","Schreiben","E-Mail","درباره یک مشکل و درخواست کمک ایمیل رسمی بنویس.",25],
    ["ÖSD","B2","Sprechen","Diskussion","درباره استفاده از شبکه‌های اجتماعی موافق/مخالف بحث کن.",8],
    ["ÖSD","C1","Schreiben","Argumentativer Text","دو موضع را مقایسه و موضع خود را دقیق نتیجه‌گیری کن.",40],
    ["ÖSD","C1","Hören","Interview","نکته اصلی، مثال و موضع مصاحبه‌شونده را استخراج کن.",12],
    ["ÖSD","C2","Sprechen","Nuancierte Position","یک موضوع پیچیده را بدون حکم مطلق و با محدودیت‌ها ارائه کن.",10]
  ].map((x,i)=>({id:"exam-"+String(i+1).padStart(2,"0"),exam:x[0],level:x[1],skill:x[2],title:x[3],task:x[4],minutes:x[5]}));

  const writing=[];
  const speaking=[];
  const wPrompts={
    A1:["یک یادداشت 4 جمله‌ای درباره برنامه فردا بنویس.","برای یک دوست پیام کوتاه دعوت بنویس.","یک فرم ساده را با اطلاعات فرضی در جمله توضیح بده."],
    A2:["برای صاحبخانه درباره یک مشکل خانه پیام بنویس.","درباره آخرهفته گذشته 80 واژه بنویس.","یک ایمیل کوتاه برای درخواست اطلاعات دوره بنویس."],
    B1:["یک متن نظر 120 واژه‌ای درباره حمل‌ونقل عمومی بنویس.","برای پیگیری یک درخواست اداری ایمیل رسمی بنویس.","یک تجربه حل مشکل در محل کار را ساختاریافته بنویس."],
    B2:["یک گزارش 180 واژه‌ای از یک جلسه فرضی بنویس.","یک شکایت رسمی با راه‌حل پیشنهادی بنویس.","یک متن مقایسه‌ای درباره آموزش حضوری و آنلاین بنویس."],
    C1:["یک Zusammenfassung علمی 220 واژه‌ای بنویس.","یک Stellungnahme با Einwand و پاسخ بنویس.","یک گزارش حرفه‌ای با توصیه نهایی تهیه کن."],
    C2:["یک نقد آکادمیک چندلایه با Hedging بنویس.","دو متن فرضی را در یک Synthese مقایسه کن.","یک متن رسمی را با حفظ معنا به سبک روشن‌تر بازنویسی کن."]
  };
  const sPrompts={
    A1:["در 30 ثانیه برنامه روزانه‌ات را بگو.","در فروشگاه درباره سایز و قیمت سؤال کن.","در هتل یک نیاز ساده را توضیح بده."],
    A2:["برای تغییر یک وقت تلفنی صحبت کن.","درباره یک مشکل اینترنت با پشتیبانی حرف بزن.","برای سفر مسیر و زمان مناسب را مقایسه کن."],
    B1:["در مصاحبه شغلی یک نقطه قوت را با مثال توضیح بده.","درباره خرابی خانه با صاحبخانه مذاکره کن.","یک نظر را با دلیل و مثال بیان کن."],
    B2:["در جلسه پروژه درباره تأخیر و راه‌حل صحبت کن.","یک شکایت پیچیده را مؤدبانه پیگیری کن.","یک ارائه 3 دقیقه‌ای درباره یک موضوع کاری بده."],
    C1:["یک پژوهش را با محدودیت‌ها ارائه کن.","در سمینار به یک نظر مخالف پاسخ بده.","یک تصمیم را با معیارهای متعدد دفاع کن."],
    C2:["یک ادعای مطلق را در لحظه تعدیل و دقیق کن.","یک مذاکره پیچیده با شرط انجام بده.","یک بحث تخصصی را مدیریت و جمع‌بندی کن."]
  };
  Object.entries(wPrompts).forEach(([level,arr])=>arr.forEach((prompt,i)=>writing.push({id:"deep-write-"+level.toLowerCase()+"-"+(i+1),level,prompt})));
  Object.entries(sPrompts).forEach(([level,arr])=>arr.forEach((prompt,i)=>speaking.push({id:"deep-speak-"+level.toLowerCase()+"-"+(i+1),level,prompt})));

  return{version:1,contrasts,reading,listening,exams,writing,speaking};
});