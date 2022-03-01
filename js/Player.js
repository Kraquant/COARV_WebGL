Player = function(game, canvas) {
    //La scène du jeu
    this.scene = game.scene;

    //Initialisation de la caméra
    this._initCamera(this.scene, canvas);
};

Player.prototype = {
    _initCamera : function(scene, canvas) {
        //Camera centree
        this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), scene);
        this.camera.attachControl(canvas, true);

        //Camera libre
        //this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -10), scene);
        //this.camera.setTarget(BABYLON.Vector3.Zero());
        //this.camera.attachControl(canvas, true);

    }
};