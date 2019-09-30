$(document).ready(function() {
  /////////////////////////////////
  //          Calender           //
  /////////////////////////////////

  const $ = jQuery
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  let monthfield = $('p.date')
  let displayfield = $('p.selected')
  let current_year
  let current_month
  let empty_days
  let date
  let start_date = {}
  let end_date = {}
  let now = new Date()

  function highlight(first_date, last_date) {
    let date_box = $('.date')
    // More = Highlight right half only
    // Less = Highlight left half only
    if (first_date > last_date) {
      for (let i = last_date + 1; i <= first_date - 1; i++)
        $(date_box[i]).addClass('middle')
      $(date_box[first_date]).addClass('less')
      $(date_box[last_date]).addClass('more')
    } else {
      for (let i = first_date + 1; i <= last_date - 1; i++)
        $(date_box[i]).addClass('middle')
      $(date_box[last_date]).addClass('less')
      $(date_box[first_date]).addClass('more')
    }
  }

  function crossmonth() {
    if (
      end_date.month > start_date.month &&
      end_date.year === start_date.year
    ) {
      // Increasing months, but not year
      highlight(0, end_date.index)
      displayfield.text(
        start_date.date +
          ' ' +
          months[start_date.month].substring(0, 3) +
          ' - ' +
          end_date.date +
          ' ' +
          months[end_date.month].substring(0, 3) +
          ' ' +
          end_date.year
      )
    } else if (end_date.year > start_date.year) {
      // Increasing the year
      highlight(0, end_date.index)
      displayfield.text(
        start_date.date +
          ' ' +
          months[start_date.month].substring(0, 3) +
          ' ' +
          start_date.year +
          ' - ' +
          end_date.date +
          ' ' +
          months[end_date.month].substring(0, 3) +
          ', ' +
          current_year
      )
    } else if (
      end_date.month < start_date.month &&
      end_date.year === start_date.year
    ) {
      // Decreasing months, but not year
      highlight(end_date.index, 99)
      displayfield.text(
        end_date.date +
          ' ' +
          months[end_date.month].substring(0, 3) +
          ' - ' +
          start_date.date +
          ' ' +
          months[start_date.month].substring(0, 3) +
          ' ' +
          start_date.year
      )
    } else if (end_date.year < start_date.year) {
      // Decreasing the year
      highlight(end_date.index, 99)
      displayfield.text(
        end_date.date +
          ' ' +
          months[end_date.month].substring(0, 3) +
          ' ' +
          end_date.year +
          ' - ' +
          start_date.date +
          ' ' +
          months[start_date.month].substring(0, 3) +
          ', ' +
          start_date.year
      )
    } else if (
      start_date.index > end_date.index &&
      end_date.year === start_date.year
    ) {
      // Same month, user picked the end date first
      highlight(end_date.index, start_date.index)
      displayfield.text(
        end_date.date +
          ' - ' +
          start_date.date +
          ' ' +
          months[end_date.month].substring(0, 3) +
          ' ' +
          end_date.year
      )
    } else {
      displayfield.text(
        start_date.date +
          ' - ' +
          end_date.date +
          ' ' +
          months[start_date.month] +
          ', ' +
          current_year
      )
      highlight(start_date.index, end_date.index) // Same month, user picked the start date first
    }
  }

  function month_memory() {
    if (start_date.month == current_month && start_date.year == current_year) {
      if (start_date.month > end_date.month) {
        if (start_date.year < end_date.year) highlight(start_date.index, 99)
        else highlight(0, start_date.index)
      } else if (start_date.month < end_date.month) {
        if (start_date.year > end_date.year) highlight(0, start_date.index)
        else highlight(start_date.index, 99)
      } else if (
        start_date.month == end_date.month &&
        start_date.year == end_date.year
      ) {
        if (start_date.date != end_date.date) {
          highlight(start_date.index, end_date.index)
          $($('.date')[end_date.index]).addClass('active')
        } else {
          $($('.date')[start_date.index]).addClass('active')
        }
      }
      $($('.date')[start_date.index]).addClass('active')
    } else if (
      end_date.month == current_month &&
      end_date.year == current_year
    ) {
      if (start_date.month > end_date.month) {
        if (start_date.year < end_date.year) highlight(0, end_date.index)
        else highlight(end_date.index, 99)
      } else if (start_date.month < end_date.month) {
        if (start_date.year > end_date.year) highlight(end_date.index, 99)
        else highlight(0, end_date.index)
      }
      $($('.date')[end_date.index]).addClass('active')
    } else if (
      (start_date.month < current_month && end_date.month > current_month) ||
      (end_date.month < current_month && start_date.month > current_month)
    ) {
      highlight(0, 99)
    }
  }

  function time(month, year) {
    let m = new Date(year, month, 0)
    return [m.getDate(), m.getDay()]
    // returns array containing: [Days in x month, Day of the week x month starts on]
  }

  function calendar(month, year) {
    let container = $('.numbers')
    let days = time(month + 1, year)[0] // How many days there are; count from months from 1
    date = 0

    empty_days = time(month, year)[1] // What day it starts on, how many empty items to insert; count months from 0

    monthfield
      .text(months[month] + ' ' + year)
      .data('date', (month + ',' + year).toString()) // set month and year text descriptor, then store current month and year in data

    current_month = Number(monthfield.data('date').split(',')[0])
    current_year = Number(monthfield.data('date').split(',')[1])

    for (i = 0; i < empty_days; i++) {
      $($('.hidden')[0])
        .clone()
        .detach()
        .prependTo(container)
    } // Insert empty items to bump to correct starting date
    for (i = 0; i < days; i++) {
      $($('.hidden')[0])
        .clone()
        .detach()
        .removeClass('hidden')
        .appendTo(container)
    } // Insert items that contain the dates

    $('.numbers li.date').each(function() {
      let _this = $(this)
      if (!_this.hasClass('hidden')) {
        // Don't add dates to bump items
        if (date < days) {
          date += 1
          $(_this.find('p')).text(date)
        }
      }
    })
    month_memory()
  }

  if (document.location.href.match('edit')) {
    // adaptations for editing conferences
    start_date = $('#calendar').data('start')
    end_date = $('#calendar').data('end')
    calendar(start_date.month, start_date.year)
  } else calendar(now.getMonth(), now.getFullYear()) // Default to this month

  function reset(full) {
    if (full) $('.numbers').empty()
    date = 1
    $('.date').each(function() {
      $(this).removeClass('active middle more less') // you can pass multiple classes to the selector
    })
  }

  $('.numbers').on('click', '.date', function(event) {
    $('#calendar').css('border', '1px solid #DEE0E4') // reset on clicking, in case: changed to alert missing

    event.preventDefault()
    let _this = $(this)

    function select(which_date) {
      which_date.index = Number(_this.index() + 1)
      which_date.date = Number(_this.index() + 1 - empty_days)
      which_date.month = Number(current_month)
      which_date.year = Number(current_year)
      _this.addClass('active')
    }

    if (
      (start_date.hasOwnProperty('index') &&
        end_date.hasOwnProperty('index')) ||
      !start_date.hasOwnProperty('index')
    ) {
      start_date = {}
      end_date = {}
      reset(false)
      select(start_date)
      displayfield.text(
        start_date.date + ' ' + months[start_date.month] + ' ' + start_date.year
      )
    } else if (
      start_date.hasOwnProperty('index') &&
      start_date.index !== _this.index() + 1
    ) {
      select(end_date)
      crossmonth()
    }
  })

  // reset on clicking, in case changed to alert it was missing
  $('input').each(function() {
    $(this).on('click', function() {
      $(this).css('border', '1px solid #DEE0E4')
    })
  })
  $('#country').on('click', function() {
    $(this).css('border', '1px solid #DEE0E4')
  })

  $('.controls .left').on('click', function() {
    reset(true)
    if (current_month === 0) calendar(11, current_year - 1)
    // i.e. Change December to January
    else calendar(current_month - 1, current_year)
  })

  $('.controls .right').on('click', function() {
    reset(true)
    if (current_month === 11) calendar(0, current_year + 1)
    // i.e. Change January to December
    else calendar(current_month + 1, current_year)
  })

  /////////////////////////////////
  //    Form Posting handler     //
  /////////////////////////////////

  // Fake input - file uploader
  const realInput = $('.fileinput')
  let filename

  $('.file').on('click', function() {
    realInput.click()
  })

  realInput.on('change', function() {
    filename = realInput
      .val()
      .split(/\\|\//)
      .pop()
    $('.fileinfo').text(filename)
  })

  $('.rectangle').on('click', function() {
    // The file input on the conference editing page is first, therefore adjust the int to account
    let f = 0
    if (document.location.href.match('edit')) f = 1

    let missing = []
    let id = $('#suggest').data('id')
    let name = $($('input')[f]).val()
    let website = $($('input')[f + 1]).val()
    let country = $('#country p')
      .text()
      .split('▾')[0]
    let city = $($('input')[f + 2]).val()
    let desc = $('textarea').val()
    let file = $('.fileinput')[0].files[0]
    let text_date = displayfield.text()
    let start
    let end

    function notify() {
      if (name === '') missing.push('name')
      if (city === '') missing.push('city')
      if (country === 'Select a country...') missing.push('country')
      if (!start_date.hasOwnProperty('index')) missing.push('date')
      else if (!end_date.hasOwnProperty('index')) {
        end_date = start_date // assume it's a one day conference
        start = Date.UTC(start_date.year, start_date.month, start_date.date)
        end = start
      } else {
        start = Date.UTC(start_date.year, start_date.month, start_date.date)
        end = Date.UTC(end_date.year, end_date.month, end_date.date)
      }

      function red(item) {
        item.css('border', '1px solid #e05f5fbd')
      }

      if (missing.length === 0) {
        return true
      } else {
        // we're using a loop so that we only bump to the top once after checking all fields
        for (let item in missing) {
          if (missing[item] === 'name') red($($('input')[0]))
          else if (missing[item] === 'city') red($($('input')[2]))
          else if (missing[item] === 'country') red($('#country'))
          else if (missing[item] === 'date') red($('#calendar'))
        }
      }
      window.scrollTo(0, 0)
      return false
    }

    if (notify()) {
      // Set the UTC timestamps to the true ending date
      if (start >= end) {
        let x = start_date
        let y = end_date
        end_date = x
        start_date = y
        UTC_Date = start
      } else {
        UTC_Date = end
      }
      console.log(UTC_Date)
      let formData = new FormData()
      let conference = {
        id: id,
        title: name,
        text_date: text_date,
        UTC: UTC_Date,
        start_date: start_date,
        end_date: end_date,
        country: country,
        city: city,
        description: desc,
        website: website,
        image: filename
      }

      formData.append('data', JSON.stringify(conference))
      formData.append('file', file)
      $.ajax({
        type: 'POST',
        url: '/submit',
        contentType: false,
        data: formData,
        processData: false,
        success: function(r) {
          if (r === 'OK') {
            if (document.location.href.match('return')) {
              document.location.href =
                './' + document.location.href.split('return=')[1]
            } else document.location.href = '/thanks'
          }
        },
        error: function(e) {
          console.log('some error', e)
        }
      })
    }
  })
})
