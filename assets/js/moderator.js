
async function loadMuteList() {
    document.getElementById("btn_load_mute_list").style.display = "none";

    // Fetch data from the server
    const resp = await fetch(API_ADDRESS + `/images/mute-list`)
        .then(response => response.json())
        .catch(error => {console.error(error)})

    if(!resp || !resp.result || !resp.status === "ok") {
        // Something went wrong
        alert("Something went wrong"); 
        document.getElementById("btn_load_mute_list").style.display = "";
        return;
    }

    // Activate All
    document.getElementById("lbl_mute_list_title").style.display = "";
    document.getElementById("muted-accounts-container").style.display = "";
    document.getElementById("muted-posts-container").style.display = "";
    document.getElementById("mute-list-section").style.background = "";

    // Fill all accounts
    resp.result.forEach(elem => {
        if(elem.type === "acc"){
            document.getElementById("muted-accounts-container").innerHTML += `
                <div class="col col-md-2 text-center">
                    <h6 style="margin: 0px;padding: 0px;">Account</h6>
                    <p>@${elem._id}</p>
                </div>
            `;
        }

        if(elem.type === "post"){
            document.getElementById("muted-posts-container").innerHTML += `
                <div class="col col-md-3 text-center">
                    <h6 style="margin: 0px;padding: 0px;">@${elem.author}</h6>
                    <p>${elem.permlink}</p>
                    <a href="https://peakd.com/@${elem.author}/${elem.permlink}" target="_blank" style="color: blue">View Full Post</a>
                </div>
            `;
        }
    })
}

async function clearPostInfoForm() {
    document.getElementById('txt_viewinfo_author').value = "";
    document.getElementById('txt_viewinfo_permlink').value = "";
    document.getElementById("post-info-results-container").style.display = "none";

    document.getElementById("post-info-result-images").innerHTML = "";
}

async function onClickPostInfoSearch() {
    const in_author = document.getElementById('txt_viewinfo_author').value.replace("@", "");
    const in_permlink = document.getElementById('txt_viewinfo_permlink').value.replace("/", "");

    if(!in_author || in_author.length <= 3 || !in_permlink || in_permlink.length <= 3) {
        alert("Please enter a valid author and permlink");
        return;
    }

    // Fetch data from the server
    const resp = await fetch(API_ADDRESS + `/images/post-info?author=${in_author}&permlink=${in_permlink}`)
        .then(response => response.json())
        .catch(error => {console.error(error)})

    if(!resp || !resp.status === "ok") {
        // Something went wrong
        alert("Failed: " + resp.err); 
        return;
    }

    const {author, permlink, tags, images} = resp.result;   

    // Show first meta-data
    document.getElementById("post-info-results-container").style.display = "block";
    document.getElementById("label_post_info_author").innerHTML = author;
    document.getElementById("label_post_info_permlink").innerHTML = permlink;
    document.getElementById("label_post_info_tags").innerHTML = tags;

    if(document.getElementById("label_post_info_tags").innerHTML.length < 5)
    document.getElementById("label_post_info_tags").innerHTML = "no tags available";

    // Show Images
    document.getElementById("post-info-result-images").innerHTML = "";
    images.forEach(img_url => {
        const html_data = `
        <div class="col col-md-9" style="
            background-image: url('${img_url}');
            background-position: center;
            background-size: cover;
            width: 100%;
            background-repeat: no-repeat;
            min-height: 250px;">
        </div>
        <div class="col d-xl-flex justify-content-xl-center col-md-3">
            <a class="d-xl-flex align-items-xl-center" href="${img_url}" target="_blank">
                View Full Image
            </a>
        </div>
        `;

        document.getElementById("post-info-result-images").innerHTML += html_data;
    });
}

async function  onClickMutePost() {
    const in_author = document.getElementById('txt_mutepost_author').value.replace("@", "");
    const in_permlink = document.getElementById('txt_mutepost_permlink').value.replace("/", "");
    const in_password = document.getElementById('txt_mod_passwd').value;

    if(!in_author || in_author.length <= 3 || !in_permlink || in_permlink.length <= 3 | !in_password || in_password.length <= 3) {
        alert("Please enter a valid author, permlink and password");
        return;
    }

    // Fetch data from the server
    const resp = await fetch(API_ADDRESS + `/images/mute-post?author=${in_author}&permlink=${in_permlink}&password=${in_password}`)
        .then(response => response.json())
        .catch(error => {console.error(error)})

    // Unknown error
    if(!resp){
        // Something went wrong
        alert("Something unknown went wrong"); 
    }

    // Success
    if(resp.status === "ok"){
        alert("Ok: Post is muted");
        location.reload();
    }

    // Say what error
    if(resp.status === "failed"){
        alert("Failed: " + resp.err);
    }

    

}