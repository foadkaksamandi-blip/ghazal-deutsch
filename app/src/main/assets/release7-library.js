(function(root,factory){
  const lib=factory();
  if(typeof module==="object"&&module.exports)module.exports=lib;
  if(root)root.GhazalLibrary=lib;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const G={
    A1:[
      ["sein & haben","sein برای هویت/وضعیت و haben برای مالکیت و برخی حالت‌ها.","Ich bin müde. / Ich habe Zeit.","Ich habe 20 Jahre. → Ich bin 20 Jahre alt."],
      ["Präsens","فعل صرف‌شده معمولاً جای دوم جمله خبری است.","Heute arbeite ich zu Hause.","Heute ich arbeite … → Heute arbeite ich …"],
      ["W-Fragen","کلمه پرسشی + فعل + فاعل.","Wo wohnen Sie?","Wo Sie wohnen? → Wo wohnen Sie?"],
      ["Ja/Nein-Fragen","فعل صرف‌شده در آغاز سؤال می‌آید.","Kommen Sie aus Iran?","Sie kommen aus Iran? فقط در گفتار با آهنگ سؤال ممکن است."],
      ["Artikel","اسم‌ها با der/die/das و جمع die یاد گرفته می‌شوند.","der Tisch, die Lampe, das Buch","اسم را بدون Artikel یاد نگیر."],
      ["Akkusativ Basis","مفعول مستقیم مذکر: der → den / ein → einen.","Ich kaufe einen Kaffee.","Ich kaufe ein Kaffee. → einen Kaffee"],
      ["Dativ Basis","برای برخی فعل‌ها و حروف اضافه؛ der/das→dem، die→der.","Ich helfe dem Mann.","Ich helfe den Mann. → dem Mann"],
      ["Negation","nicht جمله/صفت/فعل را و kein اسم بدون Artikel معین را منفی می‌کند.","Ich komme nicht. / Ich habe kein Auto.","Ich habe nicht Auto. → kein Auto"],
      ["Trennbare Verben","پیشوند جداشدنی در جمله اصلی به پایان می‌رود.","Ich stehe um sieben auf.","Ich aufstehe … → Ich stehe … auf."],
      ["Perfekt Einführung","haben/sein + Partizip II برای گذشته محاوره‌ای.","Ich habe gearbeitet. / Ich bin gefahren.","Ich bin gearbeitet. → Ich habe gearbeitet."]
    ],
    A2:[
      ["Perfekt","افعال حرکتی/تغییر حالت اغلب با sein، بقیه غالباً با haben.","Wir sind angekommen. / Wir haben gegessen.","Hilfsverb باید با فعل هماهنگ باشد."],
      ["Präteritum häufig","sein/haben و modalها در گفتار هم بسیار رایج‌اند.","Ich war krank. / Ich musste arbeiten.","برای هر فعل لزوماً Präteritum روزمره طبیعی نیست."],
      ["Dativ/Akkusativ","گیرنده غالباً Dativ و چیز/شخص مستقیم Akkusativ.","Ich gebe dem Kollegen die Datei.","هر دو نقش را با ترتیب و Artikel تشخیص بده."],
      ["Wechselpräpositionen","Wo? → Dativ، Wohin? → Akkusativ.","Das Bild hängt an der Wand. / Ich hänge es an die Wand.","مکان و حرکت را از هم جدا کن."],
      ["weil / dass","فعل صرف‌شده در جمله وابسته پایان می‌رود.","Ich bleibe zu Hause, weil ich krank bin.","weil ich bin krank → weil ich krank bin"],
      ["wenn / ob","wenn برای شرط/تکرار و ob برای سؤال غیرمستقیم بله/خیر.","Wenn ich Zeit habe … / Ich weiß nicht, ob er kommt.","ob را با wenn جایگزین نکن."],
      ["Komparativ/Superlativ","-er / am …sten یا بی‌قاعده.","schneller / am schnellsten; gut / besser / am besten","mehr besser غلط است."],
      ["Reflexive Verben","ضمیر بازتابی با شخص تغییر می‌کند.","Ich interessiere mich für Musik.","Ich interessiere für … → mich"],
      ["Adjektivdeklination Basis","پایان صفت به Artikel و Kasus بستگی دارد.","ein gutes Buch / der gute Film","صفت را بدون توجه به Artikel صرف نکن."],
      ["Infinitiv mit zu","بسیاری ساختارها با zu + Infinitiv می‌آیند.","Ich versuche, pünktlich zu kommen.","Modalverben معمولاً بدون zu هستند."]
    ],
    B1:[
      ["Relativsätze","ضمیر موصولی نقش خود را داخل جمله وابسته می‌گیرد.","Das ist der Mann, dem ich geholfen habe.","Kasus را از نقش در Relativsatz تعیین کن."],
      ["Konjunktiv II Basis","برای ادب، آرزو، فرض.","Ich würde gern … / Könnten Sie …?","würde + Infinitiv را بی‌دلیل روی würde haben/sein ترجیح نده."],
      ["Passiv Einführung","werden + Partizip II برای تمرکز بر عمل.","Der Antrag wird geprüft.","werden و sein-Passiv را اشتباه نگیر."],
      ["Indirekte Fragen","سؤال غیرمستقیم با فعل در پایان.","Können Sie mir sagen, wann der Zug fährt?","… wann fährt der Zug? → wann der Zug fährt"],
      ["Connectors","deshalb/dennoch/trotzdem جای اول می‌آیند و فعل جای دوم می‌ماند.","Es regnet. Trotzdem gehe ich raus.","Trotzdem ich gehe … → Trotzdem gehe ich …"],
      ["Nominalisierung Basis","فعل/صفت می‌تواند اسم شود.","prüfen → die Prüfung; anmelden → die Anmeldung","Artikel و جنس اسم جدید را یاد بگیر."],
      ["Präpositionen mit Kasus","حروف اضافه الگوی Kasus ثابت دارند.","wegen des Wetters / mit dem Bus","هر Präposition را با Kasus یاد بگیر."],
      ["Satzklammer","بخش‌های فعل قاب جمله را می‌سازند.","Ich habe gestern lange gearbeitet.","اجزای فعل را پراکنده و بی‌قاعده نچین."],
      ["Partizip als Adjektiv","Partizip می‌تواند مانند صفت استفاده شود.","die geschlossene Tür / ein spannender Vortrag","پایان صفت همچنان لازم است."],
      ["Argumentation Basis","ادعا + دلیل + مثال + نتیجه.","Ich bin dafür, weil … Zum Beispiel … Deshalb …","فقط نظر بدون دلیل کافی نیست."]
    ],
    B2:[
      ["Konjunktiv II vertieft","فرض غیرواقعی حال/گذشته و ادب پیشرفته.","Wenn ich mehr Zeit hätte, würde ich … / Hätte ich das gewusst …","زمان فرض را درست انتخاب کن."],
      ["Konjunktiv I Einführung","برای نقل قول غیرمستقیم رسمی.","Er sagt, er sei krank.","اگر فرم با Indikativ یکسان شد، Konjunktiv II ممکن است لازم شود."],
      ["Passiv erweitert","Modalpassiv و Zustandspassiv.","Der Antrag muss geprüft werden. / Die Tür ist geschlossen.","Vorgang و Zustand را تفکیک کن."],
      ["Nominalstil","متون رسمی اسم‌محورترند، اما افراط نکن.","Nach Abschluss der Prüfung …","Nominalstil زیاد می‌تواند متن را سنگین کند."],
      ["Partizipialkonstruktionen","عبارت‌های فشرده با Partizip I/II.","die im Bericht genannten Zahlen","مرجع Partizip باید روشن باشد."],
      ["Präpositionaladverbien","darauf, damit, davon … برای اشیا/موضوعات.","Ich warte darauf, dass …","برای افراد معمولاً Präposition + Pronomen."],
      ["Informationsstruktur","معلوم → جدید، Topic → Focus.","Den Bericht habe ich gestern geschickt.","جابجایی باید هدف گفتمانی داشته باشد."],
      ["Registerabhängige Grammatik","ساختار رسمی/محاوره‌ای می‌تواند فرق کند.","wegen des Wetters / wegen dem Wetter (umgangssprachlich)","در نوشتار رسمی هنجار معیار را حفظ کن."],
      ["Konzessive Strukturen","obwohl, trotzdem, dennoch, zwar … aber.","Obwohl es teuer ist, … / Es ist teuer; dennoch …","نوع اتصال و جای فعل را رعایت کن."],
      ["Datenbeschreibung","روند را خنثی با فعل‌های دقیق توصیف کن.","Der Anteil stieg von 20 auf 35 Prozent.","تفسیر را با مشاهده داده قاطی نکن."]
    ],
    C1:[
      ["Indirekte Rede","Konjunktiv I/II برای فاصله‌گذاری از گفته منبع.","Die Autorin betont, dies sei nur vorläufig.","منبع و درجه قطعیت را روشن نگه دار."],
      ["Nominalstil vs Verbalstil","انتخاب سبک بر اساس متن و خوانایی.","Nach Durchführung … / Nachdem man … durchgeführt hatte …","فقط رسمی‌تر کردن لزوماً بهتر نیست."],
      ["Informationsverpackung","Vorfeld, Mittelfeld و Nachfeld برای وزن اطلاعات.","Besonders relevant ist, dass …","جمله را آن‌قدر فشرده نکن که خوانایی از بین برود."],
      ["Kohäsion","ارجاع، رابط و تکرار کنترل‌شده متن را می‌چسبانند.","Daraus folgt … / Dieser Befund …","رابط‌های زیاد بدون منطق کمک نمی‌کنند."],
      ["Diskursmarker","allerdings, insofern, demgegenüber, folglich …","Demgegenüber zeigt Studie B …","معنای دقیق هر Marker را حفظ کن."],
      ["Hedging","در متن علمی شدت ادعا را تنظیم کن.","Die Ergebnisse deuten darauf hin, dass …","behauptet/zeigt قطعی‌تر از deutet darauf hin است."],
      ["Komplexe Relativstrukturen","ضمیر موصولی با Präposition/Genitiv.","ein Ansatz, dessen Wirkung … / mit dem …","Kasus و مرجع را دقیق نگه دار."],
      ["Argumentationslogik","These → Begründung → Evidenz → Einwand → Schluss.","Ein möglicher Einwand … Dennoch …","نقد مخالف را منصفانه بازنمایی کن."],
      ["Stilvariation","یک معنا را رسمی، خنثی یا شخصی بازنویسی کن.","Das ist problematisch. / Dies erscheint problematisch.","Register باید با موقعیت هماهنگ باشد."],
      ["Akademische Synthese","چند منبع را مقایسه و ترکیب کن.","Während A …, hebt B … hervor.","منابع را با هم مخلوط نکن."]
    ],
    C2:[
      ["Nuancierung","درجه، استثنا و شرط را دقیق بیان کن.","Das gilt weitgehend, jedoch nicht uneingeschränkt.","از حکم مطلق بی‌دلیل پرهیز کن."],
      ["Implizite Bedeutung","معنای ضمنی، presupposition و کنایه را تشخیص بده.","Die Formulierung legt nahe, dass …","معنای ضمنی را با معنای صریح یکی نکن."],
      ["Registerkontrolle","آگاهانه بین colloquial, neutral, formal, academic جابه‌جا شو.","Das ist Quatsch. → Diese Schlussfolgerung überzeugt nicht.","لحن را مکانیکی عوض نکن؛ قصد ارتباطی را حفظ کن."],
      ["Idiomaticity","ترکیب طبیعی واژه‌ها بر ترجمه لفظی مقدم است.","eine Entscheidung treffen","*eine Entscheidung machen در این کاربرد طبیعی نیست."],
      ["Spontane Reformulierung","همان معنا را سریع و طبیعی بازبیان کن.","Anders formuliert … / Genauer gesagt …","بازگویی نباید معنای اصلی را تغییر دهد."],
      ["Diskursive Steuerung","بحث را باز، منحرف، برگردان و جمع‌بندی کن.","Lassen Sie uns zur Ausgangsfrage zurückkehren.","کنترل بحث را با قطع تهاجمی اشتباه نگیر."],
      ["Diplomatische Kritik","نقد شدید را دقیق اما حرفه‌ای بیان کن.","Es erscheint fraglich, ob …","Höflichkeit نباید نقد را بی‌معنا کند."],
      ["Mehrdeutigkeit","ابهام ساختاری/واژگانی را تشخیص و رفع کن.","Die Aussage lässt mehrere Auslegungen zu.","اگر ابهام مهم است، آن را صریح رفع کن."],
      ["Stilistische Verdichtung","اطلاعات زیاد را بدون از دست دادن وضوح فشرده کن.","Unter Berücksichtigung der genannten Einschränkungen …","فشردگی نباید خوانایی را نابود کند."],
      ["Fachliche Präzision","اصطلاح دقیق، Collocation و محدودیت ادعا را کنترل کن.","Die Befunde sind robust gegenüber …","کلمات بسیار پیشرفته بدون نیاز، متن را بهتر نمی‌کنند."]
    ]
  };

  const R={
    A1:["Guten Tag!","Wie heißen Sie?","Ich hätte gern …","Entschuldigung, wo ist …?","Können Sie das bitte wiederholen?","Ich verstehe nicht.","Wie viel kostet das?","Ich brauche Hilfe."],
    A2:["Könnten Sie bitte …?","Leider kann ich nicht, weil …","Ich möchte einen Termin vereinbaren.","Welche Unterlagen brauche ich?","Seit wann …?","Ich würde gern …","Können wir den Termin verschieben?","Ich habe eine Frage zu …"],
    B1:["Meiner Meinung nach …","Einerseits …, andererseits …","Ich bin dafür/dagegen, weil …","Könnten Sie bitte prüfen, ob …?","Ich möchte nach dem Stand … fragen.","Ein gutes Beispiel dafür ist …","Ich verstehe Ihren Punkt, aber …","Zusammenfassend denke ich …"],
    B2:["Aus meiner Sicht …","Wenn ich Sie richtig verstanden habe …","Ich möchte besonders hervorheben, dass …","Im Vergleich zu …","Unter der Bedingung, dass …","Die bisherige Lösung ist nicht ausreichend.","Auffällig ist, dass …","Lassen Sie uns folgende Schritte vereinbaren."],
    C1:["Aus dem Text geht hervor, dass …","Ein möglicher Einwand wäre …","Man muss allerdings einräumen, dass …","Daraus lässt sich ableiten, dass …","Im Hinblick auf …","Die Ergebnisse deuten darauf hin, dass …","Demgegenüber …","Nach Abwägung der Argumente …"],
    C2:["Insofern ist der Einwand berechtigt, als …","Gleichwohl wäre es verkürzt, …","Unter der Voraussetzung, dass …","Anders formuliert …","Es erscheint fraglich, ob …","Die Aussage lässt mehrere Auslegungen zu.","Vorbehaltlich einer genaueren Prüfung …","Das ist insofern zu relativieren, als …"]
  };

  const W={
    A1:["یک فرم ساده با نام، آدرس و شماره تماس پر کن.","یک پیام 3 جمله‌ای برای معرفی خودت بنویس.","برای کافه یک سفارش کوتاه بنویس.","یک پیام برای تغییر زمان قرار بنویس."],
    A2:["یک ایمیل کوتاه برای رزرو وقت پزشک بنویس.","مشکل اینترنت خانه را در 5 جمله توضیح بده.","برای دعوت دوست و تعیین زمان پیام بنویس.","یک درخواست ساده درباره مدارک اداره بنویس."],
    B1:["یک ایمیل رسمی برای جابه‌جایی وقت بنویس.","یک شکایت کوتاه درباره سفارش ناقص بنویس.","نظر خودت درباره Homeoffice را با دلیل و مثال بنویس.","یک متن کوتاه درباره تجربه کاری خودت بنویس."],
    B2:["یک گزارش کوتاه از وضعیت پروژه بنویس.","یک شکایت رسمی با درخواست راه‌حل بنویس.","یک متن استدلالی 180 کلمه‌ای درباره حمل‌ونقل عمومی بنویس.","یک نمودار فرضی را خنثی توصیف و سپس تفسیر کن."],
    C1:["یک Zusammenfassung بی‌طرف از یک متن تحلیلی بنویس.","یک ایمیل دانشگاهی برای درخواست تمدید مهلت بنویس.","یک Stellungnahme با Einwand و پاسخ به آن بنویس.","یک گزارش حرفه‌ای با Sachverhalt, Bewertung, Empfehlung بنویس."],
    C2:["یک پاراگراف محاوره‌ای را به سبک رسمی و سپس آکادمیک بازنویسی کن.","دو دیدگاه متعارض را در یک Synthese بدون تحریف ترکیب کن.","یک نقد تند را دیپلماتیک و دقیق بازنویسی کن.","یک استدلال را با Hedging و محدودیت‌های روشن بازسازی کن."]
  };

  const S={
    A1:["خودت را در 30 ثانیه معرفی کن.","در کافه سفارش بده.","آدرس ایستگاه را بپرس.","در داروخانه علائم ساده را توضیح بده."],
    A2:["برای بازدید خانه تماس بگیر.","وقت پزشک را جابه‌جا کن.","مشکل اینترنت را به پشتیبانی توضیح بده.","دعوتی را مؤدبانه رد کن."],
    B1:["در مصاحبه شغلی درباره تجربه‌ات جواب بده.","با صاحبخانه درباره خرابی گرمایش صحبت کن.","یک سوءتفاهم با همکار را حل کن.","وضعیت یک درخواست اداری را تلفنی پیگیری کن."],
    B2:["در جلسه کاری درباره تأخیر پروژه مذاکره کن.","یک ارائه 2 دقیقه‌ای ساختارمند بده.","با خدمات مشتری درباره بازپرداخت مذاکره کن.","مزایا و معایب یک سیاست را بحث کن."],
    C1:["یک موضع پیچیده را با Einwand و پاسخ ارائه کن.","نتایج یک مطالعه را با محدودیت‌ها ارائه کن.","در سمینار با نظر مخالف محترمانه بحث کن.","یک بازخورد تخصصی و قابل اقدام بده."],
    C2:["یک ادعای مبهم را در لحظه بازنویسی و دقیق کن.","یک مذاکره قرارداد با شرط و محدودیت انجام بده.","بحث چندنفره را جمع‌بندی و به موضوع برگردان.","از یک استدلال دانشگاهی در برابر پرسش سخت دفاع کن."]
  };

  const READING=[
    {id:"r-a1-1",level:"A1",title:"Eine Nachricht",text:"Hallo Ghazal, der Deutschkurs beginnt morgen um neun Uhr. Bitte bring dein Buch und einen Stift mit. Bis morgen!",questions:["کلاس چه زمانی شروع می‌شود؟","چه چیزهایی باید همراه باشد؟"]},
    {id:"r-a2-1",level:"A2",title:"Terminänderung",text:"Sehr geehrte Frau Rahimi, Ihr Termin am Dienstag kann leider nicht stattfinden. Wir können Ihnen Donnerstag um 14:30 Uhr anbieten. Bitte bestätigen Sie den neuen Termin.",questions:["قرار قبلی چه روزی بود؟","زمان پیشنهادی جدید چیست؟"]},
    {id:"r-b1-1",level:"B1",title:"Wohnungsproblem",text:"Seit drei Tagen funktioniert die Heizung in unserer Wohnung nicht. Trotz meiner Nachricht am Montag wurde bisher kein Termin für die Reparatur vereinbart. Da die Temperaturen niedrig sind, bitte ich um eine kurzfristige Lösung.",questions:["مشکل از چه زمانی شروع شده؟","نویسنده چه درخواستی دارد؟"]},
    {id:"r-b2-1",level:"B2",title:"Arbeitszeitmodell",text:"Flexible Arbeitszeiten können die Vereinbarkeit von Beruf und Privatleben verbessern. Gleichzeitig erfordern sie klare Absprachen, damit Erreichbarkeit und Zusammenarbeit nicht leiden. Entscheidend ist daher weniger das Modell selbst als seine konkrete Umsetzung.",questions:["موضع اصلی متن چیست؟","چه شرطی برای موفقیت مدل ذکر شده؟"]},
    {id:"r-c1-1",level:"C1",title:"Digitalisierung",text:"Die Einführung digitaler Verwaltungsangebote wird häufig mit Effizienzgewinnen begründet. Ob diese tatsächlich eintreten, hängt jedoch wesentlich von der Nutzerfreundlichkeit, der technischen Zuverlässigkeit und der Verfügbarkeit analoger Alternativen für bestimmte Gruppen ab.",questions:["ادعای اصلی چیست؟","چه محدودیت‌هایی ذکر شده؟"]},
    {id:"r-c2-1",level:"C2",title:"Evidenz und Politik",text:"Der Verweis auf wissenschaftliche Evidenz entbindet politische Entscheidungen nicht von normativen Abwägungen. Daten können Folgen und Wahrscheinlichkeiten beschreiben, nicht jedoch allein festlegen, welche Ziele eine Gesellschaft priorisieren sollte. Gerade darin liegt die Grenze einer rein technokratischen Entscheidungslogik.",questions:["مرز Evidenz طبق متن چیست؟","نقد اصلی متوجه چه رویکردی است؟"]}
  ];

  const LISTENING=[
    {id:"l-a1-1",level:"A1",title:"Am Bahnhof",script:"Der Zug nach Köln fährt heute nicht von Gleis drei, sondern von Gleis fünf. Die Abfahrt ist um 10 Uhr 20.",focus:["Gleis","Uhrzeit","Korrektur"]},
    {id:"l-a2-1",level:"A2",title:"Arztpraxis",script:"Guten Tag. Wegen einer kurzfristigen Änderung müssen wir Ihren Termin am Mittwoch verschieben. Am Freitag um elf Uhr wäre noch ein Termin frei.",focus:["Terminänderung","Wochentag","Uhrzeit"]},
    {id:"l-b1-1",level:"B1",title:"Telefonischer Kundenservice",script:"Ich sehe, dass Ihre Bestellung das Lager verlassen hat, aber beim Versanddienstleister noch nicht zugestellt wurde. Ich kann eine Nachforschung starten und Ihnen morgen per E-Mail Rückmeldung geben.",focus:["Status","Problemursache","nächster Schritt"]},
    {id:"l-b2-1",level:"B2",title:"Projektmeeting",script:"Wir liegen beim Budget im Plan, haben aber beim Zeitplan etwa eine Woche Rückstand. Wenn wir die Testphase parallel zur Dokumentation starten, könnten wir einen Teil der Verzögerung aufholen.",focus:["Budget","Verzögerung","Lösung"]},
    {id:"l-c1-1",level:"C1",title:"Vorlesung",script:"Die Korrelation zwischen zwei Variablen sagt zunächst nichts über einen kausalen Zusammenhang aus. Um Kausalität plausibel zu machen, müssen alternative Erklärungen systematisch geprüft und möglichst ausgeschlossen werden.",focus:["Korrelation","Kausalität","methodische Bedingung"]},
    {id:"l-c2-1",level:"C2",title:"Diskussion",script:"Ich würde die These nicht vollständig zurückweisen, aber sie scheint mir insofern zu pauschal, als sie institutionelle Unterschiede ausblendet. Gerade diese Unterschiede könnten erklären, warum vergleichbare Maßnahmen in verschiedenen Kontexten zu unterschiedlichen Ergebnissen führen.",focus:["Nuancierung","Einwand","Begründung"]}
  ];

  const grammar=[];
  Object.entries(G).forEach(([level,items])=>items.forEach((x,i)=>grammar.push({id:"g-"+level.toLowerCase()+"-"+(i+1),level,title:x[0],rule:x[1],example:x[2],mistake:x[3]})));
  const redemittel=[];
  Object.entries(R).forEach(([level,items])=>items.forEach((x,i)=>redemittel.push({id:"rm-"+level.toLowerCase()+"-"+(i+1),level,text:x})));
  const writing=[];
  Object.entries(W).forEach(([level,items])=>items.forEach((x,i)=>writing.push({id:"w-"+level.toLowerCase()+"-"+(i+1),level,prompt:x})));
  const speaking=[];
  Object.entries(S).forEach(([level,items])=>items.forEach((x,i)=>speaking.push({id:"s-"+level.toLowerCase()+"-"+(i+1),level,prompt:x})));
  return {version:1,grammar,redemittel,writing,speaking,reading:READING,listening:LISTENING};
});