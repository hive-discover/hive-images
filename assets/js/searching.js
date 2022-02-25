let all_images = {};  // {img-url : {author, permlink...}}
let modal_images = []; // [url1, url2, ... urln]

// LIFO Stacks for Image Modals
let post_img_modal_stack = []; // data = identifier

String.prototype.hashCode = function() {
    var hash = 0, i = 0, len = this.length;
    while ( i < len ) {
        hash  = ((hash << 5) - hash + this.charCodeAt(i++)) << 0;
    }
    return hash;
};

const closeAllModals = () => {
    // Close and Reset all Modals
    post_img_modal_stack = [];

    $('#image-modal').modal('hide');
    $('#image-expand').modal('hide');
}

const clearSearch = () => {
    all_images = {};
    $('#container-search-results').empty();

    document.getElementById("search_img_error").style.display = "none";
    document.getElementById('section-search-results').style.display = 'block';
    document.getElementById('label-no-results').style.display = 'none';
    document.getElementById('search-loading-spinner').style.display = 'block';
}

const loadSimilarImagesToExanded = async (img_url) => {
    document.getElementById("modal-image-sim-container").innerHTML = "";
    document.getElementById("image-expand-sim-label").style.display = "none";

    // Get sim-data
    const response = await fetch(API_ADDRESS + '/images/similar-url?url=' + img_url, {
        method: 'GET'
    })
        .then(async (resp) => {return await resp.json();})
        .catch(err => { console.error(err); return null;});
    

    if(!response || response.status !== "ok" || !response.sim_objs) {
        // Something went wrong
        $('#modal-something-went-wrong').modal('show');    
        return;
    }

    if(response.sim_objs.length)
        document.getElementById("image-expand-sim-label").style.display = "block";

    // Add Images
    for(let i = 0; i < response.sim_objs.length; i++){
        // Get Info and Add only if not already added in all_images
        let info = response.sim_objs[i];
        info.imgs = info.images;

        if(!all_images[info.imgs[0].hashCode()]) 
            all_images[info.imgs[0].hashCode()] = info;
        

        const img_html = `
            <div class="col-md-6 col-lg-4">
                <a class="d-block mx-auto portfolio-item" href="javascript:showImageModal('${info.imgs[0].hashCode()}');">
                    <div class="d-flex portfolio-item-caption position-absolute h-100 w-100">
                        <div class="text-center text-white my-auto portfolio-item-caption-content w-100">
                            <i class="fa fa-search-plus fa-3x"></i>
                        </div>
                    </div>
    
                    <img class="img-fluid" src="${info.sim_url}" loading="lazy" />
                    <p style="float: right;">by <small>@${info.author}</small></p>
                    </a>
            </div>
        `;
        document.getElementById("modal-image-sim-container").innerHTML += img_html;
    }
       
}

const expandImage = (img_url, author, permlink) => {
    document.getElementById("expand-image-url").src = "placeholder.png";
    document.getElementById("expand-image-url").src = img_url;
    document.getElementById("expand-image-label-url").value = img_url;
    document.getElementById("exand-image-permlink").value = permlink;
    document.getElementById("exand-image-author").value = "@" + author;
    
    $('#image-expand').modal('show');   

    loadSimilarImagesToExanded(img_url);
}

const onCloseExandImageModal = () => {
    // Maybe open the source post modal
    if(!post_img_modal_stack.length)
        return;

    // Get Last Element and when it is already loaded (in-place), abort and run next round
    const identifier = post_img_modal_stack.pop();
    const img_data = all_images[identifier];
    if(document.getElementById("modal-title").innerText === '"' + img_data.title + '"' && document.getElementById("modal-author").innerText === "by @" + img_data.author)
        return onCloseExandImageModal();

    showImageModal(identifier, false);
}

const showImageModal = (identifier, enter_in_stack=true) => {
    const img_data = all_images[identifier];
    modal_images = [];

    // Set Modal-Properties
    $('#modal-title').text('"' + img_data.title + '"');
    $('#modal-author').text("by @" + img_data.author);
    document.getElementById("image-modal-peakd-link").href = "https://peakd.com/@" + img_data.author + "/" + img_data.permlink;
    document.getElementById("container-post-images").innerHTML = "";
    document.getElementById("modal-loader").style.display = "block";

    $('#image-modal').modal('show');
    $('#image-expand').modal('hide');

    // Show All Images
    for(let i = 0; i < img_data.imgs.length; i++){
        const img_html = `
            <div class="col-md-6 col-lg-4" style="margin: auto">
                <a class="d-block mx-auto portfolio-item" href="javascript:expandImage('${img_data.imgs[i]}', '${img_data.author}', '${img_data.permlink}');">
                    <div class="d-flex portfolio-item-caption position-absolute h-100 w-100">
                        <div class="text-center text-white my-auto portfolio-item-caption-content w-100">
                            <i class="fa fa-expand"></i>
                        </div>
                    </div>
                    <img class="img-fluid" src="${img_data.imgs[i]}" loading="lazy" />
                    </div>
                </a>
            </div>
        `;

        modal_images.push(img_data.imgs[i]);
        $('#container-post-images').append(img_html);
    }

    // Disable Loader
    document.getElementById("modal-loader").style.display = "none";

    if(enter_in_stack)
        post_img_modal_stack.push(identifier);
}

const addOneImage = (identifier, container_id = "container-search-results") => {
    const img_data = all_images[identifier];

    // Add to HTML
    const img_html = `
        <div class="col-md-6 col-lg-4">
            <a class="d-block mx-auto portfolio-item" href="javascript:showImageModal('${identifier}');">
                <div class="d-flex portfolio-item-caption position-absolute h-100 w-100">
                    <div class="text-center text-white my-auto portfolio-item-caption-content w-100">
                        <i class="fa fa-search-plus fa-3x"></i>
                    </div>
                </div>

                <img class="img-fluid" src="${img_data.imgs[0]}" loading="lazy" />
                <p style="float: right;">by <small>@${img_data.author}</small></p>
                </a>
        </div>
    `;
    $('#' + container_id).append(img_html);
}

const addOnePost = async (post, container_id = "container-search-results") => {
    if(!post) return; // No Post

    // Remove not-strings from images
    post.images = post.images.filter(url => typeof url === 'string');

    all_images[post.images[0].hashCode()] = {
        author : post.author,
        permlink : post.permlink,
        title : post.title,
        imgs : post.images.filter(elem => {return !blocked_urls.includes(elem);})
    }

    addOneImage(post.images[0].hashCode(), container_id); 
}

const loadResults = async (result_posts, start_imgs = 15) => {
    // Check if results exist
    if(!result_posts || result_posts.length === 0){
        document.getElementById('search-loading-spinner').style.display = 'none';
        document.getElementById("btn-load-more-images").style.display = "none";
        document.getElementById('label-no-results').style.display = 'block';
        return;
    }

    // Load first Images
    for(let i = 0; result_posts.length > 0, i < start_imgs; i++)
        await addOnePost(result_posts.shift());

    document.getElementById('search-loading-spinner').style.display = 'none';

    if(result_posts.length > 0) // Show Load-More Buttons only when there are more results
        document.getElementById("btn-load-more-images").style.display = "block";
    else
        document.getElementById("btn-load-more-images").style.display = "none";

    // Set more Loading-Button-Event    
    $("#btn-load-more-images").click(async () => {
        document.getElementById("btn-load-more-images").style.display = "none";
        document.getElementById('search-loading-spinner').style.display = 'block';

        // Load start_imgs more Images
        for(let i = 0; result_posts.length > 0, i < start_imgs; i++)
            await addOnePost(result_posts.shift());

        if(result_posts.length > 0)
            document.getElementById("btn-load-more-images").style.display = "block";
        document.getElementById('search-loading-spinner').style.display = 'none';
    });
}

const getTextSearchAPIData = async (query, amount = 100) => {
    const request_body = {
        query : query,
        amount : amount,
        full_data : true,
        sorting : "smart"
    };

    // Send Ajax request to server
    const response = await new Promise((resolve, reject) =>{
        $.ajax({
            url: API_ADDRESS + "images/text",
            contentType: 'application/json;charset=UTF-8',
            method: 'POST',
            data : JSON.stringify(request_body),
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error); 
            }
        });
    });

    if(!response || response.status !== "ok" || !response.posts){
        // An error occurred
        console.error(error);
        document.getElementById('label-no-results').style.display = 'block';
        document.getElementById('search-loading-spinner').style.display = 'none';
        $('#modal-something-went-wrong').modal('show');  
        return;
    }

    // Show results
    await loadResults(response.posts); 
}

const getSimilarSearchAPIData = async (img_desc, amount = 100) => { 

    const request_body = {
        img_desc : img_desc,
        amount : amount,
        full_data : true
    };

    // Send Ajax request to server
    const response = await new Promise((resolve, reject) =>{
        $.ajax({
            url: API_ADDRESS + "/images/similar",
            contentType: 'application/json;charset=UTF-8',
            method: 'POST',
            data : JSON.stringify(request_body),
            success: function (response) {
                resolve(response);
            },
            error: function (error) {
                reject(error); 
            }
        });
    });

    if(!response || response.status !== "ok" || !response.posts){
        // An error occurred
        console.error(error);
        document.getElementById('label-no-results').style.display = 'block';
        document.getElementById('search-loading-spinner').style.display = 'none';
        $('#modal-something-went-wrong').modal('show');  
        return;
    }

    // Show results
    await loadResults(response.posts);
}


const OnClick_SearchByIMG = async () => { 
    if(document.getElementById("upload").files.length == 0){
        // Nothing was uploaded
        return;
    }

    clearSearch();

    // Make FormData
    form = new FormData();
    form.append("file", document.getElementById("upload").files[0]);

    // Send fetch-request to get an image-description
    let response = await fetch(LBP_API_ADDRESS + 'img', {
        method: 'POST',
        body: form
    }).catch(err => { console.error(err);});

    if(response === undefined || response.status !== 200){
        // Something wen wrong
        document.getElementById('label-no-results').style.display = 'block';
        document.getElementById('search-loading-spinner').style.display = 'none';
        $('#modal-something-went-wrong').modal('show');    
        return;
    }

    // Search for similar images
    let result_body = await response.json();
    await getSimilarSearchAPIData(result_body.description)  
}

const OnClick_SearchByURL = async () => {
    const img_url = $('#txt_search_img_url').val();
    if(img_url.length == 0){
        document.getElementById('label-no-results').style.display = 'block';
        return;
    }

    clearSearch();

    // Load image - as soon as it loaded, we we send the request to our server
    document.getElementById('img_search_url').onload = async () => {
        // Image was loaded successfully
        // Send fetch-request to get an image-description
        let response = await fetch(LBP_API_ADDRESS + 'url?img_url=' + img_url, {method : "POST"})
                                .catch(err => { console.error(err);});

        if(response === undefined || response.status !== 200){
            // Something wen wrong
            document.getElementById('label-no-results').style.display = 'block';
            document.getElementById('search-loading-spinner').style.display = 'none';
            $('#modal-something-went-wrong').modal('show');    
            return;
        }

        // Search for similar images
        let result_body = await response.json();
        await getSimilarSearchAPIData(result_body.description);  
    }
    document.getElementById('img_search_url').onerror = () => {
        // Cannot Load Image
        document.getElementById("search_img_error").style.display = "block";
        document.getElementById('label-no-results').style.display = 'block';
        document.getElementById('search-loading-spinner').style.display = 'none';

        document.getElementById('img_search_url').onload = null;
        document.getElementById('img_search_url').src = "";
    }
    
    // Start to load the Image
    document.getElementById('img_search_url').src = img_url;   
}

const OnClick_SearchByTopic = async () => {
    const text_query = $('#txt_search_topics').val();
    if(text_query.length == 0){
        document.getElementById('label-no-results').style.display = 'block';
        return;
    }

    clearSearch();
    
    // Get and Set Search Data
    await getTextSearchAPIData(text_query);
}
