$(document).ready(function () {

  var realInput = $('.fileinput')
  var filename = false
  var file

  $("input").each(function(){
    var _this = $(this)
    var txt = _this.attr("placeholder")
    if(!_this.hasClass("password")) _this.val(txt)
    else {
      _this.on("keypress", function(){
        _this.data("updated", "true")
      })
    }
  })

  $('.dropdown li').each(function (index) {
    $(this).on('click', function () {
      $('.sel').data("admin", index) // db stores this as a number
    })
  })

  $(".file").each(function(){
    var _this = $(this)
    _this.attr("src", $(this).attr('src').replace(/'/g, ''))
    _this.on('click', function () { realInput.click() })
  })

  realInput.on('change', function () {
    filename = realInput.val().split(/\\|\//).pop()
    $('.fileinfo').text(filename)
  })

  $('.dropdown li').each(function (index) {
    $(this).on('click', function () {
      $('.sel').val(index)
    })
  })

  function notification (message) {

    var notifier = $('#notify')
    if (message != 'Details Updated!') notifier.removeClass('happy')

    $('#notify p').text(message)
    notifier.animate({
      opacity: '1'
    }, 350)
    setTimeout(function () {
      notifier.animate({
        opacity: '0'
      }, 350)
    }, 2500)
  }

  $('.approve').each(function(){
    $(this).on('click', function () {


      var _this = $($(this).parents()[1]);
      var formData = new FormData()
      var id = _this.data("id")
      var inputs = _this.find('input')
      var username = _this.find(".username")[0].value
      var personname = _this.find(".name")[0].value
      var password = _this.find(".password")[0]
      var admin = $(_this.find(".sel"))
      var email = _this.find(".email")[0].value


      if(filename) {
        file = $('.fileinput')[0].files[0]
        formData.append('file', file)
      }
      if($(password).data("updated") === "true") password = password.value
      else password = false

      function notify () {
        var missing = []

        if (admin.text() === '') missing.push($($('.menu')[0]))

        // check the fields aren't empty
        for (i = 0; i <= 2; i++) {
          if (!$(inputs[i]).hasClass('password') && inputs[i].value === '') missing.push(inputs[i])
        }

        if (filename) filename = file.name

        if (missing.length != 0) {
          for (item in missing) {
            $(missing[item]).css('background-color', 'rgba(255,0,0,0.25').on('click', function () {
              $(this).css('background-color', '#FFFFFF')
            })
          }
          window.scrollTo(0, 0)
          return false
        } else return true
      }

      if (notify()) {

        var user = {
          id: id,
          username: username,
          name: personname,
          password: password,
          email: email,
          isAdmin: Number(admin.data("admin")), // db stores this as a number
          filename: filename
        }
        var str = JSON.stringify(user)
        formData.append('data', str)

        $.ajax({
          type: 'POST',
          url: '/update',
          contentType: false,
          data: formData,
          processData: false,
          success: function (r) {
            notification(r)
          },
          error: function (e) {
            console.log('some error', e)
          }
        })
      }
    })
  })

  $('.reject').each(function(){
    var _this = $($(this).parents()[1]);
    var formData = new FormData()
    var id = _this.data("id")

    var user = {
      id: id,
      username: username,
      name: personname,
      password: password,
      email: email,
      isAdmin: Number(admin.data("admin")), // db stores this as a number
      filename: filename
    }
    var str = JSON.stringify(user)
  })


})
