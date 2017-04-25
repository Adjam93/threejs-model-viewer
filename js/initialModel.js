var scale2 = 1;

var gridHelper;
$('#grid').change(function () {
    if (grid.checked) {
        gridHelper.visible = true;
    }
    else {
        gridHelper.visible = false;
    }
});

var polar_grid_helper;
$('#polar_grid').change(function () {
    if (polar_grid.checked) {
        polar_grid_helper.visible = true;
    }
    else {
        polar_grid_helper.visible = false;
    }
});

var axis_view;
$('#axis').change(function () {
    if (axis.checked) {
        axis_view.visible = true;
    }
    else {
        axis_view.visible = false;
    }
});


var bound_box;
$('#bBox').change(function () {
    if (bBox.checked) {
        bound_box.visible = true;
    }
    else {
        bound_box.visible = false;
    }
});

var wireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, transparent: true });

var phongMaterial = new THREE.MeshPhongMaterial({
    color: 0x555555,
    specular: 0xffffff, shininess: 10,
    shading: THREE.SmoothShading,
    side: THREE.DoubleSide
}); //Phong for reflectivity 

var default_material = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }); //new THREE.MeshLambertMaterial({ color: 0x737373 });

var $$ = document.querySelector.bind(document);

xrayMaterial = new THREE.ShaderMaterial({
    uniforms: {
        p: { type: "f", value: 3 },
        glowColor: { type: "c", value: new THREE.Color(0x84ccff) },
    },
    vertexShader: $$('#vertexShader').text,
    fragmentShader: $$('#fragmentShader').text,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
   // wireframe: true //wireframe could be added, to view x-ray and wireframe combined view
});

glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        p: { type: "f", value: 0.1 },
        glowColor: { type: "c", value: new THREE.Color(0xffff80) },
    },
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

$(".glow_select").spectrum({
    color: "#fff",
    change: function (color) {
        $("#basic-log").text("Hex Colour Selected: " + color.toHexString()); //Log information
        glow_value = $(".glow_select").spectrum('get').toHexString(); //Get the colour selected
        glowMaterial.uniforms.glowColor.type = "c";
        glowMaterial.uniforms.glowColor.value = new THREE.Color(glow_value);
    }
});

var objLoader = new THREE.OBJLoader();
objLoader.setPath('model/');
objLoader.load('crash2.obj', function (object) {
    object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            var geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

            if (geometry !== undefined) {
                //Dislay file name, number of vertices and faces info of model
                //console.log(geometry.vertices.length);

                // var position = new THREE.Vector3();
                // position.getPositionFromMatrix(model.matrixWorld);
                // alert(position.x + ',' + position.y + ',' + position.z);

                statsNode.innerHTML = 'Name of model/file: crash.obj '
                    + '<br>'
                    + 'Number of vertices: ' + geometry.vertices.length
                    + '<br>'
                    + 'Number of faces: ' + geometry.faces.length;
                // + '<br>'
                //+ 'Model Position: ' + position.x + ',' + position.y + ',' + position.z;
            }

            child.material = default_material;

            var geo = new THREE.EdgesGeometry(child.geometry); // or WireframeGeometry
            var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2});
            var wireframe = new THREE.LineSegments(geo, mat);           

            $('#wire_check').change(function () {
                if (wire.checked) {
                    model_wire.checked = false;
                    child.material = wireframeMaterial;
                }
                else if (phong.checked) {
                    child.material = phongMaterial;
                    //if phong shading is on when selecting wireframe, go back to phong, when wireframe is off
                }
                else {
                    child.material = default_material;
                }
            });

            $('#model_wire').change(function () {
                if (model_wire.checked) {
                        wire.checked = false;
                        child.material = default_material;
                        child.add(wireframe);
                }
                else {
                    child.material = default_material;
                    child.remove(wireframe);
                }
            });

            $('#phong_check').change(function () {
                if (phong.checked) {
                    child.material = phongMaterial;
                }
                else {
                    child.material = default_material;
                }
            });

            $('#xray_check').change(function () {
                if (xray.checked) {
                    child.material = xrayMaterial;
                }
                else {
                    child.material = default_material;
                } 
            });

            glowModel = new THREE.Mesh(child.geometry, glowMaterial);
            glowMaterial.visible = false;
            glowModel.position = object.position;
            glowModel.scale.multiplyScalar(1.035);
            object.add(glowModel);

            $('#glow_check').change(function () {
                if (glow.checked) {
                    glowMaterial.visible = true;
                    // scene.add(glowModel);
                }
                else {
                    glowMaterial.visible = false;
                    scene.remove(glowModel);
                    child.material = default_material;
                }
            });
        }
    });


    bound_box = new THREE.BoxHelper(object); //, 0xffffff
    bound_box.visible = false;
    object.add(bound_box);

    var bbox = new THREE.Box3();
    bbox.setFromObject(object);
    console.log(bbox.min.y);

    /*POLAR GRID HELPER*/
    var radius = 10;
    var radials = 16;
    var circles = 8;
    var divisions = 64;

    polar_grid_helper = new THREE.PolarGridHelper(bbox.max.x * 4, radials, circles, divisions);
    polar_grid_helper.position.y = bbox.min.y;
    polar_grid_helper.visible = false;
    object.add(polar_grid_helper);

    /*NORMAL GRID HELPER*/
    gridHelper = new THREE.GridHelper(bbox.max.x * 4, 40, 0xe6e600, 0x808080);
    //Set size of grid to cover objects of all sizes based on the non visible box3() size.
    gridHelper.position.x = 0;
    gridHelper.position.y = bbox.min.y; //Set grid underneath loaded model object
    gridHelper.position.z = 0;
    gridHelper.visible = false; //Grid visibility initially false, until grid checkbox is selected
    object.add(gridHelper);

    /*AXIS HELPER*/
    axis_view = new THREE.AxisHelper(bbox.max.z * 4); //Set axis size based on the non visible box3() size.
    axis_view.position.y = bbox.min.y; //Set axis underneath loaded model object
    axis_view.visible = false; //axis visibility initially false, until axis checkbox is selected
    object.add(axis_view);

    object.position.set(0, 0, 0);
    scene.add(object);

    $('#scale_up').click(function (e) {
        scale2 = scale2 + (scale2 * 0.55);
        object.scale.x = object.scale.y = object.scale.z = scale2;
        camera.lookAt(object.position);
        controls.reset();           
    });
    
    $('#scale_down').click(function (e) {
        scale2 = scale2 - (scale2 * 0.25);
        object.scale.x = object.scale.y = object.scale.z = scale2;
        camera.lookAt(object.position);
        controls.reset();
    });

    $('#obj_file').on('change', function () {
        //When selecting a file, if a model is already present, remove current model before loading new model
        scene.remove(object);
        scene.remove(glowModel); //Remove glow model if present
    });

    $('#remove').click(function () {
        scene.remove(object);
        scene.remove(glowModel); //Remove glow model if present
    });

});