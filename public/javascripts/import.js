(function() {
    
    $(document).on('submit', '#import-playlist-form', function(evt){
        evt.preventDefault();
        var checkedBoxes = $('input[name="playlist"]:checked');
        var checkedValues = [];
        for (var i=0; i<checkedBoxes.length; i++){
            checkedValues.push({playlistID:$(checkedBoxes[i]).val(), ownerID:$(checkedBoxes[i]).data('ownerid')});
        }
        console.log('checked values');
        console.log(checkedValues);
        alert(checkedValues[0].ownerID + checkedValues[0].playlistID);
        $.post(
            '/import',
            {content: JSON.stringify(checkedValues)}
        ).done(function(response) {
            window.location = '/profile';
        }).fail(function(responseObject) {
            var response = $.parseJSON(responseObject.responseText);
            $('.error').text(response.err);
        });
    });
  
})();
