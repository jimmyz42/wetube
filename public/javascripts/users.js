(function() {
  $(document).on('submit', '#login-form', function(evt) {
      evt.preventDefault();
      $.post(
          '/login',
          helpers.getFormData(this)
      ).done(function(response) {
          currentUser = response.content.username;
          window.location = '/';
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

  $(document).on('submit', '#register-form', function(evt) {
      evt.preventDefault();
      var formData = helpers.getFormData(this);
      if (formData.password !== formData.confirm) {
          $('.error').text('Password and confirmation do not match!');
          return;
      }
      delete formData['confirm'];
      console.log('about to post');
      console.log(formData);
      $.post(
          '/account',
          formData
      ).done(function(response) {
		  currentUser = response.content.user;
          window.location = '/';
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });

  $(document).on('click', '#logout-link', function(evt) {
      evt.preventDefault();
      $.post(
          '/logout'
      ).done(function(response) {
          currentUser = undefined;
          window.location = '/';
      }).fail(function(responseObject) {
          var response = $.parseJSON(responseObject.responseText);
          $('.error').text(response.err);
      });
  });  
    
   
  
})();
