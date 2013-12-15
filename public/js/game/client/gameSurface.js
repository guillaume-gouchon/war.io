var camera, scene, engine, canvas, shadowGenerator;

var gameSurface = {};


gameSurface.building = null;




/**
*   CONSTANTS
*/
gameSurface.PIXEL_BY_NODE = 10;
gameSurface.MESHES_DIR = 'assets/3D/'


/**
*	Initializes the game surface.
*/
gameSurface.init = function () {

	//TODO
	$('#loadingScreen').addClass('hide');
	$('#game').removeClass('hide');

    canvas = document.getElementById("renderCanvas");
    var divFps = document.getElementById("fps");

    // Babylon
    engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(0.3, 0.3, 0.3);
    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    var sun = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 100, 2), scene);

    camera.setPosition(new BABYLON.Vector3(20, 80, 20));
    camera.attachControl(document.getElementById("gui"));

    // Shadows
    shadowGenerator = new BABYLON.ShadowGenerator(1024, sun);

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/skybox/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Grounds
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/heightMap.png", 600, 600, 100, 0, 12, scene, false);
    var groundMaterial = new WORLDMONGER.GroundMaterial("ground", scene, sun);
    ground.material = groundMaterial;
    ground.position.y = -0.1;
    ground.receiveShadows = true;

    var extraGround = BABYLON.Mesh.CreateGround("extraGround", 1000, 1000, 1, scene, false);
    var extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);
    extraGroundMaterial.diffuseTexture = new BABYLON.Texture("shaders/Ground/sand.jpg", scene);
    extraGroundMaterial.diffuseTexture.uScale = 60;
    extraGroundMaterial.diffuseTexture.vScale = 60;
    extraGround.position.y = -2.05;
    extraGround.material = extraGroundMaterial;

    // Water
    var water = BABYLON.Mesh.CreateGround("water", 1000, 1000, 1, scene, false);
    var waterMaterial = new WORLDMONGER.WaterMaterial("water", scene, sun);
    waterMaterial.refractionTexture.renderList.push(ground);
    waterMaterial.refractionTexture.renderList.push(extraGround);

    waterMaterial.reflectionTexture.renderList.push(ground);
    waterMaterial.reflectionTexture.renderList.push(skybox);

    water.isPickable = false;
    water.material = waterMaterial;
    
    // Render loop
    var renderFunction = function () {
        if (ground.isReady && ground.subMeshes.length == 1) {
            ground.subdivide(20);    // Subdivide to optimize picking
        }

        controls.updateCamera();

        // Fps
        divFps.innerHTML = BABYLON.Tools.GetFps().toFixed() + " fps";

        // Render scene
        scene.render();

        // Animations
        skybox.rotation.y += 0.0001 * scene.getAnimationRatio();
    };

    // Launch render loop
    engine.runRenderLoop(renderFunction);

    // Resize
    window.addEventListener("resize", function () {
        engine.resize();
    });


    controls.init();

    this.loadModel("", "Spaceship");


};


gameSurface.getFirstIntersectObject = function (x, y) {
    var pickInfo = scene.pick(x, y);

    if (!pickInfo.hit)
        return;

    return pickInfo.pickedMesh;
}


gameSurface.loadModel = function (name, filename) {
    BABYLON.SceneLoader.ImportMesh(name, this.MESHES_DIR, filename + ".babylon", scene, function (newMeshes, particleSystems, skeletons) {
        var loadedModel = newMeshes[0];
        for (var index = 0; index < newMeshes.length; index++) {
            shadowGenerator.getShadowMap().renderList.push(newMeshes[index]);
        }

        loadedModel.position = new BABYLON.Vector3(0, 20, 0);
        loadedModel.rotation.y = Math.PI;
    });
}
