import SignPost from "../objects/SignPost.js";

export default class SignPostManager {
    constructor() {
        this.signPosts = [];
    }
    
    addSignPost(x, y) {
        const signPost = new SignPost(x, y);
        this.signPosts.push(signPost);
        return signPost;
    }
    
    update(dt) {
        this.signPosts.forEach(signPost => signPost.update(dt));
    }
    
    render(context) {
        this.signPosts.forEach(signPost => signPost.render(context));
    }
    
    checkCollisionWithPlayer(player) {
        for (const signPost of this.signPosts) {
            if (!signPost.isActive || signPost.isActivated) continue;
            
            if (signPost.collidesWith(player)) {
                return signPost;
            }
        }
        return null;
    }
}