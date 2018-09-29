// Save profile changes to DB
function editProfile() {
  // First, ensure changes have been made
  if ($('#profileName').attr('alt') === $('#profileName').val() && $('#profileLocation').attr('alt') === $('#profileLocation').val()) {
    return Materialize.toast('No changes have been made.', 2000);
  }

  // Then, ensure changes are valid
  if ($('input').hasClass('invalid')) return Materialize.toast('Invalid information.', 2000, 'error');

  // If changes have been made, update the user's profile in the DB
  progress('show');
  ajaxFunctions.ajaxRequest('PUT',
    `/api/user/${$('#profileName').val()}/${$('#profileLocation').val()}`, (res) => {
      const result = JSON.parse(res);

      // Update UI with new user info
      $('#navName').html(`${result.name.split(' ')[0]}`);
      $('#navImg').attr('alt', `${result.name}`);
      $('#profileName').val(`${result.name}`);
      $('#profileName').attr('alt', `${result.name}`);
      $('#profileLocation').val(`${result.location}`);
      $('#profileLocation').attr('alt', `${result.location}`);

      // Close modal and notify the user
      $('#profileModal').modal('close');
      Materialize.toast('Your profile has been updated!', 2000);
      progress('hide');
    });
}

// Cancel profile changes
function resetProfile() {
  // Restore original profile values
  $('#profileName').val($('#profileName').attr('alt'));
  $('#profileLocation').val($('#profileLocation').attr('alt'));
  $('input').removeClass('invalid');

  // Close modal and notify the user
  $('#profileModal').modal('close');
  Materialize.toast('No changes have been made.', 2000);
}
