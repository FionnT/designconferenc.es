$(document).ready(function(){

// PSA: jQuery doesn't support ES6 fat arrow functions in some/most cases
//      Best to just avoid using them

  var start = undefined;
  var end = undefined;

  var now = new Date();
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  function time (year, month) {
    var m = new Date(year, month, 0);
    return [m.getDate(), m.getDay(), m.getFullYear()]
    // returns array containing:
    // [Days in x month, Day of the week x month starts on, and a full YYYY string of passed year]
  }
  function calendar(year, month){
    var container = $(".numbers");
    var days = time(year, month+1)[0]; // How many days there are; count from months from 1
    var day = time(year, month)[1]; // what day it starts on, how many empty items to insert; count months from 0
    var tdate = $("p.date");
    var date = 0;

    tdate.text(months[month] + " " + (time(year, month)[2]).toString()) // set text descriptor
    tdate.data("date", (year+","+month).toString()) // store current date in data

    for(i=0;i<day;i++){$($(".hidden")[0]).clone().detach().prependTo(container)} // Insert empty items to bump to correct starting date
    for(i=0;i<days;i++){$($(".hidden")[0]).clone().detach().removeClass("hidden").appendTo(container)} // Insert items that contain the dates

    $(".numbers li.date").each(function( index ){
      var $this = $(this)
      if(!($this.hasClass("hidden"))){ // don't add dates to bump items
        if(date<days){
          date+=1
          $($this.find("p")).text(date)
        }
      }
    })
  }
  calendar(now.getFullYear(), now.getMonth()) // default to this month

  function reset(full){
    if(full) $(".numbers").empty();
    start = undefined;
    end = undefined;
    date = 1
    $(".date").each(function(){
      $(this).removeClass("active middle more less") // you can pass multiple classes to the selector
    })
  }

  $(".controls .left").on("click", function(){
    reset(true);
    var current = $("p.date");
    var year = Number(current.data("date").split(",")[0])
    var month = Number(current.data("date").split(",")[1])

    if(month===0) calendar(year-1, 11) // i.e. January
    else calendar(year,month-1)

  })

  $(".controls .right").on("click", function(){
    reset(true);
    var current = $("p.date");
    var year = Number(current.data("date").split(",")[0])
    var month = Number(current.data("date").split(",")[1])

    if(month===11) calendar(year+1, 0) // i.e. December
    else calendar(year,month+1)

  })

  // See here for why we're triggering the below differently: http://learn.jquery.com/events/event-delegation/

  $(".numbers").on("click", ".date", function(event) {
    $("#calendar").css("border", "1px solid #DEE0E4") // reset on clicking, in case: changed to alert missing
    event.preventDefault();
    var $this = $(this);
    if(start != undefined && end != undefined){
      reset(false)
      $this.addClass("active")
      start = ($this.index()+1).toString();
    }else if(start != undefined){
      end = ($this.index()+1).toString();
      $this.addClass("active")

      // More = right
      // Less = left

      var first = Number(start);
      var last = Number(end)
      if(last>first){ // Moving rightside
        $($(".date")[first]).addClass("more")
        $($(".date")[last]).addClass("less")
        for(i=first+1;i<=last-1;i++) $($(".date")[i]).addClass("middle");

      }else if(last<first){ // Moving leftside
        $($(".date")[first]).addClass("less")
        $($(".date")[last]).addClass("more")
        for(i=last+1;i<=first-1;i++) $($(".date")[i]).addClass("middle");
      }
    }else {
      $this.addClass("active")
      start = ($this.index()+1).toString();
    }
  });

  // Fake input - file uploader
  var realInput = $('.fileinput');
  $(".file").on('click', function() {realInput.click();});

  var filename = undefined
  realInput.on('change', function() {
    filename = realInput.val().split(/\\|\//).pop();
    $(".fileinfo").text(filename);
  });


  // Form Posting handler
  $(".rectangle").on("click", function(){
    var name = $($("input")[0]).val();
    var website = $($("input")[1]).val();

    var country =  $("#country p").text().split("▾")[0];
    var city = $($("input")[2]).val();
    var datefield = $("p.date");
    var period = " " + datefield.text().split(" ")[0].substring(0, 3) + ", " + datefield.text().split(" ")[1]; // Yeyeyeyeyeye. It ain't dumb if it works.
    var desc = $("textarea").val();
    var file = $('.fileinput')[0].files[0];
    var missing = []

    var begin = Number(end) - $(".numbers .hidden").length;
    var final = Number(start) - $(".numbers .hidden").length;

    if(start!=undefined && end!=undefined)
      // Ensure formatting of date is 2nd - 24th, and not 24th - 2nd
      if(begin<final) var date = begin + "-" + final + period;
      else var date = final + "-" + begin + period;
    else var date = begin + period
    // TODO: Add custom input field for when months go across dates

    // we're using a loop so that we only bump to the top once after checking all fields
    function notify() {

      if(name === "") missing.push("name")
      if(city === "") missing.push("city")
      if(country === "Select a country...") missing.push("country")
      if(start === undefined) missing.push("date")

      function red(item){item.css("border", "1px solid #e05f5fbd")}

      if(missing.length === 0){
        return true
      }else{
        for(item in missing) {
          if(missing[item] === "name") red($($("input")[0]))
          else if(missing[item] === "city") red($($("input")[2]))
          else if(missing[item] === "country") red($("#country"))
          else if(missing[item] === "date") red($("#calendar"))
        }
      }
      window.scrollTo(0,0);
      return false
    }

    if(notify()){
      var formData = new FormData();
      var conference = {
        title: name,
        date: date,
        country: country,
        city: city,
        description: desc,
        website: website,
        image: filename
      }
      var str = JSON.stringify(conference)

      formData.append("data", str)
      formData.append("file", file);
      $.ajax({
        type: "POST",
        url: "/submit",
        contentType: false,
        data: formData,
        processData: false,
        success: function(r){
          if(r === "OK"){
            document.location.href = "/thanks"
          }
        },
        error: function (e) {
            console.log("some error", e);
        }
      });
    }
  })

  // reset on clicking, in case changed to alert it was missing
  $("input").each(function(){$(this).on("click", function(){$(this).css("border", "1px solid #DEE0E4")})})
  $("#country").on("click", function(){$(this).css("border", "1px solid #DEE0E4")})

})
