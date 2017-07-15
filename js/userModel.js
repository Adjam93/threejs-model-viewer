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

/*READ FILE*/
document.getElementById('obj_file').addEventListener('change', readFile, false); //Read .obj file

var fileType = ['obj'];
var reader;

function readFile(evt) {
    if (evt.target.files && evt.target.files[0]) {
        var extension = evt.target.files[0].name.split('.').pop().toLowerCase(), //get .obj file extension from input file
            isSuccess = fileType.indexOf(extension) > -1;  //is extension acceptable type

        if (isSuccess) {
            scene.remove(sample_model);

            modelLoaded = true;
            var fileObject = evt.target.files[0];
            reader = new FileReader();

            var tmppath = URL.createObjectURL(evt.target.files[0]); //Testing a temporary path for .obj file

            reader.onload = function (e) {
                scene.remove(model); //on each load of .obj file remove current file from scene before adding new selected file

                document.getElementById("scale_up").disabled = false;
                document.getElementById("scale_down").disabled = false;

                loader.setPath(tmppath)
                console.log(tmppath);

                model = loader.parse(this.result); //Set model to be the user file
                $("#disp_tmp_path").html("Temporary Path --> <strong>[" + tmppath + "]</strong>"); //Display temp path

                var geometry;
                model.traverse(function (child) {
                    if (child instanceof THREE.Mesh) {
                        geometry = new THREE.Geometry().fromBufferGeometry(child.geometry);

                        if (geometry !== undefined) {
                            //Dislay file name, number of vertices and faces info of model
                            statsNode.innerHTML = 'Name of model/file: ' + fileObject.name
                                + '<br>'
                                + 'Number of vertices: ' + geometry.vertices.length
                                + '<br>'
                                + 'Number of faces: ' + geometry.faces.length;
                        }


                        child.material = materials.default_material;

                        var geo = new THREE.EdgesGeometry(child.geometry); // or WireframeGeometry
                        var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
                        var wireframe = new THREE.LineSegments(geo, mat);

                        setWireFrame(child);
                        setGlowModel(model);
                        setGlow(child);

                        setWireFrame(child);
                        setPhong(child);
                        setXray(child);


                        $('#model_wire').change(function () {
                            if (model_wire.checked) {
                                wire.checked = false;
                                child.material = materials.default_material;
                                child.add(wireframe);
                            }
                            else {
                                child.material = materials.default_material;
                                child.remove(wireframe);
                            }
                        });

                    }
                });

                model.position.set(0, 0, 0);

                bound_box = new THREE.BoxHelper(model); //, 0xffffff
                bound_box.visible = false;
                model.add(bound_box); //Add bounding box helper to model (for when checkbox is checked)

                var bbox = new THREE.Box3().setFromObject(model);
                console.log(bbox.min.y);

                setCamera(model);

                /*POLAR GRID HELPER*/
                var radius = 10;
                var radials = 16;
                var circles = 8;
                var divisions = 64;

                polar_grid_helper = new THREE.PolarGridHelper(bbox.max.x * 4, radials, circles, divisions);
                polar_grid_helper.position.y = bbox.min.y;
                polar_grid_helper.visible = false;
                model.add(polar_grid_helper);

                /*NORMAL GRID HELPER*/
                gridHelper = new THREE.GridHelper(bbox.max.x * 4, 40, 0xe6e600, 0x808080);
                //Set size of grid to cover objects of all sizes based on the non visible box3() size.
                // gridHelper.position.x = 0;
                gridHelper.position.y = bbox.min.y; //Set grid underneath loaded model object
                // gridHelper.position.z = 0;
                gridHelper.visible = false; //Grid visibility initially false, until grid checkbox is selected
                model.add(gridHelper);

                /*AXIS HELPER*/
                axis_view = new THREE.AxisHelper(bbox.max.z * 10); //Set axis size based on the non visible box3() size.
                axis_view.position.y = bbox.min.y; //Set axis underneath loaded model object
                axis_view.visible = false; //axis visibility initially false, until axis checkbox is selected
                model.add(axis_view);

                console.log(renderer.info.memory.geometries);

                $("#Rotate_X").click(function () {

                    model.rotation.x = -Math.PI / 2;
                    polar_grid_helper.rotation.x = Math.PI / 2;
                    gridHelper.rotation.x = Math.PI / 2;
                    axis_view.rotation.x = Math.PI / 2;
                });

                scene.add(model);
                objects.push(model);
            };
            reader.readAsText(fileObject);
        }
        else { //File other than .obj type selected
            alert("Wrong file type, please select .obj files only");
        }

        var size = document.getElementById('obj_file').files[0].size;

        //progress/loading bar
        reader.onprogress = function (data) {
            if (data.lengthComputable) { //if size of file transfer is known
                var percentage = Math.round((data.loaded * 100) / data.total);
                console.log(percentage);
                statsNode.innerHTML = 'Loaded : ' + percentage + '%' + ' of ' + fileObject.name
                + '<progress value="0" max="100" class="progress"></progress>';
                // + 'Size of file ' + Math.round(size / 1048576) + 'Mbs';
                $('.progress').css({ 'width': percentage + '%' });////Width of progress bar set to the current percentage of model loaded (progress bar therefore increases in width as model loads)
                $('.progress').val(percentage); //Set progress bar value to the current amount loaded
            }
        }
    }
}


function scaleUp() {
    if (modelLoaded) {
        scale = scale + (scale * 0.55);
        model.scale.x = model.scale.y = model.scale.z = scale;
        camera.lookAt(model.position);
        controls.reset();
    }
}
function scaleDown() {
    if (modelLoaded) {
        scale = scale - (scale * 0.25);
        model.scale.x = model.scale.y = model.scale.z = scale;
        camera.lookAt(model.position);
        controls.reset();
    }
}
$('#scale_up').click(function (e) {
    scaleUp();
});

$('#scale_down').click(function (e) {
    scaleDown();
});
