class Post {
    constructor(id, ownerId, userEmail, title, imageUrl, postcode, town, latitude, longitude, date, wikiSearchString, fav){
        this.id = id;
        this.ownerId = ownerId;
        this.userEmail = userEmail;
        this.title = title;
        this.imageUrl = imageUrl;
        this.postcode = postcode;
        this.town = town;
        this.latitude = latitude;
        this.longitude = longitude;
        this.date = date;
        this.wikiSearchString = wikiSearchString;
        this.fav = fav;
    }
}

export default Post;