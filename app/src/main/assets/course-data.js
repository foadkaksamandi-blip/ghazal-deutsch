(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.GhazalData = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const levels = [
    { id: "A1", fa: "شروع", color: "#42A57A", description: "جمله‌های ضروری و زندگی روزمره" },
    { id: "A2", fa: "پایه", color: "#2A91C9", description: "استقلال در موقعیت‌های آشنا" },
    { id: "B1", fa: "میانی", color: "#5B6FDC", description: "مدیریت زندگی و گفت‌وگوی پیوسته" },
    { id: "B2", fa: "میانیِ رو به بالا", color: "#7652D6", description: "کار، دانشگاه و ارتباط دقیق" },
    { id: "C1", fa: "پیشرفته", color: "#B54EA2", description: "بیان روان، تخصصی و دانشگاهی" },
    { id: "C2", fa: "تسلط", color: "#D26A45", description: "درک ظرافت‌ها و بیان نزدیک به بومی" }
  ];

  const lessons = [
    {
      id: "a1-01", level: "A1", title: "معرفی خود", de: "Sich vorstellen", minutes: 12,
      goal: "نام، کشور و زبان خودت را ساده معرفی کنی.",
      words: [["heißen", "نام داشتن", "Ich heiße Ghazal."], ["kommen", "آمدن", "Ich komme aus Iran."], ["wohnen", "ساکن بودن", "Ich wohne in Berlin."], ["sprechen", "صحبت کردن", "Ich spreche Persisch."], ["lernen", "یاد گرفتن", "Ich lerne Deutsch."]],
      pattern: { de: "Ich heiße … / Ich komme aus …", fa: "من … نام دارم / من از … می‌آیم." },
      dialogue: [["Guten Tag! Wie heißen Sie?", "روز بخیر! نام شما چیست؟"], ["Ich heiße Ghazal. Und Sie?", "من غزل هستم. شما چطور؟"], ["Ich heiße Anna. Woher kommen Sie?", "من آنا هستم. اهل کجا هستید؟"], ["Ich komme aus Iran.", "من اهل ایران هستم."]],
      quiz: { q: "کدام جمله یعنی «من غزل نام دارم»؟", options: ["Ich heiße Ghazal.", "Ich wohne Ghazal.", "Ich komme Ghazal."], answer: 0, explain: "heißen برای گفتن نام استفاده می‌شود." }
    },
    {
      id: "a1-02", level: "A1", title: "عدد، ساعت و قرار", de: "Zahlen und Uhrzeit", minutes: 14,
      goal: "ساعت و زمان یک قرار را بفهمی و بیان کنی.",
      words: [["die Uhr", "ساعت", "Es ist drei Uhr."], ["heute", "امروز", "Heute habe ich Zeit."], ["morgen", "فردا", "Bis morgen!"], ["der Termin", "قرار", "Ich habe einen Termin."], ["pünktlich", "سر وقت", "Bitte seien Sie pünktlich."]],
      pattern: { de: "Der Termin ist um … Uhr.", fa: "قرار ساعت … است." },
      dialogue: [["Wann ist der Termin?", "قرار چه زمانی است؟"], ["Morgen um zehn Uhr.", "فردا ساعت ده."], ["Gut, ich bin pünktlich.", "خوب است، سر وقت می‌رسم."]],
      quiz: { q: "Der Termin ist um zehn Uhr یعنی چه؟", options: ["قرار ساعت ده است.", "قرار ده روز دیگر است.", "قرار لغو شده است."], answer: 0, explain: "um + ساعت، زمان دقیق را نشان می‌دهد." }
    },
    {
      id: "a1-03", level: "A1", title: "خرید روزانه", de: "Einkaufen", minutes: 15,
      goal: "قیمت بپرسی و خرید ساده انجام بدهی.",
      words: [["kosten", "قیمت داشتن", "Wie viel kostet das?"], ["brauchen", "نیاز داشتن", "Ich brauche Brot."], ["bezahlen", "پرداخت کردن", "Ich möchte bezahlen."], ["bar", "نقدی", "Zahlen Sie bar?"], ["die Karte", "کارت", "Mit Karte, bitte."]],
      pattern: { de: "Ich hätte gern …", fa: "من … می‌خواهم؛ حالت مؤدبانه." },
      dialogue: [["Guten Tag. Ich hätte gern ein Brot.", "سلام. یک نان می‌خواهم."], ["Gern. Sonst noch etwas?", "حتماً. چیز دیگری؟"], ["Nein, danke. Mit Karte, bitte.", "نه ممنون. با کارت لطفاً."]],
      quiz: { q: "برای درخواست مؤدبانه کدام درست است؟", options: ["Ich hätte gern Kaffee.", "Ich bin Kaffee.", "Ich komme Kaffee."], answer: 0, explain: "Ich hätte gern ساختار رایج و مؤدبانه برای درخواست است." }
    },
    {
      id: "a1-04", level: "A1", title: "مسیر و حمل‌ونقل", de: "Weg und Verkehr", minutes: 15,
      goal: "آدرس بپرسی و مسیر ساده را دنبال کنی.",
      words: [["links", "چپ", "Gehen Sie links."], ["rechts", "راست", "Dann rechts."], ["geradeaus", "مستقیم", "Immer geradeaus."], ["die Haltestelle", "ایستگاه", "Wo ist die Haltestelle?"], ["umsteigen", "خط عوض کردن", "Sie müssen umsteigen."]],
      pattern: { de: "Wie komme ich zu …?", fa: "چطور به … برسم؟" },
      dialogue: [["Entschuldigung, wo ist der Bahnhof?", "ببخشید، ایستگاه قطار کجاست؟"], ["Geradeaus und dann links.", "مستقیم و بعد چپ."], ["Vielen Dank!", "خیلی ممنون!"]],
      quiz: { q: "geradeaus به چه معناست؟", options: ["مستقیم", "راست", "عقب"], answer: 0, explain: "geradeaus یعنی مستقیم به جلو." }
    },
    {
      id: "a2-01", level: "A2", title: "خانه و اجاره", de: "Wohnung und Miete", minutes: 18,
      goal: "درباره اجاره، هزینه جانبی و بازدید خانه سؤال کنی.",
      words: [["die Miete", "اجاره", "Wie hoch ist die Miete?"], ["die Nebenkosten", "هزینه‌های جانبی", "Sind die Nebenkosten inklusive?"], ["die Kaution", "ودیعه", "Die Kaution beträgt zwei Monatsmieten."], ["besichtigen", "بازدید کردن", "Kann ich die Wohnung besichtigen?"], ["möbliert", "مبله", "Die Wohnung ist möbliert."]],
      pattern: { de: "Ist … in der Miete enthalten?", fa: "آیا … در اجاره حساب شده است؟" },
      dialogue: [["Ist die Wohnung noch frei?", "آیا خانه هنوز خالی است؟"], ["Ja. Möchten Sie sie besichtigen?", "بله. می‌خواهید بازدید کنید؟"], ["Ja, gern. Wie hoch ist die Kaution?", "بله. مبلغ ودیعه چقدر است؟"]],
      quiz: { q: "Nebenkosten چیست؟", options: ["هزینه‌های جانبی خانه", "قرارداد کار", "بلیط قطار"], answer: 0, explain: "هزینه‌هایی مثل گرمایش یا خدمات ساختمان را Nebenkosten می‌گویند." }
    },
    {
      id: "a2-02", level: "A2", title: "پزشک و داروخانه", de: "Arzt und Apotheke", minutes: 18,
      goal: "علائم ساده را توضیح بدهی و وقت پزشک بگیری.",
      words: [["die Schmerzen", "درد", "Ich habe starke Schmerzen."], ["der Termin", "وقت", "Ich brauche einen Termin."], ["die Versicherungskarte", "کارت بیمه", "Bringen Sie Ihre Versicherungskarte mit."], ["das Rezept", "نسخه", "Der Arzt gibt mir ein Rezept."], ["die Apotheke", "داروخانه", "Wo ist die nächste Apotheke?"]],
      pattern: { de: "Seit wann haben Sie …?", fa: "از چه زمانی … دارید؟" },
      dialogue: [["Was fehlt Ihnen?", "چه مشکلی دارید؟"], ["Ich habe seit gestern Halsschmerzen.", "از دیروز گلودرد دارم."], ["Haben Sie auch Fieber?", "تب هم دارید؟"], ["Nein, kein Fieber.", "نه، تب ندارم."]],
      quiz: { q: "برای گفتن «از دیروز» کدام درست است؟", options: ["seit gestern", "für gestern", "an gestern"], answer: 0, explain: "seit زمان شروع یک وضعیت ادامه‌دار را نشان می‌دهد." }
    },
    {
      id: "a2-03", level: "A2", title: "کار و برنامه روزانه", de: "Arbeit und Alltag", minutes: 18,
      goal: "وظایف، شیفت و برنامه کاری را توضیح بدهی.",
      words: [["die Schicht", "شیفت", "Meine Schicht beginnt um acht."], ["erledigen", "انجام دادن", "Ich muss die Aufgabe erledigen."], ["zuständig", "مسئول", "Wer ist dafür zuständig?"], ["die Pause", "استراحت", "Wann ist die Pause?"], ["Bescheid geben", "خبر دادن", "Bitte geben Sie mir Bescheid."]],
      pattern: { de: "Ich muss …, bevor ich …", fa: "باید …، پیش از آنکه …" },
      dialogue: [["Kannst du morgen früher kommen?", "می‌توانی فردا زودتر بیایی؟"], ["Ja, aber ich muss um vier gehen.", "بله، ولی باید ساعت چهار بروم."], ["In Ordnung. Gib mir bitte Bescheid.", "باشه. لطفاً خبرم کن."]],
      quiz: { q: "Bescheid geben یعنی چه؟", options: ["خبر دادن", "مرخصی گرفتن", "پرداخت کردن"], answer: 0, explain: "ترکیب رایج برای اطلاع‌دادن است." }
    },
    {
      id: "a2-04", level: "A2", title: "اداره و فرم", de: "Behörde und Formular", minutes: 20,
      goal: "فرم ساده پر کنی و درباره مدارک لازم بپرسی.",
      words: [["das Formular", "فرم", "Füllen Sie das Formular aus."], ["die Unterlagen", "مدارک", "Welche Unterlagen brauche ich?"], ["unterschreiben", "امضا کردن", "Bitte hier unterschreiben."], ["gültig", "معتبر", "Der Pass ist noch gültig."], ["fehlen", "کم بودن/نبودن", "Ein Dokument fehlt."]],
      pattern: { de: "Welche Unterlagen muss ich mitbringen?", fa: "چه مدارکی باید همراه بیاورم؟" },
      dialogue: [["Ich möchte mich anmelden.", "می‌خواهم ثبت آدرس کنم."], ["Haben Sie Ihren Pass und die Wohnungsgeberbestätigung?", "گذرنامه و تأییدیه صاحبخانه را دارید؟"], ["Ja, hier sind die Unterlagen.", "بله، مدارک اینجاست."]],
      quiz: { q: "ausfüllen در ارتباط با فرم یعنی چه؟", options: ["پر کردن", "گم کردن", "کپی گرفتن"], answer: 0, explain: "ein Formular ausfüllen یعنی فرم را پر کردن." }
    },
    {
      id: "b1-01", level: "B1", title: "مصاحبه شغلی", de: "Vorstellungsgespräch", minutes: 22,
      goal: "سابقه و توانایی خودت را منظم توضیح بدهی.",
      words: [["die Erfahrung", "تجربه", "Ich habe drei Jahre Erfahrung."], ["zuverlässig", "قابل اعتماد", "Ich bin zuverlässig."], ["die Stärke", "نقطه قوت", "Meine Stärke ist Organisation."], ["sich bewerben", "درخواست کار دادن", "Ich bewerbe mich um die Stelle."], ["verfügbar", "در دسترس", "Ab Mai bin ich verfügbar."]],
      pattern: { de: "Ich habe Erfahrung mit …", fa: "در زمینه … تجربه دارم." },
      dialogue: [["Warum möchten Sie bei uns arbeiten?", "چرا می‌خواهید با ما کار کنید؟"], ["Weil die Stelle gut zu meiner Erfahrung passt.", "چون این شغل با تجربه من هماهنگ است."], ["Wann könnten Sie anfangen?", "چه زمانی می‌توانید شروع کنید؟"], ["Ab dem ersten Mai.", "از اول ماه مه."]],
      quiz: { q: "sich um eine Stelle bewerben یعنی چه؟", options: ["برای یک شغل درخواست دادن", "از کار استعفا دادن", "حقوق گرفتن"], answer: 0, explain: "فعل بازتابی sich bewerben با um برای موقعیت شغلی می‌آید." }
    },
    {
      id: "b1-02", level: "B1", title: "ایمیل رسمی", de: "Formelle E-Mail", minutes: 22,
      goal: "یک درخواست رسمی کوتاه و محترمانه بنویسی.",
      words: [["bezüglich", "در مورد", "Bezüglich meines Termins …"], ["hiermit", "بدین‌وسیله", "Hiermit bestätige ich …"], ["verschieben", "جابه‌جا کردن", "Könnten wir den Termin verschieben?"], ["die Rückmeldung", "پاسخ", "Vielen Dank für Ihre Rückmeldung."], ["Mit freundlichen Grüßen", "با احترام", "Mit freundlichen Grüßen, Ghazal"]],
      pattern: { de: "Ich möchte Sie bitten, …", fa: "می‌خواهم از شما درخواست کنم که …" },
      dialogue: [["Sehr geehrte Frau Weber,", "خانم وبر گرامی،"], ["ich möchte Sie bitten, den Termin zu verschieben.", "می‌خواهم درخواست کنم وقت را جابه‌جا کنید."], ["Vielen Dank für Ihre Rückmeldung.", "از پاسخ شما سپاسگزارم."], ["Mit freundlichen Grüßen", "با احترام"]],
      quiz: { q: "پایان مناسب ایمیل رسمی کدام است؟", options: ["Mit freundlichen Grüßen", "Tschüssi", "Bis dann, Alter"], answer: 0, explain: "Mit freundlichen Grüßen پایان استاندارد ایمیل رسمی است." }
    },
    {
      id: "b1-03", level: "B1", title: "بیان نظر و دلیل", de: "Meinung begründen", minutes: 22,
      goal: "نظر خودت را با دلیل، مثال و نتیجه بیان کنی.",
      words: [["meiner Meinung nach", "به نظر من", "Meiner Meinung nach ist das sinnvoll."], ["einerseits", "از یک طرف", "Einerseits spart es Zeit."], ["andererseits", "از طرف دیگر", "Andererseits kostet es Geld."], ["deshalb", "بنابراین", "Deshalb stimme ich zu."], ["das Beispiel", "مثال", "Ein gutes Beispiel dafür ist …"]],
      pattern: { de: "Ich bin dafür/dagegen, weil …", fa: "موافق/مخالفم، چون …" },
      dialogue: [["Sollten Geschäfte sonntags öffnen?", "آیا فروشگاه‌ها یکشنبه باز باشند؟"], ["Ich bin dagegen, weil alle Erholung brauchen.", "مخالفم چون همه به استراحت نیاز دارند."], ["Andererseits wäre es für Berufstätige praktisch.", "از طرف دیگر برای شاغلان کاربردی است."]],
      quiz: { q: "بعد از weil جای فعل کجاست؟", options: ["پایان جمله وابسته", "ابتدای جمله", "همیشه جای دوم"], answer: 0, explain: "در جمله وابسته با weil، فعل صرف‌شده معمولاً در پایان می‌آید." }
    },
    {
      id: "b1-04", level: "B1", title: "حل مشکل روزمره", de: "Probleme lösen", minutes: 22,
      goal: "خرابی، تأخیر یا اشتباه را توضیح بدهی و راه‌حل بخواهی.",
      words: [["defekt", "خراب", "Die Heizung ist defekt."], ["sich beschweren", "شکایت کردن", "Ich möchte mich beschweren."], ["beheben", "رفع کردن", "Wann wird der Fehler behoben?"], ["die Frist", "مهلت", "Die Frist endet morgen."], ["dringend", "فوری", "Das Problem ist dringend."]],
      pattern: { de: "Könnten Sie bitte dafür sorgen, dass …?", fa: "ممکن است لطفاً رسیدگی کنید که …؟" },
      dialogue: [["Die Heizung funktioniert seit zwei Tagen nicht.", "گرمایش دو روز است کار نمی‌کند."], ["Wir schicken morgen einen Techniker.", "فردا تعمیرکار می‌فرستیم."], ["Bitte möglichst früh. Es ist dringend.", "لطفاً تا حد ممکن زود؛ فوری است."]],
      quiz: { q: "beheben بیشتر برای چه استفاده می‌شود؟", options: ["رفع‌کردن مشکل", "رزروکردن وقت", "توضیح‌دادن مسیر"], answer: 0, explain: "einen Fehler / ein Problem beheben یعنی خطا یا مشکل را رفع کردن." }
    },
    {
      id: "b2-01", level: "B2", title: "ارتباط حرفه‌ای", de: "Professionell kommunizieren", minutes: 25,
      goal: "در جلسه روشن، مؤدب و نتیجه‌محور صحبت کنی.",
      words: [["die Rückfrage", "پرسش تکمیلی", "Ich habe dazu eine Rückfrage."], ["nachvollziehbar", "قابل درک", "Die Entscheidung ist nachvollziehbar."], ["berücksichtigen", "در نظر گرفتن", "Wir müssen das Budget berücksichtigen."], ["vereinbaren", "توافق کردن", "Wir vereinbaren einen Termin."], ["zusammenfassen", "جمع‌بندی کردن", "Ich fasse die Punkte kurz zusammen."]],
      pattern: { de: "Wenn ich Sie richtig verstanden habe, …", fa: "اگر درست متوجه شده باشم، …" },
      dialogue: [["Wenn ich Sie richtig verstanden habe, verschiebt sich die Frist.", "اگر درست فهمیده باشم، مهلت عقب می‌افتد."], ["Genau. Wir brauchen zwei weitere Tage.", "دقیقاً. دو روز دیگر نیاز داریم."], ["Dann halten wir Freitag als neuen Termin fest.", "پس جمعه را زمان جدید ثبت می‌کنیم."]],
      quiz: { q: "berücksichtigen نزدیک‌ترین معنی کدام است؟", options: ["در نظر گرفتن", "نادیده گرفتن", "لغو کردن"], answer: 0, explain: "etwas berücksichtigen یعنی عاملی را در تصمیم لحاظ کردن." }
    },
    {
      id: "b2-02", level: "B2", title: "دانشگاه و ارائه", de: "Studium und Präsentation", minutes: 25,
      goal: "ساختار ارائه و استدلال دانشگاهی را مدیریت کنی.",
      words: [["die These", "گزاره اصلی", "Meine These lautet …"], ["die Quelle", "منبع", "Die Quelle ist zuverlässig."], ["hervorheben", "برجسته کردن", "Ich möchte hervorheben, dass …"], ["die Schlussfolgerung", "نتیجه‌گیری", "Daraus ergibt sich die Schlussfolgerung …"], ["belegen", "با مدرک اثبات کردن", "Die Daten belegen den Trend."]],
      pattern: { de: "Daraus lässt sich schließen, dass …", fa: "از این می‌توان نتیجه گرفت که …" },
      dialogue: [["Zunächst erläutere ich die Fragestellung.", "ابتدا مسئله را توضیح می‌دهم."], ["Anschließend stelle ich die Ergebnisse vor.", "سپس نتایج را ارائه می‌کنم."], ["Zum Schluss beantworte ich Ihre Fragen.", "در پایان به پرسش‌ها پاسخ می‌دهم."]],
      quiz: { q: "کدام فعل برای پشتیبانی ادعا با مدرک است؟", options: ["belegen", "vermuten", "vergessen"], answer: 0, explain: "eine Aussage mit Daten belegen یعنی ادعا را با داده اثبات کردن." }
    },
    {
      id: "b2-03", level: "B2", title: "مذاکره و توافق", de: "Verhandeln", minutes: 25,
      goal: "پیشنهاد بدهی، شرط بگذاری و به راه‌حل میانی برسی.",
      words: [["der Vorschlag", "پیشنهاد", "Ich habe einen Vorschlag."], ["die Voraussetzung", "پیش‌شرط", "Das ist eine wichtige Voraussetzung."], ["entgegenkommen", "کوتاه آمدن", "Können Sie uns entgegenkommen?"], ["der Kompromiss", "سازش", "Wir brauchen einen Kompromiss."], ["verbindlich", "الزام‌آور", "Die Zusage ist verbindlich."]],
      pattern: { de: "Unter der Voraussetzung, dass …", fa: "به شرط آنکه …" },
      dialogue: [["Wir könnten früher liefern, wenn Sie die Menge erhöhen.", "اگر مقدار را افزایش دهید می‌توانیم زودتر تحویل دهیم."], ["Könnten Sie uns beim Preis entgegenkommen?", "می‌توانید در قیمت با ما راه بیایید؟"], ["Dann einigen wir uns auf fünf Prozent Rabatt.", "پس روی پنج درصد تخفیف توافق می‌کنیم."]],
      quiz: { q: "یک توافق میانی چه نام دارد؟", options: ["Kompromiss", "Voraussetzung", "Widerspruch"], answer: 0, explain: "Kompromiss راه‌حلی است که هر دو طرف بخشی از خواسته خود را تعدیل می‌کنند." }
    },
    {
      id: "b2-04", level: "B2", title: "خبر و تحلیل", de: "Nachrichten analysieren", minutes: 25,
      goal: "واقعیت، ادعا و دیدگاه را در متن خبری جدا کنی.",
      words: [["die Behauptung", "ادعا", "Die Behauptung ist nicht belegt."], ["die Auswirkung", "پیامد", "Welche Auswirkungen hat das?"], ["der Zusammenhang", "ارتباط", "Es besteht ein Zusammenhang."], ["umstritten", "بحث‌برانگیز", "Die Maßnahme ist umstritten."], ["laut", "بر اساس گفته", "Laut der Studie …"]],
      pattern: { de: "Während …, weist … darauf hin, dass …", fa: "درحالی‌که …، … اشاره می‌کند که …" },
      dialogue: [["Laut dem Bericht sinken die Kosten.", "طبق گزارش هزینه‌ها کاهش می‌یابد."], ["Die Methode der Studie ist jedoch umstritten.", "بااین‌حال روش مطالعه بحث‌برانگیز است."], ["Deshalb sollte man die Aussage vorsichtig bewerten.", "بنابراین باید ادعا را محتاطانه ارزیابی کرد."]],
      quiz: { q: "laut einer Studie چه نقشی دارد؟", options: ["منبع ادعا را معرفی می‌کند", "مخالفت قطعی را نشان می‌دهد", "زمان گذشته می‌سازد"], answer: 0, explain: "laut + Dativ/Genitiv برای نسبت‌دادن اطلاعات به یک منبع است." }
    },
    {
      id: "c1-01", level: "C1", title: "نوشتار دانشگاهی", de: "Wissenschaftlich schreiben", minutes: 30,
      goal: "متنی منسجم با ادعا، شاهد و محدودیت بنویسی.",
      words: [["die Annahme", "فرض", "Dieser Untersuchung liegt die Annahme zugrunde …"], ["maßgeblich", "به‌طور تعیین‌کننده", "Das Ergebnis wird maßgeblich beeinflusst."], ["differenzieren", "تمایز قائل شدن", "Man muss zwischen den Fällen differenzieren."], ["einschränken", "محدود کردن", "Die Aussage ist einzuschränken."], ["insofern", "از این جهت", "Insofern ist die Kritik berechtigt."]],
      pattern: { de: "Es ist zu berücksichtigen, dass …", fa: "باید در نظر داشت که …" },
      dialogue: [["Die Ergebnisse sprechen zunächst für die Hypothese.", "نتایج در نگاه اول از فرضیه حمایت می‌کنند."], ["Allerdings ist die geringe Stichprobe zu berücksichtigen.", "بااین‌حال باید حجم کم نمونه را در نظر گرفت."], ["Eine Verallgemeinerung ist daher nur eingeschränkt möglich.", "بنابراین تعمیم فقط به‌صورت محدود ممکن است."]],
      quiz: { q: "کدام واژه برای بیان محدودیت نتیجه مناسب است؟", options: ["eingeschränkt", "zweifellos", "vollständig"], answer: 0, explain: "eingeschränkt از قطعیت بیش‌ازحد جلوگیری می‌کند و محدودیت را نشان می‌دهد." }
    },
    {
      id: "c1-02", level: "C1", title: "بوروکراسی پیچیده", de: "Komplexe Behördensprache", minutes: 30,
      goal: "نامه اداری پیچیده را تحلیل و پاسخ دقیق تنظیم کنی.",
      words: [["die Voraussetzung", "شرط لازم", "Die Voraussetzungen sind erfüllt."], ["nachreichen", "بعداً تحویل دادن", "Sie können das Dokument nachreichen."], ["fristgerecht", "در مهلت مقرر", "Der Antrag wurde fristgerecht eingereicht."], ["der Nachweis", "مدرک اثبات", "Ein Nachweis ist erforderlich."], ["gegebenenfalls", "در صورت لزوم", "Gegebenenfalls melden wir uns erneut."]],
      pattern: { de: "Hiermit nehme ich Bezug auf Ihr Schreiben vom …", fa: "بدین‌وسیله به نامه مورخ … شما ارجاع می‌دهم." },
      dialogue: [["Hiermit nehme ich Bezug auf Ihren Bescheid.", "به ابلاغیه شما ارجاع می‌دهم."], ["Den fehlenden Nachweis reiche ich fristgerecht nach.", "مدرک ناقص را در مهلت ارسال می‌کنم."], ["Ich bitte um eine schriftliche Bestätigung.", "درخواست تأیید کتبی دارم."]],
      quiz: { q: "nachreichen یعنی چه؟", options: ["مدرک را بعداً تکمیل و ارسال کردن", "درخواست را پس گرفتن", "اعتراض شفاهی کردن"], answer: 0, explain: "در امور اداری برای تحویل بعدی مدرک ناقص به کار می‌رود." }
    },
    {
      id: "c1-03", level: "C1", title: "تعارض محیط کار", de: "Konflikte am Arbeitsplatz", minutes: 30,
      goal: "اختلاف را بدون تهاجم روشن و حرفه‌ای حل کنی.",
      words: [["die Wahrnehmung", "برداشت", "Meine Wahrnehmung war eine andere."], ["missverständlich", "ابهام‌آمیز", "Die Formulierung war missverständlich."], ["konstruktiv", "سازنده", "Lassen Sie uns konstruktiv bleiben."], ["nachvollziehen", "درک کردن", "Ich kann Ihren Punkt nachvollziehen."], ["die Zuständigkeit", "حوزه مسئولیت", "Wir sollten die Zuständigkeit klären."]],
      pattern: { de: "Mir ist wichtig, dass wir …", fa: "برای من مهم است که ما …" },
      dialogue: [["Ich kann Ihre Kritik nachvollziehen.", "می‌توانم انتقاد شما را درک کنم."], ["Mir ist wichtig, dass wir die Zuständigkeit klar regeln.", "مهم است مسئولیت‌ها را روشن کنیم."], ["Lassen Sie uns die nächsten Schritte schriftlich festhalten.", "بیایید گام‌های بعدی را کتبی ثبت کنیم."]],
      quiz: { q: "کدام جمله تنش را کمتر می‌کند؟", options: ["Ich kann Ihren Punkt nachvollziehen.", "Sie liegen völlig falsch.", "Das ist allein Ihre Schuld."], answer: 0, explain: "پذیرش قابل‌فهم‌بودن دیدگاه طرف مقابل، بدون تسلیم‌شدن، فضا را سازنده می‌کند." }
    },
    {
      id: "c1-04", level: "C1", title: "آمادگی آزمون پیشرفته", de: "Prüfungsstrategie", minutes: 30,
      goal: "برای TestDaF، telc یا Goethe ساختار پاسخ و مدیریت زمان داشته باشی.",
      words: [["die Aufgabenstellung", "صورت سؤال", "Lesen Sie die Aufgabenstellung genau."], ["erörtern", "همه‌جانبه بررسی کردن", "Erörtern Sie Vor- und Nachteile."], ["gewichten", "وزن‌دهی کردن", "Die Argumente sind zu gewichten."], ["schlüssig", "منطقی و منسجم", "Die Begründung ist schlüssig."], ["die Überleitung", "عبارت گذار", "Eine Überleitung verbindet die Abschnitte."]],
      pattern: { de: "Zusammenfassend lässt sich feststellen, dass …", fa: "در جمع‌بندی می‌توان گفت که …" },
      dialogue: [["Definieren Sie zuerst Ihre Position.", "ابتدا موضع خود را مشخص کنید."], ["Ordnen und gewichten Sie dann die Argumente.", "سپس استدلال‌ها را مرتب و وزن‌دهی کنید."], ["Planen Sie fünf Minuten für die Kontrolle ein.", "پنج دقیقه برای بازبینی در نظر بگیرید."]],
      quiz: { q: "erörtern از شما چه می‌خواهد؟", options: ["بررسی چندجانبه با استدلال", "فقط ترجمه واژه‌ها", "نوشتن یک فهرست بدون توضیح"], answer: 0, explain: "erörtern یعنی موضوع را از جنبه‌های مختلف بررسی و استدلال کنید." }
    },
    {
      id: "c2-01", level: "C2", title: "ظرافت لحن", de: "Stilistische Nuancen", minutes: 35,
      goal: "لحن رسمی، خنثی، کنایه‌آمیز و محاوره‌ای را تشخیص بدهی.",
      words: [["wohlgemerkt", "توجه شود که", "Wohlgemerkt, es handelt sich um eine Ausnahme."], ["mitnichten", "به‌هیچ‌وجه", "Das ist mitnichten bewiesen."], ["geradezu", "واقعاً/تقریباً به حد", "Die Wirkung ist geradezu paradox."], ["nuanciert", "ظریف و چندلایه", "Sie argumentiert sehr nuanciert."], ["unterschwellig", "ضمنی", "Die Kritik bleibt unterschwellig."]],
      pattern: { de: "Das ist weniger … als vielmehr …", fa: "این کمتر … و بیشتر … است." },
      dialogue: [["Seine Zustimmung klang eher pflichtschuldig.", "موافقت او بیشتر از سر وظیفه به نظر می‌رسید."], ["Die Kritik war unterschwellig, aber unmissverständlich.", "انتقاد ضمنی اما کاملاً روشن بود."], ["Das ist weniger Ironie als vielmehr Distanz.", "این کمتر کنایه و بیشتر فاصله‌گذاری است."]],
      quiz: { q: "mitnichten چه شدتی دارد؟", options: ["رد قاطع: به‌هیچ‌وجه", "احتمال ضعیف", "تأیید محتاطانه"], answer: 0, explain: "mitnichten واژه‌ای رسمی برای رد قاطع است." }
    },
    {
      id: "c2-02", level: "C2", title: "استدلال پیچیده", de: "Komplex argumentieren", minutes: 35,
      goal: "استدلال چندلایه بسازی و پیش‌فرض‌های آن را نقد کنی.",
      words: [["die Prämisse", "پیش‌فرض", "Die Prämisse ist fragwürdig."], ["widerlegen", "رد کردن با دلیل", "Die These wurde widerlegt."], ["implizieren", "تلویحاً دربرداشتن", "Das impliziert eine Wertung."], ["der Einwand", "ایراد", "Gegen diesen Einwand spricht …"], ["stichhaltig", "محکم و معتبر", "Das Argument ist stichhaltig."]],
      pattern: { de: "Selbst wenn …, folgt daraus nicht zwangsläufig, dass …", fa: "حتی اگر …، الزاماً نتیجه نمی‌شود که …" },
      dialogue: [["Selbst wenn die Zahlen stimmen, ist die Schlussfolgerung voreilig.", "حتی اگر اعداد درست باشند، نتیجه‌گیری شتاب‌زده است."], ["Welche Prämisse stellen Sie infrage?", "کدام پیش‌فرض را زیر سؤال می‌برید؟"], ["Dass Korrelation automatisch Kausalität bedeutet.", "اینکه همبستگی خودبه‌خود به معنای علیت باشد."]],
      quiz: { q: "stichhaltig برای یک استدلال یعنی چه؟", options: ["محکم و معتبر", "احساسی و مبهم", "طولانی و نامرتبط"], answer: 0, explain: "Ein stichhaltiges Argument از نظر منطقی قابل دفاع است." }
    },
    {
      id: "c2-03", level: "C2", title: "زبان تخصصی و انتقال معنا", de: "Fachsprache übertragen", minutes: 35,
      goal: "مفهوم تخصصی را برای مخاطب عمومی دقیق و ساده بازنویسی کنی.",
      words: [["adressatengerecht", "متناسب با مخاطب", "Der Text muss adressatengerecht sein."], ["verdichten", "فشرده‌سازی معنا", "Die Kernaussage wird verdichtet."], ["umschreiben", "بازگویی کردن", "Schreiben Sie den Begriff verständlich um."], ["die Tragweite", "دامنه پیامد", "Die Tragweite ist erheblich."], ["prägnant", "کوتاه و گویا", "Formulieren Sie prägnant."]],
      pattern: { de: "Vereinfacht ausgedrückt bedeutet das, dass …", fa: "به زبان ساده یعنی اینکه …" },
      dialogue: [["Der Fachbegriff ist für Laien schwer verständlich.", "اصطلاح برای افراد غیرمتخصص دشوار است."], ["Vereinfacht ausgedrückt geht es um die Verteilung von Risiken.", "ساده بگوییم موضوع تقسیم ریسک‌هاست."], ["So bleibt die Aussage präzise und zugänglich.", "این‌گونه بیان هم دقیق و هم قابل‌فهم می‌ماند."]],
      quiz: { q: "adressatengerecht یعنی چه؟", options: ["متناسب با مخاطب", "از نظر دستوری ناقص", "فقط مناسب متخصصان"], answer: 0, explain: "محتوا، لحن و پیچیدگی باید با مخاطب هدف هماهنگ باشد." }
    },
    {
      id: "c2-04", level: "C2", title: "تسلط و خوداصلاحی", de: "Sprachliche Meisterschaft", minutes: 35,
      goal: "خطاهای ظریف خودت را شناسایی و بیان را طبیعی‌تر کنی.",
      words: [["idiomatisch", "طبیعی و اصطلاحی", "Die Formulierung klingt idiomatisch."], ["die Abweichung", "انحراف", "Das ist eine stilistische Abweichung."], ["treffsicher", "دقیق و بجا", "Das Wort ist treffsicher gewählt."], ["überarbeiten", "بازبینی کردن", "Überarbeiten Sie den Absatz."], ["feinjustieren", "تنظیم ظریف", "Der Ton muss feinjustiert werden."]],
      pattern: { de: "Treffender wäre die Formulierung …", fa: "بیان دقیق‌تر این خواهد بود …" },
      dialogue: [["Der Satz ist korrekt, klingt aber etwas übersetzt.", "جمله درست است ولی کمی ترجمه‌ای به نظر می‌رسد."], ["Treffender wäre: ‚Das liegt auf der Hand.‘", "بیان طبیعی‌تر این است: بدیهی است."], ["Achten Sie beim Überarbeiten auf Kollokationen.", "هنگام بازبینی به ترکیب‌های رایج واژگان توجه کنید."]],
      quiz: { q: "idiomatisch صحیح چه چیزی را توصیف می‌کند؟", options: ["بیان طبیعی در زبان مقصد", "املای قدیمی", "ترجمه واژه‌به‌واژه"], answer: 0, explain: "بیان idiomatisch همان چیزی است که گوینده مسلط به‌طور طبیعی می‌گوید." }
    }
  ];

  const placement = [
    { level: "A1", q: "Ich ___ Ghazal.", options: ["heiße", "heißt", "heißen"], answer: 0 },
    { level: "A1", q: "Woher ___ du?", options: ["kommst", "kommt", "kommen"], answer: 0 },
    { level: "A2", q: "Ich lerne Deutsch, ___ ich in Deutschland arbeiten möchte.", options: ["weil", "dann", "trotzdem"], answer: 0 },
    { level: "A2", q: "Gestern ___ ich beim Arzt.", options: ["war", "bin", "wäre"], answer: 0 },
    { level: "B1", q: "Könnten Sie mir bitte ___, welche Unterlagen fehlen?", options: ["mitteilen", "geteilt", "mitzuteilen"], answer: 0 },
    { level: "B1", q: "Obwohl es regnete, ___ wir spazieren.", options: ["gingen", "gehen würden", "gegangen"], answer: 0 },
    { level: "B2", q: "Die Maßnahme wurde eingeführt, ___ die Kosten zu senken.", options: ["um", "damit", "ohne dass"], answer: 0 },
    { level: "B2", q: "Die Ergebnisse lassen sich nicht ohne Weiteres ___.", options: ["verallgemeinern", "verallgemeinert", "zu verallgemeinerte"], answer: 0 },
    { level: "C1", q: "Es ist zu berücksichtigen, dass die Stichprobe nur bedingt ___ ist.", options: ["repräsentativ", "vertretbar gewesen", "darstellend"], answer: 0 },
    { level: "C1", q: "Welche Formulierung ist am formellsten?", options: ["Hiermit nehme ich Bezug auf Ihr Schreiben.", "Ich wollte mal wegen Ihres Briefs fragen.", "Was ist jetzt mit dem Brief?"], answer: 0 },
    { level: "C2", q: "‚Das ist mitnichten erwiesen‘ bedeutet:", options: ["Das ist keineswegs bewiesen.", "Das ist möglicherweise wahr.", "Das wurde teilweise bestätigt."], answer: 0 },
    { level: "C2", q: "Welche Variante klingt am idiomatischsten?", options: ["Das liegt auf der Hand.", "Das liegt auf der Faust.", "Das steht auf der Handfläche."], answer: 0 }
  ];

  const survivalPacks = [
    {
      id: "arrival", icon: "🧳", title: "۷۲ ساعت اول", subtitle: "ورود، سیم‌کارت، مسیر و کمک فوری",
      phrases: [["Ich bin gerade angekommen.", "تازه رسیده‌ام."], ["Können Sie mir bitte helfen?", "ممکن است لطفاً کمکم کنید؟"], ["Wo kann ich eine SIM-Karte kaufen?", "از کجا می‌توانم سیم‌کارت بخرم؟"], ["Ich habe diese Adresse. Wie komme ich dorthin?", "این آدرس را دارم؛ چطور به آنجا برسم؟"]]
    },
    {
      id: "anmeldung", icon: "🏛️", title: "ثبت آدرس و اداره", subtitle: "Anmeldung، وقت و مدارک",
      phrases: [["Ich möchte meinen Wohnsitz anmelden.", "می‌خواهم محل سکونتم را ثبت کنم."], ["Welche Unterlagen muss ich mitbringen?", "چه مدارکی باید بیاورم؟"], ["Ich habe einen Termin um zehn Uhr.", "ساعت ده وقت دارم."], ["Könnte ich eine schriftliche Bestätigung bekommen?", "ممکن است تأیید کتبی بگیرم؟"]]
    },
    {
      id: "housing", icon: "🏠", title: "خانه و اجاره", subtitle: "بازدید، قرارداد و خرابی",
      phrases: [["Ist die Wohnung noch verfügbar?", "آیا خانه هنوز موجود است؟"], ["Sind die Nebenkosten in der Miete enthalten?", "هزینه‌های جانبی در اجاره است؟"], ["Ich möchte den Mietvertrag in Ruhe lesen.", "می‌خواهم قرارداد را با آرامش بخوانم."], ["Die Heizung funktioniert nicht.", "سیستم گرمایش کار نمی‌کند."]]
    },
    {
      id: "health", icon: "🩺", title: "سلامت و درمان", subtitle: "پزشک، بیمه و داروخانه",
      phrases: [["Ich brauche möglichst bald einen Termin.", "در اولین فرصت وقت پزشک می‌خواهم."], ["Ich habe seit gestern Schmerzen.", "از دیروز درد دارم."], ["Nehmen Sie neue Patienten auf?", "بیمار جدید می‌پذیرید؟"], ["Wie oft soll ich das Medikament nehmen?", "دارو را چند بار مصرف کنم؟"]]
    },
    {
      id: "bank", icon: "🏦", title: "بانک و پرداخت", subtitle: "حساب، کارت و انتقال پول",
      phrases: [["Ich möchte ein Girokonto eröffnen.", "می‌خواهم حساب جاری باز کنم."], ["Welche Gebühren fallen an?", "چه هزینه‌هایی دارد؟"], ["Meine Karte wurde gesperrt.", "کارتم مسدود شده است."], ["Wann wird die Überweisung gutgeschrieben?", "انتقال چه زمانی به حساب می‌نشیند؟"]]
    },
    {
      id: "work", icon: "💼", title: "کار", subtitle: "درخواست، قرارداد و محیط کار",
      phrases: [["Ich bewerbe mich um die ausgeschriebene Stelle.", "برای موقعیت اعلام‌شده درخواست می‌دهم."], ["Wie lang ist die Probezeit?", "دوره آزمایشی چقدر است؟"], ["Wie sind die Arbeitszeiten geregelt?", "ساعت‌های کاری چگونه تنظیم شده؟"], ["Könnten Sie die Aufgabe bitte genauer erklären?", "ممکن است وظیفه را دقیق‌تر توضیح دهید؟"]]
    },
    {
      id: "study", icon: "🎓", title: "دانشگاه", subtitle: "ثبت‌نام، کلاس و امور دانشجویی",
      phrases: [["Wo finde ich das Studierendensekretariat?", "امور دانشجویی کجاست؟"], ["Welche Frist gilt für die Einschreibung?", "مهلت ثبت‌نام چه زمانی است؟"], ["Könnten Sie die Aufgabenstellung erläutern?", "ممکن است صورت تکلیف را توضیح دهید؟"], ["Ich möchte meine Leistung anerkennen lassen.", "می‌خواهم واحدم تطبیق داده شود."]]
    },
    {
      id: "emergency", icon: "🆘", title: "موقعیت اضطراری", subtitle: "کمک، پلیس و گم‌شدن مدارک",
      phrases: [["Ich brauche dringend Hilfe.", "فوراً کمک لازم دارم."], ["Bitte rufen Sie einen Krankenwagen.", "لطفاً آمبولانس خبر کنید."], ["Mein Pass wurde gestohlen.", "گذرنامه‌ام دزدیده شده است."], ["Wo ist die nächste Polizeidienststelle?", "نزدیک‌ترین کلانتری کجاست؟"]]
    }
  ];

  const selfAssessment = [
    { id: "listening", title: "شنیدن", prompt: "یک گفت‌وگوی روزمره معمولی را بدون متن چقدر می‌فهمی؟" },
    { id: "speaking", title: "صحبت‌کردن", prompt: "می‌توانی دو دقیقه پیوسته درباره زندگی یا کارت حرف بزنی؟" },
    { id: "reading", title: "خواندن", prompt: "نامه اداری یا خبر کوتاه را چقدر دقیق می‌فهمی؟" },
    { id: "writing", title: "نوشتن", prompt: "می‌توانی یک ایمیل رسمی منظم و بدون ترجمه واژه‌به‌واژه بنویسی؟" },
    { id: "grammar", title: "دستور", prompt: "در جای فعل، حالت‌ها و جمله‌های وابسته چقدر مطمئنی؟" },
    { id: "vocabulary", title: "واژگان", prompt: "برای زندگی، کار و اداره‌ها واژه فعال کافی داری؟" }
  ];

  return { levels, lessons, placement, survivalPacks, selfAssessment };
});
