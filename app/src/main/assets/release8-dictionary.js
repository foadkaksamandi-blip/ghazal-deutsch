(function(root,factory){
  const api=factory(root&&root.GhazalData);
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalDictionary=api;
})(typeof window!=="undefined"?window:null,function(Data){
  "use strict";

  const curated=[
    ["A1","die Mutter","Nomen","مادر","die Mütter","","mit der Mutter sprechen","Meine Mutter wohnt in Teheran.","neutral"],
    ["A1","der Bruder","Nomen","برادر","die Brüder","","einen Bruder haben","Ich habe einen Bruder.","neutral"],
    ["A1","der Termin","Nomen","وقت/قرار","die Termine","","einen Termin haben / vereinbaren","Ich habe morgen einen Termin.","neutral"],
    ["A1","die Uhr","Nomen","ساعت","die Uhren","","um zehn Uhr","Der Termin ist um zehn Uhr.","neutral"],
    ["A1","die Haltestelle","Nomen","ایستگاه","die Haltestellen","","an der Haltestelle warten","Wo ist die nächste Haltestelle?","neutral"],
    ["A1","die Apotheke","Nomen","داروخانه","die Apotheken","","in die Apotheke gehen","Wo ist die nächste Apotheke?","neutral"],
    ["A1","das Rezept","Nomen","نسخه پزشک","die Rezepte","","ein Rezept bekommen","Brauche ich dafür ein Rezept?","neutral"],
    ["A1","das Zimmer","Nomen","اتاق","die Zimmer","","ein Zimmer reservieren","Ich habe ein Zimmer reserviert.","neutral"],
    ["A1","helfen","Verb","کمک کردن","","+ Dativ","jemandem helfen","Können Sie mir helfen?","neutral"],
    ["A1","brauchen","Verb","نیاز داشتن","","+ Akkusativ","Hilfe brauchen","Ich brauche Hilfe.","neutral"],
    ["A1","bestellen","Verb","سفارش دادن","","+ Akkusativ","Essen bestellen","Ich möchte etwas bestellen.","neutral"],
    ["A1","zurückrufen","Verb","دوباره تماس گرفتن","","trennbar","später zurückrufen","Ich rufe später zurück.","neutral"],

    ["A2","die Miete","Nomen","اجاره","die Mieten","","Miete zahlen","Wie hoch ist die Miete?","neutral"],
    ["A2","die Kaution","Nomen","ودیعه","die Kautionen","","Kaution zahlen","Die Kaution beträgt zwei Monatsmieten.","formal"],
    ["A2","die Unterlagen","Nomen","مدارک","","Plural","Unterlagen einreichen","Welche Unterlagen brauche ich?","formal"],
    ["A2","das Formular","Nomen","فرم","die Formulare","","ein Formular ausfüllen","Füllen Sie bitte das Formular aus.","formal"],
    ["A2","die Lieferung","Nomen","تحویل/ارسال","die Lieferungen","","eine Lieferung erhalten","Die Lieferung kommt morgen.","neutral"],
    ["A2","der Vertrag","Nomen","قرارداد","die Verträge","","einen Vertrag kündigen","Ich möchte den Vertrag kündigen.","formal"],
    ["A2","verschieben","Verb","جابه‌جا کردن","","+ Akkusativ","einen Termin verschieben","Können wir den Termin verschieben?","neutral"],
    ["A2","kündigen","Verb","فسخ کردن","","+ Akkusativ","einen Vertrag kündigen","Ich möchte den Vertrag kündigen.","formal"],
    ["A2","einreichen","Verb","ارائه/ارسال کردن","","trennbar + Akkusativ","Unterlagen einreichen","Bitte reichen Sie die Unterlagen ein.","formal"],
    ["A2","nachreichen","Verb","بعداً تکمیل/ارسال کردن","","trennbar + Akkusativ","Dokumente nachreichen","Sie können das Dokument nachreichen.","formal"],
    ["A2","sich freuen","Verb","خوشحال بودن","","auf + Akkusativ","sich auf etwas freuen","Ich freue mich auf Samstag.","neutral"],
    ["A2","zurücksenden","Verb","پس فرستادن","","trennbar + Akkusativ","Ware zurücksenden","Ich möchte die Ware zurücksenden.","formal"],

    ["B1","die Bewerbung","Nomen","درخواست شغلی","die Bewerbungen","","eine Bewerbung schreiben","Ich sende Ihnen meine Bewerbung.","formal"],
    ["B1","der Lebenslauf","Nomen","رزومه","die Lebensläufe","","einen Lebenslauf beilegen","Im Anhang finden Sie meinen Lebenslauf.","formal"],
    ["B1","die Erfahrung","Nomen","تجربه","die Erfahrungen","","Erfahrung mit etwas haben","Ich habe Erfahrung mit Kundenservice.","neutral"],
    ["B1","der Antrag","Nomen","درخواست رسمی","die Anträge","","einen Antrag stellen","Ich habe einen Antrag gestellt.","formal"],
    ["B1","der Bearbeitungsstand","Nomen","وضعیت رسیدگی","die Bearbeitungsstände","","nach dem Bearbeitungsstand fragen","Ich möchte nach dem Bearbeitungsstand fragen.","formal"],
    ["B1","die Nebenwirkung","Nomen","عارضه جانبی","die Nebenwirkungen","","Nebenwirkungen haben","Hat das Medikament Nebenwirkungen?","formal"],
    ["B1","sich bewerben","Verb","درخواست شغل دادن","","um + Akkusativ","sich um eine Stelle bewerben","Ich bewerbe mich um die Stelle.","formal"],
    ["B1","sich beschweren","Verb","شکایت کردن","","über + Akkusativ","sich über etwas beschweren","Ich möchte mich über die Lieferung beschweren.","formal"],
    ["B1","übernehmen","Verb","پوشش دادن/برعهده گرفتن","","+ Akkusativ","Kosten übernehmen","Wird die Behandlung übernommen?","formal"],
    ["B1","nachfragen","Verb","پیگیری/سؤال مجدد کردن","","bei + Dativ / nach + Dativ","nach dem Stand fragen","Ich möchte noch einmal nachfragen.","neutral"],
    ["B1","missverstehen","Verb","بد فهمیدن","","+ Akkusativ","jemanden missverstehen","Ich glaube, ich habe Sie missverstanden.","neutral"],
    ["B1","sich einigen","Verb","به توافق رسیدن","","auf + Akkusativ","sich auf einen Termin einigen","Wir können uns auf Samstag einigen.","neutral"],

    ["B2","die Verzögerung","Nomen","تأخیر","die Verzögerungen","","eine Verzögerung aufholen","Wir haben eine Woche Verzögerung.","formal"],
    ["B2","die Maßnahme","Nomen","اقدام","die Maßnahmen","","Maßnahmen ergreifen","Wir haben Gegenmaßnahmen eingeleitet.","formal"],
    ["B2","der Widerspruch","Nomen","اعتراض رسمی","die Widersprüche","","Widerspruch einlegen","Hiermit lege ich Widerspruch ein.","formal"],
    ["B2","die Erstattung","Nomen","بازپرداخت","die Erstattungen","","eine Erstattung verlangen","Ich bitte um vollständige Erstattung.","formal"],
    ["B2","die Klausel","Nomen","بند قرارداد","die Klauseln","","eine Klausel erläutern","Diese Klausel ist unklar.","formal"],
    ["B2","die Schlussfolgerung","Nomen","نتیجه‌گیری","die Schlussfolgerungen","","eine Schlussfolgerung ziehen","Die Schlussfolgerung ist nachvollziehbar.","academic"],
    ["B2","priorisieren","Verb","اولویت‌بندی کردن","","+ Akkusativ","Aufgaben priorisieren","Wir müssen die Aufgaben priorisieren.","formal"],
    ["B2","hervorheben","Verb","برجسته کردن","","trennbar + Akkusativ","einen Punkt hervorheben","Ich möchte einen Punkt hervorheben.","formal"],
    ["B2","beanstanden","Verb","ایراد رسمی گرفتن","","+ Akkusativ","eine Lieferung beanstanden","Ich beanstande die fehlerhafte Lieferung.","formal"],
    ["B2","einlegen","Verb","ثبت/ارائه کردن","","trennbar + Akkusativ","Widerspruch einlegen","Ich lege gegen den Bescheid Widerspruch ein.","formal"],
    ["B2","berücksichtigen","Verb","در نظر گرفتن","","+ Akkusativ","Risiken berücksichtigen","Wir müssen das Budget berücksichtigen.","formal"],
    ["B2","entgegenkommen","Verb","راه آمدن/امتیاز دادن","","+ Dativ","jemandem entgegenkommen","Können Sie uns beim Preis entgegenkommen?","formal"],

    ["C1","die Kernaussage","Nomen","پیام اصلی","die Kernaussagen","","eine Kernaussage formulieren","Die Kernaussage ist deutlich.","academic"],
    ["C1","die Evidenz","Nomen","شواهد","","meist Singular","Evidenz liefern","Die Evidenz ist begrenzt.","academic"],
    ["C1","die Einschränkung","Nomen","محدودیت","die Einschränkungen","","Einschränkungen nennen","Die Studie hat mehrere Einschränkungen.","academic"],
    ["C1","die Stichprobe","Nomen","نمونه آماری","die Stichproben","","eine Stichprobe untersuchen","Die Stichprobe ist klein.","academic"],
    ["C1","der Sachverhalt","Nomen","واقعیت/موضوع پرونده","die Sachverhalte","","einen Sachverhalt darstellen","Der Sachverhalt wird zunächst dargestellt.","formal"],
    ["C1","die Rechtsgrundlage","Nomen","مبنای قانونی","die Rechtsgrundlagen","","auf einer Rechtsgrundlage beruhen","Welche Rechtsgrundlage wird genannt?","formal"],
    ["C1","ableiten","Verb","نتیجه گرفتن","","aus + Dativ","etwas aus Daten ableiten","Daraus lässt sich ableiten, dass …","academic"],
    ["C1","belegen","Verb","مستند کردن","","+ Akkusativ","eine These belegen","Wie lässt sich das belegen?","academic"],
    ["C1","differenzieren","Verb","تمایز قائل شدن","","zwischen + Dativ","stärker differenzieren","Man muss hier stärker differenzieren.","academic"],
    ["C1","einräumen","Verb","پذیرفتن یک نکته","","+ dass-Satz","einräumen, dass …","Man muss einräumen, dass …","academic"],
    ["C1","hervorgehen","Verb","برآمدن/نتیجه شدن","","aus + Dativ","aus einer Studie hervorgehen","Aus der Studie geht hervor, dass …","academic"],
    ["C1","anfechten","Verb","اعتراض رسمی/حقوقی کردن","","+ Akkusativ","einen Bescheid anfechten","Der Bescheid kann angefochten werden.","formal"],

    ["C2","die Auslegung","Nomen","تفسیر","die Auslegungen","","mehrere Auslegungen zulassen","Die Klausel lässt mehrere Auslegungen zu.","formal"],
    ["C2","die Haftung","Nomen","مسئولیت حقوقی","die Haftungen","","Haftung regeln","Die Haftung ist nicht eindeutig geregelt.","formal"],
    ["C2","die Mehrdeutigkeit","Nomen","چندمعنایی","die Mehrdeutigkeiten","","Mehrdeutigkeit vermeiden","Die Mehrdeutigkeit ist beabsichtigt.","academic"],
    ["C2","der Unterton","Nomen","لحن ضمنی","die Untertöne","","einen kritischen Unterton haben","Der Satz hat einen kritischen Unterton.","neutral"],
    ["C2","das Zwischenfazit","Nomen","جمع‌بندی میانی","die Zwischenfazits","","ein Zwischenfazit ziehen","Ein kurzes Zwischenfazit wäre hilfreich.","academic"],
    ["C2","die Annahme","Nomen","فرض","die Annahmen","","eine Annahme prüfen","Die Annahme basiert auf zwei Voraussetzungen.","academic"],
    ["C2","abwägen","Verb","سنجیدن جوانب","","+ Akkusativ","Nutzen und Risiken abwägen","Man muss Nutzen und Risiken abwägen.","formal"],
    ["C2","relativieren","Verb","محدود/نسبی کردن ادعا","","+ Akkusativ","eine Aussage relativieren","Diese Aussage muss relativiert werden.","academic"],
    ["C2","umschreiben","Verb","با توضیح بازگویی کردن","","+ Akkusativ","ein Wort umschreiben","Ich kann den Begriff umschreiben.","neutral"],
    ["C2","präzisieren","Verb","دقیق‌تر کردن","","+ Akkusativ","eine Aussage präzisieren","Könnten Sie das präzisieren?","formal"],
    ["C2","gewichten","Verb","اهمیت نسبی دادن","","+ Akkusativ","Argumente unterschiedlich gewichten","Die Argumente sind unterschiedlich zu gewichten.","academic"],
    ["C2","vorbehaltlich","Präposition/Adverb","مشروط به","","+ Genitiv / feste Wendung","vorbehaltlich der Prüfung","Die Zustimmung erfolgt vorbehaltlich der Prüfung.","formal"]
  ];

  function idFrom(s){return String(s).toLowerCase().replace(/[ä]/g,"ae").replace(/[ö]/g,"oe").replace(/[ü]/g,"ue").replace(/[ß]/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
  const rich=curated.map((r,i)=>({id:"dict-"+r[0].toLowerCase()+"-"+String(i+1).padStart(3,"0")+"-"+idFrom(r[1]),level:r[0],lemma:r[1],pos:r[2],meaning:r[3],plural:r[4],grammar:r[5],collocation:r[6],example:r[7],register:r[8]}));

  const seen=new Set(rich.map(x=>x.level+"|"+x.lemma.toLowerCase()));
  const extracted=[];
  if(Data&&Array.isArray(Data.lessons)){
    Data.lessons.forEach(lesson=>(lesson.words||[]).forEach((w,idx)=>{
      const lemma=String(w[0]||"").trim(),key=lesson.level+"|"+lemma.toLowerCase();
      if(!lemma||seen.has(key))return;
      seen.add(key);
      extracted.push({id:"auto-"+lesson.id+"-"+idx,level:lesson.level,lemma,pos:"Wort",meaning:String(w[1]||""),plural:"",grammar:"",collocation:"",example:String(w[2]||""),register:"neutral",sourceLessonId:lesson.id});
    }));
  }

  function normalize(s){return String(s||"").toLocaleLowerCase("de-DE").replace(/[.,!?;:„“"'()\[\]{}]/g," ").replace(/\s+/g," ").trim();}
  function search(query,level,limit){
    const q=normalize(query),terms=q.split(" ").filter(Boolean),pool=rich.concat(extracted).filter(x=>!level||x.level===level);
    if(!q)return pool.slice(0,Number(limit)||50);
    return pool.map(x=>{const hay=normalize([x.lemma,x.meaning,x.plural,x.grammar,x.collocation,x.example,x.register,x.level].join(" "));let score=0;terms.forEach(t=>{if(normalize(x.lemma)===t)score+=20;else if(hay.startsWith(t))score+=8;else if(hay.includes(t))score+=3;});return{x,score};}).filter(o=>o.score>0).sort((a,b)=>b.score-a.score||a.x.lemma.localeCompare(b.x.lemma,"de")).slice(0,Number(limit)||50).map(o=>o.x);
  }
  return{version:1,curated:rich,extracted,all:rich.concat(extracted),search};
});