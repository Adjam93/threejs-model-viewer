function setCamera(mod) {
    var bbox = new THREE.Box3().setFromObject(mod);

    /*MODELS OF DIFFERENT SIZES TO FIT IN CAMERA VIEW*/
    var height = bbox.getSize().y;
    var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
    var pos = scene.position;
    camera.position.set(pos.x, pos.y, dist * 3.50);
    camera.lookAt(pos);
}

function setGlowModel(mod) {
    glowModel = new THREE.Mesh(mod.children[0].geometry, materials.glowMaterial);
    materials.glowMaterial.visible = false;
    glowModel.position = mod.position;
    glowModel.scale.multiplyScalar(1.025);
    mod.add(glowModel);
}

function setWireFrame(mod) {

    $('#wire_check').change(function () {
        if (wire.checked) {
            mod.material = materials.wireframeMaterial;
            model_wire.checked = false;
        }
        else {
            mod.material = materials.default_material;
        }
    });
}

function setWireframeAndModel(mod) {

    mod.traverse(function (child) {
        if (child instanceof THREE.Mesh) {

            var geo = new THREE.EdgesGeometry(child.geometry); // or WireframeGeometry
            var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
            var wireframe = new THREE.LineSegments(geo, mat);

            $('#model_wire').change(function () {
                if (model_wire.checked) {
                    wire.checked = false;
                    mod.material = materials.default_material;
                    mod.add(wireframe);
                }
                else {
                    mod.material = materials.default_material;
                    mod.remove(wireframe);
                }
            });
        }
    });
}

function setPhong(mod) {

    $('#phong_check').change(function () {
        if (phong.checked) {
            mod.material = materials.phongMaterial;
        }
        else {
            mod.material = materials.default_material;
        }
    });
}


function setXray(mod) {

    $('#xray_check').change(function () {
        if (xray.checked) {
            mod.material = materials.xrayMaterial;
        }
        else {
            mod.material = materials.default_material;
        }
    });

}

function setGlow(mod) {

    $('#glow_check').change(function () {
        if (glow.checked) {
            materials.glowMaterial.visible = true;
        }
        else {
            materials.glowMaterial.visible = false;
            scene.remove(glowModel);
            mod.material = materials.default_material;
        }
    });
}

var bound_box;
function setBoundBox(mod) {
    bound_box = new THREE.BoxHelper(mod); //, 0xffffff
    bound_box.visible = false;
    mod.add(bound_box); //Add bounding box helper to model (for when checkbox is checked)
}

$('#bBox').change(function () {
    if (bBox.checked) {
        bound_box.visible = true;
    }
    else {
        bound_box.visible = false;
    }
});

function setPolarGrid(mod) {

    var bbox = new THREE.Box3().setFromObject(mod);
    console.log(bbox.min.y);

    /*POLAR GRID HELPER*/
    var radius = 10;
    var radials = 16;
    var circles = 8;
    var divisions = 64;

    polar_grid_helper = new THREE.PolarGridHelper(bbox.max.x * 4, radials, circles, divisions);
    polar_grid_helper.position.y = bbox.min.y;
    polar_grid_helper.visible = false;
    mod.add(polar_grid_helper);
}

var polar_grid_helper;
$('#polar_grid').change(function () {
    if (polar_grid.checked) {
        polar_grid_helper.visible = true;
    }
    else {
        polar_grid_helper.visible = false;
    }
});


function setGrid(mod) {

    var bbox2 = new THREE.Box3().setFromObject(mod);
    console.log(bbox2.min.y);

    /*NORMAL GRID HELPER*/
    gridHelper = new THREE.GridHelper(bbox2.max.x * 4, 40, 0xe6e600, 0x808080);
    //Set size of grid to cover objects of all sizes based on the non visible box3() size.
    gridHelper.position.y = bbox2.min.y; //Set grid underneath loaded model object
    gridHelper.visible = false; //Grid visibility initially false, until grid checkbox is selected
    mod.add(gridHelper);
}

var gridHelper;
$('#grid').change(function () {
    if (grid.checked) {
        gridHelper.visible = true;
    }
    else {
        gridHelper.visible = false;
    }
});


function setAxis(mod) {

    var bbox3 = new THREE.Box3().setFromObject(mod);
    console.log(bbox3.min.y);

    /*AXIS HELPER*/
    axis_view = new THREE.AxisHelper(bbox3.max.z * 10); //Set axis size based on the non visible box3() size.
    axis_view.position.y = bbox3.min.y; //Set axis underneath loaded model object
    axis_view.visible = false; //axis visibility initially false, until axis checkbox is selected
    mod.add(axis_view);
}

var axis_view;
$('#axis').change(function () {
    if (axis.checked) {
        axis_view.visible = true;
    }
    else {
        axis_view.visible = false;
    }
});

//jQuery slider for phong shininess level
$("#shine").slider({
    orientation: "horizontal",
    min: 10,
    max: 500,
    value: 10,
    slide: function (event, ui) {
        materials.phongMaterial.shininess = ui.value; //Set shininess parameter to the current selected value of slider
    }
});

$("#shine").slider({
    change: function (event, ui) {
        console.log(ui.value);
        materials.phongMaterial.shininess = ui.value; //Set shininess of phong material to value from the slider
    }
});

//Set colour of glow model to value from colour
$(".glow_select").spectrum({
    color: "#fff",
    change: function (color) {
        $("#basic-log").text("Hex Colour Selected: " + color.toHexString()); //Log information
        glow_value = $(".glow_select").spectrum('get').toHexString(); //Get the colour selected
        //Set glow material colour to selected value
        materials.glowMaterial.uniforms.glowColor.type = "c";
        materials.glowMaterial.uniforms.glowColor.value = new THREE.Color(glow_value);
    }
});

/*SCALE FUNCTIONS*/
var scale = 1;

function scaleUp(mod) {

    $('#scale_up').click(function (e) {
        if (modelLoaded || sample_model_loaded) {
            scale = scale + (scale * 0.55);
            mod.scale.x = mod.scale.y = mod.scale.z = scale;
            camera.lookAt(mod.position);
            controls.reset();
        }
    });
}

function scaleDown(mod) {

    $('#scale_down').click(function (e) {
        if (modelLoaded || sample_model_loaded) {
            scale = scale - (scale * 0.25);
            mod.scale.x = mod.scale.y = mod.scale.z = scale;
            camera.lookAt(mod.position);
            controls.reset();
        }
    });  
}
