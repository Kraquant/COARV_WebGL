Player = function(game, canvas) {
    //Acces a la camera a l'interieur de player
    var _this = this;

    //Le jeu est charge dans l'objet player
    this.game = game;

    // Paramètres de déplacement
    this.speed = 1;
    this.angularSensibility = 600;

    //Axe de mouvement X et Z
    this.axisMovement = [false, false, false, false];

    //Activation du tir ou non
    this.weaponShoot = false;

    window.addEventListener("keyup", function(evt) {
        switch(evt.keyCode) {
            case 90:
                _this.camera.axisMovement[0] = false;
                break;
            case 83:
                _this.camera.axisMovement[1] = false;
                break;
            case 81:
                _this.camera.axisMovement[2] = false;
                break;
            case 68:
                _this.camera.axisMovement[3] = false;
                break;
        }
    }, false);

    //Quand les touches sont relachées
    window.addEventListener("keydown", function(evt) {
        switch(evt.keyCode) {
            case 90:
                _this.camera.axisMovement[0] = true;
                break;
            case 83:
                _this.camera.axisMovement[1] = true;
                break;
            case 81:
                _this.camera.axisMovement[2] = true;
                break;
            case 68:
                _this.camera.axisMovement[3] = true;
                break;
        }
    }, false);

    window.addEventListener("mousemove", function(evt){
        if(_this.rotEngaged === true) {
            _this.camera.rotation.y += evt.movementX * 0.001 * (_this.angularSensibility / 250);
            var nextRotationX = _this.camera.rotation.x + (evt.movementY * 0.001 * (_this.angularSensibility / 250));
            if (nextRotationX < degToRad(90) && nextRotationX > degToRad(-90)) {
                _this.camera.rotation.x += evt.movementY * 0.001 * (_this.angularSensibility / 250);
            }
        }
    }, false);

    var canvas = this.game.scene.getEngine().getRenderingCanvas();

    // On affecte le clic et on vérifie qu'il est bien utilisé dans la scène (_this.controlEnabled)
    canvas.addEventListener("mousedown", function(evt) {

        if (_this.controlEnabled && !_this.weponShoot) {
            _this.weponShoot = true;
            _this.handleUserMouseDown();
        }
    }, false);

    // On fais pareil quand l'utilisateur relache le clic de la souris
    canvas.addEventListener("mouseup", function(evt) {
        if (_this.controlEnabled && _this.weponShoot) {
            _this.weponShoot = false;
            _this.handleUserMouseUp();
        }
    }, false);

    //Initialisation de la caméra
    this._initCamera(this.scene, canvas);
    this.controlEnabled = false;
    this._initPointerLock();
};

Player.prototype = {
    _initCamera : function(scene, canvas) {
        //Camera libre
        this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(-20, 5, 0), scene);

        // Axe de mouvement X et Z
        this.camera.axisMovement = [false, false, false, false];

        //On demande a la camera de regarder a l'origine
        this.camera.setTarget(BABYLON.Vector3.Zero());

        this.camera.weapons = new Weapons(this);

        //Vie du joueur
        this.isAlive = true;
    },

    _initPointerLock : function() {
        var _this = this;
        //Requete pour la capture du pointeur
        var canvas = this.game.scene.getEngine().getRenderingCanvas();
        canvas.addEventListener("click", function(evt){
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        //Evenement pour changer le paramètre de rotation
        var pointerlockchange = function(event) {
            _this.controlEnabled = (document.mozRequestPointerLockElement === canvas || document.webkitPointerLockElement === canvas || document.msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
            } else {
                _this.rotEngaged = true;
            }
        };

        //Event pour changer l'état du pointer sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    },

    _checkMove : function(ratioFps) {
        let relativeSpeed = this.speed / ratioFps;

        if (this.camera.axisMovement[0]) {
            this.camera.position = new BABYLON.Vector3(this.camera.position.x + (Math.sin(this.camera.rotation.y) * relativeSpeed), this.camera.position.y, this.camera.position.z + (Math.cos(this.camera.rotation.y) * relativeSpeed));
        }

        if (this.camera.axisMovement[1]) {
            this.camera.position = new BABYLON.Vector3(this.camera.position.x + (Math.sin(this.camera.rotation.y) * -relativeSpeed), this.camera.position.y, this.camera.position.z + (Math.cos(this.camera.rotation.y) * - relativeSpeed));
        }

        if (this.camera.axisMovement[2]) {
            this.camera.position = new BABYLON.Vector3(this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * relativeSpeed, this.camera.position.y, this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * relativeSpeed);
        }

        if (this.camera.axisMovement[3]) {
            this.camera.position = new BABYLON.Vector3(this.camera.position.x + Math.sin(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed, this.camera.position.y, this.camera.position.z + Math.cos(this.camera.rotation.y + degToRad(-90)) * - relativeSpeed);
        }
    },

    handleUserMouseDown : function() {
        if(this.isAlive === true) {
            this.camera.weapons.fire();
        }
    },

    handleUserMouseUp : function() {
        if(this.isAlive === true) {
            this.camera.weapons.stopFire();
        }
    },
};

function degToRad(deg)
{
    return (Math.PI*deg)/180;
}
function radToDeg(rad)
{
    return (rad*180)/Math.PI;
}