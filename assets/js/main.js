
const API_ADDRESS = "https://api.hive-discover.tech/v1/";
const LBP_API_ADDRESS = "https://lbp-api.hive-discover.tech/";

const blocked_urls = [
    "https://files.peakd.com/file/peakd-hive/ridor5301/245cyhmmwFDnV4yecfPyUyx3YJv9iNwTkpUXajj584WdwFtdRGyQL7dc55JnJ4a67UQRH.jpg", // Photography Image
    "https://images.hive.blog/DQmNWT3pij1jZRAH8cdLathMLxkAeCBYESj8oKscYS786jW/Line HIve.png", // Hive Logo
    "https://images.hive.blog/DQmWNkFtbpcrjeLjgQhCGCJPJ8fxnZdJ2jjZyAxDYW5zLsg/IMG_20210920_155748.jpg", // Weird Banner
]


$().ready(() => {
    $('#btn_search_topics').click(OnClick_SearchByTopic);
    $('#btn_search_img_url').click(OnClick_SearchByURL);
    $('#btn_search_uploaded').click(OnClick_SearchByIMG);
    
    $('#btn-search-usage').click(getUsageData);
    $('#btn-close-all-modals').click(closeAllModals);


    // Enter-event, when on the url-similar-search input
    if(document.getElementById("txt_search_img_url")){
        document.getElementById("txt_search_img_url").addEventListener("keyup", (event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode !== 13) return;
            event.preventDefault();
            OnClick_SearchByURL();
        }); 
    }
    // Enter-Event, when on the topic search input
    if(document.getElementById("txt_search_topics")){
        document.getElementById("txt_search_topics").addEventListener("keyup", (event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode !== 13) return;
            event.preventDefault();
            OnClick_SearchByTopic();
        });
    }
    // Enter-Event, when on the usage username input
    if(document.getElementById("txt_usage_username")){
        document.getElementById("txt_usage_username").addEventListener("keyup", (event) => {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode !== 13) return;
            event.preventDefault();
            getUsageData();
        });
    }

    // Close-Event, when Post-Modal is closed
  //  $('#image-expand').on('hide.bs.modal', onCloseExandImageModal);
    $('#image-modal').on('hidden.bs.modal', onCloseExandImageModal);

    // Check URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    //  * Query is set?
    if(urlParams.get("q")){     
        $('#txt_search_topics').val(urlParams.get("q"));
        $('#btn_search_topics').click();
    }
    //  * Usage Username is set?
    if(urlParams.get("usage_username")){
    
    }
});