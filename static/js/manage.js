$(document).ready(function(){

  // attach to each, instead of all so that we can update individually
  $(".remove").each(function(){
    $(this).on("click", function(){
      $($(this).parents()[1]).css("background-image", "url(./img/placeholder.png)")
    })
  })
  $(".upload").each(function(){
    $(this).on("click", function(){
      $($($(this).parents()[2]).find(".fileinput")[0]).click()
    })
  })
  $(".item.big.admin").each(function(){ // Input and textarea are self closing elements
    var input = $(this).find("input");  // Therefore we can't set values dynamically with pug (you could also use the data field)
    for(item in input){                 // So we set their placeholder dynamically, update their val using this script
      //skip the file input             // then we change their placeholders so users can still know when they're empty
      if(item>=1){
        var thing = $(input[item])
        thing.val(thing.attr('placeholder'))
        thing.attr('placeholder', 'You emptied this!')
      }
    }
    var text = $($(this).find("textarea")[0])
    text.val(text.attr('placeholder'))
    text.attr('placeholder', 'You emptied this!')
  })

  var changed = false;
  $(".fileinput").each(function(){
    $(this).change(function () {
        changed = true;
        var file = this.files[0];
        var reader = new FileReader();
        var container = $($($(this).parents()[0]).find(".img")[0])
        reader.onloadend = function () {
           container.css('background-image', 'url("' + reader.result + '")');
        }
        if (file) reader.readAsDataURL(file);
    });
  })


  // Form Posting handler; we're doing this again because the fields are different
  $(".approve").each(function(){
    $this = $(this)
    $this.on("click", function(){
      var container = $($(this).parents()[1])
      console.log(container)
      var inputs = container.find("input");

      var name = inputs[1].value;
      var date = inputs[2].value;
      var city = inputs[3].value.split(", ")[0];
      var country = inputs[3].value.split(", ")[1];
      var website = inputs[4].value;
      var file = container.find('.fileinput')[0].files[0]
      var desc = container.find("textarea")[0].value;

      if(file) var filename = file.name
      else if(changed) var filename = ($(container.find('.img')[0]).css("background-image")).split("/pending/")[1].replace("\")", "")
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
      }
      var str = JSON.stringify(conference)

      formData.append("data", str)
      formData.append("file", file);

      function clear(){
        var params = {
          id: container.data("id").toString(),
          type: "suggestion"
        }
        var formData = new FormData();
        formData.append("data", params)
        $.ajax({
          type: "POST",
          url: "/purge",
          contentType: false,
          data: formData,
          processData: false,
          success: function(r){
            if(r === "OK"){
              container.fadeOut()
            }
          },
          error: function (e) {
              console.log("some error", e);
          }
        });
      }

      $.ajax({
        type: "POST",
        url: "/submit",
        contentType: false,
        data: formData,
        processData: false,
        success: function(r){
          if(r === "OK"){
            clean()
          }
        },
        error: function (e) {
            console.log("some error", e);
        }
      });

    })
  })

})
