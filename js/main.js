var container = document.getElementById('container');
var view = document.getElementById('main_viewer');

if (!Detector.webgl) Detector.addGetWebGLMessage();

var camera, camerHelper, scene, renderer, loader,
    stats, controls, numOfMeshes = 0, model, sample_model, glowModel, wireframe, mat, scale, delta;

var initialMaterial;
var modelLoaded = false;
var bg_Texture = false;

var glow_value, selectedObject, composer, effectFXAA, outlinePass, ssaaRenderPass;

var ambient, directionalLight, directionalLight2, directionalLight3, bg_colour;
var backgroundScene, backgroundCamera, backgroundMesh;

var amb = document.getElementById('ambient_light');
var rot1 = document.getElementById('rotation');
var wire = document.getElementById('wire_check');
var model_wire = document.getElementById('model_wire');
var phong = document.getElementById('phong_check');
var xray = document.getElementById('xray_check');
var glow = document.getElementById('glow_check');
var grid = document.getElementById('grid');
var polar_grid = document.getElementById('polar_grid');
var axis = document.getElementById('axis');
var bBox = document.getElementById('bBox');

var smooth = document.getElementById('smooth');
var outline = document.getElementById('outline');

var statsNode = document.getElementById('stats');

//X-RAY SHADER MATERIAL
//http://free-tutorials.org/shader-x-ray-effect-with-three-js/
var materials = {
    default_material: new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }),
    wireframeMaterial: new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        wireframe: true, 
        shininess: 100,
        specular: 0x000, emissive: 0x000,
        shading: THREE.SmoothShading, depthWrite: true, depthTest: true
    }),
    wireframeAndModel: new THREE.LineBasicMaterial({ color: 0xffffff }),
    phongMaterial: new THREE.MeshPhongMaterial({
        color: 0x555555, specular: 0xffffff, shininess: 10,
        shading: THREE.SmoothShading, side: THREE.DoubleSide // map: texture
    }),
    xrayMaterial: new THREE.ShaderMaterial({
        uniforms: {
            p: { type: "f", value: 3 },
            glowColor: { type: "c", value: new THREE.Color(0x84ccff) },
        },
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById('fragmentShader').textContent,
        side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
        transparent: true, depthWrite: false
    })
};

var clock = new THREE.Clock();
//var winDims = [window.innerWidth * 0.8, window.innerHeight * 0.89]; //old size of renderer

function onload() {

    //window.addEventListener('resize', onWindowResize, false);
    switchScene(0);
    animate();
}

function initScene(index) {

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 500000);

    camera.position.set(0, 0, 20);

    //Setup renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x292121); //565646, 29212

    view.appendChild(renderer.domElement);

    THREEx.WindowResize(renderer, camera);

    function toggleFullscreen(elem) {
        elem = elem || document.documentElement;
        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {

            THREEx.FullScreen.request(container);

        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    document.getElementById('fullscreenBtn').addEventListener('click', function () {
        toggleFullscreen();
    });

    ambient = new THREE.AmbientLight(0x404040);
    $('#ambient_light').change(function () {
        if (amb.checked) {
            scene.add(ambient);
        }
        else {
            scene.remove(ambient);
        }
    });

    /*LIGHTS*/
    directionalLight = new THREE.DirectionalLight(0xffeedd);
    directionalLight.position.set(0, 0, 1).normalize();
    scene.add(directionalLight);

    directionalLight2 = new THREE.DirectionalLight(0xffeedd);
    directionalLight2.position.set(0, 0, -1).normalize();
    scene.add(directionalLight2);

    directionalLight3 = new THREE.DirectionalLight(0xffeedd);
    directionalLight3.position.set(0, 1, 0).normalize();
    scene.add(directionalLight3);

    var ambientLight = new THREE.AmbientLight(0x808080, 0.2); //Grey colour, low intensity
    scene.add(ambientLight);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.09;
    controls.rotateSpeed = 0.09;

    //Colour changer, to set background colour of renderer to user chosen colour
    $(".bg_select").spectrum({
        color: "#fff",
        change: function (color) {
            $("#basic_log").text("Hex Colour Selected: " + color.toHexString()); //Log information
            var bg_value = $(".bg_select").spectrum('get').toHexString(); //Get the colour selected
            renderer.setClearColor(bg_value); //Set renderer colour to the selected hex value
            ssaaRenderPass.clearColor = bg_value;
            document.body.style.background = bg_value; //Set body of document to selected colour           
        }
    });

    // postprocessing    
    ssaaRenderPass = new THREE.SSAARenderPass(scene, camera);
    ssaaRenderPass.unbiased = true;
    ssaaRenderPass.clearColor = 0x292121;
    ssaaRenderPass.clearAlpha = 1;

    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);   
    outlinePass.edgeStrength = 1.5; 
    outlinePass.edgeGlow = 2; //model glow outline

    var outputPass = new THREE.ShaderPass(THREE.CopyShader);
    outputPass.renderToScreen = true;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(ssaaRenderPass);
    composer.addPass(outlinePass);
    composer.addPass(outputPass);

    /*LOAD SAMPLE MODELS*/
    var sceneInfo = modelList[index]; //index from array of sample models in html select options
    loader = new THREE.OBJLoader();
    var url = sceneInfo.url;

    //progress/loading bar
    var onProgress = function (data) {
        if (data.lengthComputable) { //if size of file transfer is known
            var percentage = Math.round((data.loaded * 100) / data.total);
            console.log(percentage);
            statsNode.innerHTML = 'Loaded : ' + percentage + '%' + ' of ' + sceneInfo.name
            + '<br>'
            + '<progress value="0" max="100" class="progress"></progress>';
            $('.progress').css({ 'width': percentage + '%' });
            $('.progress').val(percentage);
        }
    }
    var onError = function (xhr) {
        console.log('ERROR');
    };

    loader.load(url, function (data) {

        sample_model = data;
        sample_model_loaded = true;

        console.log(sample_model);

        sample_model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {

                numOfMeshes++;
                geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                if (geometry !== undefined) {
                    //Dislay file name, number of vertices and faces info of model
                    statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + sceneInfo.name + '</span>'
                               + '<br>'
                               + 'Number of vertices: ' + '<span class="statsText">' + geometry.vertices.length + '</span>'
                               + '<br>'
                               + 'Number of faces: ' + '<span class="statsText">' + geometry.faces.length + '</span>'
                               + '<br>'
                               + 'Number of Meshes: ' + '<span class="statsText">' + numOfMeshes + '</span>';
                }

                child.material = materials.default_material;

                var wireframe2 = new THREE.WireframeGeometry(child.geometry);
                var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
                materials.wireframeAndModel.visible = false;
                sample_model.add(edges);

                setWireFrame(child);
                setWireframeAndModel(child);

                setPhong(child);
                setXray(child);

            }
        });

        setCamera(sample_model);

        setSmooth(sample_model);

        setBoundBox(sample_model);
        setPolarGrid(sample_model);
        setGrid(sample_model);
        setAxis(sample_model);

        scaleUp(sample_model);
        scaleDown(sample_model);

        selectedObject = sample_model;
        outlinePass.selectedObjects = [selectedObject];
        outlinePass.enabled = false;

        scene.add(sample_model);

    }, onProgress, onError);

}

function removeModel() {

    scene.remove(model);
    scene.remove(glowModel); //Remove glow model if present
    materials.glowMaterial.visible = false;
    scale = 1;
    numOfMeshes = 0;

    camera.position.set(0, 0, 20); //Reset camera to initial position
    controls.reset(); //Reset controls, for when previous object has been moved around e.g. larger object = larger rotation
    statsNode.innerHTML = ''; //Reset stats box (faces, vertices etc)

    $("#red, #green, #blue, #ambient_red, #ambient_green, #ambient_blue").slider("value", 127); //Reset colour sliders

    amb.checked = false; rot1.checked = false; wire.checked = false;
    model_wire.checked = false; phong.checked = false; xray.checked = false;
    glow.checked = false; grid.checked = false; polar_grid.checked = false;
    axis.checked = false; bBox.checked = false; smooth.checked = false;//Uncheck any checked boxes

    document.getElementById('smooth-model').innerHTML = "Smooth Model";

    $('#rot_slider').slider({
        disabled: true //disable the rotation slider
    });
    controls.autoRotate = false; //Stop model auto rotating if doing so on new file select
    $('#shine').slider("value", 10); //Set phong shine level back to initial

    $('input[name="rotate"]').prop('checked', false); //uncheck rotate x, y or z checkboxes
}

$('#remove').click(function () {
    removeModel();
});

$("#red, #green, #blue, #ambient_red, #ambient_green, #ambient_blue").slider({
    change: function (event, ui) {
        console.log(ui.value);
        render();
    }
});

var rotVal = [230, 400, 600, 750, 960, 1200, 1500, 1800, 1900, 2100, 2350]; //Rotation speeds low - high
var rotation_speed;

$("#rot_slider").slider({
    orientation: "horizontal",
    range: "min",
    max: rotVal.length - 1,
    value: 0,
    disabled: true,
    slide: function (event, ui) {
        rotation_speed = rotVal[ui.value]; //Set speed variable to the current selected value of slider
    }
});

$('#rotation').change(function () {
    if (rot1.checked) {
        rotation_speed = rotVal[$("#rot_slider").slider("value")];
        //set the speed to the current slider value on initial use
        controls.autoRotate = true;

        $("#rot_slider").slider({
            disabled: false,
            change: function (event, ui) {
                console.log(rotVal[ui.value]);
                controls.autoRotate = true;
                controls.autoRotateSpeed = delta * rotation_speed;
            }
        });
    }
    else {
        controls.autoRotate = false;
        $('#rot_slider').slider({
            disabled: true //disable the slider from being able to rotate object when rotation toggle is off
        });
    }
});

function setColours() {

    var colour = getColours($('#red').slider("value"), $('#green').slider("value"), $('#blue').slider("value"));
    directionalLight.color.setRGB(colour[0], colour[1], colour[2]);
    directionalLight2.color.setRGB(colour[0], colour[1], colour[2]);
    directionalLight3.color.setRGB(colour[0], colour[1], colour[2]);

    var colour = getColours($('#ambient_red').slider("value"), $('#ambient_green').slider("value"),
                            $('#ambient_blue').slider("value"));
    ambient.color.setRGB(colour[0], colour[1], colour[2]);

}

function getColours(r, g, b) {

    var colour = [r.valueOf() / 255, g.valueOf() / 255, b.valueOf() / 255];
    return colour;
}

function render() {

    setColours();

   // renderer.render(scene, camera);
}

function animate() {

    delta = clock.getDelta();
    requestAnimationFrame(animate);
    controls.update(delta);
    composer.render();
    render();

}
var modelList = [
            {
                name: "crash.obj", url: 'sample_models/crash2.obj'
            },
            {
                name: "bear.obj", url: 'sample_models/bear-obj.obj'
            },
            {
                name: "car.obj", url: 'sample_models/car2.obj'
                //, objectRotation: new THREE.Euler(0, 3 * Math.PI / 2, 0)
                        
            },
            {
                name: "tiger.obj", url: 'sample_models/Tiger.obj'
            },
            {
                name: "dinosaur.obj", url: 'sample_models/Dinosaur_V02.obj'
            },
            {
                name: "skeleton.obj", url: 'sample_models/skeleton.obj'
            }
];

function switchScene(index) {

    clear();
    initScene(index);
    var elt = document.getElementById('scenes_list');
    elt.selectedIndex = index;

}

function selectModel() {

    var select = document.getElementById("scenes_list");
    var index = select.selectedIndex;

    if (index >= 0) {
        removeModel();     
        switchScene(index);
    }

}

function clear() {

    if (view && renderer) {
        view.removeChild(renderer.domElement);
        document.body.style.background = "#292121";
    }
}

onload();
