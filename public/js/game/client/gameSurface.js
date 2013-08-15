var camera, scene, engine, canvas;

var gameSurface = {};


/**
*   CONSTANTS
*/
gameSurface.PIXEL_BY_NODE = 10;


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
    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
    var sun = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 100, 2), scene);

    camera.setPosition(new BABYLON.Vector3(20, 40, 20));
    camera.attachControl(document.getElementById("gui"));

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
    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "assets/heightMap.png", 100, 100, 100, 0, 12, scene, true);
    var groundMaterial = new WORLDMONGER.GroundMaterial("ground", scene, sun);
    ground.material = groundMaterial;
    ground.position.y = -2.0;

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

};