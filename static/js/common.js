$(document).ready(function(){

  $(".menu").each(function(index){
    var $this = $(this)
    $this.on("click", function(){
      var drop = $this.find(".dropdown");
      if(drop.hasClass("active")){
        $this.css("border-radius", "21px")
        drop.removeClass("active").addClass("inactive")
      }else {
        $this.css("border-radius", "19px 19px 0 0")
        drop.removeClass("inactive").addClass("active")
      }
    }).on("mouseleave", function(){
      $this.css("border-radius", "21px")
      $this.find(".dropdown").removeClass("active").addClass("inactive")
    })
  })

  // Chrome is dumb and doesn't support .contains()
  if (!String.prototype.contains) {
    String.prototype.contains = function(s) {
      return this.indexOf(s) > -1
    }
  }

  var match = false;
  document.addEventListener('keydown', (event) => { // event.key is better than jQuery's e.which
    var country = $("#country ul");
    var month = $("#month ul");

    function search(which){
      var i = which.find("li");
      for(t=0;t<i.length;t++)
        if($(i[t]).text().toString().substring(0,1).toLowerCase() === event.key)
          if(!match){
            match = i[t]; // for the pun
            break
          }else continue
    }

    if(country.hasClass("active")) search(country)
    else if(month.hasClass("active")) search(month)
  })
  document.addEventListener('keyup', (event) => {
    if(match)
      $(match).parents()[0].scrollTo(0, match.offsetTop-25)
      match = false;
  });


  $(".dropdown li").each(function(){
    var $this = $(this)
    var parent = $this.parents()[1];
    $this.on("click", function(){ $($(parent).find(".sel")).text($this.text()).css("color", "rgb(0, 0, 0)")})
  })

})
