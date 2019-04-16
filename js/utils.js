function stats(modelName, geometry, numOfMeshes) {

    if (geometry !== undefined) {
        statsNode.innerHTML = 'Name of model/file: ' + '<span class="statsText">' + modelName + '</span>'
           + '<br>'
           + 'Number of vertices: ' + '<span class="statsText">' + geometry.attributes.position.count + '</span>'
           + '<br>'
           + 'Number of faces: ' + '<span class="statsText">' + geometry.attributes.position.count / 3 + '</span>'
           + '<br>'
           + 'Number of Meshes: ' + '<span class="statsText">' + numOfMeshes + '</span>';
    }

}

function colladaMerge(dae, filename) {

    dae.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            numOfMeshes++;
            var geometry = child.geometry;
            stats(filename, geometry, numOfMeshes);

           // console.log(child.geometry); // BufferGeometry

            //child.geometry = new THREE.BufferGeometry().fromGeometry(child.geometry);
            var wireframe2;
            var collada_geometry = new THREE.Geometry();

            if (dae.children.length > 1) {
                for (var i = 0; i < dae.children.length; i++) {
                    var col_child = dae.children[i];

                    //console.log(dae.children.length);

                    if (col_child instanceof THREE.Mesh) {
                        
                        //When there is more than one child BufferGeometry, create a new geometry 
                        //and merge it with the main new geometry (defined above as collada_geometry)
                        var geom = new THREE.Geometry().fromBufferGeometry(col_child.geometry);

                        collada_geometry.merge(geom);
                        console.log(collada_geometry);

                         var buffer_collada_geometry = new THREE.BufferGeometry().fromGeometry(collada_geometry);
                         console.log(buffer_collada_geometry);
                    }
                }

                model = new THREE.Mesh(buffer_collada_geometry, materials.default_material);
                wireframe2 = new THREE.WireframeGeometry(buffer_collada_geometry);
                console.log("More than one Geometry");

                setSmooth(model);   
            }
            else {
               // var single_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);

                model = new THREE.Mesh(child.geometry, materials.default_material);
                wireframe2 = new THREE.WireframeGeometry(child.geometry);
                console.log("One Geometry");

                setSmooth(model);
            }

            child.material = materials.default_material;

            var edges = new THREE.LineSegments(wireframe2, materials.wireframeAndModel);
            materials.wireframeAndModel.visible = false;
            model.add(edges);

            setWireFrame(model);
            setWireframeAndModel(model);
            setPhong(model);
            setXray(model);
        }

    });
}

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

    if (modelWithTextures || fbxLoaded || gltfLoaded) {

        $('#wire_check').on('change', function () {

                $('input.check').not(this).prop('checked', false);

                if (wire.checked) {

                    materials.wireframeAndModel.visible = false;
                     if (mod.material.length > 1) {
                         for (var i = 0; i < mod.material.length; i++) {
 
                             mod.material[i].wireframe = true;
                         }
                     }
                     else {
                         mod.material.wireframe = true;
                     }

                }
                else {
                    if (mod.material.length > 1) {
                         for (var i = 0; i < mod.material.length; i++) {
 
                             mod.material[i].wireframe = false;
                         }
                     }
                     else {
                        mod.material.wireframe = false;
                     }
                }
            });
      
        }
    else {

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
}

function setWireframeAndModel(mod) {

    $('#model_wire').on('change', function () {

        $('input.check').not(this).prop('checked', false);

        if (modelWithTextures || fbxLoaded || gltfLoaded) {
            if (mod.material.length > 1) {
                for (var i = 0; i < mod.material.length; i++) {

                    mod.material[i].wireframe = false;
                }
            }
            else {
                mod.material.wireframe = false;
            }

            if (model_wire.checked) {
                materials.wireframeAndModel.visible = true;
            }
            else {
                materials.wireframeAndModel.visible = false;
            }
        }
        //model without textures
        else {
            mod.material = materials.default_material;

            if (model_wire.checked) {
                materials.wireframeAndModel.visible = true;
            }
            else {
                materials.wireframeAndModel.visible = false;
                mod.material = materials.default_material;
            }
        }
       
    });

}

function setSmooth(mod) {

    var smooth_geom;

    mod.traverse(function (child) {

        if (child instanceof THREE.Mesh) {

            $('#smooth').change(function () {
               
                if (child.geometry.isGeometry) {
                    //Merged collada geometry
                    smooth_geom = child.geometry;                   
                }
                else {
                    smooth_geom = new THREE.Geometry().fromBufferGeometry(child.geometry);
                }
                
                if (smooth.checked) {
                    document.getElementById('smooth-model').innerHTML = "Flatten Model";

                    smooth_geom.mergeVertices();
                    smooth_geom.computeVertexNormals();
                    smooth_geom.computeFaceNormals();
                    child.geometry = new THREE.BufferGeometry().fromGeometry(smooth_geom);
                    //console.log(child.geometry);
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
    
function setPhong(mod, originalMat) {

    $('#phong_check').on('change', function () {

       if (modelWithTextures || fbxLoaded || gltfLoaded) {
            phong.checked ? mod.material = materials.phongMaterial : mod.material = originalMat;
          }
          else{
              phong.checked ? mod.material = materials.phongMaterial : mod.material = materials.default_material;
          }
     });

}

function setXray(mod, originalMat) {

    $('#xray_check').on('change', function () {
        
       if (modelWithTextures || fbxLoaded || gltfLoaded) {
          xray.checked ? mod.material = materials.xrayMaterial : mod.material = originalMat;
        }
        else{
            xray.checked ? mod.material = materials.xrayMaterial : mod.material = materials.default_material;
        }
    });
}

var bound_box;
function setBoundBox(mod) {
    /*bound_box = new THREE.BoxHelper(mod); //, 0xffffff
    bound_box.visible = false;
    mod.add(bound_box); //Add bounding box helper to model (for when checkbox is checked)*/

    var box = new THREE.Box3().setFromObject(mod);
    bound_box = new THREE.Box3Helper(box);
    bound_box.visible = false;
    mod.add(bound_box);
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
    },
    change: function (event, ui) {
        console.log(ui.value);
        materials.phongMaterial.shininess = ui.value; //Set shininess of phong material to value from the slider
    }
});

//Strength of glow outine
$("#edgeStrength").slider({
    orientation: "horizontal",
    min: 1,
    max: 10,
    value: 1,
    slide: function (event, ui) {
        outlinePass.edgeStrength = ui.value;
    },
    change: function (event, ui) {
        outlinePass.edgeStrength = ui.value;
    }
});

//PointLight intensity slider
$("#point_light").slider({
    orientation: "horizontal",
    min: 0,
    max: 1,
    step: 0.1,
    value: 0.5,
    slide: function (event, ui) {
        pointLight.intensity = ui.value;
    },
    change: function (event, ui) {
        pointLight.intensity = ui.value;
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

            if (mod.scale.z < 25) {

                scale += (scale * 0.45);
                mod.scale.x = mod.scale.y = mod.scale.z = scale;
            }         
        }
    });
}

function scaleDown(mod) {

    //User clicks scale button once at a time, scale applied once
    $('#scale_down').click(function (e) {
        if (modelLoaded || sample_model_loaded) {
            
            scale -= (scale * 0.35);
            mod.scale.x = mod.scale.y = mod.scale.z = scale;
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

function resetRotation(mod) {
    $("#reset_rot").click(function () {
        mod.rotation.set(0, 0, 0);
        polar_grid_helper.rotation.set(0, 0, 0);
        gridHelper.rotation.set(0, 0, 0);
        axis_view.rotation.set(0, 0, 0);
        $('input[name="rotate"]').prop('checked', false);
    });
}

/*Animation Controls */
//credit: https://raw.githubusercontent.com/mrdoob/three.js/dev/editor/js/Sidebar.Animation.js

function addAnimation( object, model_animations ) {

    animations[ object.uuid ] = model_animations;

    if(model_animations.length > 0 ){
        animsDiv.style.display = "block";
    }
    else{
        animsDiv.style.display = "none";
    }
}

function animControl( object ) {

    var uuid = object !== null ? object.uuid : '';
    var anims = animations[ uuid ];

    if ( anims !== undefined ) {

        mixer = new THREE.AnimationMixer( object );
        var options = {};
        for ( var animation of anims ) {

            options[ animation.name ] = animation.name;

            var action = mixer.clipAction( animation );
            actions[ animation.name ] = action;
        }

        setOptions( options );
    }
}

function playAnimation() {

    currentAnimation = actions[ animationsSelect.value ];
    if ( currentAnimation !== undefined ) {

        stopAnimations();
        currentAnimation.play();
      //  updateAnimation();

    }
}

function playAllAnimation(anims) {

    if(anims !== undefined){
        
        document.getElementById("playAll").onclick = function(){
            anims.forEach(function (clip) {               
                 mixer.clipAction(clip).reset().play();
             });
        }
    }
}       

function stopAnimations() {

    if ( mixer !== undefined ) {

        mixer.stopAllAction();

    }
}

 function setOptions( options ) {

    var selected = animationsSelect.value;

    while ( animationsSelect.children.length > 0 ) {

        animationsSelect.removeChild( animationsSelect.firstChild );

    }

    for ( var key in options ) {

        var option = document.createElement( 'option' );
        option.value = key;
        option.innerHTML = options[ key ];
        animationsSelect.appendChild( option );

    }

    animationsSelect.value = selected;
}

document.getElementById("play").onclick = playAnimation;
document.getElementById("stop").onclick = stopAnimations;
