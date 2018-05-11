function setCamera(mod) {
    var bbox = new THREE.Box3().setFromObject(mod);

    /*MODELS OF DIFFERENT SIZES TO FIT IN CAMERA VIEW*/
    var height = bbox.getSize().y;
    var dist = height / (2 * Math.tan(camera.fov * Math.PI / 360));
    var pos = scene.position;
    camera.position.set(pos.x, pos.y, dist * 3.50);
    camera.lookAt(pos);
}

$('#glow_check').on('change', function () {

        if (glow.checked) {
            $('input.check').not(this).prop('checked', false);
            outlinePass.enabled = true;
        }
        else {
            outlinePass.enabled = false;
        }
        
});

function setWireFrame(mod) {

    $('#wire_check').on('change', function () {

        $('input.check').not(this).prop('checked', false);

        if (wire.checked) {
            materials.wireframeAndModel.visible = false;
            mod.material = materials.wireframeMaterial;
        }
        else {
            mod.material = materials.default_material;
        }
    });
}

function setWireframeAndModel(mod) {

    $('#model_wire').on('change', function () {

        $('input.check').not(this).prop('checked', false);
        mod.material = materials.default_material;

        if (model_wire.checked) {
            materials.wireframeAndModel.visible = true;
        }
        else {
            materials.wireframeAndModel.visible = false;
            mod.material = materials.default_material;
        }
    });

}

function setSmooth(mod) {

    mod.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            $('#smooth').change(function () {
               
                var smooth_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);

                if (smooth.checked) {
                    document.getElementById('smooth-model').innerHTML = "Flatten Model";

                    smooth_geom.mergeVertices();
                    smooth_geom.computeVertexNormals();
                    smooth_geom.computeFaceNormals();
                    child.geometry = new THREE.BufferGeometry().fromGeometry(smooth_geom);
                }
                else {
                    document.getElementById('smooth-model').innerHTML = "Smooth Model";

                    smooth_geom.computeFlatVertexNormals();
                    child.geometry = new THREE.BufferGeometry().fromGeometry(smooth_geom);
                }
            });

        }

    });

}


function setPhong(mod) {

    $('#phong_check').on('change', function () {

        $('input.check').not(this).prop('checked', false); //Uncheck any other checked inputs with class=check

        phong.checked ? mod.material = materials.phongMaterial : mod.material = materials.default_material;
    });

}

function setXray(mod) {

    $('#xray_check').on('change', function () {

        $('input.check').not(this).prop('checked', false);

        xray.checked ? mod.material = materials.xrayMaterial_: mod.material = materials.default_material;      
      
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

var axis_view;
function setAxis(mod) {

    var bbox3 = new THREE.Box3().setFromObject(mod);

    /*AXIS HELPER*/
    axis_view = new THREE.AxesHelper(bbox3.max.z * 10); //Set axis size based on the non visible box3() size.
    axis_view.position.y = bbox3.min.y; //Set axis underneath loaded model object
    axis_view.visible = false; //axis visibility initially false, until axis checkbox is selected
    mod.add(axis_view);
}

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
        //Set outlinePass effect edge colour to selected value
        outlinePass.visibleEdgeColor.set(glow_value);
    }
});

/*SCALE FUNCTIONS*/
var loopScale = 0;
scale = 1;

function scaleUp(mod) {

   // User clicks scale button once at a time, scale applied once
    $('#scale_up').click(function (e) {
        if (modelLoaded || sample_model_loaded) {
            // scale *= 1.15;

            if (mod.scale.z < 25) {

                scale += (scale * 0.45);
                mod.scale.x = mod.scale.y = mod.scale.z = scale;
                //console.log(mod.scale.z);
            }         
        }
    });
}

function scaleDown(mod) {

    //User clicks scale button once at a time, scale applied once
    $('#scale_down').click(function (e) {
        if (modelLoaded || sample_model_loaded) {

            //scale *= 0.85;

            scale -= (scale * 0.35);
            mod.scale.x = mod.scale.y = mod.scale.z = scale;
            //console.log(mod.scale.z);
        }
    });
}

function fixRotation(mod) {

    $("input:radio[name=rotate]").click(function () {
        var rotAxis = $("input:radio[name=rotate]:checked").val();

        switch (rotAxis) {

            case 'rotateX':
                mod.rotation.x = -Math.PI / 2;
                polar_grid_helper.rotation.x = Math.PI / 2;
                gridHelper.rotation.x = Math.PI / 2;
                axis_view.rotation.x = Math.PI / 2;
                break;

            case 'rotateY':
                mod.rotation.y = -Math.PI / 2;
                polar_grid_helper.rotation.y = Math.PI / 2;
                gridHelper.rotation.y = Math.PI / 2;
                axis_view.rotation.y = Math.PI / 2;
                break;

            case 'rotateZ':
                mod.rotation.z = -Math.PI / 2;
                polar_grid_helper.rotation.z = Math.PI / 2;
                gridHelper.rotation.z = Math.PI / 2;
                axis_view.rotation.z = Math.PI / 2;
                break;
        }

    });
}
