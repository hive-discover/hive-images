let usage_modal_data = {
    // remaining_posts : [],
};


const clearUsageModal = () => {   
    document.getElementById('container-usage-posts').innerHTML = '';

    document.getElementById('usage-nothing-was-found').style.display = '';
    document.getElementById('usage-loader').style.display = 'none';  
    document.getElementById('btn-usage-load-more').style.display = 'none';  

    usage_modal_data = {};
}

const addOneUsagePost = (post) => {
    const peakd_post_link = "https://peakd.com/@" + post.author + "/" + post.permlink;
    const container = `
        <div class="col col-md-12" style="margin-bottom: 20px">
            <div class="row">
                <div class="col col-md-3"><img class="col-md-12" loading="lazy" src="`+post.images[0]+`" /></div>
                <div class="col col-md-9" style="margin: auto;">
                    <h3>
                        ` + post.title + `
                        <small>
                            - @<a href="https://peakd.com/@`+post.author+`" target="_blank">`+post.author+`</a>
                        </small>
                    </h3><a href="`+peakd_post_link+`" target="_blank" style>Read it on PeakD</a>
                </div>
            </div>
            <hr/>
        </div>      
    `;

    document.getElementById('container-usage-posts').innerHTML += container;
}

const showSomeUsagePosts = (amount = 7) => {
    document.getElementById('usage-loader').style.display = ''; 

    let counter = 0;
    while(usage_modal_data.remaining_posts && usage_modal_data.remaining_posts.length > 0 && counter < amount){
        counter += 1;
        addOneUsagePost(usage_modal_data.remaining_posts.shift());
    }

    document.getElementById('usage-loader').style.display = 'none'; 
    if(!usage_modal_data.remaining_posts || usage_modal_data.remaining_posts.length === 0)
        document.getElementById('btn-usage-load-more').style.display = 'none'; 
    else
    document.getElementById('btn-usage-load-more').style.display = ''; 
}

const getUsageData = async () => {
    clearUsageModal();
    const username = $('#txt_usage_username').val();
    if(username.length < 2){
        alert("Please enter an username");
        return;
    }

    document.getElementById('usage-nothing-was-found').style.display = 'none';
    document.getElementById('usage-loader').style.display = '';  

    // Get response from the SERVER
    let response = await fetch(API_ADDRESS + 'images/used?username=' + username, {
        method: 'GET'
    }).catch(err => { console.error(err);});

    if(response === undefined || response.status !== 200){
        // Something went wrong
        $('#modal-something-went-wrong').modal('show');
        clearUsageModal();
        return;
    }

    // We got a valid response
    usage_modal_data.remaining_posts = (await response.json()).posts;
    if(usage_modal_data.remaining_posts.length === 0){
        // No data
        clearUsageModal();
        document.getElementById('usage-nothing-was-found').style.display = '';
        return;
    }

    // We got some data
    showSomeUsagePosts();
};


