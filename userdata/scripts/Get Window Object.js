(function getWindowInterface(){
  var winList = [], win = {};
  
  for(var prop in window){
    winList.push({
      name: prop,
      type: typeof window[prop]
    });
  }
  
  winList.sort(function(a, b){
    if (a.name > b.name)
      return 1;
    if (a.name < b.name)
      return -1;
    // a must be equal to b
    return 0;
  });
  
  for(var i = 0, length = winList.length; i < length; i++){
    var obj = winList[i];
    win[obj.name] = obj.type;
  }
  
  return win;
}());
