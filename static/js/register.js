$(document).ready(function () {
  const $ = jQuery;
  const realInput = $('.fileinput');
  let filename;

  $('.file').on('click', function () { realInput.click() });

  realInput.on('change', function () {
    filename = realInput.val().split(/\\|\//).pop();
    $('.fileinfo').text(filename)
  });

  $('.dropdown li').each(function (index) {
    $(this).on('click', function () {
      $('.sel').val(index) // db stores this as a number
    })
  });

  function notification (message) {
    const notifier = $('#notify');

    if (message !== 'User is registered!') notifier.removeClass('happy');
    $('#notify p').text(message);

    notifier.animate({
      opacity: '1'
    }, 350);
    setTimeout(function () {
      notifier.animate({
        opacity: '0'
      }, 350)
    }, 2500)
  }

  $('.rectangle').on('click', function () {
    const inputs = $('input');
    const admin = $('.sel');
    let email = inputs[0].value;
    let username = inputs[1].value;
    let personname = inputs[2].value;
    let password = inputs[3].value;
    let file = $('.fileinput')[0].files[0];

    function notify () {
      let missing = [];

      if (admin.text() === '') missing.push($($('.menu')[0]));

      for (i = 0; i < 5; i++) // check the fields aren't empty
      { if (inputs[i].value === '') missing.push(inputs[i]) }

      if (!file) missing.push($('.file'));
      else filename = file.name;

      if (missing.length !== 0) {
        for (let item in missing) {
          $(missing[item]).css('background-color', 'rgba(255,0,0,0.25').on('click', function () {
            $(this).css('background-color', '#FFFFFF')
          })
        }
        window.scrollTo(0, 0)
        return false
      } else return true
    }

    if (notify()) {
      let formData = new FormData();
      let user = {
        username: username,
        name: personname,
        password: password,
        email: email,
        isAdmin: admin.val(),
        filename: filename
      };

      let str = JSON.stringify(user);
      formData.append('data', str);
      formData.append('file', file);

      $.ajax({
        type: 'POST',
        url: '/register',
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
});
