$(document).ready(function(){

  var realInput = $('.fileinput');
  $(".file").on('click', function() {realInput.click();});

  var filename = undefined
  realInput.on('change', function() {
    filename = realInput.val().split(/\\|\//).pop();
    $(".fileinfo").text(filename);
  });


  function register(){

    var inputs = container.find("input");

    var name = inputs[1].value;
    var date = inputs[2].value;
    var city = inputs[3].value.split(", ")[0];
    var country = inputs[3].value.split(", ")[1];
    var website = inputs[4].value;
    var file = container.find('.fileinput')[0].files[0]
    var desc = container.find("textarea")[0].value;

    if(file) var filename = file.name
    else if($(container.find('.img')[0]).css("background-image") != "url(\"http://localhost/img/placeholder.png\"\)") var filename = ($(container.find('.img')[0]).css("background-image")).split("/pending/")[1].replace("\")", "")
    else var fileName = false;

    var formData = new FormData();

    var conference = {
      title: name,
      date: date,
      country: country,
      city: city,
      description: desc,
      website: website,
      image: filename,
      approve: true
    }

    formData.append("data", JSON.stringify(conference))
    formData.append("file", file);

    $.ajax({
      type: "POST",
      url: "/submit",
      contentType: false,
      data: formData,
      processData: false,
      success: function(r){
        if(r === "OK"){
          clear(container)
        }
      },
      error: function (e) {
          console.log("some error", e);
      }
    });
  }


  $("rectangle").on("click", function(){ register()})

})
