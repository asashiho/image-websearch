//  -----------------------------------------------------------------------------
//  -- Google Cloud Vision API WebDetection Sample -- 
//  -----------------------------------------------------------------------------

// このAPI_KEYにAPIキーを設定してください
// 例えば、APIキーが「abcdefg12345」の場合次のように指定します
var API_KEY = 'abcdefg12345';


// Vision API Endpoint
var GOOGLE_URL = 'https://vision.googleapis.com/v1/images:annotate?key=' + API_KEY;

// file upload 
$(function() {
    $('#fileform').on('submit', uploadFiles);

    // jquery.uploadThumbs
    $('#InputFile').uploadThumbs({
        position: 3, // 0:before, 1:after, 2:parent.prepend, 3:parent.append,
        // any: arbitrarily jquery selector
        imgbreak: true // append <br> after thumbnail images
    });

});

function uploadFiles(event) {
    event.preventDefault(); // Prevent the default form post

    var file = $('#fileform [name=imagefile]')[0].files[0];
    var reader = new FileReader();

    reader.onloadend = sendFileToCloudVision;
    reader.readAsDataURL(file);
}


// call google Vision API
function sendFileToCloudVision(event) {
    var content = event.target.result;

    // request
    var request = {
        requests: [{
            image: {
                content: content.replace('data:image/jpeg;base64,', '')
            },
            features: [{
                type: 'WEB_DETECTION',
                maxResults: 20
            }]
        }]
    };


    // POST
    $.post({
        url: GOOGLE_URL,
        data: JSON.stringify(request),
        contentType: 'application/json'
    }).fail(function(jqXHR, textStatus, errormsg) {
        $('#results_desc').text('error: ' + textStatus + ' ' + errormsg);
    }).done(displayVision);
}


// view response data
function displayVision(data) {
    var contents = $.parseJSON(JSON.stringify(data));

    // show webEntities.Description!
    // 
    var webEntities = contents.responses["0"].webDetection.webEntities;
    var desc = [];

    // show result area
    $('#results_desc').removeClass('hidden');
    $('#results_desc_msg').removeClass('hidden');

    $.each(webEntities,
        function(description, elem) {

            if (elem.description != null) {
                // push desc array
                desc.push(elem.description);
                
                // show display
                $('<li></li>')
                    .append(elem.description)
                    .appendTo('#results_desc');
            }
        }
    );

    // Vision API uses the power of Google Image Search to find topical entities.
    // Combine this with Visually Similar Search to find similar images on the web.
    // 
    // show webDetection.visuallySimilarImages
    var sameImages = contents.responses["0"].webDetection.visuallySimilarImages;
    var sameimg = [];

    // show result area
    $('#results_img_area').removeClass('hidden');


    $.each(sameImages,
        function(url, elem) {

            if (elem.url != null) {
                sameimg.push(elem.url);
                
                // show display
                $('#results_img').append($('<a>link</a>').attr({href:elem.url,target:"_blank"}));
                $('#results_img').append($("<img>").attr({"src":elem.url,"alt":"Photo"}));
            }
        }
    );

    // for debug
    console.log(contents);

}

