(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalAdvancedContent=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  const levels=["A1","A2","B1","B2","C1","C2"];

  const packDefs={
    idioms:{
      title:"Idioms & Naturalness",fa:"اصطلاحات و طبیعی‌بودن",items:[
        ["A1","Keine Ahnung.","نمی‌دانم / اطلاعی ندارم.","Keine Ahnung, wo der Schlüssel ist.","colloquial"],
        ["A1","Alles klar.","باشه / متوجه شدم.","Alles klar, bis morgen.","neutral"],
        ["A1","Gute Besserung!","زود خوب شو!","Du bist krank? Gute Besserung!","neutral"],
        ["A1","Viel Spaß!","خوش بگذرد!","Viel Spaß im Urlaub!","neutral"],
        ["A1","Bis gleich.","تا چند لحظه دیگر.","Ich bin in zehn Minuten da. Bis gleich.","neutral"],
        ["A1","Macht nichts.","اشکالی ندارد.","Entschuldigung! – Macht nichts.","neutral"],
        ["A2","Das kommt darauf an.","بستگی دارد.","Das kommt darauf an, wie viel Zeit wir haben.","neutral"],
        ["A2","Kein Problem.","مشکلی نیست.","Kein Problem, ich kann warten.","neutral"],
        ["A2","Ich bin dabei.","من هم هستم / شرکت می‌کنم.","Ihr geht ins Kino? Ich bin dabei.","colloquial"],
        ["A2","Das klappt.","درست می‌شود / جواب می‌دهد.","Treffen wir uns um acht? Ja, das klappt.","neutral"],
        ["A2","Mach dir keine Sorgen.","نگران نباش.","Mach dir keine Sorgen, wir finden eine Lösung.","colloquial"],
        ["A2","Ich melde mich.","خبر می‌دهم / تماس می‌گیرم.","Ich melde mich morgen bei dir.","neutral"],
        ["B1","Das sehe ich genauso.","کاملاً موافقم.","Das sehe ich genauso; wir brauchen mehr Zeit.","neutral"],
        ["B1","Da bin ich anderer Meinung.","نظر متفاوتی دارم.","Da bin ich anderer Meinung, weil …","neutral"],
        ["B1","Es geht um …","موضوع درباره … است.","Es geht um die neue Regelung.","neutral"],
        ["B1","Auf jeden Fall.","حتماً / در هر صورت.","Auf jeden Fall sollten wir nachfragen.","neutral"],
        ["B1","Im Großen und Ganzen","در مجموع","Im Großen und Ganzen bin ich zufrieden.","neutral"],
        ["B1","Das lohnt sich.","ارزشش را دارد.","Der Kurs ist teuer, aber er lohnt sich.","neutral"],
        ["B2","Das ist nachvollziehbar.","قابل درک است.","Ihre Sorge ist nachvollziehbar.","formal"],
        ["B2","Das greift zu kurz.","بیش از حد ساده‌سازی می‌کند.","Diese Erklärung greift zu kurz.","formal"],
        ["B2","Es spricht einiges dafür.","دلایل قابل توجهی به نفعش هست.","Es spricht einiges dafür, das Modell zu testen.","formal"],
        ["B2","Unter dem Strich","در نهایت / در مجموع","Unter dem Strich überwiegen die Vorteile.","neutral"],
        ["B2","Das steht außer Frage.","جای تردید ندارد.","Dass wir handeln müssen, steht außer Frage.","formal"],
        ["B2","Es läuft darauf hinaus, dass …","در نهایت به این می‌رسد که …","Es läuft darauf hinaus, dass wir priorisieren müssen.","formal"],
        ["C1","Das lässt sich nicht pauschal sagen.","نمی‌شود به‌طور کلی حکم داد.","Das lässt sich nicht pauschal sagen; der Kontext ist entscheidend.","academic"],
        ["C1","Das ist insofern relevant, als …","از این جهت مهم است که …","Das ist insofern relevant, als die Stichprobe klein ist.","academic"],
        ["C1","Man muss dabei berücksichtigen, dass …","باید در نظر داشت که …","Man muss dabei berücksichtigen, dass die Daten älter sind.","academic"],
        ["C1","Daraus folgt nicht zwangsläufig, dass …","لزوماً از آن نتیجه نمی‌شود که …","Daraus folgt nicht zwangsläufig, dass die Maßnahme unwirksam ist.","academic"],
        ["C1","Vor diesem Hintergrund …","در این چارچوب / با توجه به این زمینه","Vor diesem Hintergrund erscheint die Entscheidung plausibel.","formal"],
        ["C1","Das bedarf einer genaueren Prüfung.","نیازمند بررسی دقیق‌تر است.","Ob der Effekt dauerhaft ist, bedarf einer genaueren Prüfung.","academic"],
        ["C2","Das wäre zu kurz gegriffen.","این نتیجه‌گیری بیش از حد ساده است.","Die Debatte darauf zu reduzieren, wäre zu kurz gegriffen.","academic"],
        ["C2","So gesehen …","از این زاویه …","So gesehen ist der Einwand durchaus berechtigt.","formal"],
        ["C2","Das ist nicht von der Hand zu weisen.","نمی‌توان آن را نادیده گرفت.","Das Risiko ist nicht von der Hand zu weisen.","formal"],
        ["C2","Bei näherer Betrachtung …","با بررسی دقیق‌تر …","Bei näherer Betrachtung zeigt sich ein differenzierteres Bild.","academic"],
        ["C2","Das ändert nichts daran, dass …","این واقعیت را تغییر نمی‌دهد که …","Das ändert nichts daran, dass die Evidenz begrenzt ist.","formal"],
        ["C2","Unter dieser Prämisse …","با این فرض مبنا …","Unter dieser Prämisse wäre die Schlussfolgerung konsistent.","academic"]
      ]
    },
    phone:{
      title:"Phone German",fa:"آلمانی تلفنی",items:[
        ["A1","Guten Tag, Ghazal am Apparat.","سلام، غزل هستم.","Guten Tag, Ghazal am Apparat.","formal"],
        ["A1","Kann ich mit Frau Weber sprechen?","می‌توانم با خانم وبر صحبت کنم؟","Kann ich mit Frau Weber sprechen?","formal"],
        ["A1","Einen Moment, bitte.","یک لحظه لطفاً.","Einen Moment, bitte, ich verbinde Sie.","formal"],
        ["A2","Ich rufe wegen meines Termins an.","درباره وقت خود تماس می‌گیرم.","Ich rufe wegen meines Termins am Freitag an.","formal"],
        ["A2","Könnten Sie mich bitte zurückrufen?","ممکن است با من تماس بگیرید؟","Könnten Sie mich bitte zurückrufen?","formal"],
        ["A2","Die Verbindung ist schlecht.","ارتباط ضعیف است.","Entschuldigung, die Verbindung ist schlecht.","neutral"],
        ["B1","Ich möchte kurz nach dem Stand fragen.","می‌خواهم وضعیت را پیگیری کنم.","Ich möchte kurz nach dem Stand meines Antrags fragen.","formal"],
        ["B1","Habe ich Sie richtig verstanden, dass …?","درست فهمیدم که …؟","Habe ich Sie richtig verstanden, dass der Termin verschoben wurde?","formal"],
        ["B1","Könnten Sie das bitte noch einmal bestätigen?","ممکن است دوباره تأیید کنید؟","Könnten Sie die Uhrzeit bitte noch einmal bestätigen?","formal"],
        ["B2","Ich beziehe mich auf unser Gespräch vom …","به گفت‌وگوی قبلی ارجاع می‌دهم.","Ich beziehe mich auf unser Gespräch vom Montag.","formal"],
        ["B2","Darf ich kurz zusammenfassen?","اجازه بدهید جمع‌بندی کنم.","Darf ich kurz zusammenfassen, was wir vereinbart haben?","formal"],
        ["B2","Welche nächsten Schritte schlagen Sie vor?","قدم بعدی پیشنهادی شما چیست؟","Welche nächsten Schritte schlagen Sie vor?","formal"],
        ["C1","Ich würde gern einen Punkt präzisieren.","می‌خواهم نکته‌ای را دقیق کنم.","Ich würde gern einen Punkt aus Ihrer letzten Aussage präzisieren.","formal"],
        ["C1","Wenn ich Sie richtig interpretiere …","اگر برداشت من درست باشد …","Wenn ich Sie richtig interpretiere, ist noch keine Entscheidung gefallen.","formal"],
        ["C1","Könnten wir die offenen Punkte kurz strukturieren?","می‌توانیم نکات باز را ساختاربندی کنیم؟","Könnten wir die offenen Punkte kurz strukturieren?","formal"],
        ["C2","Lassen Sie mich die Prämisse kurz hinterfragen.","اجازه دهید فرض مبنا را بررسی کنم.","Lassen Sie mich die Prämisse kurz hinterfragen.","formal"],
        ["C2","Ich würde zwischen zwei Aspekten unterscheiden.","میان دو جنبه تمایز می‌گذارم.","Ich würde zwischen rechtlicher und praktischer Ebene unterscheiden.","formal"],
        ["C2","Darf ich Ihre Position so zusammenfassen, dass …?","می‌توانم موضع شما را این‌طور جمع‌بندی کنم؟","Darf ich Ihre Position so zusammenfassen, dass …?","formal"]
      ]
    },
    digital:{
      title:"Digital German",fa:"آلمانی دیجیتال",items:[
        ["A1","das Passwort zurücksetzen","بازنشانی رمز","Ich muss mein Passwort zurücksetzen.","neutral"],
        ["A1","sich anmelden","وارد حساب شدن","Ich kann mich nicht anmelden.","neutral"],
        ["A1","die Datei öffnen","فایل را باز کردن","Kannst du die Datei öffnen?","neutral"],
        ["A2","eine Datei hochladen","فایل آپلود کردن","Bitte laden Sie die Datei hoch.","neutral"],
        ["A2","eine Nachricht weiterleiten","پیام فوروارد کردن","Ich leite dir die Nachricht weiter.","neutral"],
        ["A2","die Verbindung abbrechen","قطع شدن اتصال","Die Verbindung ist abgebrochen.","neutral"],
        ["B1","eine Berechtigung erteilen","مجوز دسترسی دادن","Die App braucht eine Berechtigung für das Mikrofon.","formal"],
        ["B1","Daten synchronisieren","همگام‌سازی داده","Die Daten werden automatisch synchronisiert.","neutral"],
        ["B1","eine Sicherung erstellen","تهیه نسخه پشتیبان","Bitte erstellen Sie vorher eine Sicherung.","formal"],
        ["B2","Zugriffsrechte verwalten","مدیریت سطح دسترسی","Administratoren verwalten die Zugriffsrechte.","formal"],
        ["B2","eine Sicherheitslücke schließen","بستن آسیب‌پذیری","Das Update schließt eine Sicherheitslücke.","formal"],
        ["B2","Daten verschlüsseln","رمزگذاری داده","Sensible Daten müssen verschlüsselt werden.","formal"],
        ["C1","eine Schnittstelle anbinden","اتصال رابط/API","Die Anwendung wird über eine Schnittstelle angebunden.","technical"],
        ["C1","eine Migration durchführen","انجام مهاجرت داده","Die Datenmigration erfolgt schrittweise.","technical"],
        ["C1","Abwärtskompatibilität gewährleisten","حفظ سازگاری عقب‌رو","Das Format muss abwärtskompatibel bleiben.","technical"],
        ["C2","eine Architektur entkoppeln","جداکردن اجزای معماری","Die Komponenten sollten stärker entkoppelt werden.","technical"],
        ["C2","Fehlertoleranz erhöhen","افزایش تحمل خطا","Die Architektur erhöht die Fehlertoleranz.","technical"],
        ["C2","eine Abhängigkeit abstrahieren","انتزاع وابستگی","Externe Abhängigkeiten werden über Adapter abstrahiert.","technical"]
      ]
    },
    administration:{
      title:"Administration",fa:"زبان اداری",items:[
        ["A1","Bitte hier unterschreiben.","لطفاً اینجا امضا کنید.","Bitte hier unterschreiben.","formal"],
        ["A1","Welche Unterlagen brauche ich?","چه مدارکی لازم دارم؟","Welche Unterlagen brauche ich?","formal"],
        ["A1","Ich habe einen Termin.","وقت دارم.","Ich habe um zehn Uhr einen Termin.","formal"],
        ["A2","Das Dokument fehlt noch.","این مدرک هنوز کم است.","Eine Kopie des Passes fehlt noch.","formal"],
        ["A2","Bitte reichen Sie das nach.","لطفاً بعداً ارائه کنید.","Bitte reichen Sie das Dokument bis Freitag nach.","formal"],
        ["A2","Der Pass ist noch gültig.","گذرنامه هنوز معتبر است.","Mein Pass ist noch zwei Jahre gültig.","formal"],
        ["B1","Ich möchte nach dem Bearbeitungsstand fragen.","می‌خواهم وضعیت رسیدگی را پیگیری کنم.","Ich möchte nach dem Bearbeitungsstand meines Antrags fragen.","formal"],
        ["B1","Gibt es dafür eine Frist?","برای این کار مهلتی وجود دارد؟","Gibt es für die Nachreichung eine Frist?","formal"],
        ["B1","Ich habe noch keine Bestätigung erhalten.","هنوز تأییدیه نگرفته‌ام.","Ich habe noch keine schriftliche Bestätigung erhalten.","formal"],
        ["B2","Hiermit lege ich Widerspruch ein.","بدین‌وسیله اعتراض رسمی ثبت می‌کنم.","Hiermit lege ich gegen den Bescheid Widerspruch ein.","formal"],
        ["B2","Ich bitte um erneute Überprüfung.","درخواست بازبینی مجدد دارم.","Ich bitte um erneute Überprüfung der Entscheidung.","formal"],
        ["B2","Welche Rechtsgrundlage wird zugrunde gelegt?","مبنای قانونی چیست؟","Welche Rechtsgrundlage wird dieser Entscheidung zugrunde gelegt?","formal"],
        ["C1","Maßgeblich ist der Zeitpunkt der Antragstellung.","زمان ثبت درخواست تعیین‌کننده است.","Maßgeblich ist der Zeitpunkt der Antragstellung.","legal"],
        ["C1","Der Sachverhalt stellt sich wie folgt dar.","موضوع به این صورت است.","Der Sachverhalt stellt sich wie folgt dar.","legal"],
        ["C1","Die Entscheidung ist nachvollziehbar zu begründen.","تصمیم باید مستدل باشد.","Die Entscheidung ist nachvollziehbar zu begründen.","legal"],
        ["C2","Die Formulierung lässt mehrere Auslegungen zu.","عبارت چند تفسیر ممکن دارد.","Die Formulierung lässt mehrere Auslegungen zu.","legal"],
        ["C2","Vorbehaltlich einer abschließenden Prüfung …","مشروط به بررسی نهایی …","Vorbehaltlich einer abschließenden Prüfung kann dem Antrag entsprochen werden.","legal"],
        ["C2","Die Verhältnismäßigkeit wäre gesondert zu prüfen.","تناسب باید جداگانه بررسی شود.","Die Verhältnismäßigkeit wäre gesondert zu prüfen.","legal"]
      ]
    },
    academic:{
      title:"University & Academic",fa:"دانشگاهی و علمی",items:[
        ["A1","der Kurs beginnt","کلاس شروع می‌شود","Der Kurs beginnt um neun Uhr.","neutral"],
        ["A1","die Bibliothek","کتابخانه","Die Bibliothek ist im zweiten Stock.","neutral"],
        ["A1","eine Frage haben","سؤال داشتن","Ich habe eine Frage zur Aufgabe.","neutral"],
        ["A2","sich für ein Seminar anmelden","برای سمینار ثبت‌نام کردن","Ich möchte mich für das Seminar anmelden.","formal"],
        ["A2","einen Termin in der Sprechstunde vereinbaren","وقت با استاد گرفتن","Ich möchte einen Termin in Ihrer Sprechstunde vereinbaren.","formal"],
        ["A2","eine Aufgabe abgeben","تکلیف تحویل دادن","Wann muss ich die Aufgabe abgeben?","neutral"],
        ["B1","eine Hauptaussage zusammenfassen","خلاصه پیام اصلی","Ich fasse die Hauptaussage kurz zusammen.","academic"],
        ["B1","ein Beispiel anführen","مثال آوردن","Ein gutes Beispiel dafür ist …","academic"],
        ["B1","einer These zustimmen","با تز موافق بودن","Ich stimme der These teilweise zu.","academic"],
        ["B2","eine Grafik beschreiben","توصیف نمودار","Die Grafik veranschaulicht die Entwicklung.","academic"],
        ["B2","eine Quelle zitieren","ارجاع به منبع","Die Quelle wird im Literaturverzeichnis angegeben.","academic"],
        ["B2","eine Fragestellung formulieren","صورت‌بندی سؤال","Die Fragestellung lautet …","academic"],
        ["C1","eine Einschränkung benennen","ذکر محدودیت","Eine wesentliche Einschränkung besteht darin, dass …","academic"],
        ["C1","Evidenz abwägen","سنجش شواهد","Die vorhandene Evidenz ist sorgfältig abzuwägen.","academic"],
        ["C1","eine Synthese formulieren","ترکیب منابع","Beide Perspektiven lassen sich in einer Synthese verbinden.","academic"],
        ["C2","eine Annahme explizieren","صریح کردن فرض","Die zugrunde liegende Annahme sollte expliziert werden.","academic"],
        ["C2","einen Befund kontextualisieren","قرار دادن یافته در زمینه","Der Befund muss historisch kontextualisiert werden.","academic"],
        ["C2","epistemische Unsicherheit markieren","نشان دادن عدم قطعیت دانشی","Die Formulierung markiert den Grad epistemischer Unsicherheit.","academic"]
      ]
    },
    professional:{
      title:"Professional German",fa:"آلمانی حرفه‌ای",items:[
        ["A1","eine Aufgabe machen","انجام وظیفه","Ich mache diese Aufgabe heute.","neutral"],
        ["A1","eine Datei schicken","ارسال فایل","Ich schicke dir die Datei.","neutral"],
        ["A1","eine Pause machen","استراحت کردن","Wir machen um zwölf Pause.","neutral"],
        ["A2","eine Aufgabe erledigen","وظیفه را انجام دادن","Ich erledige die Aufgabe bis morgen.","neutral"],
        ["A2","Bescheid geben","اطلاع دادن","Ich gebe Ihnen morgen Bescheid.","neutral"],
        ["A2","Urlaub beantragen","درخواست مرخصی","Ich möchte Urlaub beantragen.","formal"],
        ["B1","Verantwortung übernehmen","مسئولیت پذیرفتن","Ich übernehme die Verantwortung für diesen Bereich.","formal"],
        ["B1","eine Frist einhalten","مهلت را رعایت کردن","Wir müssen die Frist einhalten.","formal"],
        ["B1","Feedback geben","بازخورد دادن","Ich möchte Ihnen kurzes Feedback geben.","formal"],
        ["B2","Prioritäten setzen","اولویت تعیین کردن","Wir müssen klare Prioritäten setzen.","formal"],
        ["B2","ein Risiko bewerten","ریسک را ارزیابی کردن","Wir sollten das Risiko neu bewerten.","formal"],
        ["B2","einen Kompromiss aushandeln","مصالحه مذاکره کردن","Wir müssen einen tragfähigen Kompromiss aushandeln.","formal"],
        ["C1","eine Empfehlung ableiten","استخراج توصیه","Aus den Ergebnissen lässt sich eine Empfehlung ableiten.","formal"],
        ["C1","einen Sachverhalt einordnen","زمینه‌گذاری موضوع","Der Sachverhalt ist strategisch einzuordnen.","formal"],
        ["C1","eine Entscheidung begründen","دلیل تصمیم","Die Entscheidung ist transparent zu begründen.","formal"],
        ["C2","Zielkonflikte abwägen","سنجش تعارض اهداف","Die Zielkonflikte müssen gegeneinander abgewogen werden.","formal"],
        ["C2","eine Position nachschärfen","دقیق‌تر کردن موضع","Wir sollten unsere Position in diesem Punkt nachschärfen.","formal"],
        ["C2","eine Prämisse hinterfragen","بررسی فرض مبنا","Die zentrale Prämisse sollte kritisch hinterfragt werden.","formal"]
      ]
    }
  };
  Object.keys(packDefs).forEach(k=>packDefs[k].items=packDefs[k].items.map((x,i)=>({id:k+"-"+String(i+1).padStart(2,"0"),level:x[0],de:x[1],fa:x[2],example:x[3],register:x[4]})));

  const audio=[
    ["A1","male","Guten Tag. Wie geht es Ihnen?",["Guten Tag","Wie geht es Ihnen"],["greeting","question"]],
    ["A1","female","Ich möchte einen Termin vereinbaren.",["Ich möchte","einen Termin","vereinbaren"],["chunks","final-r"]],
    ["A2","male","Der Zug fährt heute von Gleis fünf ab.",["Der Zug","fährt heute","von Gleis fünf ab"],["separable-verb","numbers"]],
    ["A2","female","Welche Unterlagen muss ich mitbringen?",["Welche Unterlagen","muss ich","mitbringen"],["question","separable-verb"]],
    ["B1","male","Ich bewerbe mich um die Stelle, weil sie gut zu meiner Erfahrung passt.",["Ich bewerbe mich","um die Stelle","weil sie gut zu meiner Erfahrung passt"],["weil-clause","linking"]],
    ["B1","female","Könnten Sie bitte prüfen, ob mein Antrag vollständig ist?",["Könnten Sie bitte prüfen","ob mein Antrag","vollständig ist"],["politeness","ob-clause"]],
    ["B2","male","Wenn ich Sie richtig verstanden habe, verschiebt sich die Frist um zwei Tage.",["Wenn ich Sie richtig verstanden habe","verschiebt sich die Frist","um zwei Tage"],["clause-boundary","stress"]],
    ["B2","female","Auffällig ist, dass der Anteil deutlich ansteigt, während die Kosten stabil bleiben.",["Auffällig ist","dass der Anteil deutlich ansteigt","während die Kosten stabil bleiben"],["academic-chunks","contrast"]],
    ["C1","male","Die Ergebnisse deuten darauf hin, dass mehrere Faktoren gemeinsam wirken.",["Die Ergebnisse deuten darauf hin","dass mehrere Faktoren","gemeinsam wirken"],["hedging","sentence-stress"]],
    ["C1","female","Ein möglicher Einwand ist berechtigt, dennoch sollte die Schlussfolgerung differenziert werden.",["Ein möglicher Einwand ist berechtigt","dennoch sollte die Schlussfolgerung","differenziert werden"],["concession","passive"]],
    ["C2","male","Vorbehaltlich einer genaueren Prüfung könnten wir dem Vorschlag grundsätzlich zustimmen.",["Vorbehaltlich einer genaueren Prüfung","könnten wir dem Vorschlag","grundsätzlich zustimmen"],["formal-register","rhythm"]],
    ["C2","female","Anders formuliert geht es nicht um Geschwindigkeit, sondern um Zuverlässigkeit.",["Anders formuliert","geht es nicht um Geschwindigkeit","sondern um Zuverlässigkeit"],["reformulation","contrast-stress"]]
  ].map((x,i)=>({id:"audio-r10-"+String(i+1).padStart(2,"0"),level:x[0],voice:x[1],text:x[2],segments:x[3],diagnostics:x[4],source:"offline-synthetic-tts"}));

  const pronunciation=[
    ["A1","ich-Laut /ç/","ich, nicht, richtig","زبان جلوتر؛ صدای نرم و بدون /k/."],
    ["A1","ach-Laut /x/","Bach, machen, Sprache","صدا عقب‌تر و اصطکاکی‌تر از /ç/."],
    ["A1","ü /yː/","Tür, früh, über","لب‌ها گرد؛ زبان نزدیک /i/."],
    ["A1","ö /øː/","schön, hören, mögen","لب گرد؛ کیفیت بین /e/ و /o/."],
    ["A2","R در پایان هجا","besser, Lehrer, Uhr","در بسیاری لهجه‌های معیار به واکه نزدیک می‌شود."],
    ["A2","z /ts/","Zeit, zehn, zusammen","شروع با /t/ و سریع به /s/."],
    ["A2","w /v/","Wasser, wohnen, wie","مانند /v/ انگلیسی، نه /w/."],
    ["A2","v دو الگو","Vater, Video","در واژگان آلمانی اغلب /f/؛ در وام‌واژه‌ها ممکن است /v/."],
    ["B1","Auslautverhärtung","Tag, Hund, lieb","همخوان پایانی می‌تواند بی‌واک شنیده شود."],
    ["B1","واکه بلند/کوتاه","bieten / bitten","طول و کیفیت واکه معنا را تغییر می‌دهد."],
    ["B1","Stress واژه مرکب","Bahnhof, Sprachkurs","تکیه اصلی معمولاً روی جزء نخست است."],
    ["B1","Schwa /ə/","bitte, heute, Name","واکه ضعیف و کوتاه در هجای بدون تکیه."],
    ["B2","Sentence stress","Ich brauche den NEUEN Termin.","کلمه اطلاعاتی جدید یا متضاد برجسته می‌شود."],
    ["B2","Connected speech","habe ich, geht es","مرز واژه‌ها در گفتار سریع کمتر واضح است."],
    ["B2","Chunking","Wenn ich Sie richtig verstanden habe | …","جمله را بر اساس واحد معنایی قطعه‌بندی کن."],
    ["B2","Kontraststress","nicht HEUTE, sondern MORGEN","تکیه تضاد معنایی را حمل می‌کند."],
    ["C1","Hedging intonation","Es scheint, dass …","لحن کمتر قطعی و کنترل‌شده."],
    ["C1","Parenthetical phrases","meines Erachtens, allerdings","عبارت میانی با مرز آهنگی مشخص."],
    ["C1","Long noun compounds","Nebenkostenabrechnung","واژه را به اجزای معنایی تقسیم و سپس یکپارچه کن."],
    ["C1","Formal rhythm","Vor diesem Hintergrund …","سرعت یکنواخت و تکیه روی واژگان محتوایی."],
    ["C2","Nuance through stress","Das ist NICHT zwingend der Fall.","تکیه می‌تواند دامنه نفی را تغییر دهد."],
    ["C2","Irony cues","Das ist ja großartig.","معنا می‌تواند با آهنگ جمله وارونه شود."],
    ["C2","Dense academic speech","unter Berücksichtigung der …","گروه‌های اسمی بلند را chunk کن."],
    ["C2","Reformulation pause","Anders formuliert | …","مکث کوتاه گذار گفتمانی را روشن می‌کند."]
  ].map((x,i)=>({id:"pron-"+String(i+1).padStart(2,"0"),level:x[0],feature:x[1],examples:x[2],tip:x[3]}));

  const dependencies={
    A1:{requires:[],unlocks:["A2"],core:["word-order","present","articles","basic-cases","survival-speaking"]},
    A2:{requires:["A1"],unlocks:["B1"],core:["perfect","subordinate-clauses","case-expansion","everyday-writing"]},
    B1:{requires:["A2"],unlocks:["B2"],core:["relative-clauses","konjunktiv-II","passive-intro","argumentation"]},
    B2:{requires:["B1"],unlocks:["C1"],core:["reported-speech-intro","advanced-passive","register","data-description"]},
    C1:{requires:["B2"],unlocks:["C2"],core:["academic-cohesion","hedging","synthesis","method-critique"]},
    C2:{requires:["C1"],unlocks:[],core:["nuance","implicit-meaning","register-control","reformulation"]}
  };
  const skillGraph={
    vocabulary:["reading","listening","writing","speaking"],
    grammar:["writing","speaking","reading"],
    listening:["pronunciation","speaking"],
    pronunciation:["listening","speaking"],
    reading:["writing","academic"],
    writing:["grammar","vocabulary","register"],
    speaking:["pronunciation","fluency","pragmatics"],
    errorBank:["review","dailyPlan","mastery"],
    mastery:["transfer","automaticity"]
  };

  return{version:1,levels,packs:packDefs,audio,pronunciation,dependencies,skillGraph};
});