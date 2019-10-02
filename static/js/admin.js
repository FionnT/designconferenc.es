$(document).ready(function() {
  const $ = jQuery

  let realInput
  let file

  $('input').each(function() {
    let _this = $(this)
    let txt = _this.attr('placeholder')
    if (!_this.hasClass('password')) _this.val(txt)
    else {
      _this.on('keypress', function() {
        _this.data('updated', 'true')
      })
    }
  })

  $('.dropdown li').each(function(index) {
    $(this).on('click', function() {
      $('.sel')
        .data('admin', index)
        .val(index) // db stores this as a number
    })
  })

  $('.file').each(function() {
    let _this = $(this)
    _this.attr(
      'src',
      $(this)
        .attr('src')
        .replace(/'/g, '')
    )
    _this.on('click', function() {
      realInput = $($(_this.parents()[0]).find('.fileinput')[0])
      realInput.click()
      realInput.change(function() {
        file = this.files[0]
        _this.data('filename', file.name)
        let reader = new FileReader()
        reader.onloadend = function() {
          _this.attr('src', reader.result)
        }
        if (file) reader.readAsDataURL(file)
      })
    })
  })

  function notification(message) {
    let notifier = $('#notify')
    if (message !== 'Details were updated!') notifier.removeClass('happy')
    else notifier.addClass('happy')

    $('#notify p').text(message)
    notifier.animate(
      {
        opacity: '1'
      },
      350
    )
    setTimeout(function() {
      notifier.animate(
        {
          opacity: '0'
        },
        350
      )
    }, 2500)
  }

  $('.approve').each(function() {
    $(this).on('click', function() {
      let _this = $($(this).parents()[1])
      let formData = new FormData()
      let id = _this.data('id')
      let inputs = _this.find('input')
      let username = _this.find('.username')[0].value
      let name = _this.find('.name')[0].value
      let password = _this.find('.password')[0]
      let admin = $(_this.find('.sel'))
      let email = _this.find('.email')[0].value
      let filename = $(_this.find('img')[0]).data('filename')

      if (filename != '') {
        file = _this.find('.fileinput')[0].files[0]
        formData.append('file', file)
      } else filename = false

      if ($(password).data('updated') === 'true') password = password.value
      else password = false

      function notify() {
        let missing = []

        if (admin.text() === '') missing.push($($('.menu')[0]))

        // check the fields aren't empty
        for (i = 0; i <= 2; i++) {
          if (!$(inputs[i]).hasClass('password') && inputs[i].value === '')
            missing.push(inputs[i])
        }

        if (missing.length !== 0) {
          for (item in missing) {
            $(missing[item])
              .css('background-color', 'rgba(255,0,0,0.25')
              .on('click', function() {
                $(this).css('background-color', '#FFFFFF')
              })
          }
          window.scrollTo(0, 0)
          return false
        } else return true
      }

      if (notify()) {
        let request = {
          id,
          username,
          name,
          password,
          email,
          isAdmin: Number(admin.data('admin')), // db stores this as a number
          filename,
          remove: false
        }
        let str = JSON.stringify(request)

        formData.append('data', str)

        console.log(request, file)
        $.ajax({
          type: 'POST',
          url: '/update',
          contentType: false,
          data: formData,
          processData: false,
          success: function(r) {
            notification(r)
          },
          error: function(e) {
            console.log('some error', e)
          }
        })
      }
    })
  })

  $('.reject').each(function() {
    $(this).on('click', function() {
      let formData = new FormData()

      let _this = $($(this).parents()[1])
      let id = _this.data('id')
      let request = {
        id,
        remove: true
      }

      let str = JSON.stringify(request)
      formData.append('data', str)

      $.ajax({
        type: 'POST',
        url: '/update',
        contentType: false,
        data: formData,
        processData: false,
        success: function(r) {
          notification(r)
        },
        error: function(e) {
          console.log('some error', e)
          notification('Something went wrong!')
        }
      })
    })
  })
})
