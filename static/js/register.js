$(document).ready(function(){

  var realInput = $('.fileinput');
  $(".file").on('click', function() {realInput.click();});

  var filename = undefined
  realInput.on('change', function() {
    filename = realInput.val().split(/\\|\//).pop();
    $(".fileinfo").text(filename);
  });

  $(".dropdown li").each(function(index){
    $(this).on("click", function(){
      $(".sel").val(index) //db stores this as a number
    })
  })

  function notification(message){
    var notifier = $("#notify");

    notifier.removeClass("happy")
    if(message==="User is registered!") notifier.addClass("happy")

    $("#notify p").text(message);
    notifier.animate({
      "opacity": "1"
    }, 350)
    setTimeout(function(){
      notifier.animate({
        "opacity": "0"
      }, 350)
    }, 2500)
  }

  $(".rectangle").on("click", function(){
    var inputs = $("input");
    var admin = $(".sel");
    var email = inputs[0].value
    var username = inputs[1].value
    var personname = inputs[2].value
    var password = inputs[3].value

    var file = $('.fileinput')[0].files[0]
    function notify(){
     var missing = [];

     if(admin.text()==="") missing.push($($(".menu")[0]))

     for(i=0;i<5;i++) // check the fields aren't empty
       if(inputs[i].value === "") missing.push(inputs[i])

     if(!file) missing.push($(".file"))
     else var filename = file.name;

     if(missing.length!=0){
       for(item in missing){
         $(missing[item]).css("background-color", "rgba(255,0,0,0.25").on("click", function(){
           $(this).css("background-color", "#FFFFFF")
         })
       }
       console.log(missing)
       window.scrollTo(0,0);
       return false;
     }else return true;
    }

    if(notify()){
      var formData = new FormData();
      var user = {
        username: username,
        name: personname, //for some reason if I call this var 'name' it doesn't work
        password: password,
        email: email,
        isAdmin: admin.val(),
        filename: filename
      }
      var str = JSON.stringify(user)
      formData.append("data", str);
      formData.append("file", file);
      $.ajax({
        type: "POST",
        url: "/register",
        contentType: false,
        data: formData,
        processData: false,
        success: function(r){
          notification(r)
        },
        error: function (e) {
          console.log("some error", e);
        }
      });
    }
  })

})
