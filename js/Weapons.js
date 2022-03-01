Weapons = function(Player) {

    //Cadence de tir
    this.fireRate = 800;

    //Delta de calcul pour savoir quand le tir est à nouveau disponible
    this._deltaFireRate = this.fireRate;

    // Variable variable
    this.canFire = canFire = true;

    //Variable qui changera à l'appel du tir depuis le Player
    this.launchBullets = false;

    var _this = this // Permet d'acceder à l'objet depuis les fonctions
    var engine = Player.game.scene.getEngine();

    //Acces à player n'importe ou dans Weapons
    this.Player = Player;

    //Positions selon l'arme non utilisée
    this.bottomPosition = new BABYLON.Vector3(0.5, -2.5, 1);

    //Changement de Y quand l'arme est sélectionnée
    this.topPositionY = -0.5;

    //Création de l'arme
    this.rocketLauncher = this.newWeapon(Player);

    Player.game.scene.registerBeforeRender(function() {
        if(!_this.canFire) {
            _this._deltaFireRate -= engine.getDeltaTime();
            if (_this._deltaFireRate <= 0 && _this.Player.isAlive) {
                _this.canFire = true;
                _this._deltaFireRate = _this.fireRate;
            }
        }
    });

};

Weapons.prototype = {
    newWeapon : function(Player) {
        var newWeapon;
        newWeapon = BABYLON.Mesh.CreateBox('rocketLauncher', 0.5, Player.game.scene);

        //On fait en sorte d'avoir une arme en apparence plus longue que large
        newWeapon.scaling = new BABYLON.Vector3(1, 0.7, 2);

        //Mettre la camera en parent
        newWeapon.parent = Player.camera;

        newWeapon.position = this.bottomPosition.clone();
        newWeapon.position.y = this.topPositionY;

        //Ajout d'un material
        var materialWeapon = new BABYLON.StandardMaterial('rocketLauncherMat', Player.game.scene);
        materialWeapon.diffuseColor = new BABYLON.Color3(1, 0 , 0);

        newWeapon.material = materialWeapon;

        return newWeapon
    },

    fire : function(pickInfo) {
        this.launchBullets = true;
    },

    stopFire : function(pickInfo) {
        this.launchBullets = false;
    },

    launchFire : function() {
        if(this.canFire) {
            var renderWidth = this.Player.game.engine.getRenderWidth(true);
            var renderHeight = this.Player.game.engine.getRenderHeight(true);

            var direction = this.Player.game.scene.pick(renderWidth/2, renderHeight/2);
            direction = direction.pickedPoint.subtractInPlace(this.Player.camera.position);
            direction = direction.normalize();

            this.createRocket(this.Player.camera.playerBox)
            this.canFire = false;
        } else {
            //Nothing to do : cannot fire
        }
    },

    createRocket : function(playerPosition) {
        var positionValue = this.rocketLauncher.absolutePosition.clone();
        var rotationValue = playerPosition.rotation;
        var Player = this.Player;
        var newRocket = BABYLON.Mesh.CreateBox("rocket", 1, this.Player.game.scene);
        newRocket.direction = new BABYLON.Vector3(
            Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
            Math.sin(-rotationValue.x),
            Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
        );
        newRocket.position = new BABYLON.Vector3(
            positionValue.x + (newRocket.direction.x * 1) ,
            positionValue.y + (newRocket.direction.y * 1) ,
            positionValue.z + (newRocket.direction.z * 1));
        newRocket.rotation = new BABYLON.Vector3(rotationValue.x, rotationValue.y, rotationValue.z);
        newRocket.scaling = new BABYLON.Vector3(0.5, 0.5, 1);
        newRocket.isPickable = false;

        newRocket.material = new BABYLON.StandardMaterial("textureWeapon", this.Player.game.scene);
        newRocket.material.diffuseColor = new BABYLON.Color3(1, 0, 0);

        //On donne accès a Player dans registerBeforeRender
        var Player = this.Player;

        newRocket.registerAfterRender(function() {
            //Mouvement de la roquette vers l'avant
            newRocket.translate(new BABYLON.Vector3(0, 0, 1), 1, 0);

            //Creation d'un rayon qui part de la base de la roquette vers l'avant
            var rayRocket = new BABYLON.Ray(newRocket.position, newRocket.direction);

            //On regarde quel est le premier objet touche
            var meshFound = newRocket.getScene().pickWithRay(rayRocket);

            //Si la distance au premier objet touché est inférieure à 10, on detruit la roquette
            if(!meshFound || meshFound.distance < 10) {
                //EXPLOSIONS
                if(meshFound.pickedMesh) {
                    //Creation d'une sphere qui represente la zone d'impact
                    var explosionRadius = BABYLON.Mesh.CreateSphere("sphere", 5.0, 20, Player.game.scene);
                    //Positionnement de la sphère la ou il y a eu impact
                    explosionRadius.position = meshFound.pickedPoint;
                    explosionRadius.isPickable = false;

                    //Material
                    explosionRadius.material = new BABYLON.StandardMaterial("textureExplosion", Player.game.scene);
                    explosionRadius.material.diffuseColor = new BABYLON.Color3(1, 0.6, 0);
                    explosionRadius.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    explosionRadius.material.alpha = 0.8;

                    //Abaissage de l'opacité à chaque frame
                    explosionRadius.registerAfterRender(function() {
                        explosionRadius.material.alpha -=0.02;
                        if (explosionRadius.material.alpha<=0){
                            //explosionRadius.dispose(); //Pour les ombres on le desactive
                        }
                    });
                }
                //newRocket.dispose(); //Pour les ombres on le desactive
            }

        })

    },
};