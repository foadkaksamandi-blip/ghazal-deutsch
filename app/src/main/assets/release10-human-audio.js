(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.GhazalHumanAudio=api;
})(typeof window!=="undefined"?window:null,function(){
  "use strict";
  return {
    version:1,
    note:"Unmodified human-native pronunciation/reference clips bundled at build time from Wikimedia Commons. TTS remains the fallback for full lesson scripts.",
    clips:[
      {id:"human-01",text:"Guten Tag",speaker:"Jeuwre",voice:"male",region:"Berlin, Germany",file:"human_audio/De-guten_Tag2.ogg",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:De-guten_Tag2.ogg",sha1:"52239a77cb6ade337d273c077336cc98ba38dfad"},
      {id:"human-02",text:"Wie geht es dir?",speaker:"Jeuwre",voice:"male",region:"Berlin, Germany",file:"human_audio/De-Wie_geht_es_dir..ogg",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:De-Wie_geht_es_dir..ogg",sha1:"e9fb264843ff4d2d1e4e90a7bb9524ffd1a02021"},
      {id:"human-03",text:"Schritt für Schritt",speaker:"Jeuwre",voice:"male",region:"Berlin, Germany",file:"human_audio/De-Schritt_fuer_Schritt.ogg",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:De-Schritt_f%C3%BCr_Schritt.ogg",sha1:"fde4f9c0f3d9938a7a05b825b9329c3edaee7366"},
      {id:"human-04",text:"darstellen",speaker:"Katrin Boxberger / Bernadette Perrin-Riou",voice:"female",region:"Mecklenburg, Germany",file:"human_audio/De-darstellen.ogg",license:"CC BY 3.0 US",source:"https://commons.wikimedia.org/wiki/File:De-darstellen.ogg",sha1:"6d8f96905effb7683f87edcdf658ea48196cd752"},
      {id:"human-05",text:"eintragen",speaker:"Katrin Boxberger / Bernadette Perrin-Riou",voice:"female",region:"Mecklenburg, Germany",file:"human_audio/De-eintragen.ogg",license:"CC BY 3.0 US",source:"https://commons.wikimedia.org/wiki/File:De-eintragen.ogg",sha1:"b1bf2c650e0e87f9064176cbba773f8c1fcbd1f6"},
      {id:"human-06",text:"deutsch",speaker:"Alexandra Poelzlbauers / Vion Nicolas",voice:"female",region:"Vienna, Austria",file:"human_audio/De-at-deutsch.ogg",license:"CC BY 2.0 FR",source:"https://commons.wikimedia.org/wiki/File:De-at-deutsch.ogg",sha1:"8d601b6f82ab724df230fecee65a374cf1bb75c5"}
    ]
  };
});