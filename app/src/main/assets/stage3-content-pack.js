(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root){
    api.apply({data:root.GhazalData,lib:root.GhazalLibrary,dict:root.GhazalDictionary,deep:root.GhazalDeepLibrary});
    root.GhazalStage3Content=api;
  }
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const VERSION="3.0.0";
  const LEVELS=["A1","A2","B1","B2","C1","C2"];

  const L=(level,no,title,de,goal,pattern,words,dialogue,quiz)=>({
    id:"s3-"+level.toLowerCase()+"-"+String(no).padStart(2,"0"),
    level,title,de,minutes:{A1:18,A2:20,B1:24,B2:28,C1:32,C2:35}[level],
    goal,pattern:{de:pattern[0],fa:pattern[1]},words,dialogue,
    quiz:{q:quiz[0],options:quiz[1],answer:quiz[2],explain:quiz[3]},
    stage3:true
  });

  const lessons=[
    L("A1",1,"ثبت آدرس در اداره","Anmeldung beim Bürgeramt",
      "در Bürgeramt هدف مراجعه، مدارک پایه و درخواست ثبت آدرس را ساده و مؤدبانه بیان کنی.",
      ["Ich möchte mich anmelden und habe alle Unterlagen dabei.","می‌خواهم ثبت آدرس کنم و همه مدارک را همراه دارم."],
      [
        ["die Anmeldung","ثبت آدرس/ثبت‌نام","Ich brauche eine Anmeldung.","Nomen","die Anmeldungen","","eine Anmeldung beantragen","formal"],
        ["der Ausweis","مدرک شناسایی","Hier ist mein Ausweis.","Nomen","die Ausweise","","den Ausweis vorzeigen","neutral"],
        ["die Adresse","نشانی","Meine neue Adresse ist in Köln.","Nomen","die Adressen","","eine Adresse angeben","neutral"],
        ["mitbringen","همراه آوردن","Bitte bringen Sie den Mietvertrag mit.","Verb","","trennbar + Akkusativ","Unterlagen mitbringen","neutral"],
        ["unterschreiben","امضا کردن","Bitte unterschreiben Sie hier.","Verb","","+ Akkusativ","ein Formular unterschreiben","formal"]
      ],
      [
        ["Guten Tag. Was kann ich für Sie tun?","روز بخیر. چه کمکی می‌توانم بکنم؟"],
        ["Ich möchte mich anmelden.","می‌خواهم ثبت آدرس کنم."],
        ["Haben Sie Ihren Ausweis und die Wohnungsgeberbestätigung dabei?","مدرک شناسایی و تأییدیه صاحبخانه را همراه دارید؟"],
        ["Ja, hier sind die Unterlagen.","بله، مدارک اینجاست."]
      ],
      ["برای شروع درخواست ثبت آدرس کدام جمله طبیعی‌تر است؟",["Ich möchte mich anmelden.","Ich bin Anmeldung.","Ich komme die Anmeldung."],0,"Ich möchte mich anmelden عبارت ساده و طبیعی برای بیان هدف مراجعه است."]),

    L("A1",2,"مراجعه به پزشک","Beim Arzt",
      "علائم ساده، مدت مشکل و نیاز به وقت پزشک را بیان کنی.",
      ["Ich habe seit gestern Kopfschmerzen.","از دیروز سردرد دارم."],
      [
        ["die Beschwerden","علائم/ناراحتی","Welche Beschwerden haben Sie?","Nomen","die Beschwerden","Plural","Beschwerden haben","formal"],
        ["das Fieber","تب","Ich habe kein Fieber.","Nomen","","meist Singular","Fieber haben","neutral"],
        ["der Schmerz","درد","Der Schmerz ist stark.","Nomen","die Schmerzen","","Schmerzen haben","neutral"],
        ["seit","از زمانی در گذشته تا اکنون","Ich bin seit Montag krank.","Präposition","","+ Dativ / Zeitangabe","seit gestern","neutral"],
        ["untersuchen","معاینه کردن","Die Ärztin untersucht mich.","Verb","","+ Akkusativ","einen Patienten untersuchen","formal"]
      ],
      [
        ["Was fehlt Ihnen?","چه مشکلی دارید؟"],
        ["Ich habe seit gestern starke Kopfschmerzen.","از دیروز سردرد شدید دارم."],
        ["Haben Sie auch Fieber?","تب هم دارید؟"],
        ["Nein, aber ich bin sehr müde.","نه، ولی خیلی خسته‌ام."]
      ],
      ["برای وضعیت ادامه‌دار از دیروز کدام درست است؟",["seit gestern","für gestern","an gestern"],0,"seit برای شروع وضعیتی که تا اکنون ادامه دارد استفاده می‌شود."]),

    L("A1",3,"ایستگاه و تغییر خط","Am Bahnhof",
      "سکو، زمان حرکت و تغییر خط را بپرسی و بفهمی.",
      ["Von welchem Gleis fährt der Zug ab?","قطار از کدام سکو حرکت می‌کند؟"],
      [
        ["das Gleis","سکو/خط ریلی","Der Zug fährt von Gleis vier.","Nomen","die Gleise","","von Gleis vier abfahren","neutral"],
        ["die Abfahrt","حرکت/زمان حرکت","Die Abfahrt ist um 8:10 Uhr.","Nomen","die Abfahrten","","pünktliche Abfahrt","neutral"],
        ["der Anschluss","قطار/اتصال بعدی","Ich muss den Anschluss erreichen.","Nomen","die Anschlüsse","","den Anschluss erreichen","neutral"],
        ["umsteigen","خط عوض کردن","Sie müssen in Bonn umsteigen.","Verb","","sein + in + Dativ","in Köln umsteigen","neutral"],
        ["verspätet","با تأخیر","Der Zug ist zehn Minuten verspätet.","Adjektiv","","","verspätet sein","neutral"]
      ],
      [
        ["Entschuldigung, von welchem Gleis fährt der Zug nach Bonn?","ببخشید، قطار بن از کدام سکو حرکت می‌کند؟"],
        ["Von Gleis sechs.","از سکوی شش."],
        ["Muss ich umsteigen?","باید خط عوض کنم؟"],
        ["Ja, einmal in Köln.","بله، یک بار در کلن."]
      ],
      ["umsteigen یعنی چه؟",["تغییر خط/قطار","پیاده‌روی کردن","رزرو کردن"],0,"umsteigen برای عوض‌کردن وسیله یا خط در مسیر به‌کار می‌رود."]),

    L("A1",4,"خانه و وسایل ضروری","In der Wohnung",
      "مشکل ساده خانه و نیاز فوری را به صاحبخانه یا مدیریت ساختمان بگویی.",
      ["Die Heizung funktioniert nicht.","سیستم گرمایش کار نمی‌کند."],
      [
        ["die Heizung","سیستم گرمایش","Die Heizung ist kalt.","Nomen","die Heizungen","","die Heizung reparieren","neutral"],
        ["der Schlüssel","کلید","Ich habe den Schlüssel verloren.","Nomen","die Schlüssel","","einen Schlüssel bekommen","neutral"],
        ["kaputt","خراب","Die Lampe ist kaputt.","Adjektiv","","","kaputt sein","informal"],
        ["funktionieren","کار کردن","Das Licht funktioniert wieder.","Verb","","","gut funktionieren","neutral"],
        ["reparieren","تعمیر کردن","Kann jemand die Heizung reparieren?","Verb","","+ Akkusativ","etwas reparieren","neutral"]
      ],
      [
        ["Guten Tag, ich habe ein Problem in der Wohnung.","سلام، در خانه مشکلی دارم."],
        ["Was ist passiert?","چه اتفاقی افتاده؟"],
        ["Die Heizung funktioniert nicht.","گرمایش کار نمی‌کند."],
        ["Wir schicken morgen einen Techniker.","فردا تعمیرکار می‌فرستیم."]
      ],
      ["برای گفتن «چراغ خراب است» کدام درست است؟",["Die Lampe ist kaputt.","Die Lampe hat kaputt.","Die Lampe macht kaputt."],0,"kaputt با sein برای توصیف وضعیت شیء به‌کار می‌رود."]),

    L("A1",5,"تماس و تغییر قرار","Termin am Telefon",
      "تلفنی خودت را معرفی کنی، زمان قرار را بفهمی و درخواست زمان دیگری بدهی.",
      ["Können wir den Termin auf Freitag verschieben?","می‌توانیم قرار را به جمعه منتقل کنیم؟"],
      [
        ["der Termin","قرار","Ich habe morgen einen Termin.","Nomen","die Termine","","einen Termin vereinbaren","neutral"],
        ["frei","آزاد","Ist am Freitag etwas frei?","Adjektiv","","","einen Termin frei haben","neutral"],
        ["verschieben","جابه‌جا کردن","Ich muss den Termin verschieben.","Verb","","+ Akkusativ / auf + Akkusativ","einen Termin verschieben","neutral"],
        ["zurückrufen","دوباره تماس گرفتن","Ich rufe später zurück.","Verb","","trennbar","später zurückrufen","neutral"],
        ["passen","مناسب بودن","Passt Ihnen zehn Uhr?","Verb","","+ Dativ","jemandem gut passen","neutral"]
      ],
      [
        ["Praxis Weber, guten Tag.","مطب وبر، روز بخیر."],
        ["Guten Tag, hier ist Mina Rahimi.","سلام، مینا رحیمی هستم."],
        ["Passt Ihnen Donnerstag um zehn Uhr?","پنجشنبه ساعت ده مناسب است؟"],
        ["Leider nicht. Ist Freitag möglich?","متأسفانه نه. جمعه ممکن است؟"]
      ],
      ["Passt Ihnen zehn Uhr? یعنی چه؟",["ساعت ده برای شما مناسب است؟","ساعت ده چند است؟","ساعت ده گذشته است؟"],0,"passen + Dativ برای مناسب‌بودن زمان یا چیز برای شخص به‌کار می‌رود."]),

    L("A2",1,"قرارداد اجاره و هزینه‌ها","Mietvertrag und Nebenkosten",
      "درباره مبلغ اجاره، Nebenkosten، Kaution و بندهای پایه قرارداد سؤال کنی.",
      ["Sind die Heizkosten in den Nebenkosten enthalten?","آیا هزینه گرمایش داخل هزینه‌های جانبی است؟"],
      [
        ["die Nebenkosten","هزینه‌های جانبی","Die Nebenkosten betragen 180 Euro.","Nomen","Plural","","Nebenkosten abrechnen","formal"],
        ["die Kaution","ودیعه","Die Kaution beträgt zwei Monatsmieten.","Nomen","die Kautionen","","Kaution hinterlegen","formal"],
        ["enthalten","شامل بودن","Wasser ist in der Miete enthalten.","Verb/Partizip","","in + Dativ","in der Miete enthalten sein","formal"],
        ["betragen","مقدار داشتن","Die Miete beträgt 900 Euro.","Verb","","+ Akkusativ","900 Euro betragen","formal"],
        ["kündigen","فسخ کردن","Der Vertrag kann schriftlich gekündigt werden.","Verb","","+ Akkusativ","einen Vertrag kündigen","formal"]
      ],
      [
        ["Wie hoch ist die Warmmiete?","اجاره گرم چقدر است؟"],
        ["Sie beträgt 980 Euro.","۹۸۰ یورو است."],
        ["Sind Strom und Internet enthalten?","برق و اینترنت هم شامل است؟"],
        ["Nein, diese Kosten zahlen Sie separat.","نه، این هزینه‌ها جدا پرداخت می‌شوند."]
      ],
      ["betragen در «Die Miete beträgt 980 Euro» چه معنی می‌دهد؟",["مقدار داشتن","فسخ کردن","پرداخت دیرهنگام"],0,"betragen برای بیان مقدار عددی رسمی و دقیق استفاده می‌شود."]),

    L("A2",2,"بیمه و خسارت ساده","Versicherung und Schaden",
      "یک خسارت ساده را گزارش کنی و درباره مدارک لازم بپرسی.",
      ["Welche Unterlagen muss ich für den Schaden einreichen?","برای خسارت چه مدارکی باید ارائه کنم؟"],
      [
        ["der Schaden","خسارت","Ich möchte einen Schaden melden.","Nomen","die Schäden","","einen Schaden melden","formal"],
        ["die Rechnung","فاکتور","Bitte senden Sie die Rechnung mit.","Nomen","die Rechnungen","","eine Rechnung einreichen","formal"],
        ["der Nachweis","مدرک اثبات","Wir brauchen einen Nachweis.","Nomen","die Nachweise","","einen Nachweis vorlegen","formal"],
        ["melden","گزارش دادن","Bitte melden Sie den Schaden online.","Verb","","+ Akkusativ","einen Schaden melden","formal"],
        ["einreichen","ارائه/ثبت کردن","Sie können die Fotos online einreichen.","Verb","","trennbar + Akkusativ","Unterlagen einreichen","formal"]
      ],
      [
        ["Guten Tag, ich möchte einen Schaden melden.","سلام، می‌خواهم خسارتی را گزارش کنم."],
        ["Was ist passiert?","چه اتفاقی افتاده؟"],
        ["Mein Fahrrad wurde beschädigt.","دوچرخه‌ام آسیب دیده است."],
        ["Bitte schicken Sie uns Fotos und die Rechnung.","لطفاً عکس‌ها و فاکتور را برای ما بفرستید."]
      ],
      ["einen Schaden melden یعنی چه؟",["گزارش خسارت","لغو بیمه","پرداخت خسارت"],0,"melden یعنی موضوعی را رسمی اطلاع‌دادن یا ثبت‌کردن."]),

    L("A2",3,"شیفت و برنامه کار","Schicht und Arbeitsplan",
      "درباره شیفت، تعویض زمان و مرخصی کوتاه با همکار یا سرپرست صحبت کنی.",
      ["Könnten wir die Schicht am Samstag tauschen?","می‌توانیم شیفت شنبه را با هم عوض کنیم؟"],
      [
        ["die Schicht","شیفت","Meine Schicht beginnt um sieben.","Nomen","die Schichten","","eine Schicht übernehmen","neutral"],
        ["tauschen","عوض کردن","Können wir die Schicht tauschen?","Verb","","+ Akkusativ","eine Schicht tauschen","neutral"],
        ["die Vertretung","جایگزینی","Ich brauche eine Vertretung.","Nomen","die Vertretungen","","eine Vertretung organisieren","formal"],
        ["Bescheid geben","خبر دادن","Gib mir bitte heute Bescheid.","Wendung","","Dativ","jemandem Bescheid geben","neutral"],
        ["übernehmen","برعهده گرفتن","Ich kann die Frühschicht übernehmen.","Verb","","+ Akkusativ","eine Aufgabe übernehmen","neutral"]
      ],
      [
        ["Kannst du meine Schicht am Samstag übernehmen?","می‌توانی شیفت شنبه من را برداری؟"],
        ["Ja, wenn du dafür meine Schicht am Montag übernimmst.","بله، اگر در عوض شیفت دوشنبه من را برداری."],
        ["Das passt. Ich gebe der Leitung Bescheid.","خوب است. به مدیریت خبر می‌دهم."]
      ],
      ["Bescheid geben یعنی چه؟",["اطلاع دادن","پول پرداخت کردن","شیفت تمام کردن"],0,"Bescheid geben یک ترکیب بسیار رایج برای خبر دادن است."]),

    L("A2",4,"بانک و انتقال پول","Bank und Überweisung",
      "یک انتقال بانکی ساده را انجام بدهی و درباره گیرنده، مبلغ و دلیل پرداخت سؤال کنی.",
      ["Ich möchte 250 Euro auf dieses Konto überweisen.","می‌خواهم ۲۵۰ یورو به این حساب منتقل کنم."],
      [
        ["die Überweisung","انتقال بانکی","Die Überweisung dauert einen Tag.","Nomen","die Überweisungen","","eine Überweisung machen","neutral"],
        ["der Empfänger","گیرنده","Bitte prüfen Sie den Empfänger.","Nomen","die Empfänger","","Empfänger angeben","formal"],
        ["der Betrag","مبلغ","Der Betrag ist 250 Euro.","Nomen","die Beträge","","einen Betrag überweisen","formal"],
        ["überweisen","انتقال دادن","Ich überweise die Miete morgen.","Verb","","+ Akkusativ / auf + Akkusativ","Geld überweisen","neutral"],
        ["prüfen","بررسی کردن","Prüfen Sie bitte die IBAN.","Verb","","+ Akkusativ","Daten prüfen","formal"]
      ],
      [
        ["Ich möchte eine Überweisung machen.","می‌خواهم انتقال بانکی انجام بدهم."],
        ["Wie hoch ist der Betrag?","مبلغ چقدر است؟"],
        ["250 Euro.","۲۵۰ یورو."],
        ["Bitte prüfen Sie noch einmal die IBAN.","لطفاً IBAN را یک بار دیگر بررسی کنید."]
      ],
      ["Empfänger در انتقال بانکی کیست؟",["گیرنده پول","فرستنده نامه","کارمند بانک"],0,"Empfänger شخص یا نهادی است که مبلغ را دریافت می‌کند."]),

    L("A2",5,"مشکل در سفر","Reiseproblem",
      "تأخیر، لغو یا گم‌شدن رزرو را توضیح بدهی و راه‌حل بخواهی.",
      ["Mein Zug ist ausgefallen. Welche Verbindung kann ich jetzt nehmen?","قطارم لغو شده؛ حالا کدام مسیر را می‌توانم بگیرم؟"],
      [
        ["ausfallen","لغو شدن","Der Zug fällt heute aus.","Verb","","trennbar","ein Zug fällt aus","neutral"],
        ["die Verbindung","مسیر/اتصال حمل‌ونقل","Gibt es eine andere Verbindung?","Nomen","die Verbindungen","","eine Verbindung nehmen","neutral"],
        ["die Verspätung","تأخیر","Wir haben 30 Minuten Verspätung.","Nomen","die Verspätungen","","Verspätung haben","neutral"],
        ["umbuchen","تغییر رزرو","Kann ich das Ticket umbuchen?","Verb","","trennbar + Akkusativ","ein Ticket umbuchen","neutral"],
        ["erstatten","بازپرداخت کردن","Wird der Preis erstattet?","Verb","","+ Akkusativ","Kosten erstatten","formal"]
      ],
      [
        ["Mein Zug nach Hamburg fällt aus.","قطار هامبورگ من لغو شده است."],
        ["Sie können die nächste Verbindung um 16:20 nehmen.","می‌توانید مسیر بعدی ساعت ۱۶:۲۰ را بگیرید."],
        ["Muss ich das Ticket umbuchen?","باید بلیط را تغییر رزرو بدهم؟"],
        ["Nein, Ihr Ticket bleibt gültig.","نه، بلیط شما معتبر می‌ماند."]
      ],
      ["ausfallen در سفر یعنی چه؟",["لغو شدن","زودتر رسیدن","رزرو کردن"],0,"برای پرواز، قطار، کلاس یا جلسه، ausfallen یعنی برگزار نشدن/لغو شدن."]),

    L("B1",1,"درخواست شغل و رزومه","Bewerbung und Lebenslauf",
      "درخواست شغلی کوتاه بنویسی و تجربه خودت را با مثال توضیح بدهی.",
      ["Ich bewerbe mich um die Stelle, weil meine Erfahrung gut zu den Aufgaben passt.","برای این موقعیت درخواست می‌دهم چون تجربه‌ام با وظایف آن هماهنگ است."],
      [
        ["die Stelle","موقعیت شغلی","Die Stelle ist ab Juni frei.","Nomen","die Stellen","","sich um eine Stelle bewerben","formal"],
        ["der Lebenslauf","رزومه","Im Anhang finden Sie meinen Lebenslauf.","Nomen","die Lebensläufe","","einen Lebenslauf beilegen","formal"],
        ["die Erfahrung","تجربه","Ich habe Erfahrung im Kundenservice.","Nomen","die Erfahrungen","","Erfahrung mit etwas haben","neutral"],
        ["sich bewerben","درخواست شغل دادن","Ich bewerbe mich um die Stelle.","Verb","","um + Akkusativ","sich um eine Stelle bewerben","formal"],
        ["geeignet","مناسب","Ich halte mich für die Aufgabe geeignet.","Adjektiv","","für + Akkusativ","für eine Stelle geeignet sein","formal"]
      ],
      [
        ["Warum interessieren Sie sich für die Stelle?","چرا به این موقعیت علاقه دارید؟"],
        ["Weil sie gut zu meiner bisherigen Erfahrung passt.","چون با تجربه قبلی من هماهنگ است."],
        ["Welche Stärke bringen Sie mit?","چه نقطه قوتی دارید؟"],
        ["Ich arbeite zuverlässig und kann gut organisieren.","قابل اعتماد کار می‌کنم و سازمان‌دهی خوبی دارم."]
      ],
      ["sich bewerben با کدام حرف اضافه برای موقعیت شغلی می‌آید؟",["um + Akkusativ","mit + Dativ","gegen + Akkusativ"],0,"sich um eine Stelle bewerben ساخت استاندارد است."]),

    L("B1",2,"پیگیری پرونده اداری","Behördliche Nachfrage",
      "وضعیت یک درخواست را رسمی پیگیری کنی و درباره مدرک ناقص سؤال کنی.",
      ["Ich möchte mich nach dem Bearbeitungsstand meines Antrags erkundigen.","می‌خواهم درباره وضعیت رسیدگی به درخواست خود پیگیری کنم."],
      [
        ["der Antrag","درخواست رسمی","Mein Antrag wurde vor drei Wochen eingereicht.","Nomen","die Anträge","","einen Antrag stellen","formal"],
        ["der Bearbeitungsstand","وضعیت رسیدگی","Wie ist der aktuelle Bearbeitungsstand?","Nomen","die Bearbeitungsstände","","nach dem Bearbeitungsstand fragen","formal"],
        ["die Rückmeldung","پاسخ/بازخورد","Ich warte noch auf eine Rückmeldung.","Nomen","die Rückmeldungen","","eine Rückmeldung erhalten","formal"],
        ["nachreichen","بعداً ارائه کردن","Ich kann das Dokument morgen nachreichen.","Verb","","trennbar + Akkusativ","Unterlagen nachreichen","formal"],
        ["sich erkundigen","پیگیری/پرس‌وجو کردن","Ich möchte mich nach dem Stand erkundigen.","Verb","","nach + Dativ","sich nach etwas erkundigen","formal"]
      ],
      [
        ["Guten Tag, ich rufe wegen meines Antrags an.","سلام، درباره درخواست خود تماس گرفته‌ام."],
        ["Nennen Sie mir bitte das Aktenzeichen.","لطفاً شماره پرونده را بگویید."],
        ["Gern. Können Sie mir sagen, ob noch Unterlagen fehlen?","حتماً. می‌توانید بگویید آیا هنوز مدرکی کم است؟"],
        ["Es fehlt noch eine Kopie Ihres Passes.","هنوز یک کپی از پاسپورت شما کم است."]
      ],
      ["«پیگیری وضعیت درخواست» کدام عبارت رسمی‌تر است؟",["sich nach dem Bearbeitungsstand erkundigen","den Antrag machen gehen","über Antrag telefonieren"],0,"sich erkundigen nach + Dativ برای پیگیری رسمی بسیار رایج است."]),

    L("B1",3,"حل اختلاف در تیم","Konflikt im Team",
      "سوءتفاهم را بدون حمله شخصی روشن و درباره راه‌حل مشترک توافق کنی.",
      ["Ich glaube, wir haben uns an diesem Punkt missverstanden.","فکر می‌کنم در این بخش همدیگر را بد فهمیده‌ایم."],
      [
        ["das Missverständnis","سوءتفاهم","Es gab ein Missverständnis.","Nomen","die Missverständnisse","","ein Missverständnis klären","neutral"],
        ["die Absprache","هماهنگی/توافق","Unsere Absprache war anders.","Nomen","die Absprachen","","eine Absprache treffen","neutral"],
        ["klären","روشن/حل کردن","Lassen Sie uns das gemeinsam klären.","Verb","","+ Akkusativ","eine Frage klären","neutral"],
        ["sich einigen","به توافق رسیدن","Wir haben uns auf Freitag geeinigt.","Verb","","auf + Akkusativ","sich auf eine Lösung einigen","neutral"],
        ["nachvollziehen","درک کردن","Ich kann Ihren Punkt nachvollziehen.","Verb","","+ Akkusativ","eine Position nachvollziehen","formal"]
      ],
      [
        ["Ich glaube, wir haben unterschiedliche Informationen bekommen.","فکر می‌کنم اطلاعات متفاوتی دریافت کرده‌ایم."],
        ["Das kann sein. Lass uns die Aufgaben noch einmal klären.","ممکن است. بیایید وظایف را دوباره روشن کنیم."],
        ["Können wir uns auf diese Aufteilung einigen?","می‌توانیم روی این تقسیم کار توافق کنیم؟"],
        ["Ja, so ist es für mich klar.","بله، این‌طوری برای من روشن است."]
      ],
      ["برای مخالفت محترمانه کدام بهتر است؟",["Ich kann Ihren Punkt nachvollziehen, sehe es aber etwas anders.","Das ist falsch.","Sie verstehen nichts."],0,"ابتدا پذیرش بخشی از دیدگاه و سپس بیان تفاوت، لحن حرفه‌ای‌تری دارد."]),

    L("B1",4,"بیماری و محل کار","Krankmeldung im Beruf",
      "غیبت به‌دلیل بیماری را حرفه‌ای اطلاع بدهی و درباره گواهی پزشکی توضیح بدهی.",
      ["Ich bin heute arbeitsunfähig und reiche die Bescheinigung nach.","امروز قادر به کار نیستم و گواهی را بعداً ارائه می‌کنم."],
      [
        ["die Arbeitsunfähigkeit","ناتوانی موقت برای کار","Die Arbeitsunfähigkeit dauert drei Tage.","Nomen","","meist Singular","Arbeitsunfähigkeit bescheinigen","formal"],
        ["die Bescheinigung","گواهی","Die Bescheinigung sende ich per E-Mail.","Nomen","die Bescheinigungen","","eine Bescheinigung einreichen","formal"],
        ["sich krankmelden","اعلام بیماری کردن","Ich muss mich heute krankmelden.","Verb","","reflexiv","sich bei der Arbeit krankmelden","neutral"],
        ["voraussichtlich","احتمالاً/طبق برآورد","Ich bin voraussichtlich bis Mittwoch krank.","Adverb","","","voraussichtlich dauern","formal"],
        ["nachreichen","بعداً ارائه کردن","Die Bescheinigung reiche ich morgen nach.","Verb","","trennbar","ein Dokument nachreichen","formal"]
      ],
      [
        ["Guten Morgen, ich muss mich für heute krankmelden.","صبح بخیر، باید برای امروز اعلام بیماری کنم."],
        ["Wissen Sie schon, wie lange Sie fehlen?","می‌دانید چه مدت غایب خواهید بود؟"],
        ["Voraussichtlich zwei Tage.","احتمالاً دو روز."],
        ["Bitte reichen Sie die Bescheinigung nach.","لطفاً گواهی را بعداً ارائه کنید."]
      ],
      ["voraussichtlich چه نقشی دارد؟",["برآورد احتمالی را بیان می‌کند","قطعیت کامل می‌دهد","گذشته را می‌سازد"],0,"voraussichtlich یعنی بر اساس اطلاعات فعلی احتمالاً."]),

    L("B1",5,"امنیت دیجیتال روزمره","Digitale Sicherheit",
      "درباره رمز عبور، لینک مشکوک و حفاظت ساده از حساب‌ها صحبت کنی.",
      ["Ich habe die Nachricht nicht geöffnet, weil der Link verdächtig aussah.","پیام را باز نکردم چون لینک مشکوک به‌نظر می‌رسید."],
      [
        ["das Passwort","رمز عبور","Ändern Sie regelmäßig Ihr Passwort.","Nomen","die Passwörter","","ein Passwort ändern","neutral"],
        ["verdächtig","مشکوک","Die E-Mail sieht verdächtig aus.","Adjektiv","","","verdächtig aussehen","neutral"],
        ["der Zugriff","دسترسی","Unbekannte hatten Zugriff auf das Konto.","Nomen","die Zugriffe","auf + Akkusativ","Zugriff auf ein Konto haben","formal"],
        ["bestätigen","تأیید کردن","Bestätigen Sie die Anmeldung in der App.","Verb","","+ Akkusativ","eine Anmeldung bestätigen","neutral"],
        ["sperren","مسدود کردن","Ich habe die Karte sofort sperren lassen.","Verb","","+ Akkusativ","ein Konto sperren","formal"]
      ],
      [
        ["Ich habe eine ungewöhnliche E-Mail bekommen.","یک ایمیل غیرعادی دریافت کردم."],
        ["Haben Sie auf den Link geklickt?","روی لینک کلیک کردید؟"],
        ["Nein, er sah verdächtig aus.","نه، مشکوک به‌نظر می‌رسید."],
        ["Gut. Ändern Sie trotzdem vorsichtshalber Ihr Passwort.","خوب است. با این حال برای احتیاط رمز را تغییر دهید."]
      ],
      ["Zugriff auf ein Konto یعنی چه؟",["دسترسی به حساب","بستن حساب","انتقال وجه"],0,"Zugriff auf + Akkusativ یعنی امکان دسترسی به چیزی."]),

    L("B2",1,"گزارش وضعیت پروژه","Projektstatus berichten",
      "وضعیت، ریسک، تأخیر و اقدام بعدی را کوتاه و حرفه‌ای گزارش کنی.",
      ["Wir liegen beim Budget im Plan, haben aber beim Zeitplan eine Woche Rückstand.","از نظر بودجه طبق برنامه‌ایم، اما زمان‌بندی یک هفته عقب است."],
      [
        ["der Rückstand","عقب‌ماندگی","Wir haben eine Woche Rückstand.","Nomen","die Rückstände","","Rückstand aufholen","formal"],
        ["die Gegenmaßnahme","اقدام اصلاحی","Wir haben eine Gegenmaßnahme definiert.","Nomen","die Gegenmaßnahmen","","eine Gegenmaßnahme einleiten","formal"],
        ["der Meilenstein","نقطه عطف پروژه","Der nächste Meilenstein ist der Systemtest.","Nomen","die Meilensteine","","einen Meilenstein erreichen","formal"],
        ["priorisieren","اولویت‌بندی کردن","Wir müssen die kritischen Aufgaben priorisieren.","Verb","","+ Akkusativ","Aufgaben priorisieren","formal"],
        ["aufholen","جبران کردن","Wir können einen Teil der Verzögerung aufholen.","Verb","","trennbar + Akkusativ","Verzögerung aufholen","neutral"]
      ],
      [
        ["Wie ist der aktuelle Projektstand?","وضعیت فعلی پروژه چطور است؟"],
        ["Der technische Teil ist abgeschlossen, die Dokumentation ist noch offen.","بخش فنی تمام شده، مستندات هنوز باز است."],
        ["Was ist das größte Risiko?","بزرگ‌ترین ریسک چیست؟"],
        ["Die knappe Testzeit. Deshalb priorisieren wir die kritischen Fälle.","زمان کم تست؛ به همین دلیل موارد بحرانی را اولویت می‌دهیم."]
      ],
      ["برای گزارش حرفه‌ای کدام ساختار دقیق‌تر است؟",["Status → Risiko → Maßnahme → nächster Schritt","فقط مشکل را بگو","فقط تاریخ پایان را بگو"],0,"گزارش وضعیت حرفه‌ای باید وضعیت، ریسک، اقدام و قدم بعدی را روشن کند."]),

    L("B2",2,"مذاکره و امتیاز متقابل","Verhandeln und Entgegenkommen",
      "شرط، امتیاز و خط قرمز را مؤدبانه مطرح کنی و به توافق نزدیک شوی.",
      ["Beim Preis könnten wir Ihnen entgegenkommen, wenn die Laufzeit verlängert wird.","در قیمت می‌توانیم راه بیاییم اگر مدت قرارداد بیشتر شود."],
      [
        ["die Bedingung","شرط","Unter dieser Bedingung können wir zustimmen.","Nomen","die Bedingungen","","eine Bedingung stellen","formal"],
        ["die Gegenleistung","امتیاز متقابل","Welche Gegenleistung wäre möglich?","Nomen","die Gegenleistungen","","eine Gegenleistung anbieten","formal"],
        ["entgegenkommen","راه آمدن","Beim Preis können wir Ihnen entgegenkommen.","Verb","","+ Dativ","jemandem entgegenkommen","formal"],
        ["verbindlich","قطعی/الزام‌آور","Wir brauchen eine verbindliche Zusage.","Adjektiv","","","verbindlich zusagen","formal"],
        ["aushandeln","مذاکره و نهایی کردن","Die Details müssen noch ausgehandelt werden.","Verb","","+ Akkusativ","Konditionen aushandeln","formal"]
      ],
      [
        ["Können Sie uns beim Preis entgegenkommen?","می‌توانید در قیمت با ما راه بیایید؟"],
        ["Das wäre möglich, wenn Sie zwei Jahre Laufzeit akzeptieren.","اگر قرارداد دو ساله را بپذیرید ممکن است."],
        ["Dann brauchen wir allerdings eine verbindliche Preisgarantie.","در آن صورت به تضمین قطعی قیمت نیاز داریم."],
        ["Darüber können wir sprechen.","می‌توانیم درباره آن صحبت کنیم."]
      ],
      ["aushandeln نزدیک‌ترین معنی چیست؟",["از طریق مذاکره نهایی کردن","لغو کردن","کپی گرفتن"],0,"aushandeln یعنی جزئیات یا شرایط را با مذاکره به توافق رساندن."]),

    L("B2",3,"ارائه دانشگاهی","Akademisch präsentieren",
      "ارائه را ساختاربندی، منبع را معرفی و نتیجه را بدون اغراق بیان کنی.",
      ["Aus den Daten lässt sich ableiten, dass der Effekt unter diesen Bedingungen stabil ist.","از داده‌ها می‌توان نتیجه گرفت که اثر تحت این شرایط پایدار است."],
      [
        ["die Fragestellung","پرسش پژوهش","Die Fragestellung lautet …","Nomen","die Fragestellungen","","eine Fragestellung formulieren","academic"],
        ["die Quelle","منبع","Die Quelle stammt aus dem Jahr 2025.","Nomen","die Quellen","","eine Quelle zitieren","academic"],
        ["der Befund","یافته","Der zentrale Befund betrifft …","Nomen","die Befunde","","einen Befund darstellen","academic"],
        ["ableiten","نتیجه گرفتن","Daraus lässt sich eine Empfehlung ableiten.","Verb","","aus + Dativ","etwas aus Daten ableiten","academic"],
        ["einschränken","محدود کردن","Die Aussage muss eingeschränkt werden.","Verb","","+ Akkusativ","eine Aussage einschränken","academic"]
      ],
      [
        ["Zunächst erläutere ich die Fragestellung.","ابتدا پرسش پژوهش را توضیح می‌دهم."],
        ["Anschließend stelle ich die wichtigsten Befunde vor.","سپس مهم‌ترین یافته‌ها را ارائه می‌کنم."],
        ["Welche Einschränkung ist besonders wichtig?","کدام محدودیت مهم‌تر است؟"],
        ["Die Stichprobe ist relativ klein.","نمونه نسبتاً کوچک است."]
      ],
      ["برای نتیجه‌گیری محتاطانه کدام مناسب‌تر است؟",["Daraus lässt sich ableiten, dass …","Das beweist für immer, dass …","Es ist hundertprozentig so."],0,"lässt sich ableiten نتیجه را بیان می‌کند بدون ادعای قطعیت بیش از شواهد."]),

    L("B2",4,"شکایت و اعتراض رسمی","Formelle Beschwerde und Widerspruch",
      "مشکل را مستند، انتظار خود را روشن و لحن رسمی را حفظ کنی.",
      ["Hiermit beanstande ich die fehlerhafte Leistung und bitte um eine schriftliche Stellungnahme.","بدین‌وسیله به خدمت معیوب اعتراض می‌کنم و پاسخ کتبی می‌خواهم."],
      [
        ["die Beanstandung","اعتراض به نقص","Die Beanstandung wurde registriert.","Nomen","die Beanstandungen","","eine Beanstandung einreichen","formal"],
        ["der Widerspruch","اعتراض رسمی","Ich lege Widerspruch gegen den Bescheid ein.","Nomen","die Widersprüche","gegen + Akkusativ","Widerspruch einlegen","formal"],
        ["die Frist","مهلت","Die Frist endet am 30. Juni.","Nomen","die Fristen","","eine Frist einhalten","formal"],
        ["beanstanden","به نقص اعتراض کردن","Ich beanstande die Rechnung.","Verb","","+ Akkusativ","eine Leistung beanstanden","formal"],
        ["fordern","مطالبه کردن","Ich fordere eine Korrektur der Rechnung.","Verb","","+ Akkusativ","eine Korrektur fordern","formal"]
      ],
      [
        ["Worin besteht das Problem?","مشکل دقیقاً چیست؟"],
        ["Die berechnete Leistung wurde nicht vollständig erbracht.","خدمت محاسبه‌شده کامل ارائه نشده است."],
        ["Was erwarten Sie?","چه انتظاری دارید؟"],
        ["Ich bitte um Korrektur und eine schriftliche Bestätigung.","اصلاح و تأیید کتبی می‌خواهم."]
      ],
      ["Widerspruch einlegen معمولاً چه نوع عملی است؟",["اعتراض رسمی به تصمیم/ابلاغ","درخواست دوستانه","رزرو وقت"],0,"Widerspruch einlegen ساخت رسمی برای اعتراض به تصمیم یا Bescheid است."]),

    L("B2",5,"بحث اجتماعی با توازن","Gesellschaftlich argumentieren",
      "مزایا و معایب یک سیاست را مقایسه و موضع خود را با محدودیت روشن بیان کنی.",
      ["Einerseits verbessert die Maßnahme den Zugang, andererseits entstehen zusätzliche Kosten.","از یک طرف دسترسی بهتر می‌شود و از طرف دیگر هزینه اضافی ایجاد می‌شود."],
      [
        ["die Auswirkung","پیامد","Die Maßnahme hat mehrere Auswirkungen.","Nomen","die Auswirkungen","auf + Akkusativ","Auswirkungen auf etwas haben","formal"],
        ["der Zugang","دسترسی","Der Zugang zu Bildung soll verbessert werden.","Nomen","die Zugänge","zu + Dativ","Zugang zu etwas haben","formal"],
        ["abwägen","سنجیدن جوانب","Man muss Nutzen und Kosten abwägen.","Verb","","+ Akkusativ","Vor- und Nachteile abwägen","formal"],
        ["einwenden","اعتراض/ایراد مطرح کردن","Man könnte einwenden, dass …","Verb","","dass-Satz","gegen etwas einwenden","formal"],
        ["überwiegen","غلبه داشتن","Für mich überwiegen die Vorteile.","Verb","","","Vorteile überwiegen","formal"]
      ],
      [
        ["Welche Vorteile sehen Sie?","چه مزایایی می‌بینید؟"],
        ["Der Zugang wird einfacher und Wege werden kürzer.","دسترسی آسان‌تر و مسیرها کوتاه‌تر می‌شوند."],
        ["Welche Einwände gibt es?","چه ایرادهایی وجود دارد؟"],
        ["Die Kosten könnten deutlich steigen.","هزینه‌ها ممکن است به‌طور محسوسی بالا برود."]
      ],
      ["برای استدلال متوازن کدام بهتر است؟",["مزیت و ایراد را جدا کن و سپس وزن بده","فقط نظر خودت را تکرار کن","طرف مقابل را رد کن"],0,"در B2 استدلال باید حداقل یک دیدگاه مخالف را دقیق بازتاب دهد."]),

    L("C1",1,"خلاصه علمی بی‌طرف","Wissenschaftlich zusammenfassen",
      "ادعای اصلی، شواهد و محدودیت یک متن را بدون افزودن نظر شخصی خلاصه کنی.",
      ["Die Autorin kommt zu dem Schluss, dass der Effekt zwar messbar, aber kontextabhängig ist.","نویسنده نتیجه می‌گیرد که اثر قابل اندازه‌گیری است اما به زمینه وابسته است."],
      [
        ["die Kernaussage","ادعای اصلی","Die Kernaussage des Textes lautet …","Nomen","die Kernaussagen","","eine Kernaussage herausarbeiten","academic"],
        ["die Evidenz","شواهد","Die Evidenz ist nicht in allen Bereichen gleich stark.","Nomen","","meist Singular","Evidenz liefern","academic"],
        ["die Einschränkung","محدودیت","Die Studie hat methodische Einschränkungen.","Nomen","die Einschränkungen","","Einschränkungen benennen","academic"],
        ["hervorgehen","برآمدن/مشخص شدن","Aus den Daten geht hervor, dass …","Verb","","aus + Dativ","aus einer Analyse hervorgehen","academic"],
        ["zusammenfassen","خلاصه کردن","Der Abschnitt lässt sich in zwei Punkten zusammenfassen.","Verb","","+ Akkusativ","Ergebnisse zusammenfassen","academic"]
      ],
      [
        ["Was ist die Kernaussage des Artikels?","ادعای اصلی مقاله چیست؟"],
        ["Der Effekt ist vorhanden, aber nicht in jedem Kontext gleich stark.","اثر وجود دارد ولی در همه زمینه‌ها به یک اندازه قوی نیست."],
        ["Welche Einschränkung nennt die Autorin?","نویسنده چه محدودیتی می‌گوید؟"],
        ["Die Stichprobe ist nicht repräsentativ für alle Gruppen.","نمونه برای همه گروه‌ها نماینده نیست."]
      ],
      ["در Zusammenfassung چه چیزی باید حذف شود؟",["نظر شخصی نویسنده خلاصه","ساختار استدلال","نظر شخصی خلاصه‌کننده"],2,"خلاصه علمی باید موضع متن را بازتاب دهد، نه نظر شخصی فرد خلاصه‌کننده."]),

    L("C1",2,"بحث در سمینار","Seminardiskussion",
      "با یک دیدگاه تا حدی موافق باشی، محدودیت آن را نشان بدهی و موضع خود را مستدل کنی.",
      ["Dem Argument kann ich teilweise folgen; allerdings bleibt die Frage offen, ob …","تا حدی می‌توانم استدلال را بپذیرم، اما این پرسش باز می‌ماند که آیا…"],
      [
        ["der Einwand","ایراد استدلالی","Der Einwand ist nachvollziehbar.","Nomen","die Einwände","","einen Einwand aufgreifen","academic"],
        ["die Annahme","فرض","Diese Annahme ist nicht ausreichend begründet.","Nomen","die Annahmen","","auf einer Annahme beruhen","academic"],
        ["differenzieren","تمایز دقیق دادن","Hier muss man stärker differenzieren.","Verb","","zwischen + Dativ","zwischen Fällen differenzieren","academic"],
        ["einräumen","پذیرفتن یک نکته","Man muss einräumen, dass …","Verb","","dass-Satz","einen Punkt einräumen","academic"],
        ["widersprechen","مخالفت کردن","Ich würde dieser Schlussfolgerung widersprechen.","Verb","","+ Dativ","einer These widersprechen","academic"]
      ],
      [
        ["Ich stimme dem Grundgedanken zu.","با ایده اصلی موافقم."],
        ["Wo sehen Sie trotzdem ein Problem?","با این حال مشکل را کجا می‌بینید؟"],
        ["Die Argumentation setzt voraus, dass alle Gruppen gleich reagieren.","استدلال فرض می‌کند همه گروه‌ها یکسان واکنش می‌دهند."],
        ["Genau diese Annahme müsste geprüft werden.","دقیقاً همین فرض باید بررسی شود."]
      ],
      ["برای مخالفت آکادمیک کدام مناسب‌تر است؟",["Ich würde der Schlussfolgerung in dieser Form widersprechen.","Das ist Unsinn.","Sie liegen völlig falsch."],0,"در بحث آکادمیک، نقد باید متوجه ادعا باشد نه شخص."]),

    L("C1",3,"بازخورد حرفه‌ای پیشرفته","Differenziertes Feedback",
      "نقطه قوت، حوزه بهبود و اقدام مشخص را بدون مبهم‌گویی بیان کنی.",
      ["Besonders überzeugend ist die klare Struktur; ausbaufähig ist dagegen die Begründung der Prioritäten.","ساختار روشن بسیار قانع‌کننده است؛ اما استدلال اولویت‌ها قابل بهبود است."],
      [
        ["die Rückmeldung","بازخورد","Die Rückmeldung soll konkret und umsetzbar sein.","Nomen","die Rückmeldungen","","konstruktive Rückmeldung geben","formal"],
        ["ausbaufähig","قابل توسعه/بهبود","Die Analyse ist noch ausbaufähig.","Adjektiv","","","ausbaufähig sein","formal"],
        ["konkretisieren","مشخص‌تر کردن","Könnten Sie das Ziel konkretisieren?","Verb","","+ Akkusativ","eine Erwartung konkretisieren","formal"],
        ["nachvollziehbar","قابل درک","Die Entscheidung ist gut nachvollziehbar.","Adjektiv","","","nachvollziehbar begründen","formal"],
        ["umsetzen","اجرا کردن","Wie setzen wir die Änderung um?","Verb","","trennbar + Akkusativ","eine Maßnahme umsetzen","neutral"]
      ],
      [
        ["Was hat gut funktioniert?","چه چیزی خوب کار کرد؟"],
        ["Die Präsentation war klar strukturiert.","ارائه ساختار روشنی داشت."],
        ["Was sollte verbessert werden?","چه چیزی باید بهتر شود؟"],
        ["Die Kriterien für die Priorisierung sollten genauer begründet werden.","معیارهای اولویت‌بندی باید دقیق‌تر توضیح داده شوند."]
      ],
      ["بازخورد قابل اقدام چه ویژگی دارد؟",["مشخص و قابل مشاهده است","فقط مثبت است","فقط درباره شخصیت است"],0,"بازخورد حرفه‌ای باید رفتار یا خروجی قابل تغییر را مشخص کند."]),

    L("C1",4,"تحلیل یک تصمیم اداری","Bescheid analysieren",
      "مبنای تصمیم، مهلت، امکان اعتراض و پیامد یک Bescheid را استخراج کنی.",
      ["Aus dem Bescheid geht hervor, dass innerhalb eines Monats Widerspruch eingelegt werden kann.","از ابلاغ مشخص است که ظرف یک ماه می‌توان اعتراض رسمی ثبت کرد."],
      [
        ["der Bescheid","ابلاغ/تصمیم اداری","Der Bescheid wurde gestern zugestellt.","Nomen","die Bescheide","","einen Bescheid erhalten","formal"],
        ["die Rechtsbehelfsbelehrung","راهنمای اعتراض قانونی","Die Rechtsbehelfsbelehrung steht am Ende.","Nomen","die Rechtsbehelfsbelehrungen","","Rechtsbehelfsbelehrung prüfen","legal"],
        ["die Rechtsgrundlage","مبنای قانونی","Die Rechtsgrundlage wird ausdrücklich genannt.","Nomen","die Rechtsgrundlagen","","auf einer Rechtsgrundlage beruhen","legal"],
        ["anfechten","اعتراض حقوقی کردن","Die Entscheidung kann angefochten werden.","Verb","","+ Akkusativ","einen Bescheid anfechten","legal"],
        ["zustellen","ابلاغ/تحویل رسمی کردن","Der Brief wurde am Montag zugestellt.","Verb","","+ Dativ + Akkusativ","einen Bescheid zustellen","legal"]
      ],
      [
        ["Was ist in diesem Schreiben entscheidend?","در این نامه چه چیزی تعیین‌کننده است؟"],
        ["Die Frist und die Möglichkeit des Widerspruchs.","مهلت و امکان اعتراض رسمی."],
        ["Wann beginnt die Frist?","مهلت از چه زمانی شروع می‌شود؟"],
        ["Mit der wirksamen Zustellung des Bescheids.","با ابلاغ مؤثر تصمیم."]
      ],
      ["برای تحلیل Bescheid چه چیزی حیاتی است؟",["Frist + Rechtsbehelf + Rechtsgrundlage","رنگ سربرگ","طول نامه"],0,"مهلت، روش اعتراض و مبنای تصمیم مستقیماً بر اقدام بعدی اثر دارند."]),

    L("C1",5,"استدلال دانشگاهی برای TestDaF","TestDaF-Argumentation",
      "نمودار/موضوع را توصیف، دو دیدگاه را مقایسه و موضع نهایی را با معیارهای روشن دفاع کنی.",
      ["Die Daten zeigen einen Anstieg; daraus folgt jedoch nicht automatisch, dass die Maßnahme die Ursache ist.","داده‌ها افزایش را نشان می‌دهند، اما از آن خودکار نتیجه نمی‌شود که اقدام علت آن بوده است."],
      [
        ["die Entwicklung","روند","Die Entwicklung verläuft nicht linear.","Nomen","die Entwicklungen","","eine Entwicklung beschreiben","academic"],
        ["der Anteil","سهم/درصد","Der Anteil steigt auf 42 Prozent.","Nomen","die Anteile","","einen Anteil ausmachen","academic"],
        ["die Tendenz","گرایش","Es zeigt sich eine leicht steigende Tendenz.","Nomen","die Tendenzen","","eine Tendenz erkennen","academic"],
        ["interpretieren","تفسیر کردن","Die Zahlen dürfen nicht vorschnell interpretiert werden.","Verb","","+ Akkusativ","Daten interpretieren","academic"],
        ["belegen","مستند کردن","Die Daten belegen einen Zusammenhang, aber keine Ursache.","Verb","","+ Akkusativ","eine Aussage belegen","academic"]
      ],
      [
        ["Was zeigt die Grafik zunächst?","نمودار در ابتدا چه چیزی نشان می‌دهد؟"],
        ["Einen deutlichen Anstieg über fünf Jahre.","افزایش محسوسی طی پنج سال."],
        ["Kann man daraus direkt Kausalität ableiten?","می‌توان مستقیم علیت نتیجه گرفت؟"],
        ["Nein, dafür wären zusätzliche Belege nötig.","نه، برای آن شواهد بیشتری لازم است."]
      ],
      ["در توصیف نمودار اولویت اول چیست؟",["ابتدا داده را دقیق توصیف کردن","فوراً علت را حدس زدن","نظر شخصی را اول نوشتن"],0,"در TestDaF توصیف داده و تفسیر باید از هم جدا بمانند."]),

    L("C2",1,"ترکیب چند منبع","Akademische Synthese",
      "دو منبع با نتایج متفاوت را بدون تحریف ترکیب و علت اختلاف را تحلیل کنی.",
      ["Während Studie A einen stabilen Effekt berichtet, fällt dieser in Studie B deutlich schwächer aus; ein möglicher Grund liegt in der unterschiedlichen Stichprobenzusammensetzung.","در حالی که مطالعه A اثر پایداری گزارش می‌کند، در مطالعه B اثر بسیار ضعیف‌تر است؛ یک دلیل ممکن ترکیب متفاوت نمونه‌هاست."],
      [
        ["die Synthese","ترکیب تحلیلی","Die Synthese verbindet mehrere Befunde.","Nomen","die Synthesen","","eine Synthese erstellen","academic"],
        ["die Abweichung","انحراف/تفاوت","Die Abweichung ist methodisch erklärbar.","Nomen","die Abweichungen","","eine Abweichung erklären","academic"],
        ["die Übertragbarkeit","قابلیت تعمیم","Die Übertragbarkeit ist begrenzt.","Nomen","","meist Singular","Übertragbarkeit prüfen","academic"],
        ["gewichten","وزن‌دادن","Die Befunde müssen unterschiedlich gewichtet werden.","Verb","","+ Akkusativ","Evidenz gewichten","academic"],
        ["relativieren","نسبی/محدود کردن","Der zweite Befund relativiert die erste Aussage.","Verb","","+ Akkusativ","eine Aussage relativieren","academic"]
      ],
      [
        ["Widersprechen sich die Studien vollständig?","آیا مطالعات کاملاً همدیگر را نقض می‌کنند؟"],
        ["Nicht unbedingt. Sie untersuchen unterschiedliche Populationen.","نه لزوماً؛ جمعیت‌های متفاوتی را بررسی می‌کنند."],
        ["Wie sollte man die Ergebnisse zusammenführen?","چطور باید نتایج را ترکیب کرد؟"],
        ["Man sollte Kontext, Methode und Stichprobe unterschiedlich gewichten.","باید زمینه، روش و نمونه را با وزن متفاوت در نظر گرفت."]
      ],
      ["Synthese در سطح C2 یعنی چه؟",["ترکیب انتقادی چند منبع با حفظ تفاوت‌ها","خلاصه یک متن","ترجمه جمله به جمله"],0,"Synthese تفاوت‌ها و نقاط مشترک منابع را در یک تحلیل مشترک نگه می‌دارد."]),

    L("C2",2,"تفسیر بند قرارداد","Vertragsklauseln auslegen",
      "ابهام، شرط، استثنا و پیامد چند تفسیر یک بند را دقیق توضیح بدهی.",
      ["Die Klausel lässt offen, ob die Haftungsbegrenzung auch bei grober Fahrlässigkeit gelten soll.","بند روشن نمی‌کند که محدودیت مسئولیت در بی‌احتیاطی فاحش هم اعمال می‌شود یا نه."],
      [
        ["die Auslegung","تفسیر حقوقی/متنی","Die Klausel lässt mehrere Auslegungen zu.","Nomen","die Auslegungen","","eine Klausel auslegen","legal"],
        ["die Haftung","مسئولیت حقوقی","Die Haftung ist vertraglich begrenzt.","Nomen","","meist Singular","Haftung begrenzen","legal"],
        ["die Fahrlässigkeit","بی‌احتیاطی","Grobe Fahrlässigkeit ist nicht erfasst.","Nomen","","meist Singular","grob fahrlässig handeln","legal"],
        ["vorbehaltlich","مشروط به","Die Zustimmung erfolgt vorbehaltlich der Prüfung.","Präposition/Adverb","","+ Genitiv","vorbehaltlich einer Prüfung","formal"],
        ["eindeutig","بی‌ابهام","Die Regelung ist nicht eindeutig formuliert.","Adjektiv","","","eindeutig regeln","formal"]
      ],
      [
        ["Wo liegt die Mehrdeutigkeit?","ابهام کجاست؟"],
        ["Es ist unklar, welche Fälle von der Haftungsbegrenzung erfasst sind.","روشن نیست چه مواردی شامل محدودیت مسئولیت می‌شوند."],
        ["Wie könnte man die Klausel verbessern?","چطور می‌توان بند را بهتر کرد؟"],
        ["Durch eine ausdrückliche Regelung der Ausnahmen.","با بیان صریح استثناها."]
      ],
      ["برای تحلیل بند مبهم چه کار باید کرد؟",["تفسیرهای ممکن و پیامد هرکدام را جدا کرد","فقط یک معنی را قطعی فرض کرد","واژه‌های سخت را حذف کرد"],0,"در C2 باید دامنه معنایی و پیامدهای هر تفسیر روشن شود."]),

    L("C2",3,"مدیریت بحث پرتنش","Moderieren und deeskalieren",
      "اختلاف شدید را خلاصه، نقاط مشترک را جدا و گفتگو را به تصمیم عملی برگردانی.",
      ["Bevor wir weiterdiskutieren, würde ich die beiden strittigen Punkte voneinander trennen.","پیش از ادامه بحث، دو نقطه اختلاف را از هم جدا می‌کنم."],
      [
        ["der Dissens","اختلاف نظر","Der Dissens betrifft vor allem die Prioritäten.","Nomen","","meist Singular","Dissens feststellen","formal"],
        ["die Eskalation","تشدید تنش","Wir sollten eine weitere Eskalation vermeiden.","Nomen","die Eskalationen","","Eskalation vermeiden","formal"],
        ["vermitteln","میانجی‌گری کردن","Sie vermittelt zwischen beiden Seiten.","Verb","","zwischen + Dativ","zwischen Positionen vermitteln","formal"],
        ["zuspitzen","تشدید/تیز کردن","Die Debatte hat sich unnötig zugespitzt.","Verb","","reflexiv","einen Konflikt zuspitzen","formal"],
        ["entkräften","بی‌اثر کردن استدلال","Der Einwand lässt sich teilweise entkräften.","Verb","","+ Akkusativ","einen Einwand entkräften","academic"]
      ],
      [
        ["Wir drehen uns gerade im Kreis.","الان بحث دور خودش می‌چرخد."],
        ["Dann lassen Sie uns die beiden Konfliktpunkte trennen.","پس دو نقطه اختلاف را جدا کنیم."],
        ["Beim Ziel sind wir uns eigentlich einig.","در هدف در واقع توافق داریم."],
        ["Dann sollten wir nur noch über den Weg dorthin entscheiden.","پس فقط باید درباره مسیر رسیدن تصمیم بگیریم."]
      ],
      ["وظیفه Moderator در تنش چیست؟",["ساختار دادن و جداکردن موضوع از شخص","انتخاب برنده بحث","شدت‌دادن اختلاف"],0,"Moderation حرفه‌ای روند و موضوع را مدیریت می‌کند، نه اینکه طرف یک شخص را بگیرد."]),

    L("C2",4,"معنای ضمنی و لحن","Implikatur und Unterton",
      "معنای صریح را از ضمنی، کنایه، فاصله‌گذاری و لحن نهادی جدا کنی.",
      ["Die Formulierung ist formal zustimmend, signalisiert durch den Zusatz jedoch deutliche Distanz.","عبارت در ظاهر موافق است، اما با بخش افزوده فاصله‌گذاری روشنی نشان می‌دهد."],
      [
        ["der Unterton","لحن ضمنی","Die Bemerkung hat einen kritischen Unterton.","Nomen","die Untertöne","","einen Unterton erkennen","neutral"],
        ["die Implikatur","معنای ضمنی","Die Implikatur ergibt sich aus dem Kontext.","Nomen","die Implikaturen","","eine Implikatur erschließen","linguistic"],
        ["andeuten","تلویحاً اشاره کردن","Er deutet Zweifel an.","Verb","","trennbar + Akkusativ","Kritik andeuten","formal"],
        ["suggerieren","القای ضمنی کردن","Der Titel suggeriert Sicherheit.","Verb","","+ Akkusativ","einen Eindruck suggerieren","formal"],
        ["distanzieren","فاصله‌گذاری کردن","Die Autorin distanziert sich von der Aussage.","Verb","","sich von + Dativ","sich von einer Position distanzieren","formal"]
      ],
      [
        ["Ist die Aussage eindeutig positiv?","آیا گزاره کاملاً مثبت است؟"],
        ["Nein. Der Zusatz „zumindest vorläufig“ relativiert die Zustimmung.","نه؛ افزودن «دست‌کم موقتاً» موافقت را محدود می‌کند."],
        ["Was signalisiert das?","چه چیزی را نشان می‌دهد؟"],
        ["Vorsicht und Distanz zur endgültigen Bewertung.","احتیاط و فاصله از ارزیابی نهایی."]
      ],
      ["suggerieren چه تفاوتی با sagen دارد؟",["چیزی را القا می‌کند بدون اینکه لزوماً صریح بگوید","همیشه دقیقاً مترادف است","فقط در گذشته می‌آید"],0,"suggerieren بر اثر ضمنی و برداشت مخاطب تأکید دارد."]),

    L("C2",5,"بحث تخصصی با عدم قطعیت","Expertendiskussion und Unsicherheit",
      "سطح اطمینان، محدودیت داده و سناریوهای جایگزین را دقیق در موضع تخصصی وارد کنی.",
      ["Nach heutigem Kenntnisstand ist diese Erklärung plausibel, aber keineswegs alternativlos.","بر اساس دانش فعلی این توضیح معقول است، اما تنها توضیح ممکن نیست."],
      [
        ["der Kenntnisstand","سطح دانش موجود","Nach heutigem Kenntnisstand gilt …","Nomen","","meist Singular","nach aktuellem Kenntnisstand","academic"],
        ["die Plausibilität","معقول‌بودن","Die Plausibilität ist hoch, aber nicht bewiesen.","Nomen","","meist Singular","Plausibilität prüfen","academic"],
        ["die Unsicherheit","عدم قطعیت","Die Unsicherheit bleibt erheblich.","Nomen","die Unsicherheiten","","Unsicherheit quantifizieren","academic"],
        ["vorläufig","موقت/غیرنهایی","Das Ergebnis ist vorläufig.","Adjektiv/Adverb","","","vorläufig bewerten","academic"],
        ["vorbehalten","محفوظ نگه‌داشتن","Eine endgültige Bewertung bleibt weiteren Daten vorbehalten.","Partizip/Verb","","Dativ","einer Prüfung vorbehalten bleiben","formal"]
      ],
      [
        ["Wie sicher ist die Schlussfolgerung?","نتیجه چقدر قطعی است؟"],
        ["Sie ist plausibel, aber durch die Datenlage noch nicht endgültig abgesichert.","معقول است اما با داده‌های فعلی هنوز قطعی نشده."],
        ["Welche Alternative bleibt offen?","چه آلترناتیوی باز می‌ماند؟"],
        ["Ein Teil des Effekts könnte durch unbeobachtete Faktoren erklärt werden.","بخشی از اثر ممکن است با عوامل مشاهده‌نشده توضیح داده شود."]
      ],
      ["Hedging در زبان تخصصی چه فایده‌ای دارد؟",["سطح قطعیت را متناسب با شواهد نشان می‌دهد","متن را عمداً مبهم می‌کند","همه ادعاها را ضعیف می‌کند"],0,"Hedging دقیق، قدرت ادعا را با کیفیت شواهد تنظیم می‌کند."])
  ];

  const grammarRows=[
    ["A1","Satzklammer im Hauptsatz","در افعال جداشدنی و Perfekt بخش دوم ساختار به انتهای جمله می‌رود.","Ich stehe um sieben Uhr auf. / Ich habe heute gearbeitet.","Ich aufstehe um sieben. → Ich stehe um sieben auf."],
    ["A1","Modalverb + Infinitiv","Modalverb صرف می‌شود و Infinitiv اصلی در پایان می‌آید.","Ich muss morgen arbeiten.","Ich muss arbeite. → Ich muss arbeiten."],
    ["A1","Akkusativ nach haben/brauchen","بعد از بسیاری افعال متعدی مفعول مستقیم Akkusativ است.","Ich brauche einen Termin.","Ich brauche ein Termin. → einen Termin."],
    ["A1","Höfliche Bitte mit können","برای درخواست مؤدبانه می‌توان از Können Sie …? استفاده کرد.","Können Sie mir bitte helfen?","Hilf mir! در موقعیت رسمی بیش از حد مستقیم است."],

    ["A2","Nebensatz mit weil/dass/ob","در جمله وابسته فعل صرف‌شده به پایان می‌رود.","Ich weiß, dass der Termin morgen ist.","…, dass der Termin ist morgen. → … morgen ist."],
    ["A2","Wechselpräposition: Ort vs Richtung","Wo? معمولاً Dativ و Wohin? معمولاً Akkusativ می‌گیرد.","Das Bild hängt an der Wand. Ich hänge es an die Wand.","حرکت فیزیکی همیشه Akkusativ نیست؛ جهت/مقصد مهم است."],
    ["A2","Pronominaladverbien da-/wo-","برای چیزها: daran/darauf و woran/worauf؛ برای اشخاص معمولاً Präposition + Pronomen.","Woran denkst du? – Ich denke daran.","Woran denkst du an? → ساخت دوگانه غلط است."],
    ["A2","Adjektivdeklination nach ein-/kein-","پایان صفت اطلاعاتی را که Artikel نشان نمی‌دهد تکمیل می‌کند.","ein guter Kurs / eine gute Idee / kein neues Problem","صفت همیشه -e نمی‌گیرد."],

    ["B1","Relativsatz mit Kasus","Kasus ضمیر موصولی از نقش آن در جمله موصولی می‌آید.","Das ist die Kollegin, der ich geholfen habe.","Kasus را از اسم قبلی حدس نزن."],
    ["B1","Passiv Vorgang vs Zustand","werden + Partizip II روند و sein + Partizip II وضعیت نتیجه را نشان می‌دهد.","Der Antrag wird geprüft. / Der Antrag ist geprüft.","wird geprüft و ist geprüft یک معنا ندارند."],
    ["B1","Konjunktiv II für Höflichkeit und Irrealität","würde/könnte/hätte/wäre برای درخواست، فرض یا آرزو استفاده می‌شود.","Könnten Sie den Termin verschieben?","Kannst du … در محیط رسمی همیشه مناسب نیست."],
    ["B1","Indirekte Frage","کلمه پرسشی/ob + جمله وابسته با فعل در پایان.","Können Sie mir sagen, wann der Zug fährt?","…, wann fährt der Zug? → … wann der Zug fährt."],

    ["B2","Nominalisierung und Verbalstil","متن رسمی می‌تواند فعل را اسمی کند، ولی زیاده‌روی خوانایی را کم می‌کند.","Wir prüfen den Antrag. → Die Prüfung des Antrags erfolgt …","Nominalstil را فقط برای رسمی‌تر شدن بی‌دلیل زیاد نکن."],
    ["B2","Partizipien als Adjektive","Partizip I روند فعال و Partizip II نتیجه/حالت را می‌تواند فشرده کند.","die steigenden Kosten / die abgeschlossene Prüfung","Partizip باید از نظر معنا با اسم هماهنگ باشد."],
    ["B2","Konnektoren mit Satzstellung","dennoch/deshalb/trotzdem می‌توانند جای اول باشند و فعل همچنان جای دوم است.","Die Frist ist knapp. Dennoch halten wir sie ein.","Dennoch wir halten … → Dennoch halten wir …"],
    ["B2","Passiversatzformen","sich lassen + Infinitiv و sein + zu + Infinitiv می‌توانند امکان/ضرورت را بیان کنند.","Das Problem lässt sich lösen. / Die Frist ist einzuhalten.","هر Passiv را نمی‌توان بدون تغییر معنا جایگزین کرد."],

    ["C1","Konjunktiv I in indirekter Rede","برای گزارش فاصله‌گذارانه سخن دیگران، Konjunktiv I رایج است.","Die Autorin erklärt, der Effekt sei begrenzt.","Indikativ می‌تواند فاصله گزارشگر را کمتر کند."],
    ["C1","Hedging mit Modalität","dürfte, könnte, scheint, spricht dafür سطح قطعیت را تنظیم می‌کنند.","Der Effekt dürfte kleiner sein als zunächst angenommen.","Hedging با تردید بی‌دلیل یکی نیست."],
    ["C1","Erweiterte Attributgruppen","اطلاعات فشرده پیش از اسم می‌تواند با Partizip و Ergänzungen ساخته شود.","die im Bericht ausführlich beschriebenen Risiken","زنجیره بیش از حد طولانی خوانایی را کاهش می‌دهد."],
    ["C1","Kohäsion durch Verweisstrukturen","dabei, dadurch, demgegenüber, insofern ارتباط منطقی میان بخش‌ها را دقیق می‌کنند.","Die Kosten steigen. Demgegenüber sinkt der Zeitaufwand.","Konnektor باید رابطه واقعی دو گزاره را نشان دهد."],

    ["C2","Informationsstruktur und Fokus","جایگاه جمله و ساختار cleft/Topik می‌تواند تمرکز معنایی را عوض کند.","Entscheidend ist nicht die Menge, sondern die Qualität der Evidenz.","جابجایی صرف واژه‌ها همیشه خنثی نیست."],
    ["C2","Präsupposition und Skopus","واژه‌هایی مثل sogar, nur, wieder و Negation پیش‌فرض و دامنه معنایی ایجاد می‌کنند.","Nicht alle Ergebnisse waren robust. ≠ Alle Ergebnisse waren nicht robust.","دامنه نفی را باید دقیق کنترل کرد."],
    ["C2","Modalpartikeln und Register","doch, eben, ja, wohl در گفتار نگرش گوینده را ظریف منتقل می‌کنند و در متن رسمی محدودترند.","Das ist ja gerade der Punkt.","ترجمه واژه‌به‌واژه Modalpartikel معمولاً جواب نمی‌دهد."],
    ["C2","Verdichtung vs Klarheit","Nominalisierung، Ellipse و Partizipialkonstruktion متن را فشرده می‌کنند اما باید شفافیت حفظ شود.","Vorbehaltlich weiterer Prüfung bleibt die Bewertung vorläufig.","فشردگی بالا بدون ساختار روشن می‌تواند ابهام بسازد."]
  ].map((x,i)=>({id:"s3-g-"+x[0].toLowerCase()+"-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],rule:x[2],example:x[3],mistake:x[4],stage3:true}));

  const redemittelByLevel={
    A1:["Ich möchte …","Können Sie mir bitte helfen?","Wo finde ich …?","Wann ist der Termin?","Ich habe ein Problem mit …","Das passt mir gut."],
    A2:["Könnten wir den Termin verschieben?","Welche Unterlagen brauche ich dafür?","Ist … im Preis enthalten?","Ich möchte mich kurz erkundigen.","Falls das nicht möglich ist, …","Bitte geben Sie mir Bescheid."],
    B1:["Ich möchte mich nach … erkundigen.","Ich kann Ihren Punkt nachvollziehen, aber …","Meiner Erfahrung nach …","Könnten wir uns darauf einigen, dass …?","Der Grund dafür ist, dass …","Zusammenfassend würde ich sagen, dass …"],
    B2:["Wenn ich Sie richtig verstanden habe, …","Unter der Voraussetzung, dass …","Man könnte einwenden, dass …","Dem steht allerdings entgegen, dass …","Daraus lässt sich ableiten, dass …","Ich würde folgenden Kompromiss vorschlagen: …"],
    C1:["Dem Argument kann ich teilweise folgen; allerdings …","Aus den vorliegenden Daten geht hervor, dass …","Diese Schlussfolgerung gilt nur unter der Annahme, dass …","Ein wesentlicher Einwand besteht darin, dass …","Unter Berücksichtigung dieser Einschränkung …","Die Befunde sollten daher vorsichtig interpretiert werden."],
    C2:["Nach heutigem Kenntnisstand spricht vieles dafür, dass …","Die Aussage ist insofern zu relativieren, als …","Unter einer engeren Auslegung ließe sich argumentieren, dass …","Der scheinbare Widerspruch löst sich auf, wenn man …","Vorbehaltlich weiterer Evidenz würde ich …","Entscheidend ist weniger X als vielmehr Y."]
  };
  const redemittel=[];
  Object.entries(redemittelByLevel).forEach(([level,arr])=>arr.forEach((text,i)=>redemittel.push({id:"s3-rm-"+level.toLowerCase()+"-"+(i+1),level,text,stage3:true})));

  const writingByLevel={
    A1:["یک پیام ۵ جمله‌ای برای تغییر وقت بنویس و یک زمان جدید پیشنهاد بده.","یک یادداشت کوتاه برای صاحبخانه درباره خرابی گرمایش بنویس.","در ۶ جمله خودت، محل زندگی و برنامه فردا را معرفی کن."],
    A2:["یک ایمیل کوتاه درباره سؤال از Nebenkosten و Kaution بنویس.","یک گزارش ساده خسارت برای بیمه در ۸۰ تا ۱۰۰ واژه بنویس.","برای تغییر شیفت با همکار پیام مؤدبانه بنویس و دلیل کوتاه بده."],
    B1:["یک ایمیل رسمی برای پیگیری Bearbeitungsstand در ۱۲۰ واژه بنویس.","یک Bewerbung کوتاه با تجربه، نقطه قوت و زمان شروع بنویس.","یک سوءتفاهم کاری را بی‌طرف توضیح بده و راه‌حل پیشنهاد کن."],
    B2:["یک Projektstatus در ۱۸۰ واژه با Status, Risiko, Maßnahme, nächster Schritt بنویس.","یک شکایت رسمی با شرح نقص، شواهد، خواسته و مهلت پاسخ بنویس.","یک Stellungnahme درباره Homeoffice با Einwand و پاسخ بنویس."],
    C1:["یک Zusammenfassung علمی ۲۲۰ واژه‌ای شامل Kernaussage, Evidenz, Einschränkung بنویس.","یک تحلیل Bescheid با Frist, Rechtsgrundlage و گزینه‌های اقدام بنویس.","یک TestDaF-Stellungnahme با توصیف داده، دو دیدگاه و موضع نهایی بنویس."],
    C2:["دو نتیجه پژوهشی متعارض را در یک Synthese ۳۰۰ واژه‌ای ترکیب کن.","یک بند قراردادی مبهم را با دو Auslegung و پیامد هرکدام تحلیل کن.","یک نقد تخصصی را با Hedging، Gegenargument و محدودیت شواهد بازنویسی کن."]
  };
  const speakingByLevel={
    A1:["در ۴۵ ثانیه هدف مراجعه به Bürgeramt و مدارکی که داری را بگو.","در نقش بیمار، دو علامت و مدت آن را به پزشک توضیح بده.","در ایستگاه درباره Gleis و Umsteigen سؤال کن."],
    A2:["در ۶۰ ثانیه یک Schaden را به بیمه گزارش کن.","برای تعویض شیفت با همکار مذاکره کوتاه انجام بده.","مشکل لغو قطار را توضیح بده و راه‌حل جایگزین بخواه."],
    B1:["در مصاحبه شغلی یک تجربه را با Beispiel توضیح بده.","وضعیت درخواست اداری را تلفنی پیگیری کن.","یک تعارض تیمی را بدون سرزنش جمع‌بندی و راه‌حل پیشنهاد کن."],
    B2:["Projektstatus را در ۹۰ ثانیه با ریسک و اقدام اصلاحی ارائه کن.","مذاکره قیمت و مدت قرارداد را با یک امتیاز متقابل انجام بده.","درباره یک سیاست عمومی موافق و مخالف را مقایسه و موضع خودت را بگو."],
    C1:["یک مقاله را با Kernaussage، Evidenz و Einschränkung در دو دقیقه خلاصه کن.","در سمینار به یک Einwand پاسخ دقیق و غیرشخصی بده.","یک Grafik را توصیف و سپس با احتیاط تفسیر کن."],
    C2:["دو مطالعه متعارض را در دو دقیقه Synthese کن.","یک بند مبهم قرارداد را با دو تفسیر توضیح بده.","در بحث پرتنش، نقاط اختلاف را تفکیک و یک مسیر تصمیم پیشنهاد کن."]
  };
  const writing=[],speaking=[];
  Object.entries(writingByLevel).forEach(([level,arr])=>arr.forEach((prompt,i)=>writing.push({id:"s3-w-"+level.toLowerCase()+"-"+(i+1),level,prompt,stage3:true})));
  Object.entries(speakingByLevel).forEach(([level,arr])=>arr.forEach((prompt,i)=>speaking.push({id:"s3-s-"+level.toLowerCase()+"-"+(i+1),level,prompt,stage3:true})));

  const reading=[
    ["A1","Bürgeramt Öffnungszeiten","Das Bürgeramt ist montags bis freitags geöffnet. Am Mittwoch schließt es bereits um 14 Uhr. Für die Anmeldung brauchen Sie einen Termin und einen Ausweis.",["چه روزی اداره زودتر بسته می‌شود؟","برای Anmeldung چه چیزهایی لازم است؟"]],
    ["A1","Zuganzeige","Der Zug nach Bonn fährt heute um 10:25 Uhr von Gleis 7. Wegen Bauarbeiten hält er nicht in Brühl.",["قطار چه ساعتی و از کدام سکو حرکت می‌کند؟","در کدام ایستگاه توقف ندارد؟"]],
    ["A2","Nebenkostenabrechnung","In der Abrechnung sind Heizung, Wasser und Hausreinigung enthalten. Strom und Internet gehören nicht zu den Nebenkosten und werden separat bezahlt.",["چه هزینه‌هایی شامل Nebenkosten هستند؟","چه چیزهایی جدا پرداخت می‌شوند؟"]],
    ["A2","Versicherungsmeldung","Bitte melden Sie den Schaden innerhalb von sieben Tagen. Fügen Sie Fotos, die Rechnung und eine kurze Beschreibung des Hergangs bei.",["مهلت گزارش خسارت چقدر است؟","چه مدارکی باید ضمیمه شود؟"]],
    ["B1","Bewerbungsportal","Für eine vollständige Bewerbung laden Sie bitte Lebenslauf und Zeugnisse als PDF hoch. Ein Anschreiben ist optional. Nach Eingang erhalten Sie automatisch eine Bestätigung.",["چه مدارکی اجباری است؟","بعد از ارسال چه اتفاقی می‌افتد؟"]],
    ["B1","Bearbeitungsstand","Ihr Antrag wird derzeit geprüft. Für die abschließende Bearbeitung fehlt noch eine aktuelle Meldebescheinigung. Sobald das Dokument vorliegt, kann die Entscheidung vorbereitet werden.",["پرونده در چه وضعیتی است؟","چه مدرکی کم است؟"]],
    ["B2","Projektentscheidung","Das Team empfiehlt, die Einführung um zwei Wochen zu verschieben. Zwar ist die Kernfunktion fertig, doch die Sicherheitstests sind noch nicht abgeschlossen. Ein früher Start würde das Betriebsrisiko unnötig erhöhen.",["پیشنهاد تیم چیست؟","دلیل اصلی این پیشنهاد چیست؟"]],
    ["B2","Beschwerdeantwort","Wir bedauern die Verzögerung. Nach Prüfung Ihres Falls erstatten wir 30 Prozent des Rechnungsbetrags. Eine vollständige Erstattung ist nicht vorgesehen, da die Leistung teilweise erbracht wurde.",["چه راه‌حلی پیشنهاد شده؟","چرا بازپرداخت کامل نیست؟"]],
    ["C1","Kausalität und Evidenz","Ein statistischer Zusammenhang allein genügt nicht, um Kausalität anzunehmen. Belastbare Kausalaussagen erfordern zusätzlich eine plausible Wirkungslogik und den systematischen Ausschluss alternativer Erklärungen.",["برای ادعای علیت چه چیزهایی علاوه بر همبستگی لازم است؟","متن چه خطایی را رد می‌کند؟"]],
    ["C1","Verwaltungsentscheidung","Die Behörde stützt ihre Entscheidung auf zwei Rechtsgrundlagen. Gegen den Bescheid kann innerhalb eines Monats nach Zustellung Widerspruch eingelegt werden. Die Begründung muss sich auf den konkreten Sachverhalt beziehen.",["مهلت اعتراض از چه زمانی محاسبه می‌شود؟","اعتراض باید به چه چیزی مربوط باشد؟"]],
    ["C2","Robustheit und Übertragbarkeit","Dass ein Ergebnis gegenüber mehreren Modellvarianten robust ist, erhöht das Vertrauen in die interne Stabilität der Analyse. Daraus folgt jedoch nicht automatisch, dass derselbe Effekt in anderen Institutionen oder Populationen auftreten wird.",["Robustheit چه چیزی را تقویت می‌کند؟","چه نتیجه‌ای را نمی‌توان خودکار گرفت؟"]],
    ["C2","Sprache als Positionierung","Formulierungen wie „zumindest vorläufig“ oder „nach heutigem Kenntnisstand“ schwächen eine Aussage nicht beliebig ab. Sie markieren vielmehr, auf welcher Evidenzstufe die Sprecherin ihre Behauptung verortet.",["این عبارات چه کارکردی دارند؟","آیا فقط برای مبهم کردن متن‌اند؟"]]
  ].map((x,i)=>({id:"s3-read-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],text:x[2],questions:x[3],stage3:true}));

  const listening=[
    ["A1","Termin beim Amt","Ihr Termin ist am Dienstag um neun Uhr. Bitte kommen Sie zehn Minuten früher und bringen Sie Ihren Ausweis mit.",["Tag","Uhrzeit","Dokument"]],
    ["A1","Bahnhof","Der Regionalzug nach Aachen hat heute etwa fünfzehn Minuten Verspätung. Die Abfahrt erfolgt von Gleis drei.",["Verspätung","Gleis"]],
    ["A2","Versicherung","Für die Schadensmeldung brauchen wir Fotos und die Rechnung. Sie können beide Dokumente direkt in der App hochladen.",["Dokumente","Übermittlungsweg"]],
    ["A2","Schichttausch","Ich kann deine Schicht am Samstag übernehmen, wenn du dafür am Montag die Frühschicht machst. Gib mir bitte bis heute Abend Bescheid.",["Bedingung","Frist"]],
    ["B1","Behörde","Ihr Antrag ist eingegangen, aber uns fehlt noch die Meldebescheinigung. Sobald sie vorliegt, können wir die Bearbeitung fortsetzen.",["Status","fehlendes Dokument","nächster Schritt"]],
    ["B1","Teamkonflikt","Ich glaube, wir haben uns bei der Aufgabenverteilung missverstanden. Lass uns kurz klären, wer welchen Teil bis Freitag übernimmt.",["Problem","Lösung","Frist"]],
    ["B2","Projektmeeting","Die Entwicklung ist im Wesentlichen abgeschlossen. Offen sind noch die Sicherheitstests. Wenn wir die Dokumentation parallel fertigstellen, können wir den Termin voraussichtlich halten.",["Status","offen","Maßnahme"]],
    ["B2","Verhandlung","Beim Preis könnten wir Ihnen um fünf Prozent entgegenkommen. Dafür bräuchten wir allerdings eine Laufzeit von mindestens zwei Jahren.",["Angebot","Gegenleistung"]],
    ["C1","Seminar","Die Studie zeigt einen signifikanten Zusammenhang, doch wegen der kleinen Stichprobe ist unklar, wie gut sich das Ergebnis auf andere Gruppen übertragen lässt.",["Befund","Einschränkung","Übertragbarkeit"]],
    ["C1","Bescheid","Die Widerspruchsfrist beträgt einen Monat und beginnt mit der Zustellung des Bescheids. Entscheidend ist daher das dokumentierte Zustelldatum.",["Frist","Beginn","entscheidendes Datum"]],
    ["C2","Fachgespräch","Ich würde die These nicht verwerfen, aber ihre Reichweite deutlich begrenzen. Die Daten stützen sie für diesen Kontext, nicht jedoch ohne Weiteres für andere Institutionen.",["Zugeständnis","Begrenzung","Kontext"]],
    ["C2","Moderation","Beide Seiten stimmen dem Ziel zu, unterscheiden sich aber bei der Risikobewertung. Es wäre deshalb sinnvoll, zunächst die strittigen Annahmen transparent zu machen.",["Gemeinsamkeit","Dissens","nächster Schritt"]]
  ].map((x,i)=>({id:"s3-listen-"+String(i+1).padStart(2,"0"),level:x[0],title:x[1],script:x[2],focus:x[3],stage3:true}));

  const exams=[
    ["Goethe","B1","Schreiben","Formelle E-Mail","برای جابه‌جایی یک قرار رسمی، دلیل، زمان جایگزین و درخواست تأیید بنویس.",25],
    ["Goethe","B2","Sprechen","Präsentation","در ۳ دقیقه مزایا و معایب Homeoffice را ارائه و نتیجه‌گیری کن.",8],
    ["Goethe","C1","Schreiben","Argumentativer Text","یک موضوع اجتماعی را با Einwand، Gegenargument و موضع نهایی تحلیل کن.",45],
    ["Goethe","C2","Sprechen","Nuancierte Diskussion","یک موضع پیچیده را بدون حکم مطلق و با محدودیت‌ها دفاع کن.",15],

    ["telc","B1","Sprechen","Gemeinsam planen","با شریک فرضی برای یک دوره آموزشی زمان، بودجه و وظایف را توافق کن.",8],
    ["telc","B2","Schreiben","Beschwerde","شکایت رسمی با شرح نقص، درخواست جبران و مهلت پاسخ بنویس.",30],
    ["telc","C1","Sprechen","Diskussion","به یک موضع مخالف پاسخ بده و دو معیار تصمیم‌گیری را وزن بده.",12],
    ["telc","C2","Lesen","Implizite Bedeutung","لحن، فاصله‌گذاری و پیش‌فرض‌های یک متن پیچیده را تحلیل کن.",30],

    ["TestDaF","B2","Sprechen","Hochschulsituation","برای حل یک مشکل ثبت‌نام دانشگاهی تلفنی راه‌حل بخواه و گزینه‌ها را مقایسه کن.",4],
    ["TestDaF","C1","Schreiben","Grafik + Stellungnahme","یک روند را دقیق توصیف، تفسیر محتاطانه و سپس موضع خود را مستدل کن.",35],
    ["TestDaF","C1","Hören","Vorlesung","از یک سخنرانی نکته اصلی، دو دلیل و یک محدودیت را یادداشت و بازگو کن.",12],
    ["TestDaF","C1","Lesen","Wissenschaftlicher Text","ادعا، شواهد، فرض‌ها و محدودیت‌های متن را استخراج کن.",30],

    ["ÖSD","B1","Schreiben","Anfrage","برای یک دوره آموزشی اطلاعات زمان، هزینه و شرایط ثبت‌نام را رسمی درخواست کن.",25],
    ["ÖSD","B2","Sprechen","Diskussion","دو گزینه حمل‌ونقل را با هزینه، زمان و پایداری مقایسه کن.",10],
    ["ÖSD","C1","Schreiben","Stellungnahme","یک تصمیم عمومی را با معیارها، پیامدها و موضع نهایی تحلیل کن.",40],
    ["ÖSD","C2","Sprechen","Synthese","دو موضع متعارض را منصفانه جمع‌بندی و یک Synthese ارائه کن.",15]
  ].map((x,i)=>({id:"s3-exam-"+String(i+1).padStart(2,"0"),exam:x[0],level:x[1],skill:x[2],title:x[3],task:x[4],minutes:x[5],stage3:true}));

  const extraLexicon=[
    ["A1","die Wohnungsgeberbestätigung","Nomen","تأییدیه صاحبخانه","die Wohnungsgeberbestätigungen","","eine Wohnungsgeberbestätigung vorlegen","Bitte bringen Sie die Wohnungsgeberbestätigung mit.","formal"],
    ["A1","die Öffnungszeit","Nomen","ساعت کاری","die Öffnungszeiten","","Öffnungszeiten beachten","Die Öffnungszeiten stehen online.","neutral"],
    ["A1","die Praxis","Nomen","مطب","die Praxen","","in einer Praxis anrufen","Die Praxis öffnet um acht Uhr.","neutral"],
    ["A1","gültig","Adjektiv","معتبر","","","gültig sein","Das Ticket ist noch gültig.","neutral"],
    ["A1","abholen","Verb","تحویل گرفتن","","trennbar + Akkusativ","ein Paket abholen","Ich hole das Paket morgen ab.","neutral"],
    ["A1","vereinbaren","Verb","تعیین/توافق کردن","","+ Akkusativ","einen Termin vereinbaren","Ich möchte einen Termin vereinbaren.","neutral"],

    ["A2","die Warmmiete","Nomen","اجاره با هزینه‌های جانبی","die Warmmieten","","Warmmiete zahlen","Die Warmmiete beträgt 980 Euro.","formal"],
    ["A2","die Haftpflichtversicherung","Nomen","بیمه مسئولیت شخصی","die Haftpflichtversicherungen","","eine Haftpflichtversicherung abschließen","Ich habe eine Haftpflichtversicherung.","formal"],
    ["A2","die Frühschicht","Nomen","شیفت صبح","die Frühschichten","","Frühschicht übernehmen","Am Montag habe ich Frühschicht.","neutral"],
    ["A2","die IBAN","Nomen","شماره حساب بین‌المللی","die IBANs","","IBAN prüfen","Bitte prüfen Sie die IBAN.","formal"],
    ["A2","die Fahrgastrechte","Nomen","حقوق مسافر","","Plural","Fahrgastrechte kennen","Informationen zu Fahrgastrechten finden Sie online.","formal"],
    ["A2","separat","Adjektiv/Adverb","جداگانه","","","separat bezahlen","Strom wird separat bezahlt.","neutral"],

    ["B1","das Aktenzeichen","Nomen","شماره پرونده","die Aktenzeichen","","Aktenzeichen angeben","Bitte nennen Sie das Aktenzeichen.","formal"],
    ["B1","die Meldebescheinigung","Nomen","گواهی ثبت آدرس","die Meldebescheinigungen","","Meldebescheinigung einreichen","Die Meldebescheinigung fehlt noch.","formal"],
    ["B1","die Aufgabenteilung","Nomen","تقسیم کار","die Aufgabenteilungen","","Aufgabenteilung klären","Wir klären die Aufgabenteilung.","neutral"],
    ["B1","arbeitsunfähig","Adjektiv","ناتوان موقت برای کار","","","arbeitsunfähig sein","Ich bin bis Mittwoch arbeitsunfähig.","formal"],
    ["B1","vorsichtshalber","Adverb","برای احتیاط","","","vorsichtshalber ändern","Ändern Sie vorsichtshalber Ihr Passwort.","neutral"],
    ["B1","die Zwei-Faktor-Authentifizierung","Nomen","احراز هویت دومرحله‌ای","","meist Singular","Zwei-Faktor-Authentifizierung aktivieren","Aktivieren Sie die Zwei-Faktor-Authentifizierung.","formal"],

    ["B2","die Risikobewertung","Nomen","ارزیابی ریسک","die Risikobewertungen","","Risikobewertung aktualisieren","Die Risikobewertung wird aktualisiert.","formal"],
    ["B2","die Preisgarantie","Nomen","تضمین قیمت","die Preisgarantien","","Preisgarantie vereinbaren","Wir brauchen eine verbindliche Preisgarantie.","formal"],
    ["B2","die Stichprobe","Nomen","نمونه آماری","die Stichproben","","Stichprobe untersuchen","Die Stichprobe ist relativ klein.","academic"],
    ["B2","die Erstattung","Nomen","بازپرداخت","die Erstattungen","","Erstattung verlangen","Ich bitte um vollständige Erstattung.","formal"],
    ["B2","der Zielkonflikt","Nomen","تعارض اهداف","die Zielkonflikte","","Zielkonflikt abwägen","Zwischen Kosten und Qualität besteht ein Zielkonflikt.","formal"],
    ["B2","verbindlich","Adjektiv","قطعی/الزام‌آور","","","verbindlich zusagen","Wir brauchen eine verbindliche Zusage.","formal"],

    ["C1","die Repräsentativität","Nomen","نمایندگی آماری","","meist Singular","Repräsentativität prüfen","Die Repräsentativität der Stichprobe ist begrenzt.","academic"],
    ["C1","die Kausalannahme","Nomen","فرض علیت","die Kausalannahmen","","Kausalannahme prüfen","Die Kausalannahme muss begründet werden.","academic"],
    ["C1","die Rechtsbehelfsfrist","Nomen","مهلت اقدام/اعتراض قانونی","die Rechtsbehelfsfristen","","Rechtsbehelfsfrist einhalten","Die Rechtsbehelfsfrist beträgt einen Monat.","legal"],
    ["C1","die Operationalisierung","Nomen","عملیاتی‌سازی مفهوم","die Operationalisierungen","","Variable operationalisieren","Die Operationalisierung ist transparent.","academic"],
    ["C1","der Gegenbefund","Nomen","یافته مخالف","die Gegenbefunde","","Gegenbefund berücksichtigen","Der Gegenbefund relativiert die These.","academic"],
    ["C1","methodisch","Adjektiv/Adverb","روش‌شناختی","","","methodisch begründen","Die Auswahl ist methodisch begründet.","academic"],

    ["C2","die Mehrdeutigkeit","Nomen","چندمعنایی","die Mehrdeutigkeiten","","Mehrdeutigkeit auflösen","Die Mehrdeutigkeit lässt zwei Auslegungen zu.","academic"],
    ["C2","die Evidenzstufe","Nomen","سطح قدرت شواهد","die Evidenzstufen","","Evidenzstufe kennzeichnen","Die Formulierung markiert eine niedrige Evidenzstufe.","academic"],
    ["C2","die Gegenhypothese","Nomen","فرضیه جایگزین","die Gegenhypothesen","","Gegenhypothese prüfen","Eine Gegenhypothese bleibt plausibel.","academic"],
    ["C2","die Reichweite","Nomen","دامنه اعتبار","die Reichweiten","","Reichweite einer Aussage begrenzen","Die Reichweite der Aussage ist begrenzt.","academic"],
    ["C2","die Deeskalation","Nomen","کاهش تنش","","meist Singular","Deeskalation ermöglichen","Die Moderation zielt auf Deeskalation.","formal"],
    ["C2","alternativlos","Adjektiv","بدون گزینه جایگزین","","","nicht alternativlos sein","Diese Erklärung ist keineswegs alternativlos.","academic"]
  ].map((x,i)=>({id:"s3-extra-"+x[0].toLowerCase()+"-"+String(i+1).padStart(2,"0"),level:x[0],lemma:x[1],pos:x[2],meaning:x[3],plural:x[4],grammar:x[5],collocation:x[6],example:x[7],register:x[8],stage3:true}));

  function lessonLexicon(){
    const out=[];
    lessons.forEach(lesson=>(lesson.words||[]).forEach((w,i)=>out.push({
      id:"s3-dict-"+lesson.id+"-"+(i+1),
      level:lesson.level,lemma:w[0],meaning:w[1],example:w[2],
      pos:w[3]||"Wort",plural:w[4]||"",grammar:w[5]||"",collocation:w[6]||"",register:w[7]||"neutral",
      sourceLessonId:lesson.id,stage3:true
    })));
    return out;
  }
  const dictionary=lessonLexicon().concat(extraLexicon);

  function pushUnique(arr,items,keyFn){
    if(!Array.isArray(arr))return 0;
    const seen=new Set(arr.map(keyFn));let added=0;
    items.forEach(x=>{const k=keyFn(x);if(!seen.has(k)){arr.push(x);seen.add(k);added++;}});
    return added;
  }

  function apply(targets){
    const t=targets||{},data=t.data,lib=t.lib,dict=t.dict,deep=t.deep;
    const result={lessons:0,grammar:0,redemittel:0,writing:0,speaking:0,reading:0,listening:0,exams:0,dictionary:0};
    if(data&&Array.isArray(data.lessons))result.lessons=pushUnique(data.lessons,lessons,x=>x.id);
    if(lib){
      result.grammar=pushUnique(lib.grammar,grammarRows,x=>x.id);
      result.redemittel=pushUnique(lib.redemittel,redemittel,x=>x.id);
      result.writing=pushUnique(lib.writing,writing,x=>x.id);
      result.speaking=pushUnique(lib.speaking,speaking,x=>x.id);
      result.reading=pushUnique(lib.reading,reading,x=>x.id);
      result.listening=pushUnique(lib.listening,listening,x=>x.id);
    }
    if(deep){
      pushUnique(deep.reading,reading,x=>x.id);
      pushUnique(deep.listening,listening,x=>x.id);
      result.exams=pushUnique(deep.exams,exams,x=>x.id);
    }
    if(dict){
      const addedCurated=pushUnique(dict.curated,dictionary,x=>x.level+"|"+String(x.lemma).toLocaleLowerCase("de-DE"));
      pushUnique(dict.all,dictionary,x=>x.level+"|"+String(x.lemma).toLocaleLowerCase("de-DE"));
      result.dictionary=addedCurated;
    }
    return result;
  }

  function summary(){
    const byLevel={};LEVELS.forEach(level=>byLevel[level]={
      lessons:lessons.filter(x=>x.level===level).length,
      grammar:grammarRows.filter(x=>x.level===level).length,
      redemittel:redemittel.filter(x=>x.level===level).length,
      writing:writing.filter(x=>x.level===level).length,
      speaking:speaking.filter(x=>x.level===level).length,
      reading:reading.filter(x=>x.level===level).length,
      listening:listening.filter(x=>x.level===level).length,
      dictionary:dictionary.filter(x=>x.level===level).length
    });
    return{version:VERSION,lessons:lessons.length,grammar:grammarRows.length,redemittel:redemittel.length,writing:writing.length,speaking:speaking.length,reading:reading.length,listening:listening.length,exams:exams.length,dictionary:dictionary.length,byLevel};
  }

  function audit(){
    const s=summary(),issues=[];
    LEVELS.forEach(level=>{
      const x=s.byLevel[level];
      if(x.lessons!==5)issues.push("lessons_"+level);
      if(x.grammar!==4)issues.push("grammar_"+level);
      if(x.redemittel<6)issues.push("redemittel_"+level);
      if(x.writing<3)issues.push("writing_"+level);
      if(x.speaking<3)issues.push("speaking_"+level);
      if(x.reading<2)issues.push("reading_"+level);
      if(x.listening<2)issues.push("listening_"+level);
      if(x.dictionary<25)issues.push("dictionary_"+level);
    });
    ["Goethe","telc","TestDaF","ÖSD"].forEach(exam=>{if(exams.filter(x=>x.exam===exam).length<4)issues.push("exam_"+exam);});
    lessons.forEach(l=>{
      if(!l.goal||!l.pattern||!l.pattern.de||!l.pattern.fa)issues.push("lesson_schema_"+l.id);
      if(!Array.isArray(l.words)||l.words.length!==5)issues.push("lesson_words_"+l.id);
      if(!Array.isArray(l.dialogue)||l.dialogue.length<3)issues.push("lesson_dialogue_"+l.id);
      if(!l.quiz||l.quiz.options.length!==3)issues.push("lesson_quiz_"+l.id);
    });
    return{pass:issues.length===0,issues,summary:s};
  }

  return{VERSION,LEVELS,lessons,grammar:grammarRows,redemittel,writing,speaking,reading,listening,exams,dictionary,apply,summary,audit};
});